"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EyeIcon, EyeOffIcon } from "lucide-react";

export default function EmploymentInfoTab() {
  const [showSensitive, setShowSensitive] = useState({
    license: false,
    insurance: false,
    policy: false,
    registration: false,
  });

  const toggleVisibility = (field: keyof typeof showSensitive) => {
    setShowSensitive((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <ScrollArea className="p-4 space-y-8">
      {/* Vehicle Information */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Vehicle Information</h2>
        <p className="text-sm text-unityred mb-4">
          **Sensitive Information: Please keep documentation of this data we
          will not store it electronically.**
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Driver's License */}
          <div>
            <Label className="mb-1">Driver's License</Label>
            <div className="flex items-center gap-2">
              <Input
                type={showSensitive.license ? "text" : "password"}
                placeholder="D1234567"
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => toggleVisibility("license")}
              >
                {showSensitive.license ? (
                  <EyeOffIcon size={16} />
                ) : (
                  <EyeIcon size={16} />
                )}
              </Button>
            </div>
          </div>

          {/* Car Type */}
          <div>
            <Label className="mb-1">Car Type</Label>
            <Input placeholder="Toyota Camry" />
          </div>

          {/* Insurance Dates */}
          <div>
            <Label className="mb-1">Insurance Start Date</Label>
            <Input type="date" />
          </div>
          <div>
            <Label className="mb-1">Insurance Expiration Date</Label>
            <Input type="date" />
          </div>

          {/* Policy Number */}
          <div>
            <Label className="mb-1">Policy Number</Label>
            <div className="flex items-center gap-2">
              <Input
                type={showSensitive.policy ? "text" : "password"}
                placeholder="POL-999123"
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => toggleVisibility("policy")}
              >
                {showSensitive.policy ? (
                  <EyeOffIcon size={16} />
                ) : (
                  <EyeIcon size={16} />
                )}
              </Button>
            </div>
          </div>

          {/* Registration Dates */}
          <div>
            <Label className="mb-1">Registration Start Date</Label>
            <Input type="date" />
          </div>
          <div>
            <Label className="mb-1">Registration Expiration Date</Label>
            <Input type="date" />
          </div>

          {/* Handicap Accessible */}
          <div className="flex items-center space-x-2 mt-2">
            <Checkbox id="handicap" />
            <Label htmlFor="handicap">Handicap Accessible</Label>
          </div>
        </div>
      </section>

      {/* Medical Information */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Medical Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="mb-1">Physical Exam Date</Label>
            <Input type="date" />
          </div>
          <div>
            <Label className="mb-1">TB Shot Date</Label>
            <Input type="date" />
          </div>
          <div>
            <Label className="mb-1">CPR Certification Date</Label>
            <Input type="date" />
          </div>
          <div>
            <Label className="mb-1">Other Medical Clearance</Label>
            <Input placeholder="e.g., Hep B, etc." />
          </div>
        </div>
      </section>

      {/* Background Checks */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Background Checks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="mb-1">FBI Background Check Date</Label>
            <Input type="date" />
          </div>
          <div>
            <Label className="mb-1">State Background Check Date</Label>
            <Input type="date" />
          </div>
          <div>
            <Label className="mb-1">Child Abuse Clearance Date</Label>
            <Input type="date" />
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Certifications</h2>
          <Button variant="outline">Add Certification</Button>
        </div>
        {/* Placeholder for Certification Table */}
        <div className="border rounded-md p-4 text-sm text-muted-foreground">
          No certifications added yet.
        </div>
      </section>
    </ScrollArea>
  );
}
