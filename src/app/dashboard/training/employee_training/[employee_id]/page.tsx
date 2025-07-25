"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import GoBackButton from "@/components/custom/GoBackButton";

const mockModules = [
  {
    id: 1,
    title: "Getting Started with the Web Dashboard",
    type: "website",
    progress: 100,
  },
  {
    id: 2,
    title: "Navigating the EVV Scheduling System",
    type: "website",
    progress: 80,
  },
  {
    id: 3,
    title: "Creating and Managing Visits",
    type: "website",
    progress: 50,
  },
  {
    id: 4,
    title: "Using the App: Clocking In/Out",
    type: "app",
    progress: 100,
  },
  {
    id: 5,
    title: "App Messaging and Tasks",
    type: "app",
    progress: 25,
  },
  {
    id: 6,
    title: "Managing Client Info and Authorizations",
    type: "website",
    progress: 0,
  },
];

export default function EmployeeTrainingPage() {
  const { employee_id } = useParams();
  const overallProgress =
    mockModules.reduce((sum, m) => sum + m.progress, 0) / mockModules.length;

  return (
    <div className="p-6 space-y-6">
      <GoBackButton />
      <Card>
        <CardHeader>
          <CardTitle>Training for Employee #{employee_id}</CardTitle>
          <p className="text-sm text-gray-600">
            View and manage training progress for this employee.
          </p>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Overall Progress
            </label>
            <Progress value={overallProgress} />
            <p className="text-xs mt-1 text-gray-600">
              {Math.round(overallProgress)}% completed
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {mockModules.map((module) => (
          <Card key={module.id}>
            <CardHeader>
              <CardTitle className="text-base">{module.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Progress value={module.progress} />
              <p className="text-sm text-gray-600">
                {module.progress}% complete
              </p>
              <Button className="w-full" variant="outline">
                {module.progress === 0
                  ? "Start"
                  : module.progress === 100
                  ? "Review"
                  : "Continue"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
