"use client";

import { ChevronDown } from "lucide-react";

export default function SelectFilter({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
}) {
  return (
    <div className="relative w-fit">
      <select
        value={value}
        onChange={onChange}
        className="appearance-none rounded-md border border-gray-300 bg-white px-3 pr-10 py-2 text-sm cursor-pointer text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-green-500)]"
      >
        {options.map((opt) => (
          <option key={opt}>{opt}</option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 text-gray-500 -translate-y-1/2"
        aria-hidden="true"
      />
    </div>
  );
}
