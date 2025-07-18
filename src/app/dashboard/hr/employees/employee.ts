export type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  status: "active" | "inactive" | "vacation";
  language: string;
  position: string;
  employeeId: string;
  supervisor: string;
  isOfficeStaff: boolean;
  isManagement: boolean;
  hireDate: string;
  endDate?: string;
  updatedAt: string;
};
