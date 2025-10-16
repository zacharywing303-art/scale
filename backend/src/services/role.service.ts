import prisma from "../lib/db";

// ✅ Create new role with optional permissions
export async function createRole(data: {
  name: string;
  description?: string;
  agencyId: string;
  permissions?: { name: string; description?: string }[];
}) {
  return prisma.roleType.create({
    data: {
      name: data.name,
      description: data.description,
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
    description?: string;
    permissions?: { name: string; description?: string }[];
  }
) {
  return prisma.roleType.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
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
