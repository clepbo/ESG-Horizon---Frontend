"use client";

import { Search, Plus } from "lucide-react";
import { Input } from "@/app/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/app/components/ui/select";

interface FilterOption {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}

interface ManagementControlsProps {
  title: string;
  description: string;
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  addButtonLabel: string;
  onAdd?: () => void;
  addButtonDisabled?: boolean;
  filters?: FilterOption[];
}

export default function TableManagementControls({
  title,
  description,
  search,
  onSearchChange,
  searchPlaceholder,
  addButtonLabel,
  onAdd,
  addButtonDisabled,
  filters = [],
}: ManagementControlsProps) {
  return (
    <>
      <div className="mt-0">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <p className="text-gray-600">{description}</p>
      </div>

      <div className="mt-8 mb-1 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white rounded-lg p-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center gap-3 flex-1">
          <div className="relative flex-1">
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>

          {filters.map((filter) => (
            <Select key={filter.label} value={filter.value} onValueChange={filter.onChange}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent>
                {filter.options.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>

        <button
          onClick={addButtonDisabled ? undefined : onAdd}
          disabled={addButtonDisabled}
          className={`flex items-center gap-1 rounded-md text-white text-sm px-4 py-2 transition whitespace-nowrap ${
            addButtonDisabled
              ? "bg-gray-400 cursor-not-allowed opacity-60"
              : "bg-[var(--color-primary)] hover:bg-teal-700 cursor-pointer"
          }`}
        >
          <Plus className="w-4 h-4" />
          {addButtonLabel}
        </button>
      </div>
    </>
  );
}
