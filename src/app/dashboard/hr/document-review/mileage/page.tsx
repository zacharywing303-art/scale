"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import TaskHeader from "@/components/tasks/TaskHeader";
import { getLoggedInUser } from "@/lib/auth/authHelpers";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function MileageReviewPage() {
  const params = useSearchParams();
  const taskId = params.get("taskId");
  const from = params.get("from");
  const to = params.get("to");

  const user = getLoggedInUser();
  const agencyId = user?.agency?.id;

  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    clientId: "",
    employeeId: "",
    serviceId: "",
  });

  const [clients, setClients] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);

  const [rows, setRows] = useState<any[]>([]);
  const [totalFiltered, setTotalFiltered] = useState(0);
  const [totalAgency, setTotalAgency] = useState(0);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load dropdowns
  useEffect(() => {
    if (!agencyId) return;

    (async () => {
      const [cliRes, empRes, svcRes] = await Promise.all([
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/clients/agency/${agencyId}`
        ).then((r) => r.json()),
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/employees/agency/${agencyId}`
        ).then((r) => r.json()),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/services`).then((r) =>
          r.json()
        ),
      ]);

      setClients(cliRes || []);
      setEmployees(empRes || []);
      setServices(svcRes || []);
    })();
  }, [agencyId]);

  // Task autofill + auto-search
  useEffect(() => {
    if (from) setFilters((f) => ({ ...f, dateFrom: from }));
    if (to) setFilters((f) => ({ ...f, dateTo: to }));

    if (from || to) {
      setTimeout(() => handleSearch(), 150);
    }
  }, [from, to]);

  const handleSearch = async () => {
    if (!agencyId) return;

    if (!filters.dateFrom || !filters.dateTo) {
      toast.error("Date range required.");
      return;
    }

    setLoading(true);
    try {
      const qs = new URLSearchParams({
        agencyId,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        ...(filters.clientId ? { clientId: filters.clientId } : {}),
        ...(filters.employeeId ? { employeeId: filters.employeeId } : {}),
        ...(filters.serviceId ? { serviceId: filters.serviceId } : {}),
      });

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/mileage/review?${qs}`
      );
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error);

      setRows(data.rows);
      setTotalFiltered(data.totalFilteredMileage || 0);
      setTotalAgency(data.totalAgencyMileage || 0);
      setSearched(true);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {taskId && (
        <>
          <TaskHeader
            taskId={taskId}
            warning="Review mileage entries for your agency."
          />
          <div className="text-xs text-muted-foreground mb-2">
            Review all mileage records below, then click “Mark Complete”.
          </div>
        </>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Mileage Review</h1>
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? "Loading..." : "Search"}
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div>
          <Label>Date From</Label>
          <Input
            type="date"
            value={filters.dateFrom}
            onChange={(e) =>
              setFilters((f) => ({ ...f, dateFrom: e.target.value }))
            }
          />
        </div>

        <div>
          <Label>Date To</Label>
          <Input
            type="date"
            value={filters.dateTo}
            onChange={(e) =>
              setFilters((f) => ({ ...f, dateTo: e.target.value }))
            }
          />
        </div>

        <div>
          <Label>Client</Label>
          <Select
            value={filters.clientId}
            onValueChange={(v) => setFilters((f) => ({ ...f, clientId: v }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="All clients" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Employee</Label>
          <Select
            value={filters.employeeId}
            onValueChange={(v) => setFilters((f) => ({ ...f, employeeId: v }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="All employees" />
            </SelectTrigger>
            <SelectContent>
              {employees.map((emp) => (
                <SelectItem key={emp.id} value={emp.id}>
                  {emp.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Service</Label>
          <Select
            value={filters.serviceId}
            onValueChange={(v) => setFilters((f) => ({ ...f, serviceId: v }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="All services" />
            </SelectTrigger>
            <SelectContent>
              {services.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.code} — {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Totals */}
      {searched && (
        <Card className="p-4 flex flex-col md:flex-row md:justify-between gap-3 text-sm">
          <div>
            <b>Total Mileage (This Range):</b> {totalFiltered.toFixed(2)} mi
          </div>
          <div>
            <b>Total Mileage (All-Time Agency):</b> {totalAgency.toFixed(2)} mi
          </div>
        </Card>
      )}

      {/* Empty State */}
      {searched && rows.length === 0 && (
        <Card className="p-6 text-center text-muted-foreground">
          No mileage entries found for this period.
        </Card>
      )}

      {/* Table */}
      {rows.length > 0 && (
        <div className="overflow-x-auto border rounded-md">
          <table className="min-w-full text-sm">
            <thead className="bg-muted text-muted-foreground font-semibold">
              <tr>
                <th className="px-3 py-2 border-r">Client</th>
                <th className="px-3 py-2 border-r">Employee</th>
                <th className="px-3 py-2 border-r">Call In</th>
                <th className="px-3 py-2 border-r">Call Out</th>
                <th className="px-3 py-2">Mileage</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-3 py-2 border-r">{r.clientName}</td>
                  <td className="px-3 py-2 border-r">{r.employeeName}</td>
                  <td className="px-3 py-2 border-r">
                    {new Date(r.callIn).toLocaleString()}
                  </td>
                  <td className="px-3 py-2 border-r">
                    {new Date(r.callOut).toLocaleString()}
                  </td>
                  <td className="px-3 py-2">
                    {r.mileage?.toFixed(2) ?? "0.00"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
