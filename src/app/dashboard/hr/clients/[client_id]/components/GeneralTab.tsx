"use client";

import React from "react";
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
import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";

// export default function GeneralTab() {
//   return (
//     <ScrollArea className="p-4 space-y-6">
//       {/* Address Selection */}
//       <div className="space-y-2">
//         <Label>Address</Label>
//         <div className="flex gap-4">
//           <Select>
//             <SelectTrigger className="w-full">
//               <SelectValue placeholder="Select Address" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="home">123 Main St</SelectItem>
//               <SelectItem value="apt">456 Apartment Rd</SelectItem>
//             </SelectContent>
//           </Select>
//           <CreateAddressModal />
//         </div>
//         <Input placeholder="Unit Type" />
//         <Input placeholder="Address Line 1" />
//         <Input placeholder="Address Line 2" />
//         <Input placeholder="Address Line 3" />
//         <Input placeholder="City" />
//         <Input placeholder="State" />
//         <Input placeholder="Zip Code" />
//       </div>

//       {/* Editable Contacts and Other Info */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <Input placeholder="Other Languages" />
//         <Input placeholder="Phone Number 2" />
//         <Input placeholder="Phone Number 3" />
//         <Input placeholder="Phone Number 4" />
//         <Input placeholder="Email 2" />
//       </div>

//       {/* Contacts */}
//       <div>
//         <Label className="block mb-2">Contacts</Label>
//         <CreateContactModal />
//         {/* Sample Contacts */}
//         <div className="space-y-3 mt-4">
//           {[
//             {
//               name: "Mary Johnson",
//               relationship: "Mother",
//               phone: "555-123-4567",
//             },
//             {
//               name: "David Lee",
//               relationship: "Brother",
//               phone: "555-987-6543",
//             },
//           ].map((contact, idx) => (
//             <div key={idx} className="border p-3 rounded-md shadow-sm bg-white">
//               <p className="font-medium">{contact.name}</p>
//               <p className="text-sm text-muted-foreground">
//                 {contact.relationship} — {contact.phone}
//               </p>
//             </div>
//           ))}
//         </div>
//       </div>
//       {/* Save Button */}
//       <SaveChangesButton />
//     </ScrollArea>
//   );
// }
export default function GeneralTab({ client }: { client: any }) {
  const [form, setForm] = useState(client);
  const [showSSN, setShowSSN] = useState(false);

  useEffect(() => {
    setForm(client || {});
  }, [client]);

  const handleChange = (key: string, value: string) =>
    setForm((prev: any) => ({ ...prev, [key]: value }));

  const saveChanges = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/clients/${client.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
  };

  return (
    <ScrollArea className="p-4 space-y-6">
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
            value={form.name.split(" ")[0] || ""}
            onChange={(e) => handleChange("name", e.target.value)}
          />
        </div>
        <div>
          <Label className="mb-1">Last Name</Label>
          <Input
            value={form.name.split(" ")[1] || ""}
            onChange={(e) =>
              handleChange(
                "name",
                `${form.name.split(" ")[0] || ""} ${e.target.value}`
              )
            }
          />
        </div>
        <div>
          <Label className="mb-1">Title</Label>
          <Input
            value={form.title || ""}
            onChange={(e) => handleChange("title", e.target.value)}
          />
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
            value={form.birthDate || ""}
            onChange={(e) => handleChange("birthDate", e.target.value)}
          />
        </div>
        <div>
          <Label className="mb-1">Primary Language</Label>
          <Select
            value={form.primaryLanguage || ""}
            onValueChange={(val) => handleChange("primaryLanguage", val)}
            required
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="Spanish">Spanish</SelectItem>
              <SelectItem value="Italian">Italian</SelectItem>
              <SelectItem value="German">German</SelectItem>
              <SelectItem value="French">French</SelectItem>
              <SelectItem value="Portuguese">Portuguese</SelectItem>
              <SelectItem value="Mandarin">Mandarin</SelectItem>
              <SelectItem value="Russian">Russian</SelectItem>
              <SelectItem value="Arabic">Arabic</SelectItem>
              <SelectItem value="Hindi">Hindi</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1">Medicaid ID</Label>
          <Input
            value={form.medicaidID || ""}
            onChange={(e) => handleChange("medicaidID", e.target.value)}
            disabled
          />
        </div>
        <div>
          <Label className="mb-1">Client ID</Label>
          <Input
            value={form.clientID || ""}
            onChange={(e) => handleChange("clientID", e.target.value)}
            disabled
          />
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
      </div>

      <CreateAddressModal
        clientId={client.id}
        onCreated={() => window.location.reload()}
      />
      <CreateContactModal
        clientId={client.id}
        onCreated={() => window.location.reload()}
      />

      {/* Existing addresses */}
      <div>
        <Label className="mb-1">Addresses</Label>
        {client?.addresses && client.addresses.length > 0 ? (
          client.addresses.map((a: any) => (
            <p key={a.id} className="text-sm">
              {a.addressLine1}, {a.city}, {a.state}
            </p>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No addresses found.</p>
        )}
      </div>

      <div>
        <Label className="mb-1">Contacts</Label>
        {client?.contacts && client.contacts.length > 0 ? (
          client.contacts.map((c: any) => (
            <p key={c.id} className="text-sm">
              {c.firstName} {c.lastName} – {c.phone1}
            </p>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No contacts found.</p>
        )}
      </div>

      <Button onClick={saveChanges}>Save Changes</Button>
    </ScrollArea>
  );
}
