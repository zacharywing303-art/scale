import { Request, Response } from "express";
import prisma from "../lib/db";
import { getDistance } from "geolib";
import * as visitService from "../services/visit.service";

/**
 * GET /api/mobile/visit/search-client/:clientID
 * Search a client by their clientID
 */
export async function searchClientByClientID(req: Request, res: Response) {
  try {
    const { clientID } = req.params;
    const employeeId = (req as any).user?.id || req.query.employeeId; // from token or query

    const client = await prisma.client.findFirst({
      where: { clientID },
      include: { addresses: true, services: true, assignedEmployees: true },
    });

    if (!client)
      return res
        .status(404)
        .json({ success: false, message: "Client not found" });

    // If employee provided, check assignment
    let isAssigned = false;
    if (employeeId) {
      isAssigned = client.assignedEmployees.some((e) => e.id === employeeId);
    }

    const addr = client.addresses?.[0];
    const fullAddress = addr
      ? `${addr.addressLine1}, ${addr.city}, ${addr.state} ${addr.zipcode}`
      : "No address on file";

    return res.json({
      success: true,
      client: {
        id: client.id,
        name: client.name,
        clientID: client.clientID,
        address: fullAddress,
        services: client.services.map((s) => ({
          id: s.id,
          name: s.name,
          code: s.code,
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
 * POST /api/mobile/visit/start
 * Start a new visit (clock-in)
 */
/**
 * POST /api/mobile/visit/start
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
      locationType, // home or community
      agencyID,
      proceedAnyway = false, // flag for confirmation step
    } = req.body;

    if (!clientID || !employeeID || !serviceID)
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });

    const [client, employee, service] = await Promise.all([
      prisma.client.findFirst({
        where: { clientID, agencyID },
        include: { addresses: true, services: true },
      }),
      prisma.employee.findUnique({ where: { id: employeeID } }),
      prisma.service.findUnique({ where: { id: serviceID } }),
    ]);

    if (!client || !employee)
      return res
        .status(404)
        .json({ success: false, message: "Client or employee not found" });

    // ---------------------------------
    // 1️⃣ GPS Distance Validation (safe if no address)
    // ---------------------------------
    const clientAddr =
      Array.isArray(client.addresses) && client.addresses.length > 0
        ? client.addresses[0]
        : null;

    let gpsWarning: string | null = null;
    let gpsException = false;

    if (clientAddr && latitude && longitude) {
      if (clientAddr.latitude && clientAddr.longitude) {
        const distanceMeters = getDistance(
          { latitude, longitude },
          { latitude: clientAddr.latitude, longitude: clientAddr.longitude }
        );
        const miles = distanceMeters / 1609.34;
        if (miles > 0.25) {
          gpsWarning = `You are ${miles.toFixed(
            2
          )} miles away from client's location (${clientAddr.addressLine1}).`;
          gpsException = true;
        }
      } else {
        gpsWarning = "Client address has no coordinates recorded.";
        gpsException = true;
      }
    }

    // ---------------------------------
    // 2️⃣ Service Validation (safe if no services)
    // ---------------------------------
    const hasServices =
      Array.isArray(client.services) && client.services.length > 0;
    let validService = false;

    if (hasServices) {
      validService = client.services.some((s) => s.id === serviceID);
    }

    const serviceWarning = !hasServices
      ? "This client has no services linked. You may still continue if allowed."
      : !validService
      ? "Selected service is not assigned to this client."
      : null;

    const unauthorizedServiceException = !hasServices || !validService;

    // ---------------------------------
    // 3️⃣ If user has NOT confirmed yet, show warnings
    // ---------------------------------
    if (!proceedAnyway && (gpsWarning || serviceWarning)) {
      return res.json({
        success: true,
        confirmationRequired: true,
        warnings: { gpsWarning, serviceWarning },
        client: {
          name: client.name,
          clientID: client.clientID,
          address: clientAddr
            ? `${clientAddr.addressLine1}, ${clientAddr.city}, ${clientAddr.state}`
            : "N/A",
        },
      });
    }

    // ---------------------------------
    // 4️⃣ Proceed — Create Visit
    // ---------------------------------
    const visitData = {
      agencyID,
      employeeId: employee.id,
      clientId: client.id,
      callIn: new Date(),
      serviceId: service?.id,
      source: "mobile",
      location: locationType,
      latitudeIn: latitude,
      longitudeIn: longitude,
    };

    // Prevent duplicate "active" visits for same employee + client
    const existingActive = await prisma.visit.findFirst({
      where: {
        employeeID,
        clientID: client.id,
        callOut: null, // still active
        visitStatus: { in: ["InProcess"] },
      },
    });
    if (existingActive) {
      return res.json({
        success: false,
        message: "You already have an active visit for this client.",
      });
    }

    const visit = await visitService.createVisit(visitData);

    // ---------------------------------
    // 5️⃣ Apply custom exceptions for warnings
    // ---------------------------------
    const updateExceptions: any = {};
    if (gpsException) updateExceptions.missingLocationException = true;
    if (unauthorizedServiceException)
      updateExceptions.unauthorizedServiceException = true;
    // Always true until clock-out
    updateExceptions.visitWithoutOutCallException = true;

    if (Object.keys(updateExceptions).length > 0) {
      await prisma.visit.update({
        where: { id: visit.id },
        data: {
          ...updateExceptions,
          totalCurrentExceptions: Object.keys(updateExceptions).length,
          totalOriginalExceptions: Object.keys(updateExceptions).length,
        },
      });
    }

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
// export async function startVisit(req: Request, res: Response) {
//   try {
//     const {
//       clientID,
//       employeeID,
//       serviceID,
//       latitude,
//       longitude,
//       locationType, // home or community
//       agencyID,
//     } = req.body;

//     if (!clientID || !employeeID || !serviceID)
//       return res
//         .status(400)
//         .json({ success: false, message: "Missing required fields" });

//     const [client, employee, service] = await Promise.all([
//       prisma.client.findFirst({
//         where: { clientID, agencyID },
//         include: { addresses: true, services: true },
//       }),
//       prisma.employee.findUnique({ where: { id: employeeID } }),
//       prisma.service.findUnique({ where: { id: serviceID } }),
//     ]);

//     if (!client || !employee)
//       return res
//         .status(404)
//         .json({ success: false, message: "Client or employee not found" });

//     const clientAddr = client.addresses?.[0];
//     let gpsWarning = null;

//     // Calculate distance
//     if (
//       clientAddr?.latitude &&
//       clientAddr?.longitude &&
//       latitude &&
//       longitude
//     ) {
//       const distanceMeters = getDistance(
//         { latitude, longitude },
//         { latitude: clientAddr.latitude, longitude: clientAddr.longitude }
//       );
//       const miles = distanceMeters / 1609.34;
//       if (miles > 0.25) {
//         gpsWarning = `You are ${miles.toFixed(
//           2
//         )} miles away from client's home (${clientAddr.addressLine1}).`;
//       }
//     }

//     // Check if service is valid
//     const validService = client.services.some((s) => s.id === serviceID);
//     const serviceWarning = validService
//       ? null
//       : "Selected service is not assigned to this client.";

//     return res.json({
//       success: true,
//       warnings: { gpsWarning, serviceWarning },
//       client: {
//         name: client.name,
//         clientID: client.clientID,
//         address: clientAddr
//           ? `${clientAddr.addressLine1}, ${clientAddr.city}, ${clientAddr.state}`
//           : "N/A",
//       },
//     });
//   } catch (err) {
//     console.error("startVisit error:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// }

/**
 * POST /api/mobile/visit/manual-entry
 * Manual/offline clock-in request
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
    } = req.body;

    if (!clientName || !serviceID || !employeeID)
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });

    // You can store this in a separate table later (e.g. VisitRequest)
    console.log("Manual visit request:", req.body);

    return res.json({
      success: true,
      message:
        "Manual/offline visit request recorded. It will be reviewed by your agency.",
    });
  } catch (err) {
    console.error("createManualEntry error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}
