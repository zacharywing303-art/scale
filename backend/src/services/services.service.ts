import prisma from "../lib/db";

export const getAllServices = async () => {
  return prisma.service.findMany();
};

export const getServiceById = async (id: string) => {
  return prisma.service.findUnique({ where: { id } });
};

export const createService = async (data: any) => {
  return prisma.service.create({ data });
};

export const updateService = async (id: string, data: any) => {
  return prisma.service.update({ where: { id }, data });
};

export const deleteService = async (id: string) => {
  return prisma.service.delete({ where: { id } });
};
