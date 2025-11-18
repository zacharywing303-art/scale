import prisma from "../lib/db";
import { differenceInHours } from "date-fns";

export async function getPayrollPreview(
  agencyId: string,
  from: Date,
  to: Date
) {
  // 1. Pull all employees with pay rates
  const employees = await prisma.employee.findMany({
    where: { agencyID: agencyId },
    include: {
      employmentInfo: true, // contains pay rates
    },
  });

  // 2. Pull all visits in the period
  const visits = await prisma.visit.findMany({
    where: {
      agencyID: agencyId,
      callIn: { gte: from },
      callOut: { lte: to },
      visitStatus: "Verified",
    },
    select: {
      id: true,
      employeeID: true,
      callIn: true,
      callOut: true,
      mileage: true,
    },
  });

  // 3. Aggregate payroll data per employee
  const result: any[] = [];

  for (const emp of employees) {
    const empVisits = visits.filter((v) => v.employeeID === emp.id);

    let visitHours = 0;
    let mileage = 0;

    for (const v of empVisits) {
      if (v.callIn && v.callOut) {
        visitHours += differenceInHours(
          new Date(v.callOut),
          new Date(v.callIn)
        );
      }
      mileage += v.mileage ?? 0;
    }

    // Example (facility/office hours may change later)
    const facilityHours = 0;
    const officeHours = 0;

    const overtime = visitHours > 40 ? visitHours - 40 : 0;

    result.push({
      employeeId: emp.id,
      employeeName: emp.name,
      visitHours,
      facilityHours,
      officeHours,
      overtimeHours: overtime,
      mileage,

      // Pay Rates from EmploymentInfo
      visitRate: emp.employmentInfo?.visitPayRate ?? 0,
      facilityRate: emp.employmentInfo?.facilityPayRate ?? 0,
      officeRate: emp.employmentInfo?.officePayRate ?? 0,
      mileageRate: emp.employmentInfo?.mileagePayRate ?? 0,
    });
  }

  return result;
}
