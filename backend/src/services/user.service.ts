import prisma from "../lib/db";

export const createUser = async (data: {
  name: string;
  email: string;
  password: string;
  role: string;
}) => {
  return prisma.user.create({ data });
};

export const getUserByEmail = async (email: string) => {
  return prisma.user.findUnique({ where: { email } });
};

export const getAllUsers = async () => {
  return prisma.user.findMany();
};
