"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import AddUserModal from "./AddUserModal";
import CreateNewUserModal from "./CreateNewUserModal";
import { getLoggedInUser } from "@/lib/auth/authHelpers";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  roleId?: string;
  role?: string;
  agencyId?: string;
}

interface Role {
  id: string;
  name: string;
  description?: string;
  permissions?: any[];
  users?: User[];
}

export default function ManageUserRolesPage() {
  const [expandedRoles, setExpandedRoles] = useState<string[]>([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // ✅ Load logged-in user
  useEffect(() => {
    const user = getLoggedInUser();
    setCurrentUser(user);
  }, []);

  const toggleRole = (role: string) => {
    setExpandedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  // ✅ Fetch roles + users in agency
  useEffect(() => {
    if (!currentUser?.agency?.id) return;

    const fetchRolesAndUsers = async () => {
      try {
        setLoading(true);
        const agencyId = currentUser.agency.id;

        const [rolesRes, usersRes] = await Promise.all([
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/roles?agencyId=${agencyId}`
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/users?agencyId=${agencyId}`
          ),
        ]);

        if (!rolesRes.ok || !usersRes.ok)
          throw new Error("Failed to fetch roles or users");

        const [roleData, userData] = await Promise.all([
          rolesRes.json(),
          usersRes.json(),
        ]);

        const admin = userData.find(
          (u: any) =>
            (u.role === "AGENCY_ADMIN" ||
              u.role === "Admin" ||
              u.roleId === "AGENCY_ADMIN") &&
            u.agencyId === currentUser.agency?.id
        );
        setAdminUser(admin || null);

        // Group users by roleId
        const rolesWithUsers = roleData.map((role: Role) => ({
          ...role,
          users: userData.filter((u: User) => u.roleId === role.id),
        }));

        setRoles(rolesWithUsers);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Error loading roles");
      } finally {
        setLoading(false);
      }
    };

    fetchRolesAndUsers();
  }, [currentUser]);

  if (!currentUser) {
    return <p className="p-6 text-gray-500">Loading user...</p>;
  }

  if (loading) {
    return <p className="p-6 text-gray-500">Loading roles...</p>;
  }

  if (error) {
    return <p className="p-6 text-red-500">Error: {error}</p>;
  }

  return (
    <ProtectedRoute allowedRoles={["AGENCY_ADMIN", "AGENCY_USER"]}>
      <div className="p-6 space-y-6">
        <h2 className="text-2xl font-bold">Manage User Roles</h2>

        {/* Admin Section */}
        <div className="border rounded-lg">
          <button
            onClick={() => toggleRole("Admin")}
            className="w-full text-left px-4 py-3 flex items-center justify-between bg-gray-100"
          >
            <span className="font-semibold">Admin</span>
            {expandedRoles.includes("Admin") ? (
              <ChevronDown className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </button>

          {expandedRoles.includes("Admin") && (
            <div className="overflow-x-auto">
              {adminUser ? (
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="px-4 py-2">Email</th>
                      <th className="px-4 py-2">Phone</th>
                      <th className="px-4 py-2">Edit</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="px-4 py-2">{adminUser.email}</td>
                      <td className="px-4 py-2">{adminUser.phone || "—"}</td>
                      <td className="px-4 py-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAddUserModal(true)}
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <div className="p-4 text-sm text-gray-500">
                  No Admin found for this agency.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Other Roles */}
        {roles.map((role) => (
          <div key={role.id} className="border rounded-lg">
            <button
              onClick={() => toggleRole(role.name)}
              className="w-full text-left px-4 py-3 flex items-center justify-between bg-gray-100"
            >
              <span className="font-semibold">{role.name}</span>
              {expandedRoles.includes(role.name) ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </button>

            {expandedRoles.includes(role.name) && (
              <div className="overflow-x-auto">
                {role.users && role.users.length > 0 ? (
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-600">
                      <tr>
                        <th className="px-4 py-2">Name</th>
                        <th className="px-4 py-2">Email</th>
                        <th className="px-4 py-2">Phone</th>
                        <th className="px-4 py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {role.users.map((user) => (
                        <tr key={user.id} className="border-t">
                          <td className="px-4 py-2">
                            {user.firstName} {user.lastName}
                          </td>
                          <td className="px-4 py-2">{user.email}</td>
                          <td className="px-4 py-2">{user.phone || "—"}</td>
                          <td className="px-4 py-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowAddUserModal(true)}
                            >
                              Edit
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-4 text-sm text-gray-500">
                    No users assigned to this role.
                  </div>
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
    </ProtectedRoute>
  );
}
// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { ChevronDown, ChevronRight } from "lucide-react";
// import { UserRole } from "./user";
// import AddUserModal from "./AddUserModal";
// import CreateNewUserModal from "./CreateNewUserModal";

// const mockRoles: UserRole[] = [
//   {
//     role: "Admin",
//     users: [
//       {
//         id: "1",
//         email: "admin@example.com",
//         phone: "555-123-4567",
//       },
//     ],
//   },
//   {
//     role: "Co-Admin",
//     users: [
//       {
//         id: "2",
//         firstName: "Jane",
//         lastName: "Smith",
//         email: "jane@example.com",
//         phone: "555-987-6543",
//       },
//     ],
//   },
//   {
//     role: "Manager",
//     users: [
//       {
//         id: "3",
//         firstName: "Michael",
//         lastName: "Green",
//         email: "michael@example.com",
//         phone: "555-456-7890",
//       },
//     ],
//   },
//   {
//     role: "Supervisor",
//     users: [],
//   },
// ];

// export default function ManageUserRolesPage() {
//   const [expandedRoles, setExpandedRoles] = useState<string[]>([]);
//   const [showAddUserModal, setShowAddUserModal] = useState(false);
//   const [showCreateUserModal, setShowCreateUserModal] = useState(false);

//   const toggleRole = (role: string) => {
//     setExpandedRoles((prev) =>
//       prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
//     );
//   };

//   return (
//     <div className="p-6 space-y-6">
//       <h2 className="text-2xl font-bold">Manage User Roles</h2>

//       {mockRoles.map((roleData) => (
//         <div key={roleData.role} className="border rounded-lg">
//           <button
//             onClick={() => toggleRole(roleData.role)}
//             className="w-full text-left px-4 py-3 flex items-center justify-between bg-gray-100"
//           >
//             <span className="font-semibold">{roleData.role}</span>
//             {expandedRoles.includes(roleData.role) ? (
//               <ChevronDown className="h-5 w-5" />
//             ) : (
//               <ChevronRight className="h-5 w-5" />
//             )}
//           </button>

//           {expandedRoles.includes(roleData.role) && (
//             <div className="overflow-x-auto">
//               {roleData.users.length > 0 ? (
//                 <table className="w-full text-sm text-left">
//                   <thead className="bg-gray-50 text-gray-600">
//                     <tr>
//                       {roleData.role !== "Admin" && (
//                         <>
//                           <th className="px-4 py-2">First Name</th>
//                           <th className="px-4 py-2">Last Name</th>
//                         </>
//                       )}
//                       <th className="px-4 py-2">Email</th>
//                       <th className="px-4 py-2">Phone</th>
//                       <th className="px-4 py-2">Edit</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {roleData.users.map((user) => (
//                       <tr key={user.id} className="border-t">
//                         {roleData.role !== "Admin" && (
//                           <>
//                             <td className="px-4 py-2">{user.firstName}</td>
//                             <td className="px-4 py-2">{user.lastName}</td>
//                           </>
//                         )}
//                         <td className="px-4 py-2">{user.email}</td>
//                         <td className="px-4 py-2">{user.phone}</td>
//                         <td className="px-4 py-2">
//                           <Button variant="link" className="text-blue-600">
//                             Edit
//                           </Button>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               ) : (
//                 <p className="p-4 text-gray-500">No users in this role.</p>
//               )}
//             </div>
//           )}
//         </div>
//       ))}

//   {/* Buttons */}
//   <div className="flex flex-col md:flex-row gap-4 pt-4">
//     <Button
//       className="w-full md:w-auto"
//       onClick={() => setShowAddUserModal(true)}
//     >
//       Add User to Role
//     </Button>
//     <AddUserModal
//       open={showAddUserModal}
//       onClose={() => setShowAddUserModal(false)}
//       onSubmit={() => {}}
//       existingEmployees={[]}
//     />
//     <Button
//       className="w-full md:w-auto"
//       variant="outline"
//       onClick={() => setShowCreateUserModal(true)}
//     >
//       Add New Type of User
//     </Button>
//     <CreateNewUserModal
//       open={showCreateUserModal}
//       onClose={() => setShowCreateUserModal(false)}
//       onSave={() => {}}
//     />
//   </div>
// </div>
//   );
// }
