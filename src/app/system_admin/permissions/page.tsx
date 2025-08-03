"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Agency } from "../agencies/Agency"; // Assumes shared Agency type
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getLoggedInUser } from "@/lib/auth/authHelpers";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const dummyAgencies: Agency[] = [
  {
    id: "AG001",
    name: "Sunrise Health",
    allowEvv: true,
    status: "Active",
    state: "NY",
    subscriptionPlan: "Pro",
    paymentMethod: "Card",
  },
  {
    id: "AG002",
    name: "CarePlus Inc.",
    allowEvv: false,
    status: "Inactive",
    state: "PA",
    subscriptionPlan: "Basic",
    paymentMethod: "ACH",
  },
];

const featureList = [
  "Create Clients",
  "Manage Employees",
  "Schedule Visits",
  "Access Reports",
  "Export Data",
  "Submit Claims",
  "Use Mobile App",
  "Access Invoices",
];

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<
    Record<string, Record<string, boolean>>
  >(() =>
    dummyAgencies.reduce((acc, agency) => {
      acc[agency.id] = featureList.reduce((features, feature) => {
        features[feature] = true; // default: all enabled
        return features;
      }, {} as Record<string, boolean>);
      return acc;
    }, {} as Record<string, Record<string, boolean>>)
  );

  const handleToggle = (agencyId: string, feature: string) => {
    setPermissions((prev) => ({
      ...prev,
      [agencyId]: {
        ...prev[agencyId],
        [feature]: !prev[agencyId][feature],
      },
    }));
  };

  const handleSave = (agencyId: string) => {
    console.log(`Saving permissions for ${agencyId}:`, permissions[agencyId]);
    // TODO: Submit to backend
  };

  const router = useRouter();

  return (
    <ProtectedRoute allowedRoles={["MAIN_ADMIN"]}>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Agency Permissions</h1>

        <ScrollArea className="space-y-4 max-h-[80vh] pr-4">
          {dummyAgencies.map((agency) => (
            <Card key={agency.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">{agency.name}</h2>
                  <Button
                    variant="outline"
                    onClick={() => handleSave(agency.id)}
                  >
                    Save Changes
                  </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {featureList.map((feature) => (
                    <div key={feature} className="flex items-center gap-2">
                      <Checkbox
                        id={`${agency.id}-${feature}`}
                        checked={permissions[agency.id]?.[feature]}
                        onCheckedChange={() => handleToggle(agency.id, feature)}
                      />
                      <Label
                        htmlFor={`${agency.id}-${feature}`}
                        className="text-sm"
                      >
                        {feature}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </ScrollArea>
      </div>
    </ProtectedRoute>
  );
}
