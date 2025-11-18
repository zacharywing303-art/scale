import { Router } from "express";
import * as employeeController from "../controllers/employee.controller";

const router = Router();

router.get("/", employeeController.getEmployees);
router.get("/agency/:agencyId", employeeController.getEmployeesByAgency);
router.get("/:id", employeeController.getEmployee);
router.patch("/:id/employment-info", employeeController.upsertEmploymentInfo);
router.get("/:id/history", employeeController.getEmployeeHistory);
router.post("/", employeeController.createEmployee); // protected
router.patch("/:id", employeeController.updateEmployee);
router.delete("/:id", employeeController.deleteEmployee);

export default router;
