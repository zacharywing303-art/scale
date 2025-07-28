import prisma from "../lib/db";

export const createAgency = async (data: {
  name: string;
  code: string;
  state: string;
}) => {
  return prisma.agency.create({ data });
};

export const getAgencyByCode = async (code: string) => {
  return prisma.agency.findUnique({ where: { code } });
};

export const getAllAgencies = async () => {
  return prisma.agency.findMany();
};
