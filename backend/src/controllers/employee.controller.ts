import { Request, Response } from "express";
import * as employeeService from "../services/employee.service";

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
  const employee = await employeeService.createEmployee(req.body);
  res.status(201).json(employee);
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
