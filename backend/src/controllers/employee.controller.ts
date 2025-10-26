import { Request, Response } from "express";
import * as employeeService from "../services/employee.service";
import prisma from "../lib/db";

export const getEmployees = async (_req: Request, res: Response) => {
  const employees = await employeeService.getAllEmployees();
  res.json(employees);
};

export const getEmployee = async (req: Request, res: Response) => {
  const employee = await employeeService.getEmployeeById(req.params.id);
  if (!employee) return res.status(404).json({ message: "Employee not found" });
  res.json(employee);
};

export const createEmployee = async (req: Request, res: Response) => {
  try {
    // use agencyID passed from frontend instead of session
    if (!req.body.agencyID) {
      return res.status(400).json({ message: "Agency ID is required" });
    }

    const employee = await employeeService.createEmployee(req.body);
    res.status(201).json(employee);
  } catch (err: any) {
    console.error("Error creating employee:", err);
    res.status(500).json({ message: err.message });
  }
};

export const updateEmployee = async (req: Request, res: Response) => {
  const employee = await employeeService.updateEmployee(
    req.params.id,
    req.body
  );
  res.json(employee);
};

export const deleteEmployee = async (req: Request, res: Response) => {
  await employeeService.deleteEmployee(req.params.id);
  res.status(204).send();
};

// export const getEmployeesByAgency = async (req: Request, res: Response) => {
//   try {
//     const { agencyId } = req.params;
//     const employees = await prisma.employee.findMany({
//       where: { agencyID: agencyId },
//       select: { id: true, name: true, email: true },
//     });
//     res.json(employees);
//   } catch (err) {
//     console.error("Error fetching employees:", err);
//     res.status(500).json({ message: "Failed to fetch employees" });
//   }
// };
export async function getEmployeesByAgency(req: Request, res: Response) {
  try {
    const { agencyId } = req.params;
    const { office, facility } = req.query;

    const where: any = { agencyID: agencyId };
    if (office === "true") where.officeStaff = true;
    if (facility === "true") where.facilityStaff = true;

    const employees = await prisma.employee.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        isSupervisor: true,
        officeStaff: true,
        facilityStaff: true,
        assignedClients: { select: { id: true, name: true } },
      },

      orderBy: { name: "asc" },
    });

    res.json(employees);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load employees" });
  }
}
