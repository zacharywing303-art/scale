import { Request, Response } from "express";
import * as hrService from "../services/hr-alerts.service";

export async function getAlerts(req: Request, res: Response) {
  try {
    const { agencyId } = req.params;
    const userId = (req as any).user?.id ?? "system";
    const alerts = await hrService.getHRAlerts(agencyId, userId);
    res.json(alerts);
  } catch (e) {
    res.status(500).json({ error: "Failed to load HR alerts" });
  }
}

export async function dismiss(req: Request, res: Response) {
  try {
    const { agencyId } = req.params;
    const { alertType } = req.body;
    const userId = (req as any).user?.id ?? "system";

    await hrService.dismissAlert(agencyId, alertType, userId);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "Failed to dismiss alert" });
  }
}
