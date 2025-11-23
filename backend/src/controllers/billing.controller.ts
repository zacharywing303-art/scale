import { Request, Response } from "express";
import * as billingService from "../services/billing.service";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";

export async function reviewBilling(req: Request, res: Response) {
  try {
    const {
      agencyId,
      clientId,
      serviceId,
      dateFrom,
      dateTo,
      programId,
      payerId,
    } = req.query as any;

    if (!agencyId || !clientId || !serviceId || !dateFrom || !dateTo) {
      return res.status(400).json({ message: "Missing required filters." });
    }

    const data = await billingService.reviewBilling({
      agencyId,
      clientId,
      serviceId,
      dateFrom,
      dateTo,
      programId,
      payerId,
    });

    res.json(data);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
}

export async function exportBilling(req: Request, res: Response) {
  try {
    const format = (req.query.format as string) || "xlsx";
    const payload = await billingService.reviewBilling(req.query as any);

    const rows = [...payload.withAuth, ...payload.withoutAuth];

    if (format === "xlsx") {
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet("Billing Review");

      ws.columns = [
        { header: "Date", key: "date", width: 14 },
        { header: "Client", key: "clientName", width: 20 },
        { header: "Medicaid ID", key: "medicaidId", width: 14 },
        { header: "Program", key: "program", width: 18 },
        { header: "Payer", key: "payer", width: 18 },
        { header: "Service Code", key: "serviceCode", width: 12 },
        { header: "Service Name", key: "serviceName", width: 18 },
        { header: "Units", key: "units", width: 8 },
        { header: "Rate/Unit", key: "ratePerUnit", width: 10 },
        { header: "Total", key: "total", width: 10 },
        { header: "Authorization #", key: "authorizationNumber", width: 16 },
        { header: "Has Auth", key: "hasAuthorization", width: 8 },
        { header: "Reason", key: "reason", width: 20 },
      ];

      rows.forEach((r) => ws.addRow(r));

      // Totals row
      ws.addRow({});
      ws.addRow({
        clientName: "TOTALS",
        units: payload.totals.grandUnits,
        total: payload.totals.grandAmount,
      });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=billing-review.xlsx"
      );

      await wb.xlsx.write(res);
      res.end();
      return;
    }

    if (format === "pdf") {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=billing-review.pdf"
      );

      const doc = new PDFDocument({ margin: 30, size: "A4" });
      doc.pipe(res);

      doc.fontSize(16).text("Billing Review", { align: "center" });
      doc.moveDown();

      doc.fontSize(10);
      rows.forEach((r) => {
        doc.text(
          `${new Date(r.date).toLocaleDateString()} | ${r.clientName} | ${
            r.serviceCode
          } | Units: ${r.units} | Rate: ${r.ratePerUnit ?? "N/A"} | Total: $${(
            r.total ?? 0
          ).toFixed(2)} | Auth: ${r.authorizationNumber ?? "None"}`
        );
      });

      doc.moveDown();
      doc
        .fontSize(12)
        .text(
          `Grand Total: $${payload.totals.grandAmount.toFixed(2)}  |  Units: ${
            payload.totals.grandUnits
          }`
        );

      doc.end();
      return;
    }

    res.status(400).json({ message: "Unsupported export format." });
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
}
