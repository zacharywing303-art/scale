"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, Eye, Download } from "lucide-react";

type SavedReport = {
  id: string;
  fileName: string;
  reportType: string;
  savedDate: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  reports: SavedReport[];
  onView: (id: string) => void;
  onDownload: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function SavedReportsModal({
  open,
  onClose,
  reports,
  onView,
  onDownload,
  onDelete,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Saved Reports</DialogTitle>
        </DialogHeader>

        <div className="overflow-auto">
          <table className="w-full text-sm border border-gray-200">
            <thead className="bg-gray-100">
              <tr className="text-left">
                <th className="p-2 border-b">File Name</th>
                <th className="p-2 border-b">Report Type</th>
                <th className="p-2 border-b">Date Saved</th>
                <th className="p-2 border-b text-center" colSpan={3}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-gray-500">
                    No saved reports found.
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="p-2 border-b">{report.fileName}</td>
                    <td className="p-2 border-b">{report.reportType}</td>
                    <td className="p-2 border-b">{report.savedDate}</td>
                    <td className="p-2 border-b text-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onView(report.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                    <td className="p-2 border-b text-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDownload(report.id)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </td>
                    <td className="p-2 border-b text-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-800"
                        onClick={() => onDelete(report.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
