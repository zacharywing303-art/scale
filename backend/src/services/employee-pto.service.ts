import prisma from "../lib/db";

export async function updateAgencyPtoDefault(
  agencyId: string,
  newDefault: number,
  applyTo: "all" | "selected",
  employeeIds?: string[]
) {
  // 1. Update agency-level default
  await prisma.agency.update({
    where: { id: agencyId },
    data: { ptoDefaultDays: newDefault },
  });

  let updatedEmployees: { count: number } = { count: 0 };

  // 2. Apply default to all employees
  if (applyTo === "all") {
    updatedEmployees = await prisma.employee.updateMany({
      where: { agencyID: agencyId },
      data: { ptoDaysAllowed: newDefault },
    });
  }

  // 3. Apply default to selected employees only
  if (applyTo === "selected" && employeeIds?.length) {
    updatedEmployees = await prisma.employee.updateMany({
      where: { id: { in: employeeIds } },
      data: { ptoDaysAllowed: newDefault },
    });
  }

  return {
    success: true,
    updated: updatedEmployees,
    newDefault,
  };
}
