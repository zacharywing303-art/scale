import { Request, Response } from "express";
import prisma from "../lib/db";
import { getDistance } from "geolib";

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

    const clientAddr = client.addresses?.[0];
    let gpsWarning = null;

    // Calculate distance
    if (
      clientAddr?.latitude &&
      clientAddr?.longitude &&
      latitude &&
      longitude
    ) {
      const distanceMeters = getDistance(
        { latitude, longitude },
        { latitude: clientAddr.latitude, longitude: clientAddr.longitude }
      );
      const miles = distanceMeters / 1609.34;
      if (miles > 0.25) {
        gpsWarning = `You are ${miles.toFixed(
          2
        )} miles away from client's home (${clientAddr.addressLine1}).`;
      }
    }

    // Check if service is valid
    const validService = client.services.some((s) => s.id === serviceID);
    const serviceWarning = validService
      ? null
      : "Selected service is not assigned to this client.";

    return res.json({
      success: true,
      warnings: { gpsWarning, serviceWarning },
      client: {
        name: client.name,
        clientID: client.clientID,
        address: clientAddr
          ? `${clientAddr.addressLine1}, ${clientAddr.city}, ${clientAddr.state}`
          : "N/A",
      },
    });
  } catch (err) {
    console.error("startVisit error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

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
