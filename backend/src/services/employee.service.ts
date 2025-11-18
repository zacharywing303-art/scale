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
      last5SSN: true,
      effectiveDate: true,
      supervisorCode: true,
      nationalProviderID: true,
      alternativeProviderID: true,
      registryID: true,
      dateOfBirth: true,
      gender: true,
      mainPhone: true,
      phone2: true,
      phone3: true,
      phone4: true,
      rehire: true,
      title: true,
      middleName: true,
      addresses: true,
      certifications: true,
      contacts: true,
      medicalInfos: true,
      employmentInfo: true,
      mobileInfo: true,
      schedules: true,
      assignedClients: true,
      officeStaff: true,
      facilityStaff: true,
      VisitRequest: true,
      EmployeeHistory: true,
    },
  });
};

export const createEmployee = async (data: any) => {
  if (!data.agencyID) {
    throw new Error("Missing agencyID from session");
  }

  const employeeID = `EMP-${Math.floor(10000 + Math.random() * 90000)}`;

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

  let rawPassword: string | null = null;

  if (data.mobileUser) {
    // ✅ Fetch agency code from agency table
    const agency = await prisma.agency.findUnique({
      where: { id: data.agencyID },
      select: { code: true },
    });
    if (!agency) throw new Error("Invalid agencyID");

    const password = data.password || generateRandomPassword(16);
    rawPassword = password;
    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.mobileEmployee.create({
      data: {
        employeeID: employee.id,
        email: employee.email,
        agencyID: data.agencyID,
        agencyCode: agency.code,
        passwordHash,
      },
    });
  }

  // ✅ Return both employee and password for display
  return { employee, rawPassword };
};

export const updateEmployee = async (id: string, data: any) => {
  return prisma.employee.update({ where: { id }, data });
};

export const deleteEmployee = async (id: string) => {
  return prisma.employee.delete({ where: { id } });
};
