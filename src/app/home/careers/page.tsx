"use client";

import { Button } from "@/components/ui/button";

const jobs = [
  {
    title: "Frontend Engineer",
    type: "Full-Time",
    location: "Remote",
  },
  {
    title: "Customer Support Specialist",
    type: "Part-Time",
    location: "Philadelphia, PA",
  },
  {
    title: "Healthcare Data Analyst",
    type: "Full-Time",
    location: "Remote",
  },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-6">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold text-[#007AFF]">Join Our Team</h1>
        <p className="mt-4 text-gray-600 text-lg">
          Help us build the future of home care. We’re looking for passionate
          people to improve healthcare with technology.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {jobs.map((job, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex justify-between items-center"
          >
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                {job.title}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {job.type} · {job.location}
              </p>
            </div>
            <Button className="bg-[#34C759] hover:bg-green-600 text-white">
              Apply Now
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
