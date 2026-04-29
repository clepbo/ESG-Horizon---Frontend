"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

interface RowsPerPageSelectProps {
  value: number;
  onChange: (n: number) => void;
  options?: number[];
}

const DEFAULTS = [5, 10, 25];

/**
 * Compact "rows per page" select shared by every admin table footer.
 * Wraps the shared shadcn Select with a small trigger so the control feels
 * inline next to the "Rows per page" label.
 */
export default function RowsPerPageSelect({
  value,
  onChange,
  options = DEFAULTS,
}: RowsPerPageSelectProps) {
  return (
    <Select value={String(value)} onValueChange={(v) => onChange(Number(v))}>
      <SelectTrigger className="h-8 w-[72px] text-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((n) => (
          <SelectItem key={n} value={String(n)}>
            {n}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
