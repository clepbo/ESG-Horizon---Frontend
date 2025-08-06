"use client";

import { ChevronDown } from "lucide-react";
import React from "react";

type DateRangeSelectProps = {
  value: string;
  onChange: (value: string) => void;
};

const options = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last7", label: "Last 7 days" },
  { value: "last30", label: "Last 30 days" },
];

export default function DateRangeSelect({
  value,
  onChange,
}: DateRangeSelectProps) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
        className="text-sm font-medium text-gray-800 bg-transparent border-none appearance-none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
    </div>
  );
}
