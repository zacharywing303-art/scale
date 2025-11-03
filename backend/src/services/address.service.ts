import prisma from "../lib/db";

export const createAddress = (data: any) => prisma.address.create({ data });
export const updateAddress = (id: string, data: any) =>
  prisma.address.update({ where: { id }, data });
export const deleteAddress = (id: string) =>
  prisma.address.delete({ where: { id } });
