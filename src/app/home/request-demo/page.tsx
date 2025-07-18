"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function RequestDemoPage() {
  const [form, setForm] = useState({
    agencyName: "",
    contactName: "",
    email: "",
    phone: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would send form data to your backend or API route
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white p-8 shadow-lg rounded-lg">
        <h1 className="text-3xl font-bold text-[#007AFF] mb-6 text-center">
          Request a Demo
        </h1>
        {submitted ? (
          <div className="text-center text-green-600 font-medium">
            Thank you! We’ll be in touch shortly.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="agencyName">Agency Name</Label>
              <Input
                id="agencyName"
                name="agencyName"
                value={form.agencyName}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="contactName">Contact Name</Label>
              <Input
                id="contactName"
                name="contactName"
                value={form.contactName}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="message">Additional Details (optional)</Label>
              <Textarea
                id="message"
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={4}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-[#34C759] hover:bg-green-600 text-white"
            >
              Submit Request
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
