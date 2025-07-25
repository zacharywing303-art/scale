"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-[#007AFF] to-[#34C759] text-white py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Powering the Future of Home Care & EVV
          </h1>
          <p className="text-lg md:text-xl mb-6">
            Modern tools for agencies, caregivers, and clients — streamline your
            scheduling, billing, and compliance.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/home/features">
              <Button
                variant="outline"
                className="bg-white text-[#007AFF] hover:bg-gray-100"
              >
                Explore Features
              </Button>
            </Link>
            <Link href="/login">
              <Button className="bg-white text-[#007AFF] hover:bg-gray-100">
                Agency Login
              </Button>
            </Link>
            <Link href="/home/request-demo">
              <Button className="bg-[#34C759] text-white hover:bg-green-600">
                Request a Demo
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Highlighted Features Section */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">
            What You Can Do With Our Platform
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 text-left">
            {[
              {
                title: "EVV Compliance",
                desc: "Fully integrated with state and federal Electronic Visit Verification requirements.",
              },
              {
                title: "Smart Scheduling",
                desc: "Daily and weekly views, automated recurring shifts, office vs. home care support.",
              },
              {
                title: "Real-Time Messaging",
                desc: "Caregiver-to-office messaging to keep everyone informed instantly.",
              },
              {
                title: "Billing & Payroll",
                desc: "Automated billing and claims generation with audit tracking and adjustments.",
              },
              {
                title: "Mobile App",
                desc: "iOS & Android app with GPS tracking, offline support, visit capture, and more.",
              },
              {
                title: "Analytics & Reports",
                desc: "Generate reports for billing, EVV, compliance, client activity, and more.",
              },
            ].map(({ title, desc }) => (
              <div
                key={title}
                className="bg-white p-6 rounded shadow-md hover:shadow-lg transition"
              >
                <h3 className="text-xl font-semibold text-[#007AFF] mb-2">
                  {title}
                </h3>
                <p className="text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 px-6 bg-[#007AFF] text-white text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Agency?
          </h2>
          <p className="text-lg mb-6">
            Whether you're a growing agency or scaling across multiple regions,
            we’ve got the tools to support your success.
          </p>
          <Link href="/home/request-demo">
            <Button className="bg-white text-[#007AFF] hover:bg-gray-100">
              Request a Demo
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-gray-900 text-gray-300 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm">
            &copy; {new Date().getFullYear()} YourAgency Software. All rights
            reserved.
          </div>
          <div className="flex gap-6 text-sm">
            <Link href="/support" className="hover:text-white">
              Support
            </Link>
            <Link href="/home/careers" className="hover:text-white">
              Careers
            </Link>
            <Link href="/dashboard/login" className="hover:text-white">
              Agency Login
            </Link>
            <Link href="/home/features" className="hover:text-white">
              Features
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
