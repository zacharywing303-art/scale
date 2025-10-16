import { Button } from "@/components/ui/button";

export default function ReviewModal({
  section,
  onClose,
}: {
  section: string | null;
  onClose: () => void;
}) {
  if (!section) return null;

  const titleMap: Record<string, string> = {
    audit: "Weekly Audit Details",
    mileage: "Employee Mileage Logs",
    hours: "Hours Worked Overview",
    clientQuarterly: "Client Quarterly Review",
    employeeQuarterly: "Employee Quarterly Review",
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-800">
        {titleMap[section] || "Details"}
      </h3>
      <p className="text-gray-600">
        This is a mock modal. In production, this would display relevant
        information pulled from the backend.
      </p>
      <Button onClick={onClose}>Close</Button>
    </div>
  );
}
