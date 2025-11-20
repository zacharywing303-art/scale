import { Router } from "express";
import * as employeeController from "../controllers/employee.controller";

const router = Router();

router.get("/", employeeController.getEmployees);
router.get("/agency/:agencyId", employeeController.getEmployeesByAgency);

// Mobile-schedule & availability helpers
router.get("/:id/availability", employeeController.getEmployeeAvailability);
router.get("/:id/schedule", employeeController.getEmployeeSchedule);

router.get("/:id", employeeController.getEmployee);
router.patch("/:id/employment-info", employeeController.upsertEmploymentInfo);
router.get("/:id/history", employeeController.getEmployeeHistory);

router.post("/", employeeController.createEmployee);
router.patch("/:id", employeeController.updateEmployee);
router.delete("/:id", employeeController.deleteEmployee);

// Certifications
router.post("/:id/certifications", employeeController.createCertification);
router.patch(
  "/:id/certifications/:certId",
  employeeController.updateCertification
);
router.delete(
  "/:id/certifications/:certId",
  employeeController.deleteCertification
);

// Medical Clearances
router.post("/:id/medical", employeeController.createMedicalClearance);
router.patch(
  "/:id/medical/:clearanceId",
  employeeController.updateMedicalClearance
);
router.delete(
  "/:id/medical/:clearanceId",
  employeeController.deleteMedicalClearance
);

// Scheduling constraints (used by website create schedule)
router.get(
  "/:id/scheduling/constraints",
  employeeController.getEmployeeSchedulingConstraints
);

export default router;
