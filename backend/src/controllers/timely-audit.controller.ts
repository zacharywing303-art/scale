import * as timelyAuditService from "../services/timely-audit.service";
import { Request, Response } from "express";

export async function createAudit(req: Request, res: Response) {
  try {
    const {
      agencyId,
      frequency,
      customStart,
      customEnd,
      unityTaskId,
      createdById,
    } = req.body;

    if (!agencyId || !frequency || !createdById)
      return res.status(400).json({ error: "Missing required fields" });

    const result = await timelyAuditService.generateAudit({
      agencyId,
      frequency,
      customStart,
      customEnd,
      unityTaskId,
      createdById,
    });

    return res.json(result);
  } catch (error) {
    console.error("❌ createAudit error:", error);
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: message });
  }
}

export async function getAgencyAudits(req: Request, res: Response) {
  try {
    const { agencyId } = req.params;
    const audits = await timelyAuditService.getAgencyAudits(agencyId);
    res.json(audits);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch agency audits" });
  }
}

export async function getAuditDetail(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const audit = await timelyAuditService.getAuditDetail(id);
    if (!audit) return res.status(404).json({ error: "Audit not found" });
    res.json(audit);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch audit detail" });
  }
}

export async function markAuditComplete(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updated = await timelyAuditService.markAuditComplete(id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to mark audit complete" });
  }
}

export async function exportAuditReport(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const formatParam = req.query.format;

    // 🧠 Safely cast query param to string
    const format = Array.isArray(formatParam) ? formatParam[0] : formatParam;

    if (format !== "xlsx" && format !== "pdf") {
      return res
        .status(400)
        .json({ error: "Invalid format. Use ?format=xlsx or ?format=pdf" });
    }

    await timelyAuditService.exportAuditReport(id, format, res);
  } catch (error) {
    console.error("❌ exportAuditReport error:", error);
    res.status(500).json({ error: "Failed to export audit report" });
  }
}
