import prisma from "../lib/db";

export const getAllEmployees = async () => {
  return prisma.employee.findMany();
};

export const getEmployeeById = async (id: string) => {
  return prisma.employee.findUnique({ where: { id } });
};

export const createEmployee = async (data: any) => {
  return prisma.employee.create({ data });
};

export const updateEmployee = async (id: string, data: any) => {
  return prisma.employee.update({ where: { id }, data });
};

export const deleteEmployee = async (id: string) => {
  return prisma.employee.delete({ where: { id } });
};
