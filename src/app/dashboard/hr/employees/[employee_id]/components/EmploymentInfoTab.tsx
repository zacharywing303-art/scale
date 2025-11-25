"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AddMedicalClearanceModal from "../modals/AddMedicalClearanceModal";
import AddCertificationModal from "../modals/AddCertificationModal";

type EmploymentInfoForm = {
  driversLicenseNumber: string;
  driversLicenseExpiration: string;
  insuranceStartDate: string;
  insuranceEndDate: string;
  insurancePolicyNumber: string;
  carModel: string;
  carMake: string;
  carYear: string;
  carHandicapAccessible: boolean;
  registrationStartDate: string;
  registrationExpiration: string;
  physicalExamDate: string;
  tbShotDate: string;
  cprCertificationDate: string;
  officePayRate: string;
  facilityPayRate: string;
  visitPayRate: string;
  mileagePayRate: string;
};

const emptyForm: EmploymentInfoForm = {
  driversLicenseNumber: "",
  driversLicenseExpiration: "",
  insuranceStartDate: "",
  insuranceEndDate: "",
  insurancePolicyNumber: "",
  carModel: "",
  carMake: "",
  carYear: "",
  carHandicapAccessible: false,
  registrationStartDate: "",
  registrationExpiration: "",
  physicalExamDate: "",
  tbShotDate: "",
  cprCertificationDate: "",
  officePayRate: "",
  facilityPayRate: "",
  visitPayRate: "",
  mileagePayRate: "",
};

// Converts backend date → safe YYYY-MM-DD (no timezone issues)
const toDateInput = (value?: string | Date | null) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
};

// Determine color-coding state
const getDateStatus = (dateString: string) => {
  if (!dateString) return "none";
  const today = new Date();
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "none";
  if (date < today) return "expired";
  const days = Math.floor((date.getTime() - today.getTime()) / 86400000);
  if (days < 31) return "soon";
  return "valid";
};

const dateInputClass = (status: string) => {
  if (status === "expired") return "border-red-500 bg-red-50";
  if (status === "soon") return "border-yellow-500 bg-yellow-50";
  return "";
};

