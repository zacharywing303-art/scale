import prisma from "../lib/db";
import { subDays, differenceInDays } from "date-fns";

const PA_START = new Date("2025-01-01");

export async function getHRAlerts(agencyId: string, userId: string) {
  const alerts: any[] = [];

  // -----------------------------------------------------
  // LOAD DISMISSED ALERTS
  // -----------------------------------------------------
  const dismissed = await prisma.hRAlert.findMany({
    where: { agencyId, dismissed: true },
    select: { alertType: true },
  });
  const dismissedSet = new Set(dismissed.map((a) => a.alertType));

  const ignore = (key: string) => dismissedSet.has(key);

  const today = new Date();

  // =====================================================
  // 1. EVV COMPLIANCE (PA RULE)
  // =====================================================

  const visits = await prisma.visit.findMany({
    where: {
      agencyID: agencyId,
      callIn: { gte: PA_START },
      visitStatus: { not: "Omitted" },
    },
    select: {
      visitStatus: true,
      callOutType: true,
      outCall: true,
      id: true,
    },
  });

  const total = visits.length;

  const auto = visits.filter(
    (v) =>
      v.callOutType === "System" ||
      (v.visitStatus === "Incomplete" && v.outCall === true)
  ).length;

  if (total > 0) {
    const compliance = (auto / total) * 100;
    const key = "evv-pa-compliance";

    if (!ignore(key)) {
      if (compliance < 85) {
        alerts.push({
          id: key,
          alertType: key,
          message: `EVV compliance is below the PA requirement (currently ${compliance.toFixed(
            1
          )}%).`,
          severity: "error",
          link: "/dashboard/reports?report=evv-compliance",
        });
      } else if (compliance >= 85 && compliance < 90) {
        alerts.push({
          id: key,
          alertType: key,
          message: `EVV compliance is approaching the 85% threshold (currently ${compliance.toFixed(
            1
          )}%).`,
          severity: "warning",
          link: "/dashboard/reports?report=evv-compliance",
        });
      }
    }
  }

  // =====================================================
  // 2. EMPLOYEE EXPIRATIONS (EmploymentInfo + Certs)
  // =====================================================

  const emps = await prisma.employee.findMany({
    where: { agencyID: agencyId },
    include: {
      employmentInfo: true,
      certifications: true,
    },
  });

  const soonDate = subDays(new Date(today.getTime() + 31 * 86400000), 0);

  const addDateAlert = (
    key: string,
    msg: string,
    severity: string,
    link: string
  ) => {
    if (!ignore(key)) {
      alerts.push({ id: key, alertType: key, message: msg, severity, link });
    }
  };

  for (const e of emps) {
    const info = e.employmentInfo;

    const check = (date: Date | null | undefined, label: string) => {
      if (!date) return;

      const key = `emp-${e.id}-${label}`;

      if (date < today) {
        addDateAlert(
          key,
          `${label} expired for ${e.name}`,
          "error",
          `/dashboard/hr/employees/${e.id}?tab=employment`
        );
      } else if (date < soonDate) {
        addDateAlert(
          key,
          `${label} expiring soon for ${e.name}`,
          "warning",
          `/dashboard/hr/employees/${e.id}?tab=employment`
        );
      }
    };

    if (info) {
      check(info.driversLicenseExpiration, "Driver's License");
      check(info.registrationExpiration, "Vehicle Registration");
      check(info.insuranceEndDate, "Insurance Coverage");
    }

    // CERTIFICATION YEARLY SUGGESTIONS
    for (const cert of e.certifications) {
      const diff = differenceInDays(today, cert.dateObtained);

      if (diff > 365 && diff < 372) {
        const key = `cert-${cert.id}-${e.id}`;
        addDateAlert(
          key,
          `It has been a year since ${e.name} obtained ${cert.name}—consider updating this certification.`,
          "warning",
          `/dashboard/hr/employees/${e.id}?tab=certifications`
        );
      }
    }
  }

  // =====================================================
  // 3. AUTO CLOCK-OUTS (14 days)
  // =====================================================

  const autoVisits = await prisma.visit.findMany({
    where: {
      agencyID: agencyId,
      visitStatus: "Incomplete",
      outCall: true,
      callOut: { gte: subDays(today, 14) },
    },
    select: {
      id: true,
      employeeName: true,
      clientName: true,
      callOut: true,
    },
  });

  for (const v of autoVisits) {
    const key = `auto-${v.id}`;
    if (ignore(key)) continue;

    alerts.push({
      id: key,
      alertType: key,
      message: `System auto-clocked-out ${v.employeeName}'s visit with ${
        v.clientName
      } on ${v.callOut?.toLocaleString()}.`,
      severity: "info",
      link: `/dashboard/visits/${v.id}`,
    });
  }

  // =====================================================
  // 4. PENDING EMPLOYEE REQUESTS
  // =====================================================

  const pending = await prisma.employeeRequest.count({
    where: {
      employee: { agencyID: agencyId },
      status: "Pending",
    },
  });

  if (pending > 0 && !ignore("pending-requests")) {
    alerts.push({
      id: "pending-requests",
      alertType: "pending-requests",
      message: `${pending} employee requests are pending.`,
      severity: "warning",
      link: "/dashboard/hr/requests",
    });
  }

  // =====================================================
  // 5. CLIENT AUTH UNITS LOW
  // =====================================================

  const clients = await prisma.client.findMany({
    where: { agencyID: agencyId },
    include: { authorizations: true },
  });

  for (const c of clients) {
    for (const a of c.authorizations) {
      const key = `auth-${a.id}`;

      if (ignore(key)) continue;

      const units = a.totalAuthorizedUnits ?? 0;
      const hours = a.totalAuthorizedHours ?? 0;

      if (units === 0 || hours === 0) {
        alerts.push({
          id: key,
          alertType: key,
          severity: "error",
          message: `Client ${c.name} has exhausted authorization units/hours.`,
          link: `/dashboard/hr/clients/${c.id}?tab=program`,
        });
      } else if (units < 500 || hours < 125) {
        alerts.push({
          id: key,
          alertType: key,
          severity: "warning",
          message: `Client ${c.name} is low on authorized units/hours (${units} units, ${hours} hours).`,
          link: `/dashboard/hr/clients/${c.id}?tab=program`,
        });
      }
    }
  }

  return alerts;
}

export async function dismissAlert(
  agencyId: string,
  alertType: string,
  userId: string
) {
  return prisma.hRAlert.upsert({
    where: { alertType_agencyId: { alertType, agencyId } },
    update: {
      dismissed: true,
      dismissedAt: new Date(),
      dismissedBy: userId,
    },
    create: {
      agencyId,
      alertType,
      message: "",
      severity: "",
      dismissed: true,
      dismissedAt: new Date(),
      dismissedBy: userId,
    },
  });
}
