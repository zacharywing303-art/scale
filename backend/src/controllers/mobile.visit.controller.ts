import { Request, Response } from "express";
import prisma from "../lib/db";
import { getDistance } from "geolib";
import * as visitService from "../services/visit.service";
import { subHours } from "date-fns";

/** Helper: resolve employee by internal id OR human employeeID (code) */
async function resolveEmployee(anyId: string | undefined | null) {
  if (!anyId) return null;
  const byId = await prisma.employee.findUnique({ where: { id: anyId } });
  if (byId) return byId;
  const byCode = await prisma.employee.findFirst({
    where: { employeeID: anyId },
  });
  return byCode;
}

/** Helper: sum mileage between consecutive points (meters → miles) */
function sumMileageMiles(points: { latitude: number; longitude: number }[]) {
  if (points.length < 2) return 0;
  let meters = 0;
  for (let i = 1; i < points.length; i++) {
    meters += getDistance(points[i - 1], points[i]);
  }
  return meters / 1609.34;
}

function detectStops(
  points: { latitude: number; longitude: number; recordedAt: Date }[]
) {
  const stops = [];
  for (let i = 1; i < points.length; i++) {
    const dist = getDistance(points[i - 1], points[i]);
    const dt =
      new Date(points[i].recordedAt).getTime() -
      new Date(points[i - 1].recordedAt).getTime();

    // If user moved <10 meters in 15+ minutes, consider it a stop
    if (dist < 10 && dt > 15 * 60 * 1000) {
      stops.push(points[i]);
    }
  }
  return stops;
}

type MileagePoint = {
  latitude: number;
  longitude: number;
  recordedAt: Date;
  accuracy?: number;
};

export function computeStops(
  points: MileagePoint[],
  idleMetersThreshold = 10, // “no movement” radius
  idleSecondsThreshold = 15 * 60 // >= 15 minutes
) {
  if (!points.length) return [];

  let windowStartIdx = 0;
  let windowAnchor = points[0]; // anchor point for distance checks
  const out: {
    startedAt: Date;
    endedAt: Date;
    durationSeconds: number;
    latitude: number;
    longitude: number;
    accuracy?: number;
    note?: string;
  }[] = [];

  for (let i = 1; i < points.length; i++) {
    const p = points[i];
    const dist = getDistance(
      { latitude: p.latitude, longitude: p.longitude },
      { latitude: windowAnchor.latitude, longitude: windowAnchor.longitude }
    );
    const dtSec =
      (p.recordedAt.getTime() - points[windowStartIdx].recordedAt.getTime()) /
      1000;

    // if moved beyond idle radius, close any existing idle window
    if (dist > idleMetersThreshold) {
      if (dtSec >= idleSecondsThreshold) {
        const start = points[windowStartIdx].recordedAt;
        const end = points[i - 1].recordedAt;
        out.push({
          startedAt: start,
          endedAt: end,
          durationSeconds: Math.floor((end.getTime() - start.getTime()) / 1000),
          latitude: windowAnchor.latitude,
          longitude: windowAnchor.longitude,
          accuracy: windowAnchor.accuracy,
          note: `idle ≥ ${Math.round(
            idleSecondsThreshold / 60
          )}m within ${idleMetersThreshold}m`,
        });
      }
      // reset window at movement
      windowStartIdx = i;
      windowAnchor = p;
    } else {
      // still within idle radius; keep extending the window
      // (no-op here; we evaluate on next move or at the end)
    }
  }

  // tail close
  const tailDtSec =
    (points[points.length - 1].recordedAt.getTime() -
      points[windowStartIdx].recordedAt.getTime()) /
    1000;
  if (tailDtSec >= idleSecondsThreshold) {
    const start = points[windowStartIdx].recordedAt;
    const end = points[points.length - 1].recordedAt;
    out.push({
      startedAt: start,
      endedAt: end,
      durationSeconds: Math.floor((end.getTime() - start.getTime()) / 1000),
      latitude: windowAnchor.latitude,
      longitude: windowAnchor.longitude,
      accuracy: windowAnchor.accuracy,
      note: `idle ≥ ${Math.round(
        idleSecondsThreshold / 60
      )}m within ${idleMetersThreshold}m`,
    });
  }

  return out;
}

/**
 * GET /api/mobile/visits/search-client/:clientID
 */
