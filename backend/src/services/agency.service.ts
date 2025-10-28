import prisma from "../lib/db";

export const getAllAgencies = async () => {
  return prisma.agency.findMany();
};

export const getAgencyById = async (id: string) => {
  return prisma.agency.findUnique({ where: { id } });
};

export const createAgencyWithAdmin = async (data: {
  name: string;
  email: string;
  phone: string;
  contactPerson: string;
  santraxID: string;
  passwordHash: string;
}) => {
  const agencyCode = generateAgencyCode();

  // Create the agency first without agencyAdminId
  const agency = await prisma.agency.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      code: agencyCode,
      state: "Unknown",
      santraxID: data.santraxID,
      status: "Active",
      allowEvv: false,
    },
  });

  // Create the admin user linked to agency
  const user = await prisma.user.create({
    data: {
      name: data.contactPerson,
      email: data.email,
      phone: data.phone,
      role: "AGENCY_ADMIN",
      passwordHash: data.passwordHash,
      agencyId: agency.id,
    },
  });

  // Update agency to set agencyAdminId
  const updatedCreatedAgency = await prisma.agency.update({
    where: { id: agency.id },
    data: {
      agencyAdminId: user.id,
    },
  });

  return updatedCreatedAgency;
};

export const updateAgencySettings = async (
  agencyId: string,
  allowEvv: boolean,
  status: string,
  state: string,
  subscriptionPlan: string
) => {
  return prisma.agency.update({
    where: { id: agencyId },
    data: {
      allowEvv,
      status,
      state,
      subscriptionPlan,
    },
  });
};

export const saveAgencyChangesSettings = async (
  name: string,
  agencyId: string,
  allowEvv: boolean,
  status: string,
  addressLine1: string,
  addressLine2: string,
  addressLine3: string,
  city: string,
  addressState: string,
  zipCode: string
) => {
  return prisma.agency.update({
    where: { id: agencyId },
    data: {
      name,
      allowEvv,
      status,
      addressLine1,
      addressLine2,
      addressLine3,
      city,
      addressState,
      zipCode,
    },
  });
};

function generateAgencyCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export const updateAgency = async (id: string, data: Partial<any>) => {
  return prisma.agency.update({ where: { id }, data });
};

export const deleteAgency = async (id: string) => {
  return prisma.agency.delete({ where: { id } });
};
