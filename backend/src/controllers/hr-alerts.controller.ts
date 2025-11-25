import { Request, Response } from "express";
import * as hrAlertService from "../services/hr-alerts.service";

export async function getHRAlerts(req: Request, res: Response) {
  try {
    const { agencyId } = req.params;
    const alerts = await hrAlertService.getHRAlerts(agencyId);
    res.json(alerts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load HR alerts" });
  }
}
