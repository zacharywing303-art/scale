"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import SaveChangesButton from "./SaveChangesButton";
import CreateAddressModal from "../modals/CreateAddressModal";
import CreateContactModal from "../modals/CreateContactModal";
import { Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { getLoggedInUser } from "@/lib/auth/authHelpers";
import { is } from "date-fns/locale";

const LANGUAGE_OPTIONS = [
  "English",
  "Spanish",
  "Italian",
  "German",
  "French",
  "Portuguese",
  "Mandarin",
  "Russian",
  "Arabic",
  "Hindi",
  "Other",
];

export default function EmployeeGeneralTab({ employee }: { employee: any }) {
  const [showSSN, setShowSSN] = useState(false);
  const [form, setForm] = useState(employee);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [languages, setLanguages] = useState<string[]>(
    employee.languages || []
  );
  const currentUser = getLoggedInUser();
  const [original, setOriginal] = useState(employee);
  const [supervisors, setSupervisors] = useState<any[]>([]);

  useEffect(() => {
    setForm(employee || {});
    setLanguages(employee.languages || []);
    setOriginal(employee || {});
  }, [employee]);

  const hasChanges = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(original),
    [form, original]
  );

  const handleChange = (key: string, value: string) =>
    setForm((prev: any) => ({ ...prev, [key]: value }));

  /** Primary Language = first element in array */
  const primaryLanguage = languages[0] || "";

  const handlePrimaryLanguageChange = (newLang: string) => {
    setLanguages((prev) => {
      const filtered = prev.filter((l) => l !== newLang);
      return [newLang, ...filtered];
    });
  };

  useEffect(() => {
    const fetchSupervisors = async () => {
      if (!currentUser?.agency?.id) return;
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/employees/agency/${currentUser.agency.id}`
        );
        const data = await res.json();
        const supervisorsOnly = data.filter((emp: any) => emp.isSupervisor);
        setSupervisors(supervisorsOnly);
      } catch (err) {
        console.error("Error loading supervisors:", err);
      }
    };
    fetchSupervisors();
  }, [currentUser]);

  /** Handle adding/removing other languages */
  const toggleOtherLanguage = (lang: string) => {
    setLanguages((prev) => {
      if (prev.includes(lang)) {
        return prev.filter((l) => l !== lang);
      } else {
        return [...prev, lang];
      }
    });
  };

  const saveChanges = async () => {
    if (
      !hasChanges &&
      JSON.stringify(languages) === JSON.stringify(original.languages)
    ) {
      toast.info("No changes detected.");
      return;
    }
    setConfirmOpen(true);
  };

  const confirmSave = async () => {
    try {
      setSaving(true);
      const payload = {
        last5SSN: form.last5SSN,
        name: form.name,
        title: form.title,
        middleName: form.middleName,
        suffix: form.suffix,
        gender: form.gender,
        mainPhone: form.mainPhone,
        email: form.email,
        phone2: form.phone2,
        phone3: form.phone3,
        phone4: form.phone4,
        dateOfBirth: form.dateOfBirth,
        languages: languages,
        updatedBy: currentUser?.name,
        nationalProviderID: form.nationalProviderID,
        alternativeProviderID: form.alternativeProviderID,
        registryID: form.registryID,
        position: form.position,
        supervisorCode: form.supervisorCode,
        supervisor: form.supervisor,
        rehire: form.rehire,
        isSupervisor: form.isSupervisor,
        mobileUser: form.mobileUser,
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/employees/${employee.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed to update employee.");

      toast.success("Employee information updated successfully!");
      setConfirmOpen(false);
      window.location.reload();
    } catch (err) {
      console.error("Error updating employee:", err);
      toast.error("Failed to update employee.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollArea className="p-4 space-y-6">
      {/* Confirm Update Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm Update</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to update this Employee's information?</p>
          <DialogFooter className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Keep Editing
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setForm(original);
                setLanguages(original.languages || []);
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
      {/* Employee Personal Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Editable Fields */}
        <div>
          <Label className="mb-1">First Name</Label>
          <Input
            value={form.name?.split(" ")[0] || ""}
            onChange={(e) =>
              handleChange(
                "name",
                `${e.target.value} ${form.name?.split(" ")[1] || ""}`.trim()
              )
            }
          />
        </div>
        <div>
          <Label className="mb-1">Last Name</Label>
          <Input
            value={form.name?.split(" ")[1] || ""}
            onChange={(e) =>
              handleChange(
                "name",
                `${form.name?.split(" ")[0] || ""} ${e.target.value}`.trim()
              )
            }
          />
        </div>
        <div>
          <Label className="mb-1">Title</Label>
          <Select
            value={form.title || ""}
            onValueChange={(val) => handleChange("title", val)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Title" />
            </SelectTrigger>
            <SelectContent>
              {[
                "Mr.",
                "Mrs.",
                "Ms.",
                "Miss",
                "Dr.",
                "Prof.",
                "Rev.",
                "Mx.",
                "Other",
              ].map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1">Middle Name</Label>
          <Input
            value={form.middleName || ""}
            onChange={(e) => handleChange("middleName", e.target.value)}
          />
        </div>
        <div>
          <Label className="mb-1">Suffix</Label>
          <Input
            value={form.suffix || ""}
            onChange={(e) => handleChange("suffix", e.target.value)}
          />
        </div>
        <div>
          <Label className="mb-1">Gender</Label>
          <Select
            value={form.gender || ""}
            onValueChange={(val) => handleChange("gender", val)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1">Birth Date</Label>
          <Input
            type="date"
            value={form.dateOfBirth || ""}
            onChange={(e) => handleChange("dateOfBirth", e.target.value)}
          />
        </div>
        <div>
          <Label className="mb-1">Primary Language</Label>
          <Select
            value={primaryLanguage}
            onValueChange={handlePrimaryLanguageChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGE_OPTIONS.map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {lang}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Other Languages (multi-select checkboxes) */}
        <div>
          <Label className="mb-1">Other Languages</Label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            {LANGUAGE_OPTIONS.map((lang) => {
              if (lang === primaryLanguage) return null;
              const selected = languages.includes(lang);
              return (
                <label
                  key={lang}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <Checkbox
                    checked={selected}
                    onCheckedChange={() => toggleOtherLanguage(lang)}
                  />
                  {lang}
                </label>
              );
            })}
          </div>
        </div>

        <div>
          <Label className="mb-1">Employee ID</Label>
          <Input value={form.employeeID || ""} disabled />
        </div>
        <div>
          <Label className="mb-1">Last 5 of SSN</Label>
          <div className="flex gap-2">
            <Input
              type={showSSN ? "text" : "password"}
              value={form.last5SSN || ""}
              onChange={(e) => handleChange("last5SSN", e.target.value)}
            />
            <Button
              variant="outline"
              onClick={() => setShowSSN(!showSSN)}
              aria-label={showSSN ? "Hide SSN" : "Show SSN"}
            >
              {showSSN ? <EyeOff size={16} /> : <Eye size={16} />}
            </Button>
          </div>
        </div>

        {/* Contact Info */}
        <div>
          <Label className="mb-1">Primary Phone</Label>
          <Input
            value={form.mainPhone || ""}
            onChange={(e) => handleChange("mainPhone", e.target.value)}
          />
        </div>
        <div>
          <Label className="mb-1">Primary Email</Label>
          <Input
            value={form.email || ""}
            onChange={(e) => handleChange("email", e.target.value)}
          />
        </div>
        <div>
          <Label className="mb-1">National Provider ID</Label>
          <Input
            value={form.nationalProviderID || ""}
            onChange={(e) => handleChange("nationalProviderID", e.target.value)}
          />
        </div>
        <div>
          <Label className="mb-1">Registry ID</Label>
          <Input
            value={form.registryID || ""}
            onChange={(e) => handleChange("registryID", e.target.value)}
          />
        </div>
        <div>
          <Label className="mb-1">Other ID</Label>
          <Input
            value={form.alternativeProviderID || ""}
            onChange={(e) =>
              handleChange("alternativeProviderID", e.target.value)
            }
          />
        </div>
        <div>
          <Label className="mb-1">Alternate Phone</Label>
          <Input
            value={form.phone2 || ""}
            onChange={(e) => handleChange("phone2", e.target.value)}
          />
        </div>

        {form?.phone2 && (
          <>
            <div>
              <Label className="mb-1">Alternate Phone 2</Label>
              <Input
                value={form.phone3 || ""}
                onChange={(e) => handleChange("phone3", e.target.value)}
              />
            </div>
            <div>
              <Label className="mb-1">Alternate Phone 3</Label>
              <Input
                value={form.phone4 || ""}
                onChange={(e) => handleChange("phone4", e.target.value)}
              />
            </div>
          </>
        )}
      </div>

      {/* Address + Contact Modals */}
      <div className="flex gap-3">
        <CreateAddressModal
          employeeId={employee.id}
          onCreated={() => window.location.reload()}
        />
        <CreateContactModal
          employeeId={employee.id}
          onCreated={() => window.location.reload()}
        />
      </div>

      {/* Addresses */}
      <div>
        <Label className="mb-1">Addresses</Label>
        {employee?.addresses?.length ? (
          employee.addresses.map((a: any) => (
            <p key={a.id} className="text-sm">
              {a.addressLine1}, {a.city}, {a.state}
            </p>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No addresses found.</p>
        )}
      </div>

      {/* Emergency Contacts */}
      <div>
        <Label className="mb-1">Emergency Contacts</Label>
        {employee?.contacts?.length ? (
          employee.contacts.map((c: any) => (
            <p key={c.id} className="text-sm">
              {c.firstName} {c.lastName} ({c.relation}) – {c.phone1}
            </p>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No contacts found.</p>
        )}
      </div>

      {/* Agency Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="mb-1">Position</Label>
          <Select
            value={form.position || ""}
            onValueChange={(val) => handleChange("position", val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Position" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Office">Office</SelectItem>
              <SelectItem value="Caregiver">Caregiver</SelectItem>
              <SelectItem value="Registered_Nurse">Registered Nurse</SelectItem>
              <SelectItem value="Licensed_Practical_Nurse">
                Licensed Practical Nurse
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1">Supervisor</Label>
          <Select
            onValueChange={(v) => handleChange("supervisor", v)}
            value={form.supervisor}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Supervisor" />
            </SelectTrigger>
            <SelectContent>
              {supervisors.map((s) => (
                <SelectItem key={s.id} value={s.name}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1">Hire Date</Label>
          <Input type="date" value={form.hireDate || ""} disabled />
        </div>
        <div>
          <Label className="mb-1">Effective Date</Label>
          <Input type="date" disabled value={form.effectiveDate || ""} />
        </div>
      </div>

      {/* Checkboxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="flex items-center gap-2">
          <Checkbox
            id="mobile-user"
            checked={!!form.mobileUser}
            disabled={!!form.mobileUser}
            onCheckedChange={(checked) => {
              if (form.mobileUser) return;
              setForm((prev: any) => ({
                ...prev,
                mobileUser: checked === true,
              }));
            }}
          />
          <Label htmlFor="mobile-user">Mobile User</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="supervisor"
            checked={!!form.isSupervisor}
            onCheckedChange={(checked) =>
              setForm((prev: any) => ({
                ...prev,
                isSupervisor: checked === true,
              }))
            }
          />
          <Label htmlFor="supervisor">Supervisor</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="rehire"
            checked={!!form.rehire}
            onCheckedChange={(checked) =>
              setForm((prev: any) => ({
                ...prev,
                rehire: checked === true,
              }))
            }
          />
          <Label htmlFor="rehire">Rehire</Label>
        </div>
      </div>

      {/* Save Changes Button */}
      <Button
        onClick={saveChanges}
        disabled={!hasChanges}
        variant={hasChanges ? "default" : "outline"}
      >
        {hasChanges ? "Save Changes" : "No Changes"}
      </Button>
    </ScrollArea>
  );
}
