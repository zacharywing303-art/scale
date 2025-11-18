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
    if (!req.body.agencyID) {
      return res.status(400).json({ message: "Agency ID is required" });
    }

    const { employee, rawPassword } = await employeeService.createEmployee(
      req.body
    );

    res.status(201).json({
      message: "Employee created successfully",
      employee,
      password: rawPassword || null, // ✅ show password
    });
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
        officeStaff: true,
        facilityStaff: true,
        assignedClients: { select: { id: true, name: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    res.json(employees);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load employees" });
  }
}

export const getEmployeeHistory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const history = await prisma.employeeHistory.findMany({
      where: { employeeId: id },
      orderBy: { changedAt: "desc" },
    });
    res.json(history);
  } catch (error: any) {
    console.error("Error fetching employee history:", error);
    res.status(500).json({ message: "Failed to fetch employee history" });
  }
};

export const upsertEmploymentInfo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Optional: validate the employee exists
    const employee = await prisma.employee.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const info = await employeeService.upsertEmploymentInfo(id, req.body);
    res.json({
      message: "Employment info updated successfully",
      employmentInfo: info,
    });
  } catch (err: any) {
    console.error("Error updating employment info:", err);
    res
      .status(500)
      .json({ message: err.message || "Failed to update employment info" });
  }
};

export const createCertification = async (req: Request, res: Response) => {
  try {
    const cert = await employeeService.addCertification(
      req.params.id,
      req.body
    );
    res.json(cert);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateCertification = async (req: Request, res: Response) => {
  try {
    const cert = await employeeService.updateCertification(
      req.params.id,
      req.params.certId,
      req.body
    );
    res.json(cert);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteCertification = async (req: Request, res: Response) => {
  try {
    await employeeService.deleteCertification(req.params.certId);
    res.json({ message: "Certification deleted" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// Medical Clearances
export const createMedicalClearance = async (req: Request, res: Response) => {
  try {
    const clearance = await employeeService.addMedicalClearance(
      req.params.id,
      req.body
    );
    res.json(clearance);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateMedicalClearance = async (req: Request, res: Response) => {
  try {
    const clearance = await employeeService.updateMedicalClearance(
      req.params.clearanceId,
      req.body
    );
    res.json(clearance);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteMedicalClearance = async (req: Request, res: Response) => {
  try {
    await employeeService.deleteMedicalClearance(req.params.clearanceId);
    res.json({ message: "Medical clearance deleted" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
