import prisma from "../lib/db";

export const getAllAgencies = async () => {
  return prisma.agency.findMany();
};

export const getAgencyById = async (id: string) => {
  return prisma.agency.findUnique({ where: { id } });
};

export const createAgency = async (data: {
  name: string;
  code: string;
  state: string;
  allowEvv?: boolean;
  status?: string;
  subscriptionPlan?: string;
  paymentMethod?: string;
  email?: string;
  phone?: string;
  numOfEmployees?: number;
}) => {
  return prisma.agency.create({ data });
};

export const updateAgency = async (id: string, data: Partial<any>) => {
  return prisma.agency.update({ where: { id }, data });
};

export const deleteAgency = async (id: string) => {
  return prisma.agency.delete({ where: { id } });
};
