import { Request, Response } from "express";
import { getPayrollPreview } from "../services/payroll.service";

export async function previewPayroll(req: Request, res: Response) {
  try {
    const { agencyId, from, to } = req.query;

    if (!agencyId || !from || !to)
      return res.status(400).json({ error: "Missing required params" });

    const data = await getPayrollPreview(
      agencyId as string,
      new Date(from as string),
      new Date(to as string)
    );

    res.json(data);
  } catch (err: any) {
    console.error("Error in payroll preview:", err);
    res.status(500).json({ error: err.message });
  }
}
