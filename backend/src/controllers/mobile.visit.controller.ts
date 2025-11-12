import { Request, Response } from "express";
import prisma from "../lib/db";
import { getDistance } from "geolib";
import * as visitService from "../services/visit.service";
import { subHours } from "date-fns";

/** Helper: resolve employee by internal id OR human employeeID (code) */
async function resolveEmployee(anyId: string | undefined | null) {
  if (!anyId) return null;
  // try by Prisma id
  const byId = await prisma.employee.findUnique({ where: { id: anyId } });
  if (byId) return byId;
  // try by external employeeID code
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
  return meters / 1609.34; // miles
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

    // check assignment
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
  } catch (err) {
    console.error("searchClientByClientID error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

/**
 * POST /api/mobile/visits/start
 * Start a new visit (clock-in)
 */
export async function startVisit(req: Request, res: Response) {
  try {
    const {
      clientID, // client.clientID (string code)
      employeeID, // may be Employee.id or Employee.employeeID (code)
      serviceID,
      latitude,
      longitude,
      locationType, // "home" | "community"
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

    // GPS validation
    const addr = client.addresses?.[0] ?? null;
    let gpsWarning: string | null = null;
    let flagMissingLocation = false;

    if (addr && latitude && longitude) {
      if (addr.latitude != null && addr.longitude != null) {
        const meters = getDistance(
          { latitude, longitude },
          { latitude: addr.latitude, longitude: addr.longitude }
        );
        const miles = meters / 1609.34;
        if (miles > 0.25) {
          gpsWarning = `You are ${miles.toFixed(
            2
          )} miles away from client's location (${addr.addressLine1}).`;
          flagMissingLocation = true;
        }
      } else {
        gpsWarning = "Client address is missing coordinates.";
        flagMissingLocation = true;
      }
    }

    // Service validation
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

    // Ask for confirmation first
    if (!proceedAnyway && (gpsWarning || serviceWarning)) {
      return res.json({
        success: true,
        confirmationRequired: true,
        warnings: { gpsWarning, serviceWarning },
      });
    }

    // Prevent duplicate active
    const existingActive = await prisma.visit.findFirst({
      where: {
        employeeID: employee.employeeID, // store code in Visit.employeeID
        clientID: client.clientID, // store code in Visit.clientID
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

    // Create visit
    const visit = await visitService.createVisit({
      agencyID,
      employeeId: employee.id, // internal id for lookups
      clientId: client.id, // internal id for lookups
      callIn: new Date(),
      serviceId: service?.id,
      timeZone: "EST",
      source: "mobile",
      location: locationType,
      latitudeIn: latitude,
      longitudeIn: longitude,
    });

    // add safety exceptions
    const exceptionUpdates: any = {
      visitWithoutOutCallException: true, // always true until clock-out
      missingClockOutException: true, // your requirement
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

    return res.json({
      success: true,
      message: `Visit started for ${client.name}`,
      visit,
    });
  } catch (err) {
    console.error("startVisit error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

/**
 * GET /api/mobile/visits/active?employeeID=EMP_CODE_OR_ID
 * Returns the one active visit (if any) for this employee.
 */
// export async function getActiveVisit(req: Request, res: Response) {
//   try {
//     const employeeParam =
//       (req.query.employeeID as string) ||
//       (req as any).user?.employeeID ||
//       (req as any).user?.id;
//     const employee = await resolveEmployee(employeeParam);
//     if (!employee) return res.json({ success: true, visit: null });

//     const active = await prisma.visit.findFirst({
//       where: {
//         employeeID: employee.employeeID,
//         callOut: null,
//         visitStatus: { in: ["InProcess"] },
//       },
//       include: {
//         visitTasks: true,
//         exceptions: true,
//       },
//       orderBy: { callIn: "desc" },
//     });

//     res.json({ success: true, visit: active });
//   } catch (e) {
//     console.error("getActiveVisit error:", e);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// }
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
        employeeID: employee.employeeID, // stored as the human-readable employee code on Visit
        callOut: null,
        visitStatus: { in: ["InProcess"] },
      },
      include: {
        visitTasks: true,
        exceptions: true,
        service: { select: { id: true, name: true, code: true } }, // helpful fallback
      },
      orderBy: { callIn: "desc" },
    });

    if (!active) {
      return res.json({ success: true, visit: null });
    }

    // Build a UI-friendly shape that matches your HomeScreen expectations
    const uiVisit = {
      id: active.id,
      clientName: active.clientName ?? null,
      service: active.serviceName ?? active.service?.name ?? null, // <- what your UI renders
      date: (active.callIn ?? active.scheduledTimeIn)?.toISOString() ?? null,
      schIn: active.scheduledTimeIn?.toISOString() ?? null,
      schOut: active.scheduledTimeOut?.toISOString() ?? null,
      clockIn: active.callIn?.toISOString() ?? null,
      address: active.inOutCallLocation ?? null,

      // keep anything useful your UI may want next:
      visitStatus: active.visitStatus,
      serviceId: active.serviceId,
      serviceCode: active.service?.code ?? null,
      agencyID: active.agencyID,
      // optional: keep full record if other screens rely on it later
      raw: active,
    };

    return res.json({ success: true, visit: uiVisit });
  } catch (e) {
    console.error("getActiveVisit error:", e);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

/**
 * POST /api/mobile/visits/clock-out
 * body: { visitId, latitude, longitude }
 */
// export async function clockOutVisit(req: Request, res: Response) {
//   try {
//     const { visitId, latitude, longitude } = req.body;
//     if (!visitId)
//       return res
//         .status(400)
//         .json({ success: false, message: "visitId required" });

//     const visit = await prisma.visit.findUnique({
//       where: { id: Number(visitId) },
//     });
//     if (!visit)
//       return res
//         .status(404)
//         .json({ success: false, message: "Visit not found" });

//     // Save out time/coords + status + clear exceptions
//     const updated = await visitService.updateVisit(Number(visit.id), {
//       callOut: new Date(),
//       latitudeOut: latitude ?? null,
//       longitudeOut: longitude ?? null,
//       visitStatus: "Verified",
//       outCall: true,
//       visitWithoutOutCallException: false,
//       missingClockOutException: false,
//     });

//     // Aggregate mileage points to Visit.mileage
//     const points = await prisma.visitMileage.findMany({
//       where: { visitId: updated.id },
//       orderBy: { recordedAt: "asc" },
//       select: { latitude: true, longitude: true },
//     });
//     const miles = Number(sumMileageMiles(points).toFixed(2));

//     await prisma.visit.update({
//       where: { id: updated.id },
//       data: { mileage: miles },
//     });

//     res.json({
//       success: true,
//       message: "Clocked out successfully",
//       visit: { ...updated, mileage: miles },
//     });
//   } catch (err) {
//     console.error("clockOutVisit error:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// }
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

    const updates: any = {
      callOut: new Date(),
      latitudeOut: latitude ?? null,
      longitudeOut: longitude ?? null,
      visitStatus: "Verified",
      outCall: true,
      visitWithoutOutCallException: false,
      missingClockOutException: false,
      memo: serviceNote ?? null,
    };

    // 🔎 Exception logic
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
        if (!proceedAnyway) {
          exceptions.push("GPS Exception (out of range)");
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

    // Save tasks
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

    // Update visit + record exceptions
    const updated = await prisma.visit.update({
      where: { id: visit.id },
      data: updates,
    });

    if (exceptions.length > 0) {
      for (const ex of exceptions) {
        await prisma.visitException.create({
          data: { visitId: updated.id, exceptionType: ex, date: new Date() },
        });
      }
    }

    // Mileage aggregation
    const points = await prisma.visitMileage.findMany({
      where: { visitId: updated.id },
      orderBy: { recordedAt: "asc" },
      select: { latitude: true, longitude: true },
    });
    const miles = Number(sumMileageMiles(points).toFixed(2));
    await prisma.visit.update({
      where: { id: updated.id },
      data: { mileage: miles },
    });

    res.json({
      success: true,
      message: "Clocked out successfully",
      visit: { ...updated, mileage: miles, exceptions },
    });
  } catch (err) {
    console.error("clockOutVisit error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

/**
 * POST /api/mobile/visits/:id/mileage
 * record a single ping (called by background task every ~15 min)
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

    // Ensure visit is still active
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
  } catch (e) {
    console.error("recordMileage error:", e);
    res.status(500).json({ success: false, message: "Server error" });
  }
}
/**
 * POST /api/mobile/visits/manual-entry
 * Create a VisitRequest (manual clock-in request)
 */
export async function createManualEntry(req: Request, res: Response) {
  try {
    const {
      clientName,
      serviceID,
      employeeID, // id or code (either is ok)
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
        employeeID: emp.id, // link to Employee by internal id
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
  } catch (err) {
    console.error("createManualEntry error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}
/**
 * POST /api/mobile/visits/clock-out-verify
 * Pre-check exceptions before clock-out
 */
export async function verifyClockOutVisit(req: Request, res: Response) {
  try {
    const { visitId, latitude, longitude } = req.body;

    // 1️⃣ Fetch the visit (with agency + service)
    const visit = await prisma.visit.findUnique({
      where: { id: Number(visitId) },
      include: { agency: true, service: true },
    });
    if (!visit) {
      return res
        .status(404)
        .json({ success: false, message: "Visit not found" });
    }

    // 2️⃣ Manually fetch the client (using its primary key `id`, not clientID)
    //    In your schema, `Client.id` is the @id field (cuid), so use that.
    let client = null;
    if (visit.clientID) {
      client = await prisma.client.findFirst({
        where: { clientID: visit.clientID },
        include: { addresses: true },
      });
    }

    let gpsWarning: string | null = null;
    let shortVisitWarning: string | null = null;

    // 3️⃣ Client address check
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

    // 4️⃣ Short visit warning
    if (visit.callIn) {
      const diffMinutes =
        (Date.now() - new Date(visit.callIn).getTime()) / 60000;
      if (diffMinutes < 15) {
        shortVisitWarning = `Visit duration is only ${diffMinutes.toFixed(
          1
        )} minutes. Short visit exception may apply.`;
      }
    }

    // 5️⃣ Respond with warnings or success
    if (gpsWarning || shortVisitWarning) {
      return res.json({
        success: true,
        confirmationRequired: true,
        warnings: { gpsWarning, shortVisitWarning },
      });
    }

    return res.json({ success: true, confirmationRequired: false });
  } catch (e) {
    console.error("verifyClockOutVisit error:", e);
    res.status(500).json({ success: false, message: "Server error" });
  }
}
