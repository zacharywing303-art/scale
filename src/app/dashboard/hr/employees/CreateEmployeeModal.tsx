"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { getLoggedInUser } from "@/lib/auth/authHelpers";

// Utility function to generate a random password of given length
function generateRandomPassword(length: number): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export default function CreateEmployeeModal() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [last5SSN, setLast5SSN] = useState("");
  const [supervisor, setSupervisor] = useState(false);
  const [position, setPosition] = useState("");
  const [nationalProviderId, setNationalProviderId] = useState("");
  const [email, setEmail] = useState("");
  const [mobileUser, setMobileUser] = useState(true);
  const [gender, setGender] = useState("");
  const [language, setLanguage] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  const handleSubmit = async () => {
    try {
      // Get agency code from logged-in user
      const agencyID = getLoggedInUser()?.agency?.code;
      if (!agencyID) throw new Error("Agency code not found");

      // Generate random password if mobile user
      let password: string | undefined;
      if (mobileUser) {
        password = generateRandomPassword(16); // example length
        console.log("Generated password for mobile employee:", password);
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/employees`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            firstName,
            lastName,
            last5SSN,
            dateOfBirth,
            gender,
            language,
            phone,
            supervisor,
            position,
            nationalProviderId,
            email,
            mobileUser,
            agencyID,
            password,
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to create employee");
      const newEmployee = await res.json();
      console.log("Employee created:", newEmployee);
      // Optionally reset form or close modal here
      setFirstName("");
      setLastName("");
      setLast5SSN("");
      setDateOfBirth("");
      setGender("");
      setLanguage("");
      setPhone("");
      setSupervisor(false);
      setPosition("");
      setNationalProviderId("");
      setEmail("");
      setMobileUser(true);
      alert("Employee created successfully");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Error creating employee");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default">Create New Employee</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Employee</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="mb-1">
              First Name <span className="text-red-500">*</span>
            </Label>
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label className="mb-1">
              Last Name <span className="text-red-500">*</span>
            </Label>
            <Input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label className="mb-1">
              Last 5 SSN <span className="text-red-500">*</span>
            </Label>
            <Input
              value={last5SSN}
              onChange={(e) => setLast5SSN(e.target.value)}
              required
            />
          </div>
          <div>
            <Label className="mb-1">
              Date of Birth <span className="text-red-500">*</span>
            </Label>
            <Input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              required
            />
          </div>

          <div>
            <Label className="mb-1">
              Gender <span className="text-red-500">*</span>
            </Label>
            <Select value={gender} onValueChange={setGender} required>
              <SelectTrigger>
                <SelectValue placeholder="Select Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1">
              Language <span className="text-red-500">*</span>
            </Label>
            <Select value={language} onValueChange={setLanguage} required>
              <SelectTrigger>
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="spanish">Spanish</SelectItem>
                <SelectItem value="german">German</SelectItem>
                <SelectItem value="french">French</SelectItem>
                <SelectItem value="mandarin">Mandarin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1">
              Phone <span className="text-red-500">*</span>
            </Label>
            <Input
              type="tel"
              value={phone}
              maxLength={14}
              onChange={(e) => {
                // Remove all non-digit characters
                let digits = e.target.value.replace(/\D/g, "");
                // Limit to 10 digits
                digits = digits.slice(0, 10);
                // Format as (XXX)XXX-XXXX
                let formatted = digits;
                if (digits.length > 0) {
                  formatted = `(${digits.slice(0, 3)}`;
                  if (digits.length >= 4) {
                    formatted += `)${digits.slice(3, 6)}`;
                  }
                  if (digits.length >= 7) {
                    formatted += `-${digits.slice(6, 10)}`;
                  }
                }
                setPhone(formatted);
              }}
              placeholder="(123) 456-7890"
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="supervisor"
              checked={supervisor}
              onCheckedChange={(checked) => setSupervisor(!!checked)}
            />
            <Label htmlFor="supervisor">Supervisor</Label>
          </div>
          <div>
            <Label className="mb-1">
              Position <span className="text-red-500">*</span>
            </Label>
            <Select
              value={position}
              onValueChange={(val) => setPosition(val)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Office">Office</SelectItem>
                <SelectItem value="Caregiver">Caregiver</SelectItem>
                <SelectItem value="Registered_Nurse">
                  Registered Nurse
                </SelectItem>
                <SelectItem value="Licensed_Practical_Nurse">
                  Licensed Practical Nurse
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1">National Provider ID </Label>
            <Input
              value={nationalProviderId}
              onChange={(e) => setNationalProviderId(e.target.value)}
            />
          </div>
          <div>
            <Label className="mb-1" htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="mobileUser"
              checked={mobileUser}
              onCheckedChange={(checked) => setMobileUser(!!checked)}
            />
            <Label htmlFor="mobileUser">Mobile User</Label>
          </div>
        </div>

        <DialogFooter className="pt-4">
          <Button type="submit" onClick={handleSubmit}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
