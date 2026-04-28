"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

interface FilterSelectProps {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}

/**
 * Filter-bar dropdown used across admin tables. Wraps the shared shadcn
 * Select so all admin selects share one look. The first option in the list
 * is treated as the "All …" placeholder.
 */
export default function FilterSelect({ value, onChange, options }: FilterSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
