import prisma from "../lib/db";
import { differenceInMinutes } from "date-fns";
import { VisitStatus } from "@prisma/client";

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
    source = "manual", // "manual" | "schedule" | "mobile"
    latitudeIn,
    longitudeIn,
    latitudeOut,
    longitudeOut,
  } = data;

  // ✅ 1. Load employee + client
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
  });
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: { addresses: true },
  });
  if (!employee || !client) throw new Error("Invalid employee or client");

  // ✅ 2. Compute derived fields
  const hasOutCall = !!callOut;
  const elapsedMinutes = hasOutCall
    ? differenceInMinutes(new Date(callOut), new Date(callIn))
    : 0;
  const hours = hasOutCall ? elapsedMinutes / 60 : null;
  const units = hasOutCall ? Math.floor(elapsedMinutes / 15) : null;
  // ✅ 3. Determine type-specific fields
  let visitStatus: VisitStatus = "Scheduled";
  let callType = "Manual";
  let visitSource = "Unity Care";
  let callInType = "Manual";
  let callOutType = hasOutCall ? "Manual" : null;

  if (source === "mobile") {
    visitStatus = hasOutCall ? "Verified" : "InProcess";
    callType = "Auto";
    callInType = "Auto";
    callOutType = hasOutCall ? "Auto" : null;
    visitSource = "Mobile App";
  } else if (source === "schedule") {
    visitStatus = "Scheduled";
  } else {
    // Manual creation
    visitStatus = hasOutCall ? "Verified" : "InProcess";
  }

  // ✅ 4. Determine supervisor
  const supervisor = client.supervisor || employee.supervisor || null;

  // ✅ 5. Address
  const clientAddress = client.addresses[0]
    ? `${client.addresses[0].addressLine1}, ${client.addresses[0].city ?? ""}`
    : "N/A";

  // ✅ 6. Create visit
  const newVisit = await prisma.visit.create({
    data: {
      agencyID,
      visitStatus,
      callIn: callIn ?? scheduledTimeIn ?? null,
      callOut: callOut ?? scheduledTimeOut ?? null,
      inCall: !!(callIn ?? scheduledTimeIn),
      outCall: hasOutCall || !!scheduledTimeOut,
      callInType,
      callOutType,
      callType,
      visitSource,
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

  // ✅ 7. Record visit history
  await prisma.visitHistory.create({
    data: {
      visitId: newVisit.id,
      title: "Visit Created",
      reasonCode: source === "mobile" ? "MOBILE_START" : "MANUAL_CREATE",
      reason:
        source === "mobile"
          ? "Visit started using the mobile app."
          : source === "schedule"
          ? "Visit created from a schedule."
          : "Visit manually created via dashboard.",
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
