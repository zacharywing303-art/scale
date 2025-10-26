"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import Section from "@/components/custom/Section";

interface GeneralTabProps {
  visit: any;
}

function toDateInputValue(d?: string | Date | null) {
  if (!d) return "";
  const dt = new Date(d);
  return dt.toISOString().slice(0, 10);
}
function toTimeInputValue(d?: string | Date | null) {
  if (!d) return "";
  const dt = new Date(d);
  const h = String(dt.getHours()).padStart(2, "0");
  const m = String(dt.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}
function combineDateTime(dateStr?: string, timeStr?: string) {
  if (!dateStr || !timeStr) return null;
  return new Date(`${dateStr}T${timeStr}:00`);
}

export default function GeneralTab({ visit }: GeneralTabProps) {
  // Uneditable values
  const scheduledIn = visit?.scheduledTimeIn
    ? new Date(visit.scheduledTimeIn).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";
  const scheduledOut = visit?.scheduledTimeOut
    ? new Date(visit.scheduledTimeOut).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  const callInDate = visit?.callIn
    ? new Date(visit.callIn).toLocaleDateString()
    : "—";

  const callIn = visit?.callIn
    ? new Date(visit.callIn).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  const callOutDate = visit?.callOut
    ? new Date(visit.callOut).toLocaleDateString()
    : "—";

  const callOut = visit?.callOut
    ? new Date(visit.callOut).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  const callHours =
    visit?.callIn && visit?.callOut
      ? (
          (new Date(visit.callOut).getTime() -
            new Date(visit.callIn).getTime()) /
          (1000 * 60 * 60)
        ).toFixed(2)
      : "—";

  // Editable local state
  const [adjustedInDate, setAdjustedInDate] = useState(
    toDateInputValue(visit?.adjustedIn)
  );
  const [adjustedInTime, setAdjustedInTime] = useState(
    toTimeInputValue(visit?.adjustedIn)
  );
  const [adjustedOutDate, setAdjustedOutDate] = useState(
    toDateInputValue(visit?.adjustedOut)
  );
  const [adjustedOutTime, setAdjustedOutTime] = useState(
    toTimeInputValue(visit?.adjustedOut)
  );

  const [billHours, setBillHours] = useState(visit?.billHours ?? "");
  const [payHours, setPayHours] = useState(visit?.payHours ?? "");
  const [payer, setPayer] = useState(visit?.payer ?? "");
  const [program, setProgram] = useState(visit?.program ?? "");
  const [serviceId, setServiceId] = useState(visit?.serviceId ?? "");
  const [groupCode, setGroupCode] = useState(visit?.groupVisitCode ?? "");
  const [doNotBill, setDoNotBill] = useState(!!visit?.doNotBill);
  const [services, setServices] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [payers, setPayers] = useState<any[]>([]);

  useEffect(() => {
    async function fetchAgencyData() {
      try {
        const agencyId = visit.agencyID;
        if (!agencyId) return;

        const [svcRes, progRes, payRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/services`),
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/programs/agency/${agencyId}`
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/payers/agency/${agencyId}`
          ),
        ]);

        setServices(await svcRes.json());
        setPrograms(await progRes.json());
        setPayers(await payRes.json());
      } catch (err) {
        console.error("❌ Error loading agency data", err);
      }
    }
    fetchAgencyData();
  }, [visit.agencyID]);

  const adjustedIn = useMemo(
    () => combineDateTime(adjustedInDate, adjustedInTime),
    [adjustedInDate, adjustedInTime]
  );
  const adjustedOut = useMemo(
    () => combineDateTime(adjustedOutDate, adjustedOutTime),
    [adjustedOutDate, adjustedOutTime]
  );

  const handleSave = async () => {
    try {
      const adjustedInDateTime = adjustedIn
        ? new Date(adjustedIn)
        : visit.callIn
        ? new Date(visit.callIn)
        : null;
      const adjustedOutDateTime = adjustedOut ? new Date(adjustedOut) : null;

      // Validation: Adjusted out cannot be before adjusted in
      if (adjustedInDateTime && adjustedOutDateTime) {
        if (adjustedOutDateTime.getTime() < adjustedInDateTime.getTime()) {
          alert("❌ Adjusted Out time cannot be before Adjusted In time.");
          return;
        }

        // Validation: cannot exceed 24 hours from adjusted in
        const diffHours =
          (adjustedOutDateTime.getTime() - adjustedInDateTime.getTime()) /
          (1000 * 60 * 60);
        if (diffHours >= 24) {
          alert(
            "❌ Adjusted Out time cannot be 24 hours or more after Adjusted In or Call In."
          );
          return;
        }
      }

      const payload = {
        adjustedIn: adjustedIn ? new Date(adjustedIn).toISOString() : null,
        adjustedOut: adjustedOut ? new Date(adjustedOut).toISOString() : null,
        billHours: billHours === "" ? null : Number(billHours),
        payHours: payHours === "" ? null : Number(payHours),
        payer: payer || null,
        program: program || null,
        serviceId: serviceId || null,
        groupVisitCode: groupCode || null,
        doNotBill,
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/visits/${visit.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed to update visit");

      alert("✅ Visit updated successfully");
      // reload the page so the latest visit data is fetched and displayed
      window.location.reload();
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Error updating visit");
    }
  };

  return (
    <div className="space-y-6 p-4 overflow-auto max-h-[80vh]">
      <Section title="Uneditable Visit Info">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Label>Scheduled In Time</Label>
          <Input disabled value={scheduledIn} />
          <Label>Scheduled Out Time</Label>
          <Input disabled value={scheduledOut} />

          <Label>Call In Date</Label>
          <Input disabled value={callInDate} />
          <Label>Call In</Label>
          <Input disabled value={callIn} />

          <Label>Call Out Date</Label>
          <Input disabled value={callOutDate} />
          <Label>Call Out</Label>
          <Input disabled value={callOut} />

          <Label>Units</Label>
          <Input disabled value={visit?.units ?? "—"} />
          <Label>Call Hours</Label>
          <Input disabled value={callHours} />

          <Label>Status</Label>
          <Input disabled value={visit?.visitStatus ?? "—"} />
          <Label>Time Zone</Label>
          <Input disabled value={visit?.visitTimeZone ?? "—"} />

          <Label>Agency Name</Label>
          <Input disabled value={visit?.agency?.name ?? "—"} />

          <Label>Agency Code</Label>
          <Input disabled value={visit?.agency?.code ?? "—"} />

          <Label>Client Signature</Label>
          <Input disabled value={visit?.clientSignature ?? "None"} />

          <Label>Visit Source</Label>
          <Input disabled value={visit?.visitSource ?? "—"} />

          <Label>Schedule ID</Label>
          <Input disabled value={visit?.scheduleID ?? "—"} />
          <div className="flex items-center gap-2">
            <Checkbox
              id="approved"
              checked={visit?.approved ?? false}
              onCheckedChange={async (v) => {
                try {
                  const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/visits/${visit.id}`,
                    {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ approved: !!v }),
                    }
                  );
                  if (!res.ok)
                    throw new Error("Failed to update approval status");
                  alert(`✅ Visit ${v ? "approved" : "unapproved"}`);
                } catch (err) {
                  console.error(err);
                  alert("Error updating approval");
                }
              }}
            />
            <Label htmlFor="approved">Approved</Label>
          </div>
        </div>
      </Section>

      <Section title="Editable Visit Info">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Label>Adjusted In Date</Label>
          <Input
            type="date"
            value={adjustedInDate}
            onChange={(e) => setAdjustedInDate(e.target.value)}
          />
          <Label>Adjusted In Time</Label>
          <Input
            type="time"
            value={adjustedInTime}
            onChange={(e) => setAdjustedInTime(e.target.value)}
          />
          <Label>Adjusted Out Date</Label>
          <Input
            type="date"
            value={adjustedOutDate}
            onChange={(e) => setAdjustedOutDate(e.target.value)}
          />
          <Label>Adjusted Out Time</Label>
          <Input
            type="time"
            value={adjustedOutTime}
            onChange={(e) => setAdjustedOutTime(e.target.value)}
          />

          <Label>Bill Hours</Label>
          <Input
            type="number"
            value={billHours}
            onChange={(e) => setBillHours(e.target.value)}
          />
          <Label>Pay Hours</Label>
          <Input
            type="number"
            value={payHours}
            onChange={(e) => setPayHours(e.target.value)}
          />

          <Label>Program</Label>
          <Select value={program} onValueChange={setProgram}>
            <SelectTrigger>
              <SelectValue placeholder="Select Program" />
            </SelectTrigger>
            <SelectContent>
              {programs.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Label>Payer</Label>
          <Select value={payer} onValueChange={setPayer}>
            <SelectTrigger>
              <SelectValue placeholder="Select Payer" />
            </SelectTrigger>
            <SelectContent>
              {payers.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.payerName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Label>Service</Label>
          <Select value={serviceId} onValueChange={setServiceId}>
            <SelectTrigger>
              <SelectValue placeholder="Select Service" />
            </SelectTrigger>
            <SelectContent>
              {services.map((svc) => (
                <SelectItem key={svc.id} value={svc.id}>
                  {svc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Label>Group Visit Code</Label>
          <Input
            value={groupCode ?? ""}
            onChange={(e) => setGroupCode(e.target.value)}
          />

          <div className="flex items-center gap-2">
            <Checkbox
              id="do-not-bill"
              checked={doNotBill}
              onCheckedChange={(v) => setDoNotBill(!!v)}
            />
            <Label htmlFor="do-not-bill">Do Not Bill</Label>
          </div>
        </div>

        <Button variant="default" className="mt-4" onClick={handleSave}>
          Save Changes
        </Button>
      </Section>
    </div>
  );
}
// "use client";

// import React from "react";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Button } from "@/components/ui/button";
// import {
//   Select,
//   SelectTrigger,
//   SelectValue,
//   SelectContent,
//   SelectItem,
// } from "@/components/ui/select";
// import Section from "@/components/custom/Section";

// interface GeneralTabProps {
//   visit: any;
// }

// export default function GeneralTab({ visit }: GeneralTabProps) {
//   return (
//     <div className="space-y-6 p-4 overflow-auto max-h-[80vh]">
//       <Section title="Uneditable Visit Info">
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           <Label htmlFor="scheduled-in-time">Scheduled In Time</Label>
//           <Input id="scheduled-in-time" disabled value="8:00 AM" />
//           <Label htmlFor="scheduled-out-time">Scheduled Out Time</Label>
//           <Input id="scheduled-out-time" disabled value="10:00 AM" />

//           <Label htmlFor="scheduled-hours">Scheduled Hours</Label>
//           <Input id="scheduled-hours" disabled value="2.0" />

// <Label htmlFor="visit-from">Visit From</Label>
// <Input id="visit-from" disabled value="2025-07-21" />

//           <Label htmlFor="visit-to">Visit To</Label>
//           <Input id="visit-to" disabled value="2025-07-21" />

//           <Label htmlFor="time-zone">Time Zone</Label>
//           <Input id="time-zone" disabled value="EST" />

//           <Label htmlFor="status">Status</Label>
//           <Input id="status" disabled value="Completed" />

//           <Label htmlFor="call-in">Call In</Label>
//           <Input id="call-in" disabled value="8:05 AM" />

//           <Label htmlFor="call-out">Call Out</Label>
//           <Input id="call-out" disabled value="10:02 AM" />

//           <Label htmlFor="call-hours">Call Hours</Label>
//           <Input id="call-hours" disabled value="1.95" />

//           <Label htmlFor="units">Units</Label>
//           <Input id="units" disabled value="4" />

//           <Label htmlFor="agency-id">Agency ID</Label>
//           <Input id="agency-id" disabled value="AG1234" />

//           <Label htmlFor="agency-name">Agency Name</Label>
//           <Input id="agency-name" disabled value="CareLink Services" />

//           <Label htmlFor="client-verified-time">Client Verified Time</Label>
//           <Input id="client-verified-time" disabled value="8:05 AM" />

//           <Label htmlFor="client-verified-service">
//             Client Verified Service
//           </Label>
//           <Input id="client-verified-service" disabled value="Personal Care" />

// <Label htmlFor="client-signature">Client Signature</Label>
// <Input id="client-signature" disabled value="Signed" />

// <Label htmlFor="visit-source">Visit Source</Label>
// <Input id="visit-source" disabled value="Mobile App" />

// <Label htmlFor="schedule-id">Schedule ID</Label>
// <Input id="schedule-id" disabled value="SCH3245" />
// <div className="flex items-center gap-2">
//   <Checkbox checked disabled id="approved" />
//   <Label htmlFor="approved">Approved</Label>
// </div>
//         </div>
//       </Section>

//       <Section title="Editable Visit Info">
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           <Label htmlFor="adjusted-in-date">Adjusted In Date</Label>
//           <Input type="date" id="adjusted-in-date" />

//           <Label htmlFor="adjusted-in-time">Adjusted In Time</Label>
//           <Input type="time" id="adjusted-in-time" />

//           <Label htmlFor="adjusted-out-date">Adjusted Out Date</Label>
//           <Input type="date" id="adjusted-out-date" />

//           <Label htmlFor="adjusted-out-time">Adjusted Out Time</Label>
//           <Input type="time" id="adjusted-out-time" />

//           <Label htmlFor="bill-hours">Bill Hours</Label>
//           <Input type="number" id="bill-hours" />

//           <Label htmlFor="pay-hours">Pay Hours</Label>
//           <Input type="number" id="pay-hours" />
//           <Select>
//             <SelectTrigger>
//               <SelectValue placeholder="Select Payer" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="medicaid">Medicaid</SelectItem>
//               <SelectItem value="private">Private Insurance</SelectItem>
//             </SelectContent>
//           </Select>
//           <Select>
//             <SelectTrigger>
//               <SelectValue placeholder="Select Program" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="care1">Care Plan A</SelectItem>
//               <SelectItem value="care2">Care Plan B</SelectItem>
//             </SelectContent>
//           </Select>
//           <Select>
//             <SelectTrigger>
//               <SelectValue placeholder="Select Service" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="personal">Personal Care</SelectItem>
//               <SelectItem value="nursing">Nursing</SelectItem>
//             </SelectContent>
//           </Select>
//           <Label htmlFor="group-visit-code">Group Visit Code</Label>
//           <Input id="group-visit-code" placeholder="ABC123" />
//           <div className="flex items-center gap-2">
//             <Checkbox id="do-not-bill" />
//             <Label htmlFor="do-not-bill">Do Not Bill</Label>
//           </div>
//         </div>
//         <Button variant="outline" className="mt-4">
//           Generate Visit Code
//         </Button>
//       </Section>
//     </div>
//   );
// }
