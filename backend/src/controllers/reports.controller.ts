// src/controllers/reports.controller.ts
import { Request, Response } from "express";
import {
  getReportFilters,
  getEvvComplianceReport,
} from "../services/reports.service";

export async function getFilters(req: Request, res: Response) {
  try {
    const { agencyId } = req.params;
    const data = await getReportFilters(agencyId);
    res.json(data);
  } catch (e) {
    console.error("getFilters error", e);
    res.status(500).json({ error: "Failed to load report filters" });
  }
}

export async function evvCompliance(req: Request, res: Response) {
  try {
    const { agencyId } = req.params;
    const { from, to, employeeId, clientId, medicaidId } = req.body;

    if (!from || !to) {
      return res.status(400).json({ error: "from and to are required" });
    }

    const report = await getEvvComplianceReport({
      agencyId,
      from,
      to,
      employeeId,
      clientId,
      medicaidId,
    });

    res.json(report);
  } catch (e) {
    console.error("evvCompliance error", e);
    res.status(500).json({ error: "Failed to generate EVV Compliance report" });
  }
}
