"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { Checkbox } from "@/components/ui/checkbox";

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

export default function GeneralTab({ client }: { client: any }) {
  const [form, setForm] = useState(client);
  const [showSSN, setShowSSN] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [languages, setLanguages] = useState<string[]>(client.languages || []);
  const currentUser = getLoggedInUser();
  const [original, setOriginal] = useState(client);

  useEffect(() => {
    setForm(client || {});
    setLanguages(client.languages || []);
    setOriginal(client || {});
  }, [client]);

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
        ssn: form.ssn,
        name: form.name,
        title: form.title,
        middleInitial: form.middleInitial,
        suffix: form.suffix,
        gender: form.gender,
        mainPhone: form.primaryPhoneNumber || form.mainPhone,
        email: form.primaryEmail || form.email,
        phone2: form.phone2,
        phone3: form.phone3,
        phone4: form.phone4,
        dateOfBirth: form.dateOfBirth,
        languages: languages,
        updatedBy: currentUser?.name,
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/clients/${client.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed to update client.");

      toast.success("Client information updated successfully!");
      setConfirmOpen(false);
      window.location.reload();
    } catch (err) {
      console.error("Error updating client:", err);
      toast.error("Failed to update client.");
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
          <p>Are you sure you want to update this client’s information?</p>
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

      {/* Client Info Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="mb-1">SSN</Label>
          <div className="flex gap-2">
            <Input
              type={showSSN ? "text" : "password"}
              value={form.ssn || ""}
              onChange={(e) => handleChange("ssn", e.target.value)}
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
          <Label className="mb-1">Middle Initial</Label>
          <Input
            value={form.middleInitial || ""}
            onChange={(e) => handleChange("middleInitial", e.target.value)}
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
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
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

        {/* Primary Language */}
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
          <Label className="mb-1">Medicaid ID</Label>
          <Input value={form.medicaidID || ""} disabled />
        </div>

        <div>
          <Label className="mb-1">Client ID</Label>
          <Input value={form.clientID || ""} disabled />
        </div>

        <div>
          <Label className="mb-1">Primary Phone Number</Label>
          <Input
            value={form.primaryPhoneNumber || ""}
            onChange={(e) => handleChange("primaryPhoneNumber", e.target.value)}
          />
        </div>

        <div>
          <Label className="mb-1">Primary Email</Label>
          <Input
            value={form.primaryEmail || ""}
            onChange={(e) => handleChange("primaryEmail", e.target.value)}
          />
        </div>

        <div>
          <Label className="mb-1">Other ID</Label>
          <Input
            value={form.otherID || ""}
            onChange={(e) => handleChange("otherID", e.target.value)}
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
          clientId={client.id}
          onCreated={() => window.location.reload()}
        />
        <CreateContactModal
          clientId={client.id}
          onCreated={() => window.location.reload()}
        />
      </div>

      {/* Addresses */}
      <div>
        <Label className="mb-1">Addresses</Label>
        {client?.addresses?.length ? (
          client.addresses.map((a: any) => (
            <p key={a.id} className="text-sm">
              {a.addressLine1}, {a.city}, {a.state}
            </p>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No addresses found.</p>
        )}
      </div>

      {/* Contacts */}
      <div>
        <Label className="mb-1">Contacts</Label>
        {client?.contacts?.length ? (
          client.contacts.map((c: any) => (
            <p key={c.id} className="text-sm">
              {c.firstName} {c.lastName} ({c.relation}) – {c.phone1}
            </p>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No contacts found.</p>
        )}
      </div>

      {/* Save Button */}
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
