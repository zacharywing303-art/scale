import { Request, Response } from "express";
import * as payrollService from "../services/payroll.service";

export async function getSuggestedPeriod(req: Request, res: Response) {
  try {
    const { agencyId } = req.query;
    if (!agencyId) {
      return res.status(400).json({ error: "agencyId is required" });
    }
    const { from, to } = await payrollService.getSuggestedPeriod(
      String(agencyId)
    );
    res.json({
      periodFrom: from.toISOString(),
      periodTo: to.toISOString(),
    });
  } catch (err: any) {
    console.error("getSuggestedPeriod error:", err);
    res.status(500).json({ error: err.message });
  }
}

export async function previewPayroll(req: Request, res: Response) {
  try {
    const { agencyId, periodFrom, periodTo } = req.query;
    if (!agencyId || !periodFrom || !periodTo) {
      return res.status(400).json({ error: "Missing required query fields" });
    }

    const rows = await payrollService.getPayrollPreview({
      agencyId: String(agencyId),
      periodFrom: String(periodFrom),
      periodTo: String(periodTo),
    });

    res.json(rows);
  } catch (err: any) {
    console.error("previewPayroll error:", err);
    res.status(500).json({ error: err.message });
  }
}

export async function runPayroll(req: Request, res: Response) {
  try {
    const result = await payrollService.runPayroll(req.body);
    res.json(result);
  } catch (err: any) {
    console.error("runPayroll error:", err);
    res.status(500).json({ error: err.message });
  }
}

export async function listHistory(req: Request, res: Response) {
  try {
    const { agencyId } = req.query;
    if (!agencyId) {
      return res.status(400).json({ error: "agencyId is required" });
    }
    const history = await payrollService.listPayrollHistory(String(agencyId));
    res.json(history);
  } catch (err: any) {
    console.error("listHistory error:", err);
    res.status(500).json({ error: err.message });
  }
}

export async function getHistory(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const history = await payrollService.getPayrollHistoryById(id);
    if (!history) return res.status(404).json({ error: "Not found" });
    res.json(history);
  } catch (err: any) {
    console.error("getHistory error:", err);
    res.status(500).json({ error: err.message });
  }
}

export async function approvePayroll(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const approverId =
      (req as any).user?.id || (req.body && req.body.approverId);
    if (!approverId) {
      return res.status(400).json({ error: "approverId is required" });
    }
    const updated = await payrollService.approvePayroll(id, approverId);
    res.json(updated);
  } catch (err: any) {
    console.error("approvePayroll error:", err);
    res.status(500).json({ error: err.message });
  }
}

export async function rejectPayroll(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const approverId =
      (req as any).user?.id || (req.body && req.body.approverId);
    const { notes } = req.body;
    if (!approverId) {
      return res.status(400).json({ error: "approverId is required" });
    }
    const updated = await payrollService.rejectPayroll(id, approverId, notes);
    res.json(updated);
  } catch (err: any) {
    console.error("rejectPayroll error:", err);
    res.status(500).json({ error: err.message });
  }
}

export async function exportPayroll(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { format } = req.query;
    if (!format) {
      return res.status(400).json({ error: "format is required" });
    }

    const { mime, filename, content } = await payrollService.exportPayroll(
      id,
      String(format)
    );

    res.setHeader("Content-Type", mime);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(content);
  } catch (err: any) {
    console.error("exportPayroll error:", err);
    res.status(500).json({ error: err.message });
  }
}

// import { Request, Response } from "express";
// import * as payrollService from "../services/payroll.service";
// import prisma from "../lib/db";

// export async function getPayrollPreview(req: Request, res: Response) {
//   try {
//     const { agencyId, periodFrom, periodTo, taskId } = req.query;

//     if (!agencyId || typeof agencyId !== "string") {
//       return res.status(400).json({ message: "agencyId is required" });
//     }

//     const preview = await payrollService.getPayrollPreview({
//       agencyId,
//       periodFrom: periodFrom as string | undefined,
//       periodTo: periodTo as string | undefined,
//       taskId: taskId as string | undefined,
//     });

//     // If taskId present → optionally auto-complete if payroll already exists
//     let autoCompleted: any = null;
//     if (taskId && typeof taskId === "string") {
//       autoCompleted = await payrollService.autoCompletePayrollTaskIfRun({
//         agencyId,
//         taskId,
//       });
//     }

//     res.json({
//       ...preview,
//       autoCompleted,
//     });
//   } catch (err: any) {
//     console.error("Error fetching payroll preview:", err);
//     res
//       .status(500)
//       .json({ message: err.message || "Failed to get payroll preview" });
//   }
// }

// export async function runPayroll(req: Request, res: Response) {
//   try {
//     const { agencyId, periodFrom, periodTo, taskId, notes, runByUserId } =
//       req.body;

//     if (!agencyId || !periodFrom || !periodTo || !runByUserId) {
//       return res.status(400).json({
//         message: "agencyId, periodFrom, periodTo, and runByUserId are required",
//       });
//     }

//     // Optional: verify runByUser exists
//     const user = await prisma.user.findUnique({
//       where: { id: runByUserId },
//       select: { id: true, name: true },
//     });
//     if (!user) {
//       return res.status(400).json({ message: "Invalid runByUserId" });
//     }

//     const result = await payrollService.runPayroll({
//       agencyId,
//       periodFrom,
//       periodTo,
//       taskId,
//       notes,
//       runByUserId,
//     });

//     res.json(result);
//   } catch (err: any) {
//     console.error("Error running payroll:", err);
//     res.status(500).json({ message: err.message || "Failed to run payroll" });
//   }
// }
