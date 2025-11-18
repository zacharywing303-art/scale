import { Request, Response } from "express";
import * as payrollService from "../services/payroll.service";

export async function previewPayroll(req: Request, res: Response) {
  try {
    const { agencyId, periodFrom, periodTo } = req.query;

    const rows = await payrollService.getPayrollPreview({
      agencyId: String(agencyId),
      periodFrom: String(periodFrom),
      periodTo: String(periodTo),
    });

    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function runPayroll(req: Request, res: Response) {
  try {
    const result = await payrollService.runPayroll(req.body);
    res.json(result);
  } catch (err: any) {
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
