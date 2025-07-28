import EmployeeTabs from "./components/EmployeeTabs";
import { EmployeeHeader } from "./components/EmployeeHeader";

interface EmployeePageProps {
  params: {
    employee_id: string;
  };
}

export default function EmployeePage({ params }: EmployeePageProps) {
  const { employee_id } = params;
  return (
    <div className="p-6">
      <EmployeeHeader employeeId={employee_id} />
      <EmployeeTabs employeeId={employee_id} />
    </div>
  );
}
