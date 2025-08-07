import { Request, Response } from "express";
import { getSystemStats } from "../services/agency.stats.service";

export const systemStatsController = async (req: Request, res: Response) => {
  try {
    const stats = await getSystemStats();
    res.status(200).json(stats);
  } catch (error) {
    console.error("Failed to fetch system stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
