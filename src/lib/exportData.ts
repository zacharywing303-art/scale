import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

/**
 * Exports table data to Excel (.xlsx) or CSV format.
 * @param data Array of objects (e.g., visits, users)
 * @param filename Name of the output file (without extension)
 * @param type Either "xlsx" or "csv"
 */
export function exportTableData(
  data: any[],
  filename: string = "export",
  type: "xlsx" | "csv" = "xlsx"
) {
  if (!data || data.length === 0) {
    console.warn("No data to export.");
    return;
  }

  try {
    // Convert JSON to worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Create workbook and append sheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

    if (type === "csv") {
      const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
      const blob = new Blob([csvOutput], {
        type: "text/csv;charset=utf-8;",
      });
      saveAs(blob, `${filename}.csv`);
    } else {
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, `${filename}.xlsx`);
    }
  } catch (error) {
    console.error("Export failed:", error);
  }
}
