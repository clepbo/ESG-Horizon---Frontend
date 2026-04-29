"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { ChevronDown } from "lucide-react";
import { reportSubmissions } from "../_fixtures/reportSubmissions";

const RANGES = ["Last 12 month", "Last 6 month", "Last 3 month"] as const;

export default function ReportSubmissionsChart() {
  const [range, setRange] = useState<(typeof RANGES)[number]>("Last 12 month");
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 h-full">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Report Submissions</h3>
          <p className="text-xs text-gray-700">Monthly volume across all companies</p>
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 h-8 px-3 text-xs border border-gray-200 rounded-md bg-white text-gray-800 hover:bg-gray-50"
          >
            {range}
            <ChevronDown className="w-3.5 h-3.5 text-gray-600" />
          </button>
          {open && (
            <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-100 rounded-md shadow-lg py-1 z-10">
              {RANGES.map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => {
                    setRange(r);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs ${
                    r === range
                      ? "text-[#119B95] bg-[#119B95]/5 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={reportSubmissions} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: "#4b5563" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 20, 40, 60, 80, 100]}
              tick={{ fontSize: 11, fill: "#4b5563" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ stroke: "#e5e7eb", strokeWidth: 1, strokeDasharray: "3 3" }}
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                padding: "6px 10px",
              }}
              labelStyle={{ color: "#111827", fontWeight: 600, marginBottom: 2 }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 3, stroke: "#3b82f6", strokeWidth: 1.5, fill: "#fff" }}
              activeDot={{ r: 5 }}
              name="Value"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
