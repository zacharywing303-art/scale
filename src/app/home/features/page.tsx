"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function FeaturesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-[#007AFF] text-white py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Explore Our Features</h1>
          <p className="text-lg">
            Everything your agency needs to run efficiently — in one powerful,
            EVV-compliant platform.
          </p>
        </div>
      </header>

      {/* Features Grid */}
      <section className="bg-gray-50 py-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {[
            {
              title: "EVV Compliance",
              desc: "Meet all state and federal EVV requirements with real-time visit tracking, GPS, and call validation.",
            },
            {
              title: "Smart Scheduling",
              desc: "Create, edit, and manage office shifts and home care visits with recurring patterns and visibility filters.",
            },
            {
              title: "Visit Management",
              desc: "Track visit details, exceptions, and verifications. Adjust hours, add notes, and audit in real time.",
            },
            {
              title: "Billing & Claims",
              desc: "Automatically generate clean claims, track rejections, and handle manual billing with payer-specific rules.",
            },
            {
              title: "Payroll Integration",
              desc: "Export visit data for accurate payroll, track mileage, hours worked, and paid/unpaid status by employee.",
            },
            {
              title: "Client Management",
              desc: "Manage client profiles, authorizations, Medicaid IDs, service plans, contacts, and schedules.",
            },
            {
              title: "Employee Management",
              desc: "Track certifications, background checks, roles, schedule preferences, HR alerts, and more.",
            },
            {
              title: "Reporting & Analytics",
              desc: "Generate advanced reports by role, region, service type, and more. Save and export detailed insights.",
            },
            {
              title: "Mobile App",
              desc: "iOS and Android caregiver app with offline visit capture, task checklists, messaging, and clock in/out.",
            },
            {
              title: "Secure Messaging",
              desc: "Communicate in real time with caregivers and supervisors, track unread messages and history.",
            },
            {
              title: "User Roles & Access",
              desc: "Custom roles for Admins, Managers, Supervisors, and Field Staff — each with tailored permissions.",
            },
            {
              title: "Support & Training",
              desc: "In-app help center, onboarding guides, and access to live customer support and ticket system.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition"
            >
              <h3 className="text-xl font-semibold text-[#007AFF] mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-16 px-6 border-t">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Experience It In Action</h2>
          <p className="text-gray-600 mb-6">
            Ready to see how it works? Request a live demo and let us walk you
            through the full platform.
          </p>
          <Link href="/request-demo">
            <Button className="bg-[#34C759] hover:bg-green-600 text-white">
              Request a Demo
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
