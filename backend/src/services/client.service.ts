import prisma from "../lib/db";

export const getAllClients = async () => {
  return prisma.client.findMany();
};

export const getClientById = async (id: string) => {
  return prisma.client.findUnique({ where: { id } });
};

export const createClient = async (data: any) => {
  return prisma.client.create({ data });
};

export const updateClient = async (id: string, data: any) => {
  return prisma.client.update({ where: { id }, data });
};

export const deleteClient = async (id: string) => {
  return prisma.client.delete({ where: { id } });
};
