import prisma from "../lib/db";
import { differenceInMinutes } from "date-fns";
import { VisitStatus } from "@prisma/client";
import { getDistance } from "geolib";

/**
 * Compute visit exception flags based on visit data
 */
function computeExceptions(data: any) {
  const {
    clientId,
    employeeId,
    callIn,
    callOut,
    serviceId,
    service,
    location,
    payer,
    scheduledTimeIn,
    visitStatus,
    hours,
  } = data;

  return {
    unknownClientException: !clientId,
    unknownEmployeeException: !employeeId,
    visitWithoutInCallException: !callIn,
    visitWithoutOutCallException: !callOut,
    unmatchedClientPhoneException: false, // future EVV logic
    missingServiceException: !serviceId || !service,
    unauthorizedServiceException: false,
    missingLocationException: !location,
    visitWithoutAnyCallException: !callIn && !callOut,
    actHoursVsSchHoursException: false,
    missingPayerException: !payer,
    shortVisitException: !!(hours !== null && hours < 0.25),
    noShowException:
      visitStatus === "Scheduled" &&
      !callIn &&
      !callOut &&
      new Date(scheduledTimeIn ?? Date.now()).getTime() <
        Date.now() - 24 * 60 * 60 * 1000,
    visitVerificationException: !visitStatus,
    clientSignatureException: false,
    serviceVerificationException: false,
  };
}

/**
 * Create a new Visit and automatically record exceptions and history
 */
