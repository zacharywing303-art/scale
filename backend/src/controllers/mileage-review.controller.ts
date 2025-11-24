import { Request, Response } from "express";
import prisma from "../lib/db";

export async function reviewMileage(req: Request, res: Response) {
  try {
    const { agencyId, dateFrom, dateTo, clientId, employeeId, serviceId } =
      req.query as any;

    if (!agencyId) {
      return res.status(400).json({ error: "Missing agencyId" });
    }

    // Base query
    const where: any = {
      agencyID: agencyId,
      mileage: { not: null },
    };

    if (dateFrom && dateTo) {
      where.callIn = {
        gte: new Date(dateFrom),
        lte: new Date(dateTo),
      };
    }

    if (clientId) where.clientID = clientId;
    if (employeeId) where.employeeID = employeeId;
    if (serviceId) where.serviceId = serviceId;

    const visits = await prisma.visit.findMany({
      where,
      select: {
        id: true,
        clientName: true,
        employeeName: true,
        callIn: true,
        callOut: true,
        mileage: true,
      },
      orderBy: { callIn: "desc" },
    });

    const totalFilteredMileage = visits.reduce(
      (sum, v) => sum + (v.mileage ?? 0),
      0
    );

    const totalAgencyMileage = await prisma.visit.aggregate({
      where: { agencyID: agencyId, mileage: { not: null } },
      _sum: { mileage: true },
    });

    return res.json({
      success: true,
      rows: visits,
      totalFilteredMileage,
      totalAgencyMileage: totalAgencyMileage._sum.mileage ?? 0,
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}
