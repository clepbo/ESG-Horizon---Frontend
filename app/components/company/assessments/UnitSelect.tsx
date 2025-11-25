import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

export const UNIT_OPTIONS = [
  { value: "MMbbls", label: "MMbbls (Million Barrels)" },
  { value: "MMBOE", label: "MMBOE (Million barrels of all equivalent)" },
] as const;

interface UnitSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: string;
}

export function UnitSelect({
  value,
  onValueChange,
  placeholder = "Select the unit of measurement",
  className = "border-gray-300",
  error,
}: UnitSelectProps) {
  return (
    <div className="space-y-2">
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={className}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {UNIT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-red-600 text-xs">{error}</p>}
    </div>
  );
}
