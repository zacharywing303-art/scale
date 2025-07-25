"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { PlusIcon, SettingsIcon, EyeIcon, RefreshCcwDot } from "lucide-react";
import AddAgencyModal from "@/components/system-admin/AddAgencyModal";
import { ro } from "date-fns/locale";
import { useRouter } from "next/navigation";
import ResetPasswordModal from "@/components/system-admin/ResetPasswordModal";
import { Agency } from "@/app/system_admin/agencies/Agency";
import SystemSettingsModal from "@/components/system-admin/SystemSettingsModal";

const mockAgencies: Agency[] = [
  {
    id: "AG001",
    name: "Sunrise Health Services",
    email: "contact@sunrisehealth.com",
    phone: "(555) 123-4567",
    createdAt: "2024-02-10",
    allowEvv: true,
    status: "Active",
    state: "California",
    subscriptionPlan: "Premium",
    paymentMethod: "Credit Card",
    numberOfUsers: 50,
    timeSpent: "120 hours",
    address: "123 Sunrise St, Los Angeles, CA 90001",
  },
  {
    id: "AG002",
    name: "CareBridge Agency",
    email: "info@carebridge.org",
    phone: "(555) 987-6543",
    createdAt: "2023-11-03",
    allowEvv: false,
    status: "Inactive",
    state: "Texas",
    subscriptionPlan: "Basic",
    paymentMethod: "PayPal",
    numberOfUsers: 30,
    timeSpent: "80 hours",
    address: "456 CareBridge Rd, Austin, TX 73301",
  },
  // Add more dummy rows as needed
];

export default function AgenciesPage() {
  const [search, setSearch] = useState("");
  const [showAddAgencyModal, setShowAddAgencyModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);

  const router = useRouter();
  const handleResetPassword = (agency: Agency) => {
    setSelectedAgency(agency);
    setShowResetPasswordModal(true);
  };

  const handleSettings = (agency: Agency) => {
    setSelectedAgency(agency);
    setSettingsOpen(true);
  };

  const filteredAgencies = mockAgencies.filter(
    (agency) =>
      agency.name.toLowerCase().includes(search.toLowerCase()) ||
      agency.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Agencies</h1>
        <Button variant="secondary" onClick={() => setShowAddAgencyModal(true)}>
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Agency
        </Button>
        <AddAgencyModal
          open={showAddAgencyModal}
          onClose={() => setShowAddAgencyModal(false)}
        />
      </div>

      <div className="w-full max-w-md">
        <Input
          type="text"
          placeholder="Search agencies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAgencies.map((agency) => (
              <TableRow key={agency.id}>
                <TableCell>{agency.id}</TableCell>
                <TableCell>{agency.name}</TableCell>
                <TableCell>{agency.email}</TableCell>
                <TableCell>{agency.phone}</TableCell>
                <TableCell>{agency.createdAt}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded text-sm font-medium ${
                      agency.allowEvv
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {agency.allowEvv ? "Active" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      router.push(`/system_admin/agencies/${agency.id}`)
                    }
                  >
                    <EyeIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleResetPassword(agency)}
                  >
                    <RefreshCcwDot className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSettings(agency)}
                  >
                    <SettingsIcon className="w-4 h-4" />
                  </Button>

                  {showResetPasswordModal && selectedAgency && (
                    <ResetPasswordModal
                      agency={selectedAgency}
                      onClose={() => setShowResetPasswordModal(false)}
                    />
                  )}
                  {settingsOpen && selectedAgency && (
                    <SystemSettingsModal
                      agency={selectedAgency}
                      open={settingsOpen}
                      onClose={() => setSettingsOpen(false)}
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
            {filteredAgencies.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground py-6"
                >
                  No agencies found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
