import ClientTabs from "./components/EmployeeTabs";
import { EmployeeHeader } from "./components/EmployeeHeader";

interface ClientPageProps {
  params: {
    employee_id: string;
  };
}

export default function ClientPage({ params }: ClientPageProps) {
  const { employee_id } = params;
  return (
    <div className="p-6">
      <EmployeeHeader employeeId={employee_id} />
      <ClientTabs employeeId={employee_id} />
    </div>
  );
}
