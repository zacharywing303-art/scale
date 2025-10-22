"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download } from "lucide-react";
import { exportTableData } from "@/lib/exportData";
import { visitColumns } from "@/app/dashboard/visits/visitColumns";

type ExportButtonProps = {
  filteredVisits: any[];
  displayColumns: string[];
};

export default function ExportButton({
  filteredVisits,
  displayColumns,
}: ExportButtonProps) {
  const handleExport = (type: "xlsx" | "csv") => {
    // ✅ Filter columns to only export visible ones
    const visibleColumns = visitColumns.filter((c) =>
      displayColumns.includes(c.key)
    );

    // ✅ Map data to use column labels as headers
    const visibleData = filteredVisits.map((row) => {
      const newRow: any = {};
      visibleColumns.forEach((col) => {
        newRow[col.label] = row[col.key];
      });
      return newRow;
    });

    // ✅ Add timestamp to file name
    const timestamp = new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/[:T]/g, "-");
    const filename = `Visits_Report_${timestamp}`;

    // ✅ Export data
    exportTableData(visibleData, filename, type);
  };

  return (
    <Select onValueChange={(value) => handleExport(value as "xlsx" | "csv")}>
      <SelectTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          <SelectValue placeholder="Export Data" />
        </Button>
      </SelectTrigger>

      <SelectContent className="w-[220px]">
        <SelectItem value="xlsx">📊 Export as Excel (.xlsx)</SelectItem>
        <SelectItem value="csv">📄 Export as CSV (.csv)</SelectItem>
      </SelectContent>
    </Select>
  );
}
