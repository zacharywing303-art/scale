"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

const mockEmployees = [
  {
    id: "EMP001",
    name: "John Doe",
    progress: 80,
  },
  {
    id: "EMP002",
    name: "Emily Smith",
    progress: 60,
  },
  {
    id: "EMP003",
    name: "Carlos Rivera",
    progress: 100,
  },
  {
    id: "EMP004",
    name: "Sophia Nguyen",
    progress: 25,
  },
];

export default function EmployeeTrainingPage() {
  const router = useRouter();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Employee Training Tracker</h2>
        <p className="text-sm text-muted-foreground">
          Monitor training progress for each employee and assign learning paths.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {mockEmployees.map((emp) => (
          <Card key={emp.id}>
            <CardHeader>
              <CardTitle className="text-base">{emp.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Progress value={emp.progress} />
              <p className="text-sm text-gray-600">{emp.progress}% completed</p>
              <Button
                className="w-full"
                onClick={() =>
                  router.push(`/dashboard/training/employee_training/${emp.id}`)
                }
              >
                View Training
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
