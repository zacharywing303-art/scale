import prisma from "../lib/db";
import { differenceInMinutes } from "date-fns";
import { Prisma } from "@prisma/client"; // ✅ Import types from Prisma
const { VisitStatus } = Prisma; // ✅ Enum import shortcut

export async function createVisit(data: any) {
  const {
    agencyID,
    employeeId,
    clientId,
    callIn,
    callOut,
    service,
    timeZone,
    location,
    groupVisitCode,
    scheduledTimeIn,
    scheduledTimeOut,
    source = "manual",
    latitudeIn,
    longitudeIn,
    latitudeOut,
    longitudeOut,
  } = data;

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
  });
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: { addresses: true },
  });
  if (!employee || !client) throw new Error("Invalid employee or client");

  const hasOutCall = !!callOut;
  const elapsedMinutes = hasOutCall
    ? differenceInMinutes(new Date(callOut), new Date(callIn))
    : 0;
  const hours = hasOutCall ? elapsedMinutes / 60 : null;
  const units = hasOutCall ? Math.floor(elapsedMinutes / 15) : null;

  // ✅ Use Prisma enum instead of strings
  let visitStatus: Prisma.VisitStatus = VisitStatus.Scheduled;

  if (source === "mobile") {
    visitStatus = hasOutCall ? VisitStatus.Verified : VisitStatus.InProcess;
  } else if (source === "schedule") {
    visitStatus = VisitStatus.Scheduled;
  } else {
    visitStatus = hasOutCall ? VisitStatus.Verified : VisitStatus.InProcess;
  }

  const supervisor = client.supervisor || employee.supervisor || null;

  const clientAddress = client.addresses[0]
    ? `${client.addresses[0].addressLine1}, ${client.addresses[0].city ?? ""}`
    : "N/A";

  const newVisit = await prisma.visit.create({
    data: {
      agencyID,
      visitStatus, // ✅ Enum-safe now
      callIn: callIn ?? scheduledTimeIn ?? null,
      callOut: callOut ?? scheduledTimeOut ?? null,
      inCall: !!(callIn ?? scheduledTimeIn),
      outCall: hasOutCall || !!scheduledTimeOut,
      callInType: source === "mobile" ? "Auto" : "Manual",
      callOutType: hasOutCall
        ? source === "mobile"
          ? "Auto"
          : "Manual"
        : null,
      callType: source === "mobile" ? "Auto" : "Manual",
      visitSource:
        source === "mobile"
          ? "Mobile App"
          : source === "schedule"
          ? "Schedule"
          : "Unity Care",
      visitTimeZone: timeZone ?? "EST",
      visitWithoutOutCallException: !hasOutCall,
      billTime: hasOutCall ? hours : null,
      payHours: hours ?? null,
      units,
      service,
      inOutCallLocation: clientAddress,
      clientID: parseInt(client.clientID) || null,
      clientMedicaidID: client.medicaidID,
      clientName: client.name,
      clientPrimaryPhoneNumber: client.mainPhone,
      employeeID: parseInt(employee.employeeID) || null,
      employeeName: employee.name,
      employeeContactPhoneNumber: employee.mainPhone,
      user: employee.email,
      groupVisitCode,
      supervisor,
      doNotBill: false,
      program: client.programID ?? null,
      scheduledTimeIn: scheduledTimeIn ?? null,
      scheduledTimeOut: scheduledTimeOut ?? null,
      latitudeIn,
      longitudeIn,
      latitudeOut,
      longitudeOut,
    },
  });

  await prisma.visitHistory.create({
    data: {
      visitId: newVisit.id,
      title: "Visit Created",
      reasonCode:
        source === "mobile"
          ? "MOBILE_START"
          : source === "schedule"
          ? "SCHEDULE_CREATE"
          : "MANUAL_CREATE",
      reason:
        source === "mobile"
          ? "Visit started using mobile app."
          : source === "schedule"
          ? "Visit created from schedule."
          : "Visit manually created from dashboard.",
      dateTime: new Date(),
      updatedBy: employee.email,
    },
  });

  return newVisit;
}

// ✅ Get visits for a specific agency
export async function getVisitsByAgency(agencyId: string) {
  return prisma.visit.findMany({
    where: { agencyID: agencyId },
    include: {
      visitTasks: true,
      exceptions: true,
      history: true,
    },
    orderBy: { scheduledTimeIn: "desc" },
  });
}

// ✅ Get a single visit by ID
export async function getVisitById(visitId: number) {
  return prisma.visit.findUnique({
    where: { id: visitId },
    include: {
      visitTasks: true,
      exceptions: true,
      history: true,
    },
  });
}

// // ✅ Create visit
// export async function createVisit(data: any) {
//   return prisma.visit.create({
//     data: {
//       ...data,
//       visitStatus: data.visitStatus || "Scheduled",
//     },
//   });
// }

// ✅ Update visit
export async function updateVisit(id: number, data: any) {
  return prisma.visit.update({
    where: { id },
    data,
  });
}

// ✅ Delete visit
export async function deleteVisit(id: number) {
  return prisma.visit.delete({ where: { id } });
}
