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
import { useState, useEffect } from "react";
import { PlusIcon, SettingsIcon, EyeIcon, RefreshCcwDot } from "lucide-react";
import AddAgencyModal from "@/components/system-admin/AddAgencyModal";
import { useRouter } from "next/navigation";
import ResetPasswordModal from "@/components/system-admin/ResetPasswordModal";
import { Agency } from "@/app/system_admin/agencies/Agency";
import SystemSettingsModal from "@/components/system-admin/SystemSettingsModal";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function AgenciesPage() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "oldest">("recent");
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [showAddAgencyModal, setShowAddAgencyModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);

  const router = useRouter();

  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/agencies`
        );
        if (!res.ok) throw new Error("Failed to fetch agencies");
        const data = await res.json();
        setAgencies(data);
      } catch (err: any) {
        setError(err.message || "Error fetching agencies");
      } finally {
        setLoading(false);
      }
    };

    fetchAgencies();
  }, []);

  const filteredAgencies = agencies
    .filter((agency) => {
      const matchesSearch =
        agency.name.toLowerCase().includes(search.toLowerCase()) ||
        agency.id.toLowerCase().includes(search.toLowerCase());

      const matchesActive = showActiveOnly ? agency.allowEvv : true;

      return matchesSearch && matchesActive;
    })
    .sort((a, b) => {
      const aDate = new Date(a.createdAt ?? "").getTime();
      const bDate = new Date(b.createdAt ?? "").getTime();
      return sortBy === "recent" ? bDate - aDate : aDate - bDate;
    });

  return (
    <ProtectedRoute allowedRoles={["SYSTEM_ADMIN", "MAIN_ADMIN"]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Agencies</h1>
          <Button
            variant="secondary"
            onClick={() => setShowAddAgencyModal(true)}
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Agency
          </Button>
          <AddAgencyModal
            open={showAddAgencyModal}
            onClose={() => setShowAddAgencyModal(false)}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <Input
            type="text"
            placeholder="Search agencies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />

          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as "recent" | "oldest")}
          >
            <SelectTrigger className="max-w-xs">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
            </SelectContent>
          </Select>

          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={showActiveOnly}
              onChange={(e) => setShowActiveOnly(e.target.checked)}
            />
            <span>Active Only</span>
          </label>
        </div>

        <div className="border rounded-md overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
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
                  <TableCell>{agency.name}</TableCell>
                  <TableCell>{agency.email || "N/A"}</TableCell>
                  <TableCell>{agency.phone || "N/A"}</TableCell>
                  <TableCell>
                    {agency.createdAt
                      ? format(new Date(agency.createdAt), "MMMM d, yyyy HH:mm")
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-sm font-medium ${
                        agency.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : agency.status === "Inactive"
                          ? "bg-red-100 text-red-700"
                          : agency.status === "Suspended"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {agency.status
                        ? agency.status.charAt(0).toUpperCase() +
                          agency.status.slice(1)
                        : "Unknown"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        router.push(`/system_admin/agencies/${agency.id}`)
                      }
                      title="View/Edit Agency"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedAgency(agency);
                        setShowResetPasswordModal(true);
                      }}
                      title="Reset Password"
                    >
                      <RefreshCcwDot className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedAgency(agency);
                        setSettingsOpen(true);
                      }}
                      title="Agency Settings"
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
    </ProtectedRoute>
  );
}
