import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

export type UnitContext = "oil-gas" | "water" | "emissions" | "general";

const UNIT_OPTIONS_BY_CONTEXT: Record<UnitContext, Array<{ value: string; label: string }>> = {
  "oil-gas": [
    { value: "MMbbls", label: "MMbbls (Million Barrels)" },
    { value: "MMBOE", label: "MMBOE (Million Barrels of Oil Equivalent)" },
    { value: "barrels", label: "Barrels" },
  ],
  water: [
    { value: "m³", label: "m³ (Cubic Meters)" },
    { value: "Liters", label: "Liters" },
    { value: "Gallons", label: "Gallons" },
    { value: "MMboe", label: "MMboe" },
  ],
  emissions: [
    { value: "tCO₂e", label: "tCO₂e (Tonnes CO₂ Equivalent)" },
    { value: "kgCO₂e", label: "kgCO₂e (Kilograms CO₂ Equivalent)" },
    { value: "MtCO₂e", label: "MtCO₂e (Megatonnes CO₂ Equivalent)" },
  ],
  general: [
    { value: "units", label: "Units" },
    { value: "percentage", label: "Percentage" },
    { value: "%", label: "%" },
  ],
};

// Legacy export for backward compatibility
export const UNIT_OPTIONS = UNIT_OPTIONS_BY_CONTEXT["oil-gas"];

interface UnitSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: string;
  context?: UnitContext;
  disabled?: boolean;
}

export function UnitSelect({
  value,
  onValueChange,
  placeholder = "Select the unit of measurement",
  className = "border-gray-300",
  error,
  context = "oil-gas",
  disabled = false,
}: UnitSelectProps) {
  const options = UNIT_OPTIONS_BY_CONTEXT[context];

  return (
    <div className="space-y-2">
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className={error ? "border-red-500" : className}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
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
