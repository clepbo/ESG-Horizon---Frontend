"use client";
// import { ChevronDown } from "lucide-react";
import { useState } from "react";
import DateRangeSelect from "../ui/DateRangeSelect";

const activities = [
  {
    time: "3:35pm",
    title: "New Persona Submitted",
    description:
      'ESG Company "GreenFlow Inc." submitted a new persona for approval.',
  },
  {
    time: "2:15pm",
    title: "Access Suspended",
    description: 'Persona "Ngozi Okoro" (Investor) was suspended by Admin.',
  },
  {
    time: "2:01pm",
    title: "Data Locked",
    description:
      "Regulator data for Q2 2025 was reviewed and locked by Supervisor.",
  },
  {
    time: "12:00pm",
    title: "Persona Approved",
    description:
      'Persona "Michael Adeniran" from EcoBank was approved and granted access.',
  },
  {
    time: "10:50am",
    title: "Organization Added",
    description: "",
  },
];

export function RecentActivities() {
  const [selectedRange, setSelectedRange] = useState("today");
  return (
    <section className="w-full">
      {/* Title outside card */}
      <h3 className="text-xl font-bold text-gray-800 mb-2">
        Recent Activities
      </h3>

      <div className="rounded-xl border border-gray-200 bg-white px-6 py-4 shadow-sm">
        <div className="relative">
          {/* Vertical line connecting all dots */}
          <div className="absolute top-0 left-[5.5rem] h-full w-px bg-gray-300" />

          {/* Today header inside timeline, aligned with dot */}
          <div className="flex items-center gap-2 mb-4 relative ml-[5.25rem] z-10">
            <div className="h-2 w-2 rounded-full bg-yellow-500" />
            <DateRangeSelect
              value={selectedRange}
              onChange={setSelectedRange}
            />
          </div>

          {/* Activity timeline */}
          <div className="space-y-6">
            {activities.map((activity, index) => (
              <div key={index} className="flex items-start gap-4 relative">
                {/* Time */}
                <div className="w-16 text-right text-xs text-gray-800 pt-1">
                  {activity.time}
                </div>

                {/* Dot only (line is behind) */}
                <div className="w-4 flex justify-center relative z-10 pt-1">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      index === 0 ? "bg-yellow-500" : "bg-gray-300"
                    }`}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 space-y-0.5">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.title}
                  </p>
                  {activity.description && (
                    <p className="text-xs text-gray-600">
                      {activity.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
