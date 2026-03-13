"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { recentActivities } from "@/lib/mockData/recentActivities";

export function RecentActivities() {
  const [selectedRange, setSelectedRange] = useState("today");

  return (
    <section className="w-full">
      <h3>Recent Activities</h3>
      <div className="rounded-xl border border-gray-200 bg-white px-6 py-4 shadow-sm">
        <div className="relative">
          {/* Vertical line connecting dots */}
          <div className="absolute top-0 left-22 h-full w-px bg-gray-300" />

          {/* Header row with select */}
          <div className="flex items-center gap-2 mb-4 relative ml-[5.25rem] z-10">
            <div className="h-2 w-2 rounded-full bg-yellow-500" />
            <Select value={selectedRange} onValueChange={setSelectedRange}>
              <SelectTrigger className="w-[140px] text-xs">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Activity timeline */}
          <div className="space-y-6">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start gap-4 relative">
                {/* Time */}
                <div className="w-16 text-right text-xs text-gray-800 pt-1">{activity.time}</div>

                {/* Dot */}
                <div className="w-4 flex justify-center relative z-10 pt-1">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      index === 0 ? "bg-yellow-500" : "bg-gray-300"
                    }`}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 space-y-0.5">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  {activity.description && (
                    <p className="text-xs text-gray-600">{activity.description}</p>
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
