"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PencilIcon, TrashIcon, UserCogIcon } from "lucide-react";
import AddSystemUserModal from "@/components/system-admin/AddSystemUserModal";
import DeleteSystemUserModal from "@/components/system-admin/DeleteUserModal";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  agency?: string;
  status: "Active" | "Inactive" | "Suspended";
  lastLogin: string;
};

const dummyUsers: User[] = [
  {
    id: "SA-001",
    name: "Main Admin",
    email: "admin@system.com",
    role: "System Admin",
    status: "Active",
    lastLogin: "2025-07-23 09:14",
  },
  {
    id: "SA-002",
    name: "Support Admin",
    email: "support@system.com",
    role: "System Admin",
    status: "Active",
    lastLogin: "2025-07-22 10:30",
  },
  {
    id: "U-003",
    name: "Non Admin",
    email: "employee@agency.com",
    role: "Caregiver",
    agency: "CarePlus",
    status: "Active",
    lastLogin: "2025-07-22 14:15",
  },
];

export default function SystemUsersPage() {
  // TODO: Replace this with real auth logic
  const isMainAdmin = true; // assume the logged-in user is main system admin

  const [search, setSearch] = useState("");

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const router = useRouter();

  const filteredUsers = dummyUsers
    .filter((user) => user.role === "System Admin")
    .filter((user) => {
      const query = search.toLowerCase();
      return (
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    });

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">System Users</h1>
        {isMainAdmin && (
          <Button onClick={() => setAddModalOpen(true)}>
            <UserCogIcon className="w-4 h-4 mr-2" />
            Add System User
          </Button>
        )}
        <AddSystemUserModal
          open={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          onSubmit={(newUser) => {
            console.log("New user:", newUser);
            // TODO: Call backend API
          }}
        />
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <Input
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-1/2"
          />

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                {isMainAdmin && (
                  <TableHead className="text-right">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.status}</TableCell>
                  <TableCell>{user.lastLogin}</TableCell>
                  {isMainAdmin && (
                    <TableCell className="flex justify-end gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          // TODO: Implement edit user functionality
                          router.push(`/system_admin/users/${user.id}`);
                        }}
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setShowDeleteModal(true)}
                      >
                        <TrashIcon className="w-4 h-4 text-red-500" />
                      </Button>
                      <DeleteSystemUserModal
                        open={showDeleteModal}
                        onClose={() => setShowDeleteModal(false)}
                        userName={user.name}
                        userId={user.id}
                        onConfirm={() => {
                          // Refetch or navigate after delete
                          router.push("/system_admin/users");
                        }}
                      />
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={isMainAdmin ? 5 : 4}
                    className="text-center text-muted-foreground"
                  >
                    No system users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
