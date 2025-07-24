"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import Section from "@/components/custom/Section";

const claimHistory = [
  {
    claimId: "CLM001",
    status: "Submitted",
    amount: "$250.00",
    date: "2024-11-02",
    payer: "Medicaid",
  },
  {
    claimId: "CLM002",
    status: "Pending",
    amount: "$180.00",
    date: "2024-11-10",
    payer: "Private Insurance",
  },
];

interface ClaimsTabProps {
  visit: any;
}

export default function ClaimsTab({ visit }: ClaimsTabProps) {
  return (
    <div className="p-4 space-y-6">
      <Section title="Claim History">
        <div className="grid grid-cols-5 font-semibold text-sm border-b pb-2">
          <div>Claim ID</div>
          <div>Status</div>
          <div>Amount</div>
          <div>Date</div>
          <div>Payer</div>
        </div>

        {claimHistory.map((claim, index) => (
          <div key={index} className="grid grid-cols-5 text-sm py-2 border-b">
            <div>{claim.claimId}</div>
            <div>{claim.status}</div>
            <div>{claim.amount}</div>
            <div>{claim.date}</div>
            <div>{claim.payer}</div>
          </div>
        ))}
      </Section>
    </div>
  );
}
