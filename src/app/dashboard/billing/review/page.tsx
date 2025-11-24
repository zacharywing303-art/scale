"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { getLoggedInUser } from "@/lib/auth/authHelpers";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import TaskHeader from "@/components/tasks/TaskHeader";

type BillingRow = {
  visitId: number;
  date: string;
  clientName: string;
  medicaidId?: string;
  program?: string | null;
  payer?: string | null;
  serviceCode: string;
  serviceName: string;
  units: number;
  ratePerUnit: number | null;
  total: number;
  hasAuthorization: boolean;
  authorizationNumber?: string | null;
  reason?: string | null;
};

export default function BillingReviewPage() {
  const user = getLoggedInUser();
  const agencyId = user?.agency?.id;
  const params = useSearchParams();
  const taskId = params.get("taskId");
  const from = params.get("from");
  const to = params.get("to");

  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    clientId: "",
    serviceId: "",
    programId: "",
    payerId: "",
  });

  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [payers, setPayers] = useState<any[]>([]);

  const [withAuth, setWithAuth] = useState<BillingRow[]>([]);
  const [withoutAuth, setWithoutAuth] = useState<BillingRow[]>([]);
  const [searchedAt, setSearchedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // local editable rates (visitId -> rate)
  const [rateOverrides, setRateOverrides] = useState<Record<number, number>>(
    {}
  );

  useEffect(() => {
    if (!agencyId) return;
    (async () => {
      const [cli, svc, pro, pay] = await Promise.all([
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/clients/agency/${agencyId}`
        ).then((r) => r.json()),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/services`).then((r) =>
          r.json()
        ),
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/programs/agency/${agencyId}`
        ).then((r) => r.json()),
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/payers/agency/${agencyId}`
        ).then((r) => r.json()),
      ]);

      setClients(cli || []);
      setServices(svc || []);

      // ✅ dedupe by name per your rule
      const uniquePrograms = Array.from(
        new Map(
          (pro || []).filter((p: any) => p?.name).map((p: any) => [p.name, p])
        ).values()
      );
      setPrograms(uniquePrograms);

      const uniquePayers = Array.from(
        new Map(
          (pay || [])
            .filter((p: any) => p?.payerName)
            .map((p: any) => [p.payerName, p])
        ).values()
      );
      setPayers(uniquePayers);
    })();
  }, [agencyId]);

  useEffect(() => {
    if (from || to) {
      // wait a tick so filters update fully
      setTimeout(() => {
        handleSearch();
      }, 150);
    }
    if (from) setFilters((f) => ({ ...f, dateFrom: from }));
    if (to) setFilters((f) => ({ ...f, dateTo: to }));
  }, [from, to]);

  useEffect(() => {
    if (clients.length === 1 && !filters.clientId) {
      setFilters((f) => ({ ...f, clientId: clients[0].id }));
    }
    if (services.length === 1 && !filters.serviceId) {
      setFilters((f) => ({ ...f, serviceId: services[0].id }));
    }
  }, [clients, services]);

  const handleSearch = async () => {
    if (!agencyId) return;

    if (!filters.clientId || !filters.serviceId) {
      toast.error("Client and Service are required.");
      return;
    }

    if (!filters.dateFrom || !filters.dateTo) {
      toast.error("Date range required.");
      return;
    }

    setLoading(true);
    try {
      const qs = new URLSearchParams({
        agencyId,
        clientId: filters.clientId,
        serviceId: filters.serviceId,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        ...(filters.programId ? { programId: filters.programId } : {}),
        ...(filters.payerId ? { payerId: filters.payerId } : {}),
      });

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/billing/review?${qs}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Billing review failed.");

      setWithAuth(data.withAuth || []);
      setWithoutAuth(data.withoutAuth || []);
      setSearchedAt(new Date().toLocaleString());
      setRateOverrides({});
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const allRows = useMemo(
    () => [...withAuth, ...withoutAuth],
    [withAuth, withoutAuth]
  );

  const computedRows = allRows.map((r) => {
    const override = rateOverrides[r.visitId];
    const rate = override ?? r.ratePerUnit ?? 0;
    const total = (r.units ?? 0) * rate;
    return { ...r, ratePerUnit: rate, total };
  });

  const totals = computedRows.reduce(
    (acc, r) => {
      acc.units += r.units ?? 0;
      acc.amount += r.total ?? 0;
      if (r.hasAuthorization) {
        acc.unitsWithAuth += r.units ?? 0;
        acc.amountWithAuth += r.total ?? 0;
      } else {
        acc.unitsWithoutAuth += r.units ?? 0;
        acc.amountWithoutAuth += r.total ?? 0;
      }
      return acc;
    },
    {
      units: 0,
      amount: 0,
      unitsWithAuth: 0,
      amountWithAuth: 0,
      unitsWithoutAuth: 0,
      amountWithoutAuth: 0,
    }
  );

  const exportData = (format: "xlsx" | "pdf") => {
    if (!allRows.length) return;
    const qs = new URLSearchParams({
      agencyId: agencyId!,
      clientId: filters.clientId,
      serviceId: filters.serviceId,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      format,
      ...(filters.programId ? { programId: filters.programId } : {}),
      ...(filters.payerId ? { payerId: filters.payerId } : {}),
    });

    window.open(
      `${process.env.NEXT_PUBLIC_API_URL}/api/billing/export?${qs}`,
      "_blank"
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* 🔥 Task Header */}
      {taskId && (
        <TaskHeader
          taskId={taskId}
          warning="Billing review must be completed before invoice generation."
        />
      )}
      {taskId && (
        <div className="text-xs text-muted-foreground mb-2">
          Complete the billing review below, then click “Mark Complete” above
        </div>
      )}

      {/* Title */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Review Billing</h1>
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? "Searching..." : "Search"}
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
          <Label>Client (required)</Label>
          <Select
            value={filters.clientId}
            onValueChange={(val) =>
              setFilters((f) => ({ ...f, clientId: val }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select client" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name} ({c.clientID})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Service (required)</Label>
          <Select
            value={filters.serviceId}
            onValueChange={(val) =>
              setFilters((f) => ({ ...f, serviceId: val }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select service" />
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

        <div>
          <Label>Program</Label>
          <Select
            value={filters.programId}
            onValueChange={(val) =>
              setFilters((f) => ({ ...f, programId: val }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All programs" />
            </SelectTrigger>
            <SelectContent>
              {programs.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Payer</Label>
          <Select
            value={filters.payerId}
            onValueChange={(val) => setFilters((f) => ({ ...f, payerId: val }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="All payers" />
            </SelectTrigger>
            <SelectContent>
              {payers.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.payerName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Totals */}
      {allRows.length > 0 && (
        <Card className="p-4 flex flex-col md:flex-row md:justify-between gap-3">
          <div className="space-y-1 text-sm">
            <p>
              <b>Units With Auth:</b> {totals.unitsWithAuth}
            </p>
            <p>
              <b>Amount With Auth:</b> ${totals.amountWithAuth.toFixed(2)}
            </p>
          </div>
          <div className="space-y-1 text-sm">
            <p>
              <b>Units Without Auth:</b> {totals.unitsWithoutAuth}
            </p>
            <p>
              <b>Amount Without Auth:</b> ${totals.amountWithoutAuth.toFixed(2)}
            </p>
          </div>
          <div className="space-y-1 text-sm">
            <p className="text-lg font-semibold">
              Grand Total: ${totals.amount.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">
              Searched at: {searchedAt}
            </p>
          </div>
        </Card>
      )}

      {/* Export */}
      {allRows.length > 0 && (
        <div className="flex gap-2">
          <Button onClick={() => exportData("xlsx")}>
            <Download className="w-4 h-4 mr-1" /> Export XLSX
          </Button>
          <Button variant="outline" onClick={() => exportData("pdf")}>
            <Download className="w-4 h-4 mr-1" /> Export PDF
          </Button>
        </div>
      )}

      {/* Table */}
      {/* Empty State */}
      {!loading && allRows.length === 0 && searchedAt && (
        <Card className="p-6 text-center text-muted-foreground">
          No visits found to bill for this period.
        </Card>
      )}

      {allRows.length > 0 && (
        <div className="overflow-x-auto border rounded-md">
          <table className="min-w-full text-sm">
            <thead className="bg-muted text-muted-foreground font-semibold">
              <tr>
                <th className="px-3 py-2 border-r">Date</th>
                <th className="px-3 py-2 border-r">Client</th>
                <th className="px-3 py-2 border-r">Medicaid ID</th>
                <th className="px-3 py-2 border-r">Program</th>
                <th className="px-3 py-2 border-r">Payer</th>
                <th className="px-3 py-2 border-r">Service</th>
                <th className="px-3 py-2 border-r">Units</th>
                <th className="px-3 py-2 border-r">Rate / Unit</th>
                <th className="px-3 py-2 border-r">Total</th>
                <th className="px-3 py-2 border-r">Authorization</th>
                <th className="px-3 py-2">Reason</th>
              </tr>
            </thead>

            <tbody>
              {/* WITH AUTH */}
              <tr className="bg-green-50">
                <td
                  colSpan={11}
                  className="px-3 py-2 font-semibold text-green-700"
                >
                  Visits WITH Authorization
                </td>
              </tr>
              {withAuth.map((r) => {
                const override = rateOverrides[r.visitId];
                const rate = override ?? r.ratePerUnit ?? 0;
                const total = (r.units ?? 0) * rate;

                return (
                  <tr key={r.visitId} className="border-t">
                    <td className="px-3 py-2 border-r">
                      {new Date(r.date).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2 border-r">{r.clientName}</td>
                    <td className="px-3 py-2 border-r">
                      {r.medicaidId ?? "—"}
                    </td>
                    <td className="px-3 py-2 border-r">{r.program ?? "—"}</td>
                    <td className="px-3 py-2 border-r">{r.payer ?? "—"}</td>
                    <td className="px-3 py-2 border-r">
                      {r.serviceCode} — {r.serviceName}
                    </td>
                    <td className="px-3 py-2 border-r">{r.units}</td>
                    <td className="px-3 py-2 border-r">
                      <Input
                        type="number"
                        className="w-24"
                        value={rate}
                        onChange={(e) =>
                          setRateOverrides((prev) => ({
                            ...prev,
                            [r.visitId]: Number(e.target.value || 0),
                          }))
                        }
                      />
                    </td>
                    <td className="px-3 py-2 border-r">${total.toFixed(2)}</td>
                    <td className="px-3 py-2 border-r">
                      {r.authorizationNumber ?? "—"}
                    </td>
                    <td className="px-3 py-2">—</td>
                  </tr>
                );
              })}

              {/* WITHOUT AUTH */}
              <tr className="bg-yellow-50">
                <td
                  colSpan={11}
                  className="px-3 py-2 font-semibold text-yellow-700"
                >
                  Visits WITHOUT Authorization
                </td>
              </tr>
              {withoutAuth.map((r) => {
                const override = rateOverrides[r.visitId];
                const rate = override ?? r.ratePerUnit ?? 0;
                const total = (r.units ?? 0) * rate;

                return (
                  <tr key={r.visitId} className="border-t">
                    <td className="px-3 py-2 border-r">
                      {new Date(r.date).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2 border-r">{r.clientName}</td>
                    <td className="px-3 py-2 border-r">
                      {r.medicaidId ?? "—"}
                    </td>
                    <td className="px-3 py-2 border-r">{r.program ?? "—"}</td>
                    <td className="px-3 py-2 border-r">{r.payer ?? "—"}</td>
                    <td className="px-3 py-2 border-r">
                      {r.serviceCode} — {r.serviceName}
                    </td>
                    <td className="px-3 py-2 border-r">{r.units}</td>
                    <td className="px-3 py-2 border-r">
                      <Input
                        type="number"
                        className="w-24"
                        value={rate}
                        onChange={(e) =>
                          setRateOverrides((prev) => ({
                            ...prev,
                            [r.visitId]: Number(e.target.value || 0),
                          }))
                        }
                      />
                    </td>
                    <td className="px-3 py-2 border-r">${total.toFixed(2)}</td>
                    <td className="px-3 py-2 border-r">None</td>
                    <td className="px-3 py-2">
                      {r.reason ?? "Missing authorization"}
                    </td>
                  </tr>
                );
              })}

              {/* GRAND TOTAL ROW */}
              <tr className="bg-muted font-semibold border-t">
                <td colSpan={6} className="px-3 py-2 text-right">
                  GRAND TOTAL
                </td>
                <td className="px-3 py-2 border-r">{totals.units}</td>
                <td className="px-3 py-2 border-r">—</td>
                <td className="px-3 py-2 border-r">
                  ${totals.amount.toFixed(2)}
                </td>
                <td colSpan={2} className="px-3 py-2">
                  —
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
// "use client";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { useState } from "react";
// import { Pencil1Icon } from "@radix-ui/react-icons";

// const mockResults = [
//   {
//     id: 1,
//     date: "2025-06-28",
//     clientName: "John Doe",
//     program: "Adult Day",
//     medicaidId: "123456789",
//     serviceCode: "S5125",
//     amount: 215.0,
//     authNumber: "AUTH12345",
//     status: "Pending",
//     payer: "AmeriHealth",
//     reason: "Missing authorization",
//     billable: false,
//   },
//   {
//     id: 2,
//     date: "2025-06-27",
//     clientName: "Jane Smith",
//     program: "Home Care",
//     medicaidId: "987654321",
//     serviceCode: "T1019",
//     amount: 150.0,
//     authNumber: "AUTH67890",
//     status: "Verified",
//     payer: "Keystone First",
//     reason: "",
//     billable: true,
//   },
// ];

// export default function CreateInvoicePage() {
//   const [filters, setFilters] = useState({
//     dateFrom: "",
//     dateTo: "",
//     clientName: "",
//     program: "",
//     payer: "",
//     service: "",
//     event: "",
//     visitStatus: "",
//     billable: "",
//   });

//   const [results, setResults] = useState<typeof mockResults>([]);
//   const [searchedAt, setSearchedAt] = useState<string | null>(null);
//   const [perPage, setPerPage] = useState("10");

//   const handleSearch = () => {
//     // simulate result filtering
//     setResults(mockResults);
//     setSearchedAt(new Date().toLocaleString());
//   };

//   const totalAmount = results.reduce((acc, row) => acc + row.amount, 0);

//   return (
//     <div className="p-6 space-y-8">
//       {/* Title and Search */}
//       <div className="flex justify-between items-center">
//         <h1 className="text-2xl font-bold">Create Invoice</h1>
//         <Button onClick={handleSearch}>Search</Button>
//       </div>

//       {/* Filters */}
//       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//         <div>
//           <Label>Date From</Label>
//           <Input
//             type="date"
//             value={filters.dateFrom}
//             onChange={(e) =>
//               setFilters((f) => ({ ...f, dateFrom: e.target.value }))
//             }
//           />
//         </div>
//         <div>
//           <Label>Date To</Label>
//           <Input
//             type="date"
//             value={filters.dateTo}
//             onChange={(e) =>
//               setFilters((f) => ({ ...f, dateTo: e.target.value }))
//             }
//           />
//         </div>
//         <div>
//           <Label>Client Name</Label>
//           <Input
//             value={filters.clientName}
//             onChange={(e) =>
//               setFilters((f) => ({ ...f, clientName: e.target.value }))
//             }
//             placeholder="John Doe"
//           />
//         </div>
//         <div>
//           <Label>Program</Label>
//           <Input
//             value={filters.program}
//             onChange={(e) =>
//               setFilters((f) => ({ ...f, program: e.target.value }))
//             }
//             placeholder="Adult Day"
//           />
//         </div>
//         <div>
//           <Label>Payer</Label>
//           <Input
//             value={filters.payer}
//             onChange={(e) =>
//               setFilters((f) => ({ ...f, payer: e.target.value }))
//             }
//             placeholder="Aetna"
//           />
//         </div>
//         <div>
//           <Label>Service</Label>
//           <Input
//             value={filters.service}
//             onChange={(e) =>
//               setFilters((f) => ({ ...f, service: e.target.value }))
//             }
//             placeholder="T1019"
//           />
//         </div>
//         <div>
//           <Label>Event</Label>
//           <Input
//             value={filters.event}
//             onChange={(e) =>
//               setFilters((f) => ({ ...f, event: e.target.value }))
//             }
//             placeholder="Routine Visit"
//           />
//         </div>
//         <div>
//           <Label>Visit Status</Label>
//           <Select
//             onValueChange={(val) =>
//               setFilters((f) => ({ ...f, visitStatus: val }))
//             }
//           >
//             <SelectTrigger>
//               <SelectValue placeholder="Status" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="verified">Verified</SelectItem>
//               <SelectItem value="pending">Pending</SelectItem>
//               <SelectItem value="rejected">Rejected</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>
//         <div>
//           <Label>Billing Status</Label>
//           <Select
//             onValueChange={(val) =>
//               setFilters((f) => ({ ...f, billable: val }))
//             }
//           >
//             <SelectTrigger>
//               <SelectValue placeholder="Ok / Not Ok to Bill" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="ok">Ok to Bill</SelectItem>
//               <SelectItem value="not-ok">Not Ok to Bill</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>
//       </div>

//       {/* Total + Timestamp */}
//       {results.length > 0 && (
//         <div className="flex justify-between items-center">
//           <p className="font-semibold text-lg">
//             Total Amount: ${totalAmount.toFixed(2)}
//           </p>
//           <p className="text-sm text-gray-500">Searched at: {searchedAt}</p>
//         </div>
//       )}

//       {/* Table */}
//       <div className="overflow-x-auto border rounded-md">
//         <table className="min-w-full text-sm">
//           <thead className="bg-gray-100 text-gray-700 font-semibold">
//             <tr>
//               <th className="px-4 py-2 border-r">Edit</th>
//               <th className="px-4 py-2 border-r">Date</th>
//               <th className="px-4 py-2 border-r">Client</th>
//               <th className="px-4 py-2 border-r">Program</th>
//               <th className="px-4 py-2 border-r">Medicaid ID</th>
//               <th className="px-4 py-2 border-r">Service Code</th>
//               <th className="px-4 py-2 border-r">Amount</th>
//               <th className="px-4 py-2 border-r">Authorization</th>
//               <th className="px-4 py-2 border-r">Status</th>
//               <th className="px-4 py-2 border-r">Payer</th>
//               <th className="px-4 py-2">Reason Not Billable</th>
//             </tr>
//           </thead>
//           <tbody>
//             {results.map((r) => (
//               <tr key={r.id} className="border-t">
//                 <td className="px-4 py-2 border-r">
//                   <Button variant="ghost" size="sm">
//                     <Pencil1Icon />
//                   </Button>
//                 </td>
//                 <td className="px-4 py-2 border-r">{r.date}</td>
//                 <td className="px-4 py-2 border-r">{r.clientName}</td>
//                 <td className="px-4 py-2 border-r">{r.program}</td>
//                 <td className="px-4 py-2 border-r">{r.medicaidId}</td>
//                 <td className="px-4 py-2 border-r">{r.serviceCode}</td>
//                 <td className="px-4 py-2 border-r">${r.amount.toFixed(2)}</td>
//                 <td className="px-4 py-2 border-r">{r.authNumber}</td>
//                 <td className="px-4 py-2 border-r">{r.status}</td>
//                 <td className="px-4 py-2 border-r">{r.payer}</td>
//                 <td className="px-4 py-2">{r.reason || "—"}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Pagination */}
//       <div className="flex items-center justify-between mt-4">
//         <div className="flex items-center space-x-2">
//           <Label>Rows per page:</Label>
//           <Select
//             onValueChange={(val) => setPerPage(val)}
//             defaultValue={perPage}
//           >
//             <SelectTrigger className="w-20">
//               <SelectValue />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="10">10</SelectItem>
//               <SelectItem value="25">25</SelectItem>
//               <SelectItem value="50">50</SelectItem>
//               <SelectItem value="100">100</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>
//         <div>
//           <Button variant="ghost">← Prev</Button>
//           <Button variant="ghost">Next →</Button>
//         </div>
//       </div>
//     </div>
//   );
// }
