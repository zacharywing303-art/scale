import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const frequencies = [
  "Daily",
  "Weekly",
  "Biweekly",
  "Monthly",
  "Quarterly",
  "Yearly",
  "Date Range",
];

export default function SystemAutoHRReports() {
  const [frequency, setFrequency] = useState("");

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Auto HR Reports</CardTitle>
        <p className="text-sm text-gray-600">
          Automatically generated reports for HR insights
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="max-w-xs">
          <label className="block text-sm font-medium mb-1">Frequency</label>
          <Select onValueChange={setFrequency}>
            <SelectTrigger>
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              {frequencies.map((f) => (
                <SelectItem key={f} value={f.toLowerCase()}>
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Mileage Table */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Mileage Report</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Number of Employees</TableHead>
                <TableHead>Total Mileage</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>15</TableCell>
                <TableCell>1250 mi</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost">View</Button>
                  <Button variant="ghost">Download</Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Hours Worked Table */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Total Hours Worked</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Number of Employees</TableHead>
                <TableHead>Total Hours</TableHead>
                <TableHead>Clients</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>19</TableCell>
                <TableCell>400</TableCell>
                <TableCell>5</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost">View</Button>
                  <Button variant="ghost">Download</Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Client Review Table */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Client Reviews</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date Start</TableHead>
                <TableHead>Date End</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>07/01/2025</TableCell>
                <TableCell>07/15/2025</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost">View</Button>
                  <Button variant="ghost">Download</Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Employee Review Table */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Employee Reviews</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date Start</TableHead>
                <TableHead>Date End</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>07/01/2025</TableCell>
                <TableCell>07/15/2025</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost">View</Button>
                  <Button variant="ghost">Download</Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
