import prisma from "../lib/db";
import bcrypt from "bcrypt";
import crypto from "crypto";

function generateRandomPassword(length: number) {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+[]{}|;:,.<>?";
  let retVal = "";
  for (let i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
}

export const getAllEmployees = async () => {
  return prisma.employee.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      status: true,
      employeeID: true,
      position: true,
      supervisor: true,
      isSupervisor: true,
      hireDate: true,
      updatedAt: true,
      email: true,
      languages: true,
      mobileUser: true,
    },
  });
};

export const getEmployeeById = async (id: string) => {
  return prisma.employee.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      status: true,
      employeeID: true,
      position: true,
      supervisor: true,
      isSupervisor: true,
      hireDate: true,
      updatedAt: true,
      email: true,
      languages: true,
      mobileUser: true,
      // add more fields if you need them
    },
  });
};

export const createEmployee = async (data: any) => {
  if (!data.agencyID) {
    throw new Error("Missing agencyID from session");
  }

  // Generate unique employeeID
  const employeeID = `EMP-${Math.floor(10000 + Math.random() * 90000)}`;

  // Build base employee
  const employee = await prisma.employee.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      name: `${data.firstName} ${data.lastName}`,
      last5SSN: data.last5SSN,
      agencyID: data.agencyID,
      position: data.position,
      nationalProviderID: data.nationalProviderId || null,
      email: data.email,
      isSupervisor: data.supervisor ? true : false,
      supervisor: data.supervisor ? `${data.firstName} ${data.lastName}` : null,
      mobileUser: data.mobileUser,
      status: "Active",
      employeeID,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      mainPhone: data.phone,
      gender: data.gender,
      languages: data.language ? [data.language] : [],
    },
  });

  // Handle Mobile User account
  if (data.mobileUser) {
    const rawPassword = data.password || generateRandomPassword(16);
    console.log("Generated Mobile User password:", rawPassword); // <-- for testing

    const passwordHash = await bcrypt.hash(rawPassword, 10);

    await prisma.mobileEmployee.create({
      data: {
        employeeID: employee.id,
        email: employee.email,
        agencyCode: employee.agencyID,
        passwordHash,
      },
    });
  }

  return employee;
};

export const updateEmployee = async (id: string, data: any) => {
  return prisma.employee.update({ where: { id }, data });
};

export const deleteEmployee = async (id: string) => {
  return prisma.employee.delete({ where: { id } });
};
