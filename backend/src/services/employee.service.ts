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

  // 1. Create employee base record
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

  // 2. Create default 24/7 availability (Sun–Sat, 00:00 → 23:59)
  await prisma.employeeAvailability.createMany({
    data: Array.from({ length: 7 }).map((_, weekday) => ({
      employeeId: employee.id,
      weekday, // 0 = Sun ... 6 = Sat
      startTime: "00:00",
      endTime: "23:59",
    })),
  });

  // 3. Create blank employmentInfo row
  await prisma.employmentInfo.create({
    data: {
      employeeID: employee.id,
      driversLicenseNumber: "",
      driversLicenseExpiration: null,
      insuranceStartDate: null,
      insuranceEndDate: null,
      insurancePolicyNumber: "",
      carModel: null,
      carMake: null,
      carYear: null,
      carHandicapAccessible: false,
      registrationStartDate: null,
      registrationExpiration: null,
      physicalExamDate: null,
      tbShotDate: null,
      cprCertificationDate: null,
      officePayRate: null,
      facilityPayRate: null,
      visitPayRate: null,
      mileagePayRate: null,
    },
  });

  // 4. History log
  await prisma.employeeHistory.create({
    data: {
      employeeId: employee.id,
      title: "Employee Created",
      changedBy: "system", // frontend can override if needed
      reason: null,
      changes: {
        createdFrom: "CreateEmployeeModal",
        initialAvailability: "24/7 default",
      },
    },
  });

  // 5. If mobile user, create login
  let rawPassword: string | null = null;

  if (data.mobileUser) {
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

  return { employee, rawPassword };
};

export const updateEmployee = async (id: string, data: any) => {
  return prisma.employee.update({ where: { id }, data });
};

export const deleteEmployee = async (id: string) => {
  return prisma.employee.delete({ where: { id } });
};

export const upsertEmploymentInfo = async (employeeId: string, data: any) => {
  // Convert date strings from the frontend into Date objects
  // const toDateOrNull = (value?: string | null) =>
  //   value ? new Date(value) : null;
  const toDateOrNull = (value?: string | null) =>
    value && value.trim() !== "" ? new Date(value) : null;

  // Convert numeric strings to numbers or null
  const toNumberOrNull = (value?: string | null) => {
    if (value === undefined || value === null || value === "") return null;
    const n = Number(value);
    return Number.isNaN(n) ? null : n;
  };

  const payload = {
    driversLicenseNumber: data.driversLicenseNumber ?? "",
    driversLicenseExpiration: toDateOrNull(
      data.driversLicenseExpiration ?? null
    ),
    insuranceStartDate: toDateOrNull(data.insuranceStartDate ?? null),
    insuranceEndDate: toDateOrNull(data.insuranceEndDate ?? null),
    insurancePolicyNumber: data.insurancePolicyNumber ?? "",
    carModel: data.carModel ?? null,
    carMake: data.carMake ?? null,
    carYear: toNumberOrNull(data.carYear ?? null),
    carHandicapAccessible: !!data.carHandicapAccessible,
    registrationStartDate: toDateOrNull(data.registrationStartDate ?? null),
    registrationExpiration: toDateOrNull(data.registrationExpiration ?? null),
    physicalExamDate: toDateOrNull(data.physicalExamDate ?? null),
    tbShotDate: toDateOrNull(data.tbShotDate ?? null),
    cprCertificationDate: toDateOrNull(data.cprCertificationDate ?? null),
    officePayRate: toNumberOrNull(data.officePayRate ?? null),
    facilityPayRate: toNumberOrNull(data.facilityPayRate ?? null),
    visitPayRate: toNumberOrNull(data.visitPayRate ?? null),
    mileagePayRate: toNumberOrNull(data.mileagePayRate ?? null),
  };

  // Upsert ensures we create the record if it doesn't exist yet
  return prisma.employmentInfo.upsert({
    where: { employeeID: employeeId },
    update: payload,
    create: {
      ...payload,
      employeeID: employeeId,
    },
  });
};

export const addCertification = async (employeeId: string, data: any) => {
  return prisma.certification.create({
    data: {
      employeeID: employeeId,
      name: data.name,
      certificationID: data.certificationID || null,
      dateObtained: new Date(data.dateObtained),
    },
  });
};

export const updateCertification = async (
  employeeId: string,
  certId: string,
  data: any
) => {
  return prisma.certification.update({
    where: { id: certId },
    data: {
      name: data.name,
      certificationID: data.certificationID,
      dateObtained: new Date(data.dateObtained),
    },
  });
};

export const deleteCertification = async (certId: string) => {
  return prisma.certification.delete({
    where: { id: certId },
  });
};

export const addMedicalClearance = async (employeeId: string, data: any) => {
  return prisma.employeeMedicalInfo.create({
    data: {
      employeeID: employeeId,
      clearanceName: data.clearanceName,
      effectiveDate: new Date(data.effectiveDate),
    },
  });
};

export const updateMedicalClearance = async (
  clearanceId: string,
  data: any
) => {
  return prisma.employeeMedicalInfo.update({
    where: { id: clearanceId },
    data: {
      clearanceName: data.clearanceName,
      effectiveDate: new Date(data.effectiveDate),
    },
  });
};

export const deleteMedicalClearance = async (clearanceId: string) => {
  return prisma.employeeMedicalInfo.delete({
    where: { id: clearanceId },
  });
};
