"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import AgencyPasswordResetModal from "@/components/system-admin/AgencyPasswordResetModal";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

interface UserAccount {
  id: string;
  name: string;
  email: string;
  agency: string;
  role: "Admin" | "Staff" | "Manager";
}

const mockUsers: UserAccount[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@sunrisehomecare.com",
    agency: "Sunrise Homecare",
    role: "Admin",
  },
  {
    id: "2",
    name: "Fatima Khan",
    email: "fatima@brightcare.org",
    agency: "BrightCare Agency",
    role: "Staff",
  },
  {
    id: "3",
    name: "Liam Turner",
    email: "liam@hopehealth.com",
    agency: "Hope Health",
    role: "Manager",
  },
];

export default function ResetPasswordsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleReset = (user: UserAccount) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const confirmReset = () => {
    if (selectedUser) {
      // TODO: API call
      toast.success(`Password reset link sent to ${selectedUser.email}`);
    }
    setModalOpen(false);
  };

  const filteredUsers = mockUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ProtectedRoute allowedRoles={["MAIN_ADMIN"]}>
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">Reset Passwords</h1>

        <AgencyPasswordResetModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onConfirm={confirmReset}
          user={{
            ...selectedUser!,
            lastPasswordReset: "2024-06-10T14:30:00Z", // replace with real data
          }}
        />

        <div className="max-w-md">
          <Label htmlFor="search" className="mb-2">
            Search by name or email
          </Label>
          <Input
            id="search"
            placeholder="Enter user name or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid gap-4">
          {filteredUsers.map((user) => (
            <Card key={user.id}>
              <CardContent className="flex items-center justify-between py-4 px-6">
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-sm text-muted-foreground">
                    {user.agency} – {user.role}
                  </p>
                </div>
                <Button onClick={() => handleReset(user)}>
                  Reset Password
                </Button>
              </CardContent>
            </Card>
          ))}

          {filteredUsers.length === 0 && (
            <p className="text-muted-foreground">No users found.</p>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
