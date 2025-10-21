"use client";

import { Search } from "lucide-react";

export default function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative w-full max-w-3xl">
      <input
        id="search-input"
        name="search"
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder || "Search by name or company..."}
        className="w-full rounded-md border border-gray-300 pl-5 pr-20 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <button className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1 rounded-md bg-[var(--color-primary)]  hover:bg-teal-600 px-3 py-1.5 text-xs text-white hover:bg-opacity-90 cursor-pointer">
        <Search className="h-3.5 w-3.5" />
        <span className="hidden md:inline">Search</span>
      </button>
    </div>
  );
}
