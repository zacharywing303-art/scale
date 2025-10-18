import prisma from "../lib/db";

// ✅ Create new role with optional permissions
export async function createRole(data: {
  name: string;
  agencyId: string;
  permissions?: { name: string; description?: string }[];
}) {
  return prisma.roleType.create({
    data: {
      name: data.name,
      agencyId: data.agencyId,
      permissions: data.permissions ? { create: data.permissions } : undefined,
    },
    include: { permissions: true },
  });
}

// ✅ Fetch all roles (optionally by agency)
export async function getRoles(agencyId?: string) {
  return prisma.roleType.findMany({
    where: agencyId ? { agencyId } : {},
    include: { permissions: true },
    orderBy: { createdAt: "desc" },
  });
}

// ✅ Fetch single role by ID
export async function getRoleById(id: string) {
  return prisma.roleType.findUnique({
    where: { id },
    include: { permissions: true },
  });
}

// ✅ Update role name/description/permissions
export async function updateRole(
  id: string,
  data: {
    name?: string;
    permissions?: { name: string; description?: string }[];
  }
) {
  return prisma.roleType.update({
    where: { id },
    data: {
      name: data.name,
      permissions: data.permissions
        ? {
            deleteMany: {}, // remove old
            create: data.permissions, // create new
          }
        : undefined,
    },
    include: { permissions: true },
  });
}

// ✅ Delete role
export async function deleteRole(id: string) {
  return prisma.roleType.delete({
    where: { id },
  });
}

// Create new permission
export async function createPermission(data: {
  name: string;
  roleId?: string;
}) {
  return prisma.permission.create({ data });
}

// Get all permissions (optionally filtered by roleId)
export async function getPermissions(roleId?: string) {
  return prisma.permission.findMany({
    where: roleId ? { roleId } : {},
    orderBy: { name: "asc" },
  });
}

// Get a single permission by ID
export async function getPermissionById(id: string) {
  return prisma.permission.findUnique({ where: { id } });
}

// Update permission name or role link
export async function updatePermission(
  id: string,
  data: { name?: string; roleId?: string | null }
) {
  return prisma.permission.update({ where: { id }, data });
}

// Delete a permission
export async function deletePermission(id: string) {
  return prisma.permission.delete({ where: { id } });
}

export async function getAvailableRolesForUser(userId: string) {
  // Fetch the user along with their agency + roleType
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      agency: true,
      roleType: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // If the user is NOT an agency admin → return only their own roleType
  if (user.role !== "AGENCY_ADMIN") {
    return {
      canManageRoles: false,
      roles: user.roleType ? [user.roleType] : [],
    };
  }

  // If user IS an AGENCY_ADMIN → fetch all roles for their agency
  const agencyRoles = await prisma.roleType.findMany({
    where: { agencyId: user.agencyId! },
    include: {
      permissions: true, // optional if you want role permissions too
    },
  });

  return {
    canManageRoles: true,
    roles: agencyRoles,
  };
}
