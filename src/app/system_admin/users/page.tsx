"use client";

import { useState, useEffect } from "react";
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
import { getLoggedInUser } from "@/lib/auth/authHelpers";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { format } from "date-fns";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  agency?: string;
  isActive: boolean;
  lastLogin: string;
};

export default function SystemUsersPage() {
  // TODO: Replace this with real auth logic

  const [search, setSearch] = useState("");

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loggedInUser = getLoggedInUser();
  const isMainAdmin = loggedInUser?.role === "MAIN_ADMIN";
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/users");
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        setUsers(data);
      } catch (err: any) {
        setError(err.message || "Error fetching users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users
    .filter(
      (user) => user.role === "MAIN_ADMIN" || user.role === "SYSTEM_ADMIN"
    )
    .filter((user) => {
      const query = search.toLowerCase();
      return (
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    });

  return (
    <ProtectedRoute allowedRoles={["MAIN_ADMIN", "SYSTEM_ADMIN"]}>
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
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          user.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {user.lastLogin
                        ? format(new Date(user.lastLogin), "MMMM d, yyyy HH:mm")
                        : "N/A"}
                    </TableCell>
                    {isMainAdmin && (
                      <TableCell className="flex justify-end gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            router.push(`/system_admin/users/${user.id}`);
                          }}
                          title="Edit User"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setSelectedAgency({ id: user.id, name: user.name });
                            setShowDeleteModal(true);
                          }}
                        >
                          <TrashIcon className="w-4 h-4 text-red-500" />
                        </Button>
                        <DeleteSystemUserModal
                          open={showDeleteModal}
                          onClose={() => setShowDeleteModal(false)}
                          userName={user.name}
                          userId={user.id}
                          onConfirm={() => {
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
    </ProtectedRoute>
  );
}
