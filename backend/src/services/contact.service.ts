import prisma from "../lib/db";

export const createContact = (data: any) => prisma.contact.create({ data });
export const updateContact = (id: string, data: any) =>
  prisma.contact.update({ where: { id }, data });
export const deleteContact = (id: string) =>
  prisma.contact.delete({ where: { id } });
