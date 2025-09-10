"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { getLoggedInUser } from "@/lib/auth/authHelpers";
import { format } from "date-fns";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { ro } from "date-fns/locale";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  lastLogin: string;
  createdAt: string;
};

const loggedInUser = getLoggedInUser();
const isMainAdmin = loggedInUser?.role === "MAIN_ADMIN";

export default function SystemUserDetailPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState("");

  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/users/${id}`
        );
        if (!res.ok) throw new Error("Failed to fetch user");
        const data = await res.json();
        setUser(data);
        setName(data.name || "No Name");
        setEmail(data.email || "No Email");
        setIsActive(data.isActive ?? true);
      } catch (err: any) {
        setError(err.message || "Error loading user");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchUser();
  }, [id]);

  const handleSave = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, isActive }),
        }
      );

      if (!res.ok) throw new Error("Failed to update user");

      const updatedUser = await res.json();
      setUser(updatedUser);
      toast.success("User updated successfully");
      router.push("/system_admin/users");
    } catch (err: any) {
      toast.error(err.message || "Failed to save changes");
    }
    console.log("Updated User:", { id: id, name, email, isActive });
  };

  if (loading) {
    return <div className="p-6">Loading user data...</div>;
  }
  if (!user) {
    return <div className="p-6">User not found.</div>;
  }

  return (
    <ProtectedRoute allowedRoles={["MAIN_ADMIN"]}>
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">System User Details</h1>

        <Card className="p-6 space-y-4">
          <div>
            <Label htmlFor="name" className="mb-2">
              Full Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!isMainAdmin}
            />
          </div>

          <div>
            <Label htmlFor="email" className="mb-2">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!isMainAdmin}
            />
          </div>

          <div>
            <Label htmlFor="status" className="mb-2">
              Status
            </Label>
            <Select
              value={isActive ? "Active" : "Inactive"}
              onValueChange={(val) => setIsActive(val === "Active")}
              disabled={!isMainAdmin}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>
              <strong>Created:</strong>{" "}
              {new Date(user.createdAt).toLocaleString()}
            </p>
            <p>
              <strong>Last Login:</strong>{" "}
              {new Date(user.lastLogin).toLocaleString()}
            </p>
          </div>

          {isMainAdmin && (
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => history.back()}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </div>
          )}
        </Card>
      </div>
    </ProtectedRoute>
  );
}