export default function EmploymentInfoTab({ employee }: { employee: any }) {
  const [showSensitive, setShowSensitive] = useState({
    license: false,
    insurance: false,
    policy: false,
    registration: false,
  });

  const [form, setForm] = useState<EmploymentInfoForm>(emptyForm);
  const [original, setOriginal] = useState<EmploymentInfoForm>(emptyForm);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load existing data
  useEffect(() => {
    const info = employee?.employmentInfo || {};

    const initial: EmploymentInfoForm = {
      driversLicenseNumber: info.driversLicenseNumber || "",
      driversLicenseExpiration: toDateInput(info.driversLicenseExpiration),
      insuranceStartDate: toDateInput(info.insuranceStartDate),
      insuranceEndDate: toDateInput(info.insuranceEndDate),
      insurancePolicyNumber: info.insurancePolicyNumber || "",
      carModel: info.carModel || "",
      carMake: info.carMake || "",
      carYear: typeof info.carYear === "number" ? String(info.carYear) : "",
      carHandicapAccessible: !!info.carHandicapAccessible,
      registrationStartDate: toDateInput(info.registrationStartDate),
      registrationExpiration: toDateInput(info.registrationExpiration),
      physicalExamDate: toDateInput(info.physicalExamDate),
      tbShotDate: toDateInput(info.tbShotDate),
      cprCertificationDate: toDateInput(info.cprCertificationDate),
      officePayRate:
        info.officePayRate != null ? String(info.officePayRate) : "",
      facilityPayRate:
        info.facilityPayRate != null ? String(info.facilityPayRate) : "",
      visitPayRate: info.visitPayRate != null ? String(info.visitPayRate) : "",
      mileagePayRate:
        info.mileagePayRate != null ? String(info.mileagePayRate) : "",
    };

    setForm(initial);
    setOriginal(initial);
  }, [employee]);

  const handleChange = <K extends keyof EmploymentInfoForm>(
    key: K,
    value: EmploymentInfoForm[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const hasChanges = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(original),
    [form, original]
  );

  const toggleVisibility = (field: keyof typeof showSensitive) => {
    setShowSensitive((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const saveChanges = () => {
    if (!hasChanges) {
      toast.info("No employment info changes detected.");
      return;
    }
    setConfirmOpen(true);
  };

  const confirmSave = async () => {
    try {
      setSaving(true);

      // IMPORTANT FIX: convert "" to null so backend Date() doesn’t break
      const nullable = (v: string) => (v?.trim() ? v : null);

      const payload = {
        driversLicenseNumber: form.driversLicenseNumber || null,
        driversLicenseExpiration: nullable(form.driversLicenseExpiration),
        insuranceStartDate: nullable(form.insuranceStartDate),
        insuranceEndDate: nullable(form.insuranceEndDate),
        insurancePolicyNumber: form.insurancePolicyNumber || null,
        carModel: form.carModel || null,
        carMake: form.carMake || null,
        carYear: form.carYear || null,
        carHandicapAccessible: form.carHandicapAccessible,
        registrationStartDate: nullable(form.registrationStartDate),
        registrationExpiration: nullable(form.registrationExpiration),
        physicalExamDate: nullable(form.physicalExamDate),
        tbShotDate: nullable(form.tbShotDate),
        cprCertificationDate: nullable(form.cprCertificationDate),
        officePayRate: form.officePayRate || null,
        facilityPayRate: form.facilityPayRate || null,
        visitPayRate: form.visitPayRate || null,
        mileagePayRate: form.mileagePayRate || null,
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/employees/${employee.id}/employment-info`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed to update employment info");

      const data = await res.json();
      const updated = data.employmentInfo;

      const updatedForm: EmploymentInfoForm = {
        driversLicenseNumber: updated.driversLicenseNumber || "",
        driversLicenseExpiration: toDateInput(updated.driversLicenseExpiration),
        insuranceStartDate: toDateInput(updated.insuranceStartDate),
        insuranceEndDate: toDateInput(updated.insuranceEndDate),
        insurancePolicyNumber: updated.insurancePolicyNumber || "",
        carModel: updated.carModel || "",
        carMake: updated.carMake || "",
        carYear:
          typeof updated.carYear === "number" ? String(updated.carYear) : "",
        carHandicapAccessible: !!updated.carHandicapAccessible,
        registrationStartDate: toDateInput(updated.registrationStartDate),
        registrationExpiration: toDateInput(updated.registrationExpiration),
        physicalExamDate: toDateInput(updated.physicalExamDate),
        tbShotDate: toDateInput(updated.tbShotDate),
        cprCertificationDate: toDateInput(updated.cprCertificationDate),
        officePayRate:
          updated.officePayRate != null ? String(updated.officePayRate) : "",
        facilityPayRate:
          updated.facilityPayRate != null
            ? String(updated.facilityPayRate)
            : "",
        visitPayRate:
          updated.visitPayRate != null ? String(updated.visitPayRate) : "",
        mileagePayRate:
          updated.mileagePayRate != null ? String(updated.mileagePayRate) : "",
      };

      setForm(updatedForm);
      setOriginal(updatedForm);
      toast.success("Employment information updated successfully!");
      setConfirmOpen(false);
    } catch (error) {
      console.error("Error saving employment info:", error);
      toast.error("Failed to update employment information.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollArea className="p-4 space-y-8">
      {/* Confirm Update Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm Employment Info Update</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to update this employee’s employment info?
          </p>
          <DialogFooter className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Keep Editing
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setForm(original);
                setConfirmOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={confirmSave} disabled={saving}>
              {saving ? "Saving..." : "Yes, Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Vehicle Information */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Vehicle Information</h2>
        <p className="text-sm text-unityred mb-4">
          **Sensitive Information — please maintain documentation**
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Driver License Number */}
          <div>
            <Label className="mb-1">Driver’s License</Label>
            <div className="flex items-center gap-2">
              <Input
                type={showSensitive.license ? "text" : "password"}
                placeholder="D1234567"
                value={form.driversLicenseNumber}
                onChange={(e) =>
                  handleChange("driversLicenseNumber", e.target.value)
                }
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

          {/* Driver License Expiration */}
          <div>
            <Label className="mb-1">License Expiration Date</Label>
            {(() => {
              const status = getDateStatus(form.driversLicenseExpiration);
              return (
                <Input
                  type="date"
                  value={form.driversLicenseExpiration || ""}
                  onChange={(e) =>
                    handleChange("driversLicenseExpiration", e.target.value)
                  }
                  className={dateInputClass(status)}
                  placeholder="No date"
                />
              );
            })()}
          </div>

          {/* Car Type */}
          <div>
            <Label className="mb-1">Car Type</Label>
            <Input
              placeholder="e.g., Toyota Camry"
              value={
                form.carMake || form.carModel
                  ? `${form.carMake} ${form.carModel}`.trim()
                  : ""
              }
              onChange={(e) => handleChange("carModel", e.target.value)}
            />
          </div>

          {/* Insurance Start */}
          <div>
            <Label className="mb-1">Insurance Start Date</Label>
            {(() => {
              const s = getDateStatus(form.insuranceStartDate);
              return (
                <Input
                  type="date"
                  value={form.insuranceStartDate || ""}
                  onChange={(e) =>
                    handleChange("insuranceStartDate", e.target.value)
                  }
                  className={dateInputClass(s)}
                  placeholder="No date"
                />
              );
            })()}
          </div>

          {/* Insurance End */}
          <div>
            <Label className="mb-1">Insurance Expiration Date</Label>
            {(() => {
              const s = getDateStatus(form.insuranceEndDate);
              return (
                <Input
                  type="date"
                  value={form.insuranceEndDate || ""}
                  onChange={(e) =>
                    handleChange("insuranceEndDate", e.target.value)
                  }
                  className={dateInputClass(s)}
                  placeholder="No date"
                />
              );
            })()}
          </div>

          {/* Policy */}
          <div>
            <Label className="mb-1">Policy Number</Label>
            <div className="flex items-center gap-2">
              <Input
                type={showSensitive.policy ? "text" : "password"}
                placeholder="POL-999123"
                value={form.insurancePolicyNumber}
                onChange={(e) =>
                  handleChange("insurancePolicyNumber", e.target.value)
                }
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

          {/* Registration Start */}
          <div>
            <Label className="mb-1">Registration Start Date</Label>
            {(() => {
              const s = getDateStatus(form.registrationStartDate);
              return (
                <Input
                  type="date"
                  value={form.registrationStartDate || ""}
                  onChange={(e) =>
                    handleChange("registrationStartDate", e.target.value)
                  }
                  className={dateInputClass(s)}
                  placeholder="No date"
                />
              );
            })()}
          </div>

          {/* Registration Exp */}
          <div>
            <Label className="mb-1">Registration Expiration Date</Label>
            {(() => {
              const s = getDateStatus(form.registrationExpiration);
              return (
                <Input
                  type="date"
                  value={form.registrationExpiration || ""}
                  onChange={(e) =>
                    handleChange("registrationExpiration", e.target.value)
                  }
                  className={dateInputClass(s)}
                  placeholder="No date"
                />
              );
            })()}
          </div>

          {/* Handicap Accessible */}
          <div className="flex items-center space-x-2 mt-2">
            <Checkbox
              id="handicap"
              checked={form.carHandicapAccessible}
              onCheckedChange={(checked) =>
                handleChange("carHandicapAccessible", checked === true)
              }
            />
            <Label htmlFor="handicap">Handicap Accessible</Label>
          </div>
        </div>
      </section>

      {/* Medical Information */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Medical Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Physical Exam */}
          <div>
            <Label className="mb-1">Physical Exam Date</Label>
            {(() => {
              const s = getDateStatus(form.physicalExamDate);
              return (
                <Input
                  type="date"
                  value={form.physicalExamDate || ""}
                  onChange={(e) =>
                    handleChange("physicalExamDate", e.target.value)
                  }
                  className={dateInputClass(s)}
                  placeholder="No date"
                />
              );
            })()}
          </div>

          {/* TB Shot */}
          <div>
            <Label className="mb-1">TB Shot Date</Label>
            {(() => {
              const s = getDateStatus(form.tbShotDate);
              return (
                <Input
                  type="date"
                  value={form.tbShotDate || ""}
                  onChange={(e) => handleChange("tbShotDate", e.target.value)}
                  className={dateInputClass(s)}
                  placeholder="No date"
                />
              );
            })()}
          </div>

          {/* CPR */}
          <div>
            <Label className="mb-1">CPR Certification Date</Label>
            {(() => {
              const s = getDateStatus(form.cprCertificationDate);
              return (
                <Input
                  type="date"
                  value={form.cprCertificationDate || ""}
                  onChange={(e) =>
                    handleChange("cprCertificationDate", e.target.value)
                  }
                  className={dateInputClass(s)}
                  placeholder="No date"
                />
              );
            })()}
          </div>
        </div>
      </section>

      {/* Medical Clearances */}
      <section>
        <div className="flex justify-between mb-2">
          <h2 className="text-lg font-semibold">Medical Clearances</h2>
          <AddMedicalClearanceModal
            employeeId={employee.id}
            onCreated={() => window.location.reload()}
          />
        </div>

        {employee.medicalInfos.length === 0 ? (
          <p className="text-muted-foreground">No medical clearances.</p>
        ) : (
          <div className="border rounded-md p-4">
            {employee.medicalInfos.map((m: any) => (
              <div key={m.id} className="flex justify-between py-2">
                <span>
                  {m.clearanceName} —{" "}
                  {new Date(m.effectiveDate).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Pay Rates */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Pay Rates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="mb-1">Office Pay Rate ($/hr)</Label>
            <Input
              type="number"
              value={form.officePayRate}
              onChange={(e) => handleChange("officePayRate", e.target.value)}
              placeholder="18.50"
            />
          </div>

          <div>
            <Label className="mb-1">Facility Pay Rate ($/hr)</Label>
            <Input
              type="number"
              value={form.facilityPayRate}
              onChange={(e) => handleChange("facilityPayRate", e.target.value)}
              placeholder="20.00"
            />
          </div>

          <div>
            <Label className="mb-1">Visit Pay Rate</Label>
            <Input
              type="number"
              value={form.visitPayRate}
              onChange={(e) => handleChange("visitPayRate", e.target.value)}
              placeholder="15.00"
            />
          </div>

          <div>
            <Label className="mb-1">Mileage Pay Rate ($/mile)</Label>
            <Input
              type="number"
              value={form.mileagePayRate}
              onChange={(e) => handleChange("mileagePayRate", e.target.value)}
              placeholder="0.65"
            />
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section>
        <div className="flex justify-between mb-2">
          <h2 className="text-lg font-semibold">Certifications</h2>
          <AddCertificationModal
            employeeId={employee.id}
            onCreated={() => window.location.reload()}
          />
        </div>

        {employee.certifications.length === 0 ? (
          <p className="text-muted-foreground">No certifications added.</p>
        ) : (
          <div className="border rounded-md p-4">
            {employee.certifications.map((c: any) => (
              <div key={c.id} className="flex justify-between py-2">
                <span>
                  {c.name} — {new Date(c.dateObtained).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Save Button */}
      <div className="pt-4">
        <Button
          onClick={saveChanges}
          disabled={!hasChanges}
          variant={hasChanges ? "default" : "outline"}
        >
          {hasChanges ? "Save Employment Info" : "No Changes"}
        </Button>
      </div>
    </ScrollArea>
  );
}
// "use client";

// import React, { useEffect, useMemo, useState } from "react";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { EyeIcon, EyeOffIcon } from "lucide-react";
// import { toast } from "sonner";
// import {
//   Dialog,
//   DialogContent,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import AddMedicalClearanceModal from "../modals/AddMedicalClearanceModal";
// import AddCertificationModal from "../modals/AddCertificationModal";

// type EmploymentInfoForm = {
//   driversLicenseNumber: string;
//   driversLicenseExpiration: string; // "YYYY-MM-DD"
//   insuranceStartDate: string;
//   insuranceEndDate: string;
//   insurancePolicyNumber: string;
//   carModel: string;
//   carMake: string;
//   carYear: string;
//   carHandicapAccessible: boolean;
//   registrationStartDate: string;
//   registrationExpiration: string;
//   physicalExamDate: string;
//   tbShotDate: string;
//   cprCertificationDate: string;
//   officePayRate: string;
//   facilityPayRate: string;
//   visitPayRate: string;
//   mileagePayRate: string;
// };

// const emptyForm: EmploymentInfoForm = {
//   driversLicenseNumber: "",
//   driversLicenseExpiration: "",
//   insuranceStartDate: "",
//   insuranceEndDate: "",
//   insurancePolicyNumber: "",
//   carModel: "",
//   carMake: "",
//   carYear: "",
//   carHandicapAccessible: false,
//   registrationStartDate: "",
//   registrationExpiration: "",
//   physicalExamDate: "",
//   tbShotDate: "",
//   cprCertificationDate: "",
//   officePayRate: "",
//   facilityPayRate: "",
//   visitPayRate: "",
//   mileagePayRate: "",
// };

// // const toDateInput = (value?: string | Date | null) => {
// //   if (!value) return "";
// //   const d = typeof value === "string" ? new Date(value) : value;
// //   if (Number.isNaN(d.getTime())) return "";
// //   return d.toISOString().slice(0, 10); // "YYYY-MM-DD"
// // };
// // Converts backend date --> input[type="date"] safe format
// const toDateInput = (value?: string | Date | null) => {
//   if (!value) return ""; // DO NOT return today's date

//   const d = new Date(value);
//   if (Number.isNaN(d.getTime())) return "";

//   // ALWAYS output YYYY-MM-DD (ignoring time zone)
//   return d.toISOString().split("T")[0];
// };

// const getDateStatus = (dateString: string) => {
//   if (!dateString) return "none";

//   const today = new Date();
//   const date = new Date(dateString);
//   if (Number.isNaN(date.getTime())) return "none";

//   if (date < today) return "expired";

//   const days = Math.floor((date.getTime() - today.getTime()) / 86400000);
//   if (days < 31) return "soon";

//   return "valid";
// };

// const dateInputClass = (status: string) => {
//   if (status === "expired") return "border-red-500 bg-red-50";
//   if (status === "soon") return "border-yellow-500 bg-yellow-50";
//   return "";
// };

// export default function EmploymentInfoTab({ employee }: { employee: any }) {
//   const [showSensitive, setShowSensitive] = useState({
//     license: false,
//     insurance: false,
//     policy: false,
//     registration: false,
//   });

//   const [form, setForm] = useState<EmploymentInfoForm>(emptyForm);
//   const [original, setOriginal] = useState<EmploymentInfoForm>(emptyForm);
//   const [confirmOpen, setConfirmOpen] = useState(false);
//   const [saving, setSaving] = useState(false);

//   // Initialize from employee.employmentInfo when employee changes
//   useEffect(() => {
//     const info = employee?.employmentInfo || {};
//     const initial: EmploymentInfoForm = {
//       driversLicenseNumber: info.driversLicenseNumber || "",
//       driversLicenseExpiration: toDateInput(info.driversLicenseExpiration),
//       insuranceStartDate: toDateInput(info.insuranceStartDate),
//       insuranceEndDate: toDateInput(info.insuranceEndDate),
//       insurancePolicyNumber: info.insurancePolicyNumber || "",
//       carModel: info.carModel || "",
//       carMake: info.carMake || "",
//       carYear: typeof info.carYear === "number" ? String(info.carYear) : "",
//       carHandicapAccessible: !!info.carHandicapAccessible,
//       registrationStartDate: toDateInput(info.registrationStartDate),
//       registrationExpiration: toDateInput(info.registrationExpiration),
//       physicalExamDate: toDateInput(info.physicalExamDate),
//       tbShotDate: toDateInput(info.tbShotDate),
//       cprCertificationDate: toDateInput(info.cprCertificationDate),
//       officePayRate:
//         info.officePayRate != null ? String(info.officePayRate) : "",
//       facilityPayRate:
//         info.facilityPayRate != null ? String(info.facilityPayRate) : "",
//       visitPayRate: info.visitPayRate != null ? String(info.visitPayRate) : "",
//       mileagePayRate:
//         info.mileagePayRate != null ? String(info.mileagePayRate) : "",
//     };

//     setForm(initial);
//     setOriginal(initial);
//   }, [employee]);

//   const handleChange = <K extends keyof EmploymentInfoForm>(
//     key: K,
//     value: EmploymentInfoForm[K]
//   ) => {
//     setForm((prev) => ({ ...prev, [key]: value }));
//   };

//   const hasChanges = useMemo(
//     () => JSON.stringify(form) !== JSON.stringify(original),
//     [form, original]
//   );

//   const toggleVisibility = (field: keyof typeof showSensitive) => {
//     setShowSensitive((prev) => ({ ...prev, [field]: !prev[field] }));
//   };

//   const saveChanges = () => {
//     if (!hasChanges) {
//       toast.info("No employment info changes detected.");
//       return;
//     }
//     setConfirmOpen(true);
//   };

//   const confirmSave = async () => {
//     try {
//       setSaving(true);

//       const payload = {
//         driversLicenseNumber: form.driversLicenseNumber || null,
//         driversLicenseExpiration: form.driversLicenseExpiration || null,
//         insuranceStartDate: form.insuranceStartDate || null,
//         insuranceEndDate: form.insuranceEndDate || null,
//         insurancePolicyNumber: form.insurancePolicyNumber || null,
//         carModel: form.carModel || null,
//         carMake: form.carMake || null,
//         carYear: form.carYear || null,
//         carHandicapAccessible: form.carHandicapAccessible,
//         registrationStartDate: form.registrationStartDate || null,
//         registrationExpiration: form.registrationExpiration || null,
//         physicalExamDate: form.physicalExamDate || null,
//         tbShotDate: form.tbShotDate || null,
//         cprCertificationDate: form.cprCertificationDate || null,
//         officePayRate: form.officePayRate || null,
//         facilityPayRate: form.facilityPayRate || null,
//         visitPayRate: form.visitPayRate || null,
//         mileagePayRate: form.mileagePayRate || null,
//       };

//       const res = await fetch(
//         `${process.env.NEXT_PUBLIC_API_URL}/api/employees/${employee.id}/employment-info`,
//         {
//           method: "PATCH",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(payload),
//         }
//       );

//       if (!res.ok) {
//         throw new Error("Failed to update employment info");
//       }

//       const data = await res.json();
//       const updated = data.employmentInfo;

//       const updatedForm: EmploymentInfoForm = {
//         driversLicenseNumber: updated.driversLicenseNumber || "",
//         driversLicenseExpiration: toDateInput(updated.driversLicenseExpiration),
//         insuranceStartDate: toDateInput(updated.insuranceStartDate),
//         insuranceEndDate: toDateInput(updated.insuranceEndDate),
//         insurancePolicyNumber: updated.insurancePolicyNumber || "",
//         carModel: updated.carModel || "",
//         carMake: updated.carMake || "",
//         carYear:
//           typeof updated.carYear === "number" ? String(updated.carYear) : "",
//         carHandicapAccessible: !!updated.carHandicapAccessible,
//         registrationStartDate: toDateInput(updated.registrationStartDate),
//         registrationExpiration: toDateInput(updated.registrationExpiration),
//         physicalExamDate: toDateInput(updated.physicalExamDate),
//         tbShotDate: toDateInput(updated.tbShotDate),
//         cprCertificationDate: toDateInput(updated.cprCertificationDate),
//         officePayRate:
//           updated.officePayRate != null ? String(updated.officePayRate) : "",
//         facilityPayRate:
//           updated.facilityPayRate != null
//             ? String(updated.facilityPayRate)
//             : "",
//         visitPayRate:
//           updated.visitPayRate != null ? String(updated.visitPayRate) : "",
//         mileagePayRate:
//           updated.mileagePayRate != null ? String(updated.mileagePayRate) : "",
//       };

//       setForm(updatedForm);
//       setOriginal(updatedForm);
//       toast.success("Employment information updated successfully!");
//       setConfirmOpen(false);
//     } catch (error) {
//       console.error("Error saving employment info:", error);
//       toast.error("Failed to update employment information.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <ScrollArea className="p-4 space-y-8">
//       {/* Confirm Update Dialog */}
//       <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
//         <DialogContent className="max-w-sm">
//           <DialogHeader>
//             <DialogTitle>Confirm Employment Info Update</DialogTitle>
//           </DialogHeader>
//           <p>
//             Are you sure you want to update this employee&apos;s employment
//             information?
//           </p>
//           <DialogFooter className="flex justify-end gap-2 pt-4">
//             <Button variant="outline" onClick={() => setConfirmOpen(false)}>
//               Keep Editing
//             </Button>
//             <Button
//               variant="ghost"
//               onClick={() => {
//                 setForm(original);
//                 setConfirmOpen(false);
//               }}
//             >
//               Cancel
//             </Button>
//             <Button onClick={confirmSave} disabled={saving}>
//               {saving ? "Saving..." : "Yes, Update"}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Vehicle Information */}
//       <section>
//         <h2 className="text-lg font-semibold mb-4">Vehicle Information</h2>
//         <p className="text-sm text-unityred mb-4">
//           **Sensitive Information: Please keep documentation of this data as
//           required.**
//         </p>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {/* Driver's License */}
//           <div>
//             <Label className="mb-1">Driver&apos;s License</Label>
//             <div className="flex items-center gap-2">
//               <Input
//                 type={showSensitive.license ? "text" : "password"}
//                 placeholder="D1234567"
//                 value={form.driversLicenseNumber}
//                 onChange={(e) =>
//                   handleChange("driversLicenseNumber", e.target.value)
//                 }
//               />
//               <Button
//                 size="icon"
//                 variant="ghost"
//                 onClick={() => toggleVisibility("license")}
//               >
//                 {showSensitive.license ? (
//                   <EyeOffIcon size={16} />
//                 ) : (
//                   <EyeIcon size={16} />
//                 )}
//               </Button>
//             </div>
//           </div>

//           {/* Car Type (map to Make + Model text) */}
//           <div>
//             <Label className="mb-1">Car Type</Label>
//             <Input
//               placeholder="e.g., 2008 Toyota Camry"
//               value={
//                 form.carMake || form.carModel
//                   ? `${form.carMake} ${form.carModel}`.trim()
//                   : ""
//               }
//               onChange={(e) => {
//                 // Simple approach: store entire string in carModel
//                 handleChange("carModel", e.target.value);
//               }}
//             />
//           </div>

//           {/* Insurance Dates */}
//           <div>
//             <Label className="mb-1">Insurance Start Date</Label>
//             <Input
//               type="date"
//               value={form.insuranceStartDate}
//               onChange={(e) =>
//                 handleChange("insuranceStartDate", e.target.value)
//               }
//               placeholder={
//                 form.insuranceStartDate ? form.insuranceStartDate : "MM/DD/YYYY"
//               }
//             />
//           </div>
//           <div>
//             <Label className="mb-1">Insurance Expiration Date</Label>
//             <Input
//               type="date"
//               value={form.insuranceEndDate}
//               onChange={(e) => handleChange("insuranceEndDate", e.target.value)}
//               placeholder={
//                 form.insuranceEndDate ? form.insuranceEndDate : "MM/DD/YYYY"
//               }
//             />
//           </div>

//           {/* Policy Number */}
//           <div>
//             <Label className="mb-1">Policy Number</Label>
//             <div className="flex items-center gap-2">
//               <Input
//                 type={showSensitive.policy ? "text" : "password"}
//                 placeholder="POL-999123"
//                 value={form.insurancePolicyNumber}
//                 onChange={(e) =>
//                   handleChange("insurancePolicyNumber", e.target.value)
//                 }
//               />
//               <Button
//                 size="icon"
//                 variant="ghost"
//                 onClick={() => toggleVisibility("policy")}
//               >
//                 {showSensitive.policy ? (
//                   <EyeOffIcon size={16} />
//                 ) : (
//                   <EyeIcon size={16} />
//                 )}
//               </Button>
//             </div>
//           </div>

//           {/* Registration Dates */}
//           <div>
//             <Label className="mb-1">Registration Start Date</Label>
//             <Input
//               type="date"
//               value={form.registrationStartDate}
//               onChange={(e) =>
//                 handleChange("registrationStartDate", e.target.value)
//               }
//               placeholder={
//                 form.registrationStartDate
//                   ? form.registrationStartDate
//                   : "MM/DD/YYYY"
//               }
//             />
//           </div>
//           <div>
//             <Label className="mb-1">Registration Expiration Date</Label>
//             <Input
//               type="date"
//               value={form.registrationExpiration}
//               onChange={(e) =>
//                 handleChange("registrationExpiration", e.target.value)
//               }
//               placeholder={
//                 form.registrationExpiration
//                   ? form.registrationExpiration
//                   : "MM/DD/YYYY"
//               }
//             />
//           </div>

//           {/* Handicap Accessible */}
//           <div className="flex items-center space-x-2 mt-2">
//             <Checkbox
//               id="handicap"
//               checked={form.carHandicapAccessible}
//               onCheckedChange={(checked) =>
//                 handleChange("carHandicapAccessible", checked === true)
//               }
//             />
//             <Label htmlFor="handicap">Handicap Accessible</Label>
//           </div>
//         </div>
//       </section>

//       {/* Medical Information */}
//       <section>
//         <h2 className="text-lg font-semibold mb-4">Medical Information</h2>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <Label className="mb-1">Physical Exam Date</Label>
//             <Input
//               type="date"
//               value={form.physicalExamDate}
//               onChange={(e) => handleChange("physicalExamDate", e.target.value)}
//             />
//           </div>
//           <div>
//             <Label className="mb-1">TB Shot Date</Label>
//             <Input
//               type="date"
//               value={form.tbShotDate}
//               onChange={(e) => handleChange("tbShotDate", e.target.value)}
//             />
//           </div>
//           <div>
//             <Label className="mb-1">CPR Certification Date</Label>
//             <Input
//               type="date"
//               value={form.cprCertificationDate}
//               onChange={(e) =>
//                 handleChange("cprCertificationDate", e.target.value)
//               }
//             />
//           </div>
//         </div>
//       </section>

//       {/* Medical Clearances */}
//       <section>
//         <div className="flex justify-between mb-2">
//           <h2 className="text-lg font-semibold">Medical Clearances</h2>
//           <AddMedicalClearanceModal
//             employeeId={employee.id}
//             onCreated={() => window.location.reload()}
//           />
//         </div>

//         {employee.medicalInfos.length === 0 ? (
//           <p className="text-muted-foreground">No medical clearances.</p>
//         ) : (
//           <div className="border rounded-md p-4">
//             {employee.medicalInfos.map((m: any) => (
//               <div key={m.id} className="flex justify-between py-2">
//                 <span>
//                   {m.clearanceName} -{" "}
//                   {new Date(m.effectiveDate).toLocaleDateString()}
//                 </span>
//               </div>
//             ))}
//           </div>
//         )}
//       </section>

//       {/* Pay Rates */}
//       <section>
//         <h2 className="text-lg font-semibold mb-4">Pay Rates</h2>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <Label className="mb-1">Office Pay Rate ($/hr)</Label>
//             <Input
//               type="number"
//               step="0.01"
//               value={form.officePayRate}
//               onChange={(e) => handleChange("officePayRate", e.target.value)}
//               placeholder="e.g., 18.50"
//             />
//           </div>
//           <div>
//             <Label className="mb-1">Facility Pay Rate ($/hr)</Label>
//             <Input
//               type="number"
//               step="0.01"
//               value={form.facilityPayRate}
//               onChange={(e) => handleChange("facilityPayRate", e.target.value)}
//               placeholder="e.g., 20.00"
//             />
//           </div>
//           <div>
//             <Label className="mb-1">Visit Pay Rate ($/visit or hr)</Label>
//             <Input
//               type="number"
//               step="0.01"
//               value={form.visitPayRate}
//               onChange={(e) => handleChange("visitPayRate", e.target.value)}
//               placeholder="e.g., 15.00"
//             />
//           </div>
//           <div>
//             <Label className="mb-1">Mileage Pay Rate ($/mile)</Label>
//             <Input
//               type="number"
//               step="0.01"
//               value={form.mileagePayRate}
//               onChange={(e) => handleChange("mileagePayRate", e.target.value)}
//               placeholder="e.g., 0.65"
//             />
//           </div>
//         </div>
//       </section>

//       {/* Certifications */}
//       <section>
//         <div className="flex justify-between mb-2">
//           <h2 className="text-lg font-semibold">Certifications</h2>
//           <AddCertificationModal
//             employeeId={employee.id}
//             onCreated={() => window.location.reload()}
//           />
//         </div>

//         {employee.certifications.length === 0 ? (
//           <p className="text-muted-foreground">No certifications added.</p>
//         ) : (
//           <div className="border rounded-md p-4">
//             {employee.certifications.map((c: any) => (
//               <div key={c.id} className="flex justify-between py-2">
//                 <span>
//                   {c.name} — {new Date(c.dateObtained).toLocaleDateString()}
//                 </span>
//               </div>
//             ))}
//           </div>
//         )}
//       </section>

//       {/* Save Button */}
//       <div className="pt-4">
//         <Button
//           onClick={saveChanges}
//           disabled={!hasChanges}
//           variant={hasChanges ? "default" : "outline"}
//         >
//           {hasChanges ? "Save Employment Info" : "No Changes"}
//         </Button>
//       </div>
//     </ScrollArea>
//   );
// }
