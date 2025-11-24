import * as visitService from "../services/visit.service";
import { Request, Response } from "express";
import prisma from "../lib/db";
import { startOfDay, startOfWeek } from "date-fns";
// import type { Address } from "../prisma/generated";

type Address = {
  id: string;
  addressLabel: string;
  addressLine1: string;
  addressLine2: string | null;
  addressLine3: string | null;
  addressType: string;
  zipcode: string;
  state: string;
  county: string | null;
  employeeID: string | null;
  clientID: string | null;
  city: string;
  latitude: number | null;
  longitude: number | null;
};

export const getVisitsByAgency = async (req: Request, res: Response) => {
  try {
    const { agencyId } = req.params;
    const visits = await visitService.getVisitsByAgency(agencyId);
    return res.json(visits);
  } catch (error) {
    console.error("Error fetching visits:", error);
    return res.status(500).json({ message: "Failed to fetch visits" });
  }
};

export const getVisitById = async (req: Request, res: Response) => {
  try {
    const visit = await visitService.getVisitById(Number(req.params.id));
    if (!visit) return res.status(404).json({ message: "Visit not found" });
    return res.json(visit);
  } catch (error) {
    console.error("Error fetching visit:", error);
    return res.status(500).json({ message: "Failed to fetch visit" });
  }
};

export const createVisit = async (req: Request, res: Response) => {
  try {
    const newVisit = await visitService.createVisit(req.body);
    return res.json(newVisit);
  } catch (error) {
    console.error("Error creating visit:", error);
    return res.status(500).json({ message: "Failed to create visit" });
  }
};

export const updateVisit = async (req: Request, res: Response) => {
  try {
    const updated = await visitService.updateVisit(
      Number(req.params.id),
      req.body
    );
    return res.json(updated);
  } catch (error) {
    console.error("Error updating visit:", error);
    return res.status(500).json({ message: "Failed to update visit" });
  }
};

export const deleteVisit = async (req: Request, res: Response) => {
  try {
    await visitService.deleteVisit(Number(req.params.id));
    return res.json({ message: "Visit deleted" });
  } catch (error) {
    console.error("Error deleting visit:", error);
    return res.status(500).json({ message: "Failed to delete visit" });
  }
};

export async function addVisitTask(req: Request, res: Response) {
  try {
    const visitId = Number(req.params.id);
    const { name } = req.body;
    if (!name) return res.status(400).send("Name is required");
    const created = await visitService.addVisitTask(visitId, name);
    res.json(created);
  } catch (e: any) {
    res.status(400).send(e.message || "Failed to add task");
  }
}

export async function updateVisitTask(req: Request, res: Response) {
  try {
    const visitId = Number(req.params.id);
    const taskId = Number(req.params.taskId);
    const { completed } = req.body;
    const updated = await visitService.updateVisitTask(
      visitId,
      taskId,
      !!completed
    );
    res.json(updated);
  } catch (e: any) {
    res.status(400).send(e.message || "Failed to update task");
  }
}

export async function deleteVisitTask(req: Request, res: Response) {
  try {
    const visitId = Number(req.params.id);
    const taskId = Number(req.params.taskId);
    const out = await visitService.deleteVisitTask(visitId, taskId);
    res.json(out);
  } catch (e: any) {
    res.status(400).send(e.message || "Failed to delete task");
  }
}

