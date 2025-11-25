import prisma from "../lib/db";
import { subDays } from "date-fns";

export async function getHRAlerts(agencyId: string) {
  const alerts: any[] = [];

  // 1️⃣ EVV COMPLIANCE
  const totalVisits = await prisma.visit.count({
    where: {
      agencyID: agencyId,
      visitStatus: { not: "Omitted" },
    },
  });

  const autoVisits = await prisma.visit.count({
    where: {
      agencyID: agencyId,
      visitStatus: { not: "Omitted" },
      OR: [{ callOutType: "SYSTEM" }, { visitSource: "AUTO" }],
    },
  });

  if (totalVisits > 0) {
    const compliance = (autoVisits / totalVisits) * 100;

    if (compliance < 85) {
      alerts.push({
        id: "evv-compliance",
        message: `EVV compliance is below PA requirement (currently ${compliance.toFixed(
          1
        )}%).`,
        severity: "error",
        link: "/dashboard/reports?report=evv-compliance",
      });
    } else if (compliance >= 85 && compliance < 90) {
      alerts.push({
        id: "evv-warning",
        message: `EVV compliance approaching limit (currently ${compliance.toFixed(
          1
        )}%).`,
        severity: "warning",
        link: "/dashboard/reports?report=evv-compliance",
      });
    }
  }

  // 2️⃣ EXPIRING EMPLOYEE ITEMS
  const employees = await prisma.employee.findMany({
    where: { agencyID: agencyId },
    include: {
      employmentInfo: true,
      certifications: true,
    },
  });

  const today = new Date();
  const soon = subDays(new Date(today.getTime() + 31 * 24 * 3600 * 1000), 0);

  for (const emp of employees) {
    const info = emp.employmentInfo;

    const checkDate = (date: Date | null | undefined, label: string) => {
      if (!date) return;

      if (date < today) {
        alerts.push({
          id: `${emp.id}-${label}-expired`,
          message: `${label} expired for ${emp.name}`,
          severity: "error",
          link: `/dashboard/hr/employees/${emp.id}?tab=employment`,
        });
      } else if (date < soon) {
        alerts.push({
          id: `${emp.id}-${label}-soon`,
          message: `${label} expiring soon for ${emp.name}`,
          severity: "warning",
          link: `/dashboard/hr/employees/${emp.id}?tab=employment`,
        });
      }
    };

    if (info) {
      checkDate(info.driversLicenseExpiration, "Driver's License");
      checkDate(info.registrationExpiration, "Vehicle Registration");
      checkDate(info.insuranceEndDate, "Insurance Coverage");
    }

    // Certifications: need expirationDate if available
    for (const cert of emp.certifications) {
      if ((cert as any).expirationDate) {
        checkDate((cert as any).expirationDate, `${cert.name} Certification`);
      }
    }
  }

  // 3️⃣ AUTO CLOCK-OUTS (last 48 hours)
  const autoClockOuts = await prisma.visit.findMany({
    where: {
      agencyID: agencyId,
      OR: [{ callOutType: "SYSTEM" }, { visitSource: "AUTO" }],
      callOut: { gte: subDays(today, 2) },
    },
  });

  for (const v of autoClockOuts) {
    alerts.push({
      id: `auto-${v.id}`,
      message: `System clocked out ${v.employeeName}'s visit with ${v.clientName}.`,
      severity: "info",
      link: `/dashboard/visits/${v.id}`,
    });
  }

  // 4️⃣ PENDING EMPLOYEE REQUESTS
  const pendingRequests = await prisma.employeeRequest.count({
    where: {
      employee: { agencyID: agencyId },
      status: "Pending",
    },
  });

  if (pendingRequests > 0) {
    alerts.push({
      id: "pending-requests",
      message: `${pendingRequests} employee requests pending.`,
      severity: "warning",
      link: "/dashboard/hr/requests",
    });
  }

  // 5️⃣ CLIENT AUTHORIZATION UNITS RUNNING LOW
  const clients = await prisma.client.findMany({
    where: { agencyID: agencyId },
    include: { authorizations: true },
  });

  for (const c of clients) {
    for (const a of c.authorizations) {
      const units = a.totalAuthorizedUnits || 0;
      const hours = a.totalAuthorizedHours || 0;

      if (units === 0 || hours === 0) {
        alerts.push({
          id: `auth-${a.id}-expired`,
          message: `Client ${c.name} has exhausted their authorization.`,
          severity: "error",
          link: `/dashboard/hr/clients/${c.id}?tab=program`,
        });
      } else if (units < 500 || hours < 125) {
        alerts.push({
          id: `auth-${a.id}-low`,
          message: `Client ${c.name} has low remaining units/hours (${units} units, ${hours} hours).`,
          severity: "warning",
          link: `/dashboard/hr/clients/${c.id}?tab=program`,
        });
      }
    }
  }

  return alerts;
}
