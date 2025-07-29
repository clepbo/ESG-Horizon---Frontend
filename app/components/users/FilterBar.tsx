"use client";

import { Search, ChevronDown } from "lucide-react";

export function FilterBar() {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-4">
      <select className="border rounded px-3 py-2 text-sm w-full md:w-auto">
        <option>All Users</option>
      </select>

      <div className="flex flex-1 items-center border rounded px-3 py-2">
        <input
          placeholder="Search by name or company"
          className="flex-1 text-sm outline-none"
        />
        <button className="text-emerald-600 text-sm font-medium flex items-center gap-1">
          <Search size={16} /> Search
        </button>
      </div>

      <select className="border rounded px-3 py-2 text-sm w-full md:w-auto">
        <option>All Status</option>
      </select>

      <select className="border rounded px-3 py-2 text-sm w-full md:w-auto">
        <option>All Roles</option>
      </select>
    </div>
  );
}
