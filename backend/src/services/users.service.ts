import prisma from "../lib/db";
import bcrypt from "bcryptjs";

export const getAllUsers = async () => {
  return await prisma.user.findMany();
};

export const getUserById = async (id: string) => {
  return await prisma.user.findUnique({
    where: { id },
  });
};

export const createSystemAdminUser = async (data: {
  name: string;
  email: string;
  password: string;
  isActive: boolean;
}) => {
  const passwordHash = await bcrypt.hash(data.password, 10);
  return await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      isActive: data.isActive,
      role: "SYSTEM_ADMIN",
      systemAdminUser: true,
    },
  });
};

export const updateUser = async (id: string, data: any) => {
  return await prisma.user.update({
    where: { id },
    data,
  });
};

export const deleteUser = async (id: string) => {
  return await prisma.user.delete({
    where: { id },
  });
};

export const getSystemAdminUsers = async () => {
  return await prisma.user.findMany({
    where: { role: { in: ["SYSTEM_ADMIN", "MAIN_ADMIN"] } },
  });
};

export const getSystemAdminUsersById = async (id: string) => {
  return await prisma.user.findUnique({
    where: { id, role: { in: ["SYSTEM_ADMIN", "MAIN_ADMIN"] } },
  });
};

export const createAgencyUser = async (data: {
  name: string;
  email: string;
  password: string;
  isActive: boolean;
  agencyId: string;
  roleTypeId: string;
}) => {
  const passwordHash = await bcrypt.hash(data.password, 10);
  return await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      isActive: data.isActive,
      agencyId: data.agencyId,
      roleTypeId: data.roleTypeId,
      systemAdminUser: true,
    },
  });
};