export async function searchClientByClientID(req: Request, res: Response) {
  try {
    const { clientID } = req.params;
    const employeeIdFromReq =
      (req as any).user?.employeeID || (req as any).user?.id;

    const client = await prisma.client.findFirst({
      where: { clientID },
      include: {
        addresses: true,
        services: true,
        assignedEmployees: true,
        contacts: true,
      },
    });

    if (!client) {
      return res
        .status(404)
        .json({ success: false, message: "Client not found" });
    }

    let isAssigned = false;
    if (employeeIdFromReq) {
      const emp = await resolveEmployee(employeeIdFromReq);
      if (emp) {
        isAssigned = client.assignedEmployees.some((e) => e.id === emp.id);
      }
    }

    const addr = client.addresses?.[0];
    const fullAddress = addr
      ? `${addr.addressLine1}, ${addr.city ?? ""}, ${addr.state ?? ""} ${
          addr.zipcode ?? ""
        }`.trim()
      : "No address on file";

    return res.json({
      success: true,
      client: {
        id: client.id,
        name: client.name,
        clientID: client.clientID,
        mainPhone: client.mainPhone,
        address: fullAddress,
        services: client.services.map((s) => ({
          id: s.id,
          name: s.name,
          code: s.code,
        })),
        contacts: client.contacts.map((c) => ({
          name: `${c.firstName} ${c.lastName}`.trim(),
          phone: c.phone1 ?? c.phone2 ?? c.phone3 ?? c.phone4 ?? null,
          relation: c.relation ?? "Contact",
        })),
        isAssigned,
      },
    });
  } catch (err: any) {
    console.error("searchClientByClientID error:", err.message, err.stack);
    res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
}

/**
 * POST /api/mobile/visits/start
 * Start a new visit (clock-in)
 */
export async function startVisit(req: Request, res: Response) {
  try {
    const {
      clientID,
      employeeID,
      serviceID,
      latitude,
      longitude,
      locationType,
      agencyID,
      proceedAnyway = false,
    } = req.body;

    if (!clientID || !employeeID || !serviceID || !agencyID) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const [client, employee, service] = await Promise.all([
      prisma.client.findFirst({
        where: { clientID, agencyID },
        include: { addresses: true, services: true },
      }),
      resolveEmployee(employeeID),
      prisma.service.findUnique({ where: { id: serviceID } }),
    ]);

    if (!client || !employee) {
      return res
        .status(404)
        .json({ success: false, message: "Client or employee not found" });
    }

    const addr = client.addresses?.[0] ?? null;
    let gpsWarning: string | null = null;
    let flagMissingLocation = false;
    let gpsDistanceMiles: number | null = null;

    if (addr && latitude && longitude) {
      if (addr.latitude != null && addr.longitude != null) {
        const meters = getDistance(
          { latitude, longitude },
          { latitude: addr.latitude, longitude: addr.longitude }
        );
        gpsDistanceMiles = meters / 1609.34;
        if (gpsDistanceMiles > 0.25) {
          gpsWarning = `You are ${gpsDistanceMiles.toFixed(
            2
          )} miles away from client's location (${addr.addressLine1}).`;
          flagMissingLocation = true;
        }
      } else {
        gpsWarning = "Client address is missing coordinates.";
        flagMissingLocation = true;
      }
    }

    const hasServices =
      Array.isArray(client.services) && client.services.length > 0;
    const validService = hasServices
      ? client.services.some((s) => s.id === serviceID)
      : false;

    const serviceWarning = !hasServices
      ? "This client has no services linked."
      : !validService
      ? "Selected service is not assigned to this client."
      : null;

    const flagUnauthorizedService = !hasServices || !validService;

    if (!proceedAnyway && (gpsWarning || serviceWarning)) {
      return res.json({
        success: true,
        confirmationRequired: true,
        warnings: { gpsWarning, serviceWarning },
      });
    }

    const existingActive = await prisma.visit.findFirst({
      where: {
        employeeID: employee.employeeID,
        clientID: client.clientID,
        callOut: null,
        visitStatus: { in: ["InProcess"] },
      },
    });
    if (existingActive) {
      return res.json({
        success: false,
        message: "You already have an active visit for this client.",
      });
    }

    const visit = await visitService.createVisit({
      agencyID,
      employeeId: employee.id,
      clientId: client.id,
      callIn: new Date(),
      serviceId: service?.id,
      timeZone: "EST",
      source: "mobile",
      location: locationType,
      latitudeIn: latitude,
      longitudeIn: longitude,
    });

    // Exception flags
    const exceptionUpdates: any = {
      visitWithoutOutCallException: true,
    };
    if (flagMissingLocation) exceptionUpdates.missingLocationException = true;
    if (flagUnauthorizedService)
      exceptionUpdates.unauthorizedServiceException = true;

    await prisma.visit.update({
      where: { id: visit.id },
      data: {
        ...exceptionUpdates,
        totalCurrentExceptions:
          Object.values(exceptionUpdates).filter(Boolean).length,
        totalOriginalExceptions:
          Object.values(exceptionUpdates).filter(Boolean).length,
      },
    });

    // Log GPSException if applicable
    if (gpsDistanceMiles && gpsDistanceMiles > 0.25) {
      await prisma.gPSException.create({
        data: {
          visitId: visit.id,
          distance: gpsDistanceMiles,
          type: "IN",
          reason: gpsWarning ?? "Out of range at clock-in",
        },
      });

      await prisma.visitException.create({
        data: {
          visitId: visit.id,
          exceptionType: "GPS Exception (In)",
          date: new Date(),
        },
      });
    }

    return res.json({
      success: true,
      message: `Visit started for ${client.name}`,
      visit,
    });
  } catch (err: any) {
    console.error("startVisit error:", err.message, err.stack);
    res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
}

/**
 * GET /api/mobile/visits/active
 */
export async function getActiveVisit(req: Request, res: Response) {
  try {
    const employeeParam =
      (req.query.employeeID as string) ||
      (req as any).user?.employeeID ||
      (req as any).user?.id;

    const employee = await resolveEmployee(employeeParam);
    if (!employee) return res.json({ success: true, visit: null });

    const active = await prisma.visit.findFirst({
      where: {
        employeeID: employee.employeeID,
        callOut: null,
        visitStatus: { in: ["InProcess"] },
      },
      include: {
        visitTasks: true,
        exceptions: true,
        service: { select: { id: true, name: true, code: true } },
      },
      orderBy: { callIn: "desc" },
    });

    if (!active) return res.json({ success: true, visit: null });

    const uiVisit = {
      id: active.id,
      clientName: active.clientName ?? null,
      service: active.serviceName ?? active.service?.name ?? null,
      date: (active.callIn ?? active.scheduledTimeIn)?.toISOString() ?? null,
      schIn: active.scheduledTimeIn?.toISOString() ?? null,
      schOut: active.scheduledTimeOut?.toISOString() ?? null,
      clockIn: active.callIn?.toISOString() ?? null,
      address: active.inOutCallLocation ?? null,
      visitStatus: active.visitStatus,
      serviceId: active.serviceId,
      serviceCode: active.service?.code ?? null,
      agencyID: active.agencyID,
      raw: active,
    };

    return res.json({ success: true, visit: uiVisit });
  } catch (e: any) {
    console.error("getActiveVisit error:", e.message, e.stack);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

/**
 * POST /api/mobile/visits/clock-out
 */
export async function clockOutVisit(req: Request, res: Response) {
  try {
    const {
      visitId,
      latitude,
      longitude,
      proceedAnyway,
      tasksCompleted,
      serviceNote,
    } = req.body;

    const visit = await prisma.visit.findUnique({
      where: { id: Number(visitId) },
    });
    if (!visit)
      return res
        .status(404)
        .json({ success: false, message: "Visit not found" });

    // Compute hours/units
    let callHours = null;
    let payHours = null;
    let billHours = null;
    let units = null;

    if (visit.callIn) {
      const minutes = (Date.now() - new Date(visit.callIn).getTime()) / 60000;
      callHours = Number((minutes / 60).toFixed(2));
      payHours = callHours;
      billHours = callHours;
      units = Math.floor(minutes / 15);
    }

    const updates: any = {
      callOut: new Date(),
      latitudeOut: latitude ?? null,
      longitudeOut: longitude ?? null,
      visitStatus: "Verified",
      outCall: true,
      visitWithoutOutCallException: false,
      memo: serviceNote ?? null,

      callHours,
      payHours,
      billHours,
      units,
    };

    const exceptions: string[] = [];
    const addr = await prisma.address.findFirst({
      where: { clientID: visit.clientID! },
    });

    if (addr?.latitude && addr?.longitude && latitude && longitude) {
      const miles =
        getDistance(
          { latitude, longitude },
          { latitude: addr.latitude, longitude: addr.longitude }
        ) / 1609.34;
      if (miles > 0.25) {
        updates.gpsOutMilesFromClient = miles;

        // Always log GPS exception
        await prisma.gPSException.create({
          data: {
            visitId: visit.id,
            distance: miles,
            type: "OUT",
            reason: `Clock-out ${miles.toFixed(2)} mi away from client`,
          },
        });

        // Only update VisitException if user did NOT proceed anyway
        if (!proceedAnyway) {
          exceptions.push("GPS Exception (Out)");
          updates.missingLocationException = true;
        }
      }
    }

    if (visit.callIn) {
      const minutes = (Date.now() - new Date(visit.callIn).getTime()) / 60000;
      if (minutes < 15) {
        exceptions.push("Short Visit (<15min)");
        updates.shortVisitException = true;
      }
    }

    if (Array.isArray(tasksCompleted) && tasksCompleted.length > 0) {
      for (const t of tasksCompleted) {
        const existing = await prisma.visitTask.findFirst({
          where: { visitId: visit.id, name: t },
        });
        if (existing) {
          await prisma.visitTask.update({
            where: { id: existing.id },
            data: { completed: true },
          });
        } else {
          await prisma.visitTask.create({
            data: { visitId: visit.id, name: t, completed: true },
          });
        }
      }
    }

    const updated = await prisma.visit.update({
      where: { id: visit.id },
      data: updates,
    });

    await prisma.visitException.deleteMany({
      where: {
        visitId: visit.id,
        exceptionType: {
          in: ["visitWithoutOutCallException", "VisitWithoutOutCallException"],
        },
      },
    });

    await prisma.visitException.deleteMany({
      where: {
        visitId: updated.id,
        exceptionType: {
          in: ["visitWithoutOutCallException", "VisitWithoutOutCallException"],
        },
      },
    });

    if (exceptions.length > 0) {
      for (const ex of exceptions) {
        await prisma.visitException.create({
          data: { visitId: updated.id, exceptionType: ex, date: new Date() },
        });
      }
    }

    const points = await prisma.visitMileage.findMany({
      where: { visitId: updated.id },
      orderBy: { recordedAt: "asc" },
      select: { latitude: true, longitude: true, recordedAt: true },
    });

    const miles = Number(sumMileageMiles(points).toFixed(2));
    const stops = computeStops(points); // 👈 detect any stops

    if (stops.length) {
      await prisma.visitStop.createMany({
        data: stops.map((s) => ({
          visitId: updated.id,
          startedAt: s.startedAt,
          endedAt: s.endedAt,
          durationSeconds: s.durationSeconds,
          latitude: s.latitude,
          longitude: s.longitude,
          accuracy: s.accuracy ?? null,
          source: "postprocess",
          note: s.note ?? null,
        })),
      });
    }

    await prisma.visit.update({
      where: { id: updated.id },
      data: {
        mileage: miles,
        // Optionally store stop count or flag
        memo: stops.length ? `${stops.length} stops detected` : updated.memo,
      },
    });

    res.json({
      success: true,
      message: "Clocked out successfully",
      visit: { ...updated, mileage: miles, exceptions },
    });
  } catch (err: any) {
    console.error("clockOutVisit error:", err.message, err.stack);
    res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
}

/**
 * POST /api/mobile/visits/:id/mileage
 */
export async function recordMileage(req: Request, res: Response) {
  try {
    const visitId = Number(req.params.id);
    const { latitude, longitude } = req.body;
    if (!visitId || latitude == null || longitude == null) {
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });
    }

    const visit = await prisma.visit.findUnique({ where: { id: visitId } });
    if (!visit || visit.callOut) {
      return res
        .status(400)
        .json({ success: false, message: "Visit is not active" });
    }

    const rec = await prisma.visitMileage.create({
      data: { visitId, latitude, longitude },
    });

    res.json({ success: true, record: rec });
  } catch (e: any) {
    console.error("recordMileage error:", e.message, e.stack);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

/**
 * POST /api/mobile/visits/manual-entry
 */
export async function createManualEntry(req: Request, res: Response) {
  try {
    const {
      clientName,
      serviceID,
      employeeID,
      locationType,
      latitude,
      longitude,
      agencyID,
    } = req.body;

    if (!clientName || !serviceID || !employeeID || !agencyID) {
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });
    }

    const emp = await resolveEmployee(employeeID);
    if (!emp)
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });

    const request = await prisma.visitRequest.create({
      data: {
        clientName,
        serviceID,
        employeeID: emp.id,
        agencyID,
        location: locationType ?? "home",
        latitude: latitude ?? null,
        longitude: longitude ?? null,
      },
    });

    return res.json({
      success: true,
      message: "Manual Visit Request recorded",
      request,
    });
  } catch (err: any) {
    console.error("createManualEntry error:", err.message, err.stack);
    res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
}

/**
 * POST /api/mobile/visits/clock-out-verify
 */
export async function verifyClockOutVisit(req: Request, res: Response) {
  try {
    const { visitId, latitude, longitude } = req.body;

    const visit = await prisma.visit.findUnique({
      where: { id: Number(visitId) },
      include: { agency: true, service: true },
    });
    if (!visit) {
      return res
        .status(404)
        .json({ success: false, message: "Visit not found" });
    }

    let client = null;
    if (visit.clientID) {
      client = await prisma.client.findFirst({
        where: { clientID: visit.clientID },
        include: { addresses: true },
      });
    }

    let gpsWarning: string | null = null;
    let shortVisitWarning: string | null = null;
    const addr = client?.addresses?.[0];
    if (addr?.latitude && addr?.longitude && latitude && longitude) {
      const miles =
        getDistance(
          { latitude, longitude },
          { latitude: addr.latitude, longitude: addr.longitude }
        ) / 1609.34;
      if (miles > 0.25) {
        gpsWarning = `You are ${miles.toFixed(
          2
        )} miles away from client's address.`;
      }
    }

    if (visit.callIn) {
      const diffMinutes =
        (Date.now() - new Date(visit.callIn).getTime()) / 60000;
      if (diffMinutes < 15) {
        shortVisitWarning = `Visit duration is only ${diffMinutes.toFixed(
          1
        )} minutes. Short visit exception may apply.`;
      }
    }

    if (gpsWarning || shortVisitWarning) {
      return res.json({
        success: true,
        confirmationRequired: true,
        warnings: { gpsWarning, shortVisitWarning },
      });
    }

    return res.json({ success: true, confirmationRequired: false });
  } catch (e: any) {
    console.error("verifyClockOutVisit error:", e.message, e.stack);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

/**
 * DELETE /api/mobile/visits/:id/clear-clockout-exception
 * Clears MissingClockOut / visitWithoutOutCallException exceptions after verified clock-out
 */
export async function clearClockOutException(req: Request, res: Response) {
  try {
    const visitId = Number(req.params.id);
    const visit = await prisma.visit.findUnique({ where: { id: visitId } });
    if (!visit)
      return res
        .status(404)
        .json({ success: false, message: "Visit not found" });

    await prisma.visitException.deleteMany({
      where: {
        visitId,
        OR: [
          { exceptionType: "MissingClockOut" },
          { exceptionType: "visitWithoutOutCallException" },
          { exceptionType: "VisitWithoutOutCallException" },
        ],
      },
    });

    const updated = await prisma.visit.update({
      where: { id: visitId },
      data: {
        visitWithoutOutCallException: false,
        totalCurrentExceptions: {
          decrement: 1,
        },
      },
    });

    res.json({
      success: true,
      message: "Clock-out exception cleared",
      visit: updated,
    });
  } catch (err: any) {
    console.error("clearClockOutException error:", err.message, err.stack);
    res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
}

/**
 * GET /api/mobile/visits/:id/tasks
 * Returns all VisitTasks for a visit
 */
export async function getVisitTasks(req: Request, res: Response) {
  try {
    const visitId = Number(req.params.id);
    const tasks = await prisma.visitTask.findMany({
      where: { visitId },
      orderBy: { createdAt: "asc" },
    });
    res.json({ success: true, tasks });
  } catch (err: any) {
    console.error("getVisitTasks error:", err.message, err.stack);
    res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
}

/**
 * GET /api/mobile/visits/:id/details
 * Returns full visit details, mileage, stops, and related info
 */
export async function getVisitDetails(req: Request, res: Response) {
  try {
    const visitId = Number(req.params.id);
    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      include: {
        visitTasks: true,
        VisitMileage: { orderBy: { recordedAt: "asc" } },
        VisitStop: { orderBy: { startedAt: "asc" } },
        exceptions: true,
        agency: { select: { name: true, code: true } },
        service: { select: { id: true, name: true } },
      },
    });
    if (!visit)
      return res
        .status(404)
        .json({ success: false, message: "Visit not found" });

    const client = visit.clientID
      ? await prisma.client.findFirst({
          where: { clientID: visit.clientID },
          include: { addresses: true },
        })
      : null;

    const mileagePoints = visit.VisitMileage.map((p) => ({
      latitude: p.latitude,
      longitude: p.longitude,
    }));
    const totalMileage = Number(sumMileageMiles(mileagePoints).toFixed(2));

    res.json({
      success: true,
      visit: {
        ...visit,
        mileage: totalMileage,
        clientName: visit.clientName,
        clientAddress: client?.addresses?.[0]
          ? `${client.addresses[0].addressLine1}, ${client.addresses[0].city}`
          : "N/A",
        clientPhone: client?.mainPhone || null,
        supervisor: client?.supervisor || visit.supervisor || "N/A",
      },
    });
  } catch (err: any) {
    console.error("getVisitDetails error:", err.message, err.stack);
    res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
}