export async function createVisit(data: any) {
  const {
    agencyID,
    employeeId,
    clientId,
    callIn,
    callOut,
    serviceId,
    timeZone,
    location,
    groupVisitCode,
    scheduledTimeIn,
    scheduledTimeOut,
    scheduledHours,
    source = "manual",
    latitudeIn,
    longitudeIn,
    latitudeOut,
    longitudeOut,
    scheduleID,
  } = data;

  // Load employee and client
  const [employee, client, service] = await Promise.all([
    prisma.employee.findUnique({ where: { id: employeeId } }),
    prisma.client.findUnique({
      where: { id: clientId },
      include: { addresses: true },
    }),
    serviceId
      ? prisma.service.findUnique({ where: { id: serviceId } })
      : Promise.resolve(null),
  ]);

  if (!employee || !client) throw new Error("Invalid employee or client");

  // Compute derived visit timing info
  const hasOutCall = !!callOut;
  const elapsedMinutes = hasOutCall
    ? differenceInMinutes(new Date(callOut), new Date(callIn))
    : 0;
  const hours = hasOutCall ? elapsedMinutes / 60 : null;
  const units = hasOutCall ? Math.floor(elapsedMinutes / 15) : null;

  // Determine visit type and source
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
    visitStatus = hasOutCall ? "Verified" : "InProcess";
  }

  // Supervisor and address
  const supervisor = client.supervisor || employee.supervisor || null;
  const clientAddress = client.addresses[0]
    ? `${client.addresses[0].addressLine1}, ${client.addresses[0].city ?? ""}`
    : "N/A";

  // Compute exceptions
  const exceptions = computeExceptions({
    ...data,
    service,
    visitStatus,
    hours,
  });

  // Transaction — ensures visit + exceptions + history stay in sync
  const newVisit = await prisma.$transaction(async (tx) => {
    // Create visit
    const visit = await tx.visit.create({
      data: {
        agencyID,
        scheduleID,
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
        billTime: hasOutCall ? hours : null,
        callHours: hours ?? null,
        payHours: hours ?? null,
        units,
        serviceId: serviceId ?? null,
        serviceName: service ? `${service.code} - ${service.name}` : null,
        inOutCallLocation: clientAddress,
        clientID: client.clientID ?? null,
        clientMedicaidID: client.medicaidID,
        clientName: client.name,
        clientPrimaryPhoneNumber: client.mainPhone,
        employeeID: employee.employeeID ?? null,
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
        scheduledHours:
          scheduledHours ??
          (scheduledTimeIn && scheduledTimeOut
            ? (scheduledTimeOut.getTime() - scheduledTimeIn.getTime()) /
              1000 /
              60 /
              60
            : null),

        ...exceptions,
      },
    });

    // Insert VisitExceptions for each true flag
    const trueExceptions = Object.entries(exceptions)
      .filter(([_, val]) => val)
      .map(([key]) => ({
        visitId: visit.id,
        exceptionType: key,
        date: new Date(),
      }));

    if (trueExceptions.length > 0) {
      await tx.visitException.createMany({ data: trueExceptions });
      await tx.visit.update({
        where: { id: visit.id },
        data: {
          totalCurrentExceptions: trueExceptions.length,
          totalOriginalExceptions: trueExceptions.length,
        },
      });
    }

    // Add history
    await tx.visitHistory.create({
      data: {
        visitId: visit.id,
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

    return visit;
  });

  return newVisit;
}

/**
 * Get all visits for an agency
 */
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

export async function getVisitById(visitId: number) {
  return prisma.visit.findUnique({
    where: { id: visitId },
    include: {
      visitTasks: true,
      exceptions: true,
      history: true,
      agency: { select: { name: true, code: true } },
      service: { select: { id: true, name: true } },
    },
  });
}

/**
 * Update a visit and re-sync exceptions
 */
export async function updateVisit(id: number, data: any) {
  // Get the current visit
  const existing = await prisma.visit.findUnique({
    where: { id },
    include: { service: true },
  });
  if (!existing) throw new Error("Visit not found");

  // If serviceId changed, load new service to update name
  let serviceName = existing.serviceName;
  if (data.serviceId && data.serviceId !== existing.serviceId) {
    const svc = await prisma.service.findUnique({
      where: { id: data.serviceId },
    });
    serviceName = svc ? `${svc.code} - ${svc.name}` : null;
  }

  // Merge existing + new data (so missing fields don’t become undefined)
  const mergedData = { ...existing, ...data, serviceName };

  // Recompute exceptions using merged data (so nothing gets lost)
  const exceptions = computeExceptions(mergedData);

  // Transaction for safe update
  const updated = await prisma.$transaction(async (tx) => {
    // update the visit
    const visit = await tx.visit.update({
      where: { id },
      data: {
        ...data,
        serviceName,
        ...exceptions,
      },
    });

    // refresh VisitExceptions
    await tx.visitException.deleteMany({ where: { visitId: id } });

    const trueExceptions = Object.entries(exceptions)
      .filter(([_, val]) => val)
      .map(([key]) => ({
        visitId: id,
        exceptionType: key,
        date: new Date(),
      }));

    if (trueExceptions.length) {
      await tx.visitException.createMany({ data: trueExceptions });
      await tx.visit.update({
        where: { id },
        data: {
          totalCurrentExceptions: trueExceptions.length,
          totalOriginalExceptions: trueExceptions.length,
        },
      });
    } else {
      await tx.visit.update({
        where: { id },
        data: {
          totalCurrentExceptions: 0,
          totalOriginalExceptions: 0,
        },
      });
    }

    return visit;
  });

  return updated;
}
/**
 * Delete a visit
 */
export async function deleteVisit(id: number) {
  return prisma.visit.delete({ where: { id } });
}

export async function addVisitTask(visitId: number, name: string) {
  // ensure visit exists
  const v = await prisma.visit.findUnique({ where: { id: visitId } });
  if (!v) throw new Error("Visit not found");

  const created = await prisma.visitTask.create({
    data: { visitId, name, completed: false },
  });
  return created;
}

export async function updateVisitTask(
  visitId: number,
  taskId: number,
  completed: boolean
) {
  // ensure task belongs to visit
  const t = await prisma.visitTask.findUnique({ where: { id: taskId } });
  if (!t || t.visitId !== visitId)
    throw new Error("Task not found for this visit");

  return prisma.visitTask.update({
    where: { id: taskId },
    data: { completed },
  });
}

export async function deleteVisitTask(visitId: number, taskId: number) {
  const t = await prisma.visitTask.findUnique({ where: { id: taskId } });
  if (!t || t.visitId !== visitId)
    throw new Error("Task not found for this visit");

  await prisma.visitTask.delete({ where: { id: taskId } });
  return { ok: true };
}