export const getGpsExceptions = async (req: Request, res: Response) => {
  try {
    const { agencyId } = req.params;
    const {
      unreviewed,
      from,
      to,
      search,
      page = "1",
      pageSize = "20",
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const take = Math.min(100, parseInt(pageSize as string) || 20);
    const skip = (pageNum - 1) * take;

    const where: any = {
      visit: { agencyID: agencyId },
    };

    if (unreviewed === "true") {
      where.reviewed = false;
    }

    if (from && to) {
      where.createdAt = {
        gte: new Date(from as string),
        lte: new Date(to as string),
      };
    }

    if (search && typeof search === "string" && search.trim()) {
      where.OR = [
        { visit: { clientName: { contains: search, mode: "insensitive" } } },
        { visit: { employeeName: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [items, total] = await prisma.$transaction([
      prisma.gPSException.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          visit: {
            select: {
              id: true,
              callIn: true,
              callOut: true,
              clientName: true,
              employeeName: true,
              clientID: true,
              latitudeIn: true,
              longitudeIn: true,
              latitudeOut: true,
              longitudeOut: true,
            },
          },
        },
      }),
      prisma.gPSException.count({ where }),
    ]);

    // Load client home coordinates in one shot
    const clientIds = Array.from(
      new Set(
        items
          .map((ex: { visit: { clientID: any } }) => ex.visit?.clientID)
          .filter((cid: any): cid is string => !!cid)
      )
    );

    const addresses = clientIds.length
      ? await prisma.address.findMany({
          where: { clientID: { in: clientIds } },
        })
      : [];

    // const addressByClientId = new Map(addresses.map((a) => [a.clientID, a]));
    const addressByClientId: Map<string, Address> = new Map(
      addresses.map((a: Address) => [a.clientID!, a])
    );

    const result = items.map(
      (ex: {
        visit: { clientID: string | null };
        id: any;
        type: any;
        distance: any;
        reason: any;
        createdAt: any;
        reviewed: any;
        reviewedAt: any;
        reviewedBy: any;
      }) => {
        const addr = ex.visit.clientID
          ? (addressByClientId.get(ex.visit.clientID) as Address | undefined)
          : undefined;

        return {
          id: ex.id,
          type: ex.type,
          distance: ex.distance,
          reason: ex.reason,
          createdAt: ex.createdAt,
          reviewed: ex.reviewed,
          reviewedAt: ex.reviewedAt,
          reviewedBy: ex.reviewedBy,
          visit: ex.visit,
          clientHome: addr
            ? {
                latitude: addr.latitude,
                longitude: addr.longitude,
                address: `${addr.addressLine1}, ${addr.city ?? ""}, ${
                  addr.state ?? ""
                } ${addr.zipcode ?? ""}`.trim(),
              }
            : null,
        };
      }
    );

    return res.json({
      items: result,
      total,
      page: pageNum,
      pageSize: take,
    });
  } catch (err: any) {
    console.error("getGpsExceptions error:", err);
    res.status(500).json({ message: "Failed to fetch GPS exceptions" });
  }
};

export const getGpsExceptionSummary = async (req: Request, res: Response) => {
  try {
    const { agencyId } = req.params;

    const now = new Date();
    const todayStart = startOfDay(now);
    const weekStart = startOfWeek(now, { weekStartsOn: 0 }); // Sunday

    const baseWhere = { visit: { agencyID: agencyId } };

    const [
      total,
      unresolved,
      todayTotal,
      todayUnresolved,
      weekTotal,
      weekUnresolved,
    ] = await prisma.$transaction([
      prisma.gPSException.count({ where: baseWhere }),
      prisma.gPSException.count({
        where: { ...baseWhere, reviewed: false },
      }),
      prisma.gPSException.count({
        where: {
          ...baseWhere,
          createdAt: { gte: todayStart },
        },
      }),
      prisma.gPSException.count({
        where: {
          ...baseWhere,
          reviewed: false,
          createdAt: { gte: todayStart },
        },
      }),
      prisma.gPSException.count({
        where: {
          ...baseWhere,
          createdAt: { gte: weekStart },
        },
      }),
      prisma.gPSException.count({
        where: {
          ...baseWhere,
          reviewed: false,
          createdAt: { gte: weekStart },
        },
      }),
    ]);

    res.json({
      total,
      unresolved,
      todayTotal,
      todayUnresolved,
      weekTotal,
      weekUnresolved,
    });
  } catch (err: any) {
    console.error("getGpsExceptionSummary error:", err);
    res.status(500).json({ message: "Failed to fetch GPS exception summary" });
  }
};

export const reviewGpsException = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reviewed } = req.body;

    // Pull from auth middleware if you have it
    const reviewer =
      (req as any).user?.email || (req as any).user?.name || "System";

    const updated = await prisma.gPSException.update({
      where: { id },
      data: {
        reviewed: !!reviewed,
        reviewedAt: reviewed ? new Date() : null,
        reviewedBy: reviewed ? reviewer : null,
      },
    });

    res.json(updated);
  } catch (err: any) {
    console.error("reviewGpsException error:", err);
    res.status(500).json({ message: "Failed to update GPS exception" });
  }
};
