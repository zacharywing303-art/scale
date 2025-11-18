"use client";
import React, { use, useEffect, useState } from "react";
import EmployeeTabs from "./components/EmployeeTabs";
import { EmployeeHeader } from "./components/EmployeeHeader";

export default function EmployeePage({
  params,
}: {
  params: Promise<{ employee_id: string }>;
}) {
  const { employee_id } = use(params);
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/employees/${employee_id}`
      );
      const data = await res.json();
      setEmployee(data);
      setLoading(false);
    };
    fetchEmployee();
  }, [employee_id]);

  if (loading) return <p className="p-6">Loading employee...</p>;
  if (!employee) return <p className="p-6">Employee not found</p>;

  return (
    <div className="p-6">
      <EmployeeHeader employee={employee} />
      <EmployeeTabs employee={employee} />
    </div>
  );
}
