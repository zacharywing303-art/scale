"use client";

import { Phone, Mail, LifeBuoy, BookOpen, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SupportPage() {
  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Customer Support</h1>
        <p className="mt-2 text-gray-600">
          How can we help you today? Choose a support option or browse our help
          topics below.
        </p>
      </div>

      {/* Support Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 border rounded-lg bg-gray-50">
          <div className="flex items-center gap-4 mb-2">
            <BookOpen className="text-primary" />
            <h2 className="text-lg font-semibold">Knowledge Base</h2>
          </div>
          <p className="text-sm text-gray-600">
            Explore step-by-step guides and FAQs for using the system.
          </p>
          <Button variant="link" className="mt-2 p-0" asChild>
            <Link href="/support/knowledge-base">Browse Help Center</Link>
          </Button>
        </div>

        <div className="p-5 border rounded-lg bg-gray-50">
          <div className="flex items-center gap-4 mb-2">
            <MessageCircle className="text-primary" />
            <h2 className="text-lg font-semibold">Live Chat</h2>
          </div>
          <p className="text-sm text-gray-600">
            Chat with a support representative in real-time during business
            hours.
          </p>
          <Button variant="link" className="mt-2 p-0" asChild>
            <Link href="/support/live-chat">Start Live Chat</Link>
          </Button>
        </div>

        <div className="p-5 border rounded-lg bg-gray-50">
          <div className="flex items-center gap-4 mb-2">
            <Mail className="text-primary" />
            <h2 className="text-lg font-semibold">Contact Form</h2>
          </div>
          <p className="text-sm text-gray-600">
            Can’t find what you’re looking for? Reach out via our support form.
          </p>
          <Button variant="link" className="mt-2 p-0" asChild>
            <Link href="/support/contact">Fill Out the Form</Link>
          </Button>
        </div>

        <div className="p-5 border rounded-lg bg-gray-50">
          <div className="flex items-center gap-4 mb-2">
            <Phone className="text-primary" />
            <h2 className="text-lg font-semibold">Call or Email Us</h2>
          </div>
          <p className="text-sm text-gray-600">
            Mon–Fri 9am to 5pm EST
            <br />
            Phone:{" "}
            <a href="tel:+18005551234" className="text-blue-600 underline">
              1-800-555-1234
            </a>
            <br />
            Email:{" "}
            <a
              href="mailto:support@yourapp.com"
              className="text-blue-600 underline"
            >
              support@yourapp.com
            </a>
          </p>
        </div>
      </div>

      {/* FAQs */}
      <div className="pt-8">
        <h2 className="text-2xl font-bold text-gray-800">
          Frequently Asked Questions
        </h2>
        <div className="mt-4 space-y-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-gray-700">
              How do I reset my password?
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              You can reset your password from the login page by clicking
              "Forgot Password." A link will be sent to your email.
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-gray-700">
              How do I submit a visit correction?
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Navigate to the Visits module, find the visit, and click “Edit
              Visit.” Make your correction and click Save.
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-gray-700">
              How do I contact my agency's administrator?
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Visit the HR → Manage User Role section to view and message agency
              administrators.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
