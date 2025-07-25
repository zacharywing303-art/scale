"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import { UserRole } from "./user";
import AddUserModal from "./AddUserModal";
import CreateNewUserModal from "./CreateNewUserModal";

const mockRoles: UserRole[] = [
  {
    role: "Admin",
    users: [
      {
        id: "1",
        email: "admin@example.com",
        phone: "555-123-4567",
      },
    ],
  },
  {
    role: "Co-Admin",
    users: [
      {
        id: "2",
        firstName: "Jane",
        lastName: "Smith",
        email: "jane@example.com",
        phone: "555-987-6543",
      },
    ],
  },
  {
    role: "Manager",
    users: [
      {
        id: "3",
        firstName: "Michael",
        lastName: "Green",
        email: "michael@example.com",
        phone: "555-456-7890",
      },
    ],
  },
  {
    role: "Supervisor",
    users: [],
  },
];

export default function ManageUserRolesPage() {
  const [expandedRoles, setExpandedRoles] = useState<string[]>([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);

  const toggleRole = (role: string) => {
    setExpandedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Manage User Roles</h2>

      {mockRoles.map((roleData) => (
        <div key={roleData.role} className="border rounded-lg">
          <button
            onClick={() => toggleRole(roleData.role)}
            className="w-full text-left px-4 py-3 flex items-center justify-between bg-gray-100"
          >
            <span className="font-semibold">{roleData.role}</span>
            {expandedRoles.includes(roleData.role) ? (
              <ChevronDown className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </button>

          {expandedRoles.includes(roleData.role) && (
            <div className="overflow-x-auto">
              {roleData.users.length > 0 ? (
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      {roleData.role !== "Admin" && (
                        <>
                          <th className="px-4 py-2">First Name</th>
                          <th className="px-4 py-2">Last Name</th>
                        </>
                      )}
                      <th className="px-4 py-2">Email</th>
                      <th className="px-4 py-2">Phone</th>
                      <th className="px-4 py-2">Edit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roleData.users.map((user) => (
                      <tr key={user.id} className="border-t">
                        {roleData.role !== "Admin" && (
                          <>
                            <td className="px-4 py-2">{user.firstName}</td>
                            <td className="px-4 py-2">{user.lastName}</td>
                          </>
                        )}
                        <td className="px-4 py-2">{user.email}</td>
                        <td className="px-4 py-2">{user.phone}</td>
                        <td className="px-4 py-2">
                          <Button variant="link" className="text-blue-600">
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="p-4 text-gray-500">No users in this role.</p>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Buttons */}
      <div className="flex flex-col md:flex-row gap-4 pt-4">
        <Button
          className="w-full md:w-auto"
          onClick={() => setShowAddUserModal(true)}
        >
          Add User to Role
        </Button>
        <AddUserModal
          open={showAddUserModal}
          onClose={() => setShowAddUserModal(false)}
          onSubmit={() => {}}
          existingEmployees={[]}
        />
        <Button
          className="w-full md:w-auto"
          variant="outline"
          onClick={() => setShowCreateUserModal(true)}
        >
          Add New Type of User
        </Button>
        <CreateNewUserModal
          open={showCreateUserModal}
          onClose={() => setShowCreateUserModal(false)}
          onSave={() => {}}
        />
      </div>
    </div>
  );
}
