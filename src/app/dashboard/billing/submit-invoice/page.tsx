// Submitted Invoices Page - src/app/dashboard/billing/submit-invoice/page.tsx
// This is a Next.js page for viewing and submitting previously created invoices.
// We may use this page to filter, select, and submit invoices to payers in the future.

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
// import { Checkbox } from "@/components/ui/checkbox";
// import { useState } from "react";

// const mockInvoices = [
//   {
//     id: 1,
//     date: "2025-06-20",
//     client: "John Doe",
//     program: "Adult Day",
//     payer: "AmeriHealth",
//     status: "Pending",
//     providerId: "P12345",
//     amount: 375.5,
//     billable: true,
//   },
//   {
//     id: 2,
//     date: "2025-06-18",
//     client: "Jane Smith",
//     program: "Home Care",
//     payer: "Keystone First",
//     status: "Submitted",
//     providerId: "P67890",
//     amount: 212.0,
//     billable: true,
//   },
//   {
//     id: 3,
//     date: "2025-06-15",
//     client: "George Brown",
//     program: "Respite",
//     payer: "Aetna",
//     status: "Rejected",
//     providerId: "P54321",
//     amount: 110.0,
//     billable: false,
//   },
// ];

// export default function SubmittedInvoicesPage() {
//   const [filters, setFilters] = useState({
//     client: "",
//     dateFrom: "",
//     dateTo: "",
//     program: "",
//     payer: "",
//     status: "",
//     providerId: "",
//     billableOnly: false,
//   });

//   const [results, setResults] = useState<typeof mockInvoices>([]);
//   const [selected, setSelected] = useState<number[]>([]);

//   const handleSearch = () => {
//     const filtered = mockInvoices.filter((inv) => {
//       const matchesClient = filters.client
//         ? inv.client.toLowerCase().includes(filters.client.toLowerCase())
//         : true;
//       const matchesBillable = filters.billableOnly ? inv.billable : true;
//       return matchesClient && matchesBillable;
//     });
//     setResults(filtered);
//     setSelected([]);
//   };

//   const toggleSelect = (id: number) => {
//     setSelected((prev) =>
//       prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
//     );
//   };

//   return (
//     <div className="p-6 space-y-6">
//       {/* Header */}
//       <div className="flex justify-between items-center">
//         <h1 className="text-2xl font-bold">Submitted Invoices</h1>
//         <Button disabled={selected.length === 0}>
//           Submit {selected.length} Invoice{selected.length !== 1 && "s"}
//         </Button>
//       </div>

//       {/* Filters */}
//       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//         <div>
//           <Label>Client Name</Label>
//           <Input
//             value={filters.client}
//             onChange={(e) =>
//               setFilters((f) => ({ ...f, client: e.target.value }))
//             }
//             placeholder="John Doe"
//           />
//         </div>
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
//             placeholder="Keystone First"
//           />
//         </div>
//         <div>
//           <Label>Status</Label>
//           <Select
//             onValueChange={(val) => setFilters((f) => ({ ...f, status: val }))}
//           >
//             <SelectTrigger>
//               <SelectValue placeholder="Choose status" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="Pending">Pending</SelectItem>
//               <SelectItem value="Submitted">Submitted</SelectItem>
//               <SelectItem value="Rejected">Rejected</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>
//         <div>
//           <Label>Provider ID</Label>
//           <Input
//             value={filters.providerId}
//             onChange={(e) =>
//               setFilters((f) => ({ ...f, providerId: e.target.value }))
//             }
//             placeholder="P12345"
//           />
//         </div>
//         <div className="flex items-center space-x-2 pt-6">
//           <Checkbox
//             id="billable"
//             checked={filters.billableOnly}
//             onCheckedChange={(checked) =>
//               setFilters((f) => ({ ...f, billableOnly: !!checked }))
//             }
//           />
//           <Label htmlFor="billable">Show Only Billable</Label>
//         </div>
//       </div>

//       <Button className="mt-4" onClick={handleSearch}>
//         Search Invoices
//       </Button>

//       {/* Table */}
//       <div className="overflow-x-auto border rounded-md mt-6">
//         <table className="min-w-full text-sm">
//           <thead className="bg-gray-100 text-gray-700 font-semibold">
//             <tr>
//               <th className="px-4 py-2 border-r">Select</th>
//               <th className="px-4 py-2 border-r">Date</th>
//               <th className="px-4 py-2 border-r">Client</th>
//               <th className="px-4 py-2 border-r">Program</th>
//               <th className="px-4 py-2 border-r">Payer</th>
//               <th className="px-4 py-2 border-r">Status</th>
//               <th className="px-4 py-2 border-r">Provider ID</th>
//               <th className="px-4 py-2">Total Amount</th>
//             </tr>
//           </thead>
//           <tbody>
//             {results.map((invoice) => (
//               <tr key={invoice.id} className="border-t">
//                 <td className="px-4 py-2 border-r">
//                   <Checkbox
//                     checked={selected.includes(invoice.id)}
//                     onCheckedChange={() => toggleSelect(invoice.id)}
//                   />
//                 </td>
//                 <td className="px-4 py-2 border-r">{invoice.date}</td>
//                 <td className="px-4 py-2 border-r">{invoice.client}</td>
//                 <td className="px-4 py-2 border-r">{invoice.program}</td>
//                 <td className="px-4 py-2 border-r">{invoice.payer}</td>
//                 <td className="px-4 py-2 border-r">{invoice.status}</td>
//                 <td className="px-4 py-2 border-r">{invoice.providerId}</td>
//                 <td className="px-4 py-2">${invoice.amount.toFixed(2)}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }
