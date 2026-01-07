import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/app/components/ui/tooltip";
import { Info } from "lucide-react";
import React, { useState, useEffect } from "react";
import { UnitSelect, UnitContext } from "../../../../UnitSelect";

interface ReusableInputProps {
  label: string;
  tooltipTitle: string;
  tooltipBody: string;
  /** controlled value as string (do not force numeric coercion while typing) */
  inputValue: string;
  unitValue: string;
  /**
   * onInputChange now returns raw string typed by the user. Parent can parse to number when needed.
   * This avoids truncation/rounding while the user is still typing and prevents accidental limits.
   */
  onInputChange: (value: string) => void;
  onUnitChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  unitError?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  formatNumbers?: boolean; // when true, format on blur with commas
  customUnit?: string; // NEW: if provided, display as read-only text instead of UnitSelect
  context?: UnitContext; // NEW: context for unit dropdown
}

export default function ReusableInput({
  label,
  tooltipBody,
  tooltipTitle,
  inputValue,
  unitValue,
  onInputChange,
  onUnitChange,
  placeholder = "Enter volume",
  error,
  unitError,
  required = false,
  disabled = false,
  className = "",
  formatNumbers = false,
  customUnit, // NEW: optional custom unit
  context = "water", // Default to water context
}: ReusableInputProps) {
  const [displayValue, setDisplayValue] = useState<string>(inputValue ?? "");

  // Format number with commas for display (only on blur)
  const formatNumber = (raw: string) => {
    if (!raw) return "";
    // remove all non numeric except dot
    const clean = raw.replace(/[^\d.]/g, "");
    if (clean === "") return "";
    // parseFloat -> if NaN, return raw
    const n = parseFloat(clean);
    if (Number.isNaN(n)) return raw;
    return n.toLocaleString("en-US");
  };

  useEffect(() => {
    // keep local state in sync with parent controlled value
    setDisplayValue(inputValue ?? "");
  }, [inputValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;

    // Allow digits, commas, and period; but do not coerce to number here.
    const isValid = /^[\d,.]*$/.test(val);
    if (!isValid) return; // ignore invalid characters

    // update local UI immediately
    setDisplayValue(val);

    // pass raw string back to parent so it can store/parse as needed
    onInputChange(val);
  };

  const handleBlur = () => {
    if (formatNumbers && displayValue.trim() !== "") {
      const formatted = formatNumber(displayValue);
      setDisplayValue(formatted);
    }
    // Optionally, normalize value sent to parent on blur as plain digits (no commas)
    const normalized = displayValue.replace(/,/g, "");
    onInputChange(normalized);
  };

  const handleFocus = () => {
    // when focused, show raw digits without commas so user can edit
    if (formatNumbers && displayValue.includes(",")) {
      setDisplayValue(displayValue.replace(/,/g, ""));
    }
  };

  const handleUnitChange = (value: string) => {
    onUnitChange(value);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2">
        <Label className="text-base font-semibold text-gray-900">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center cursor-pointer hover:border-gray-600 transition-colors"
              aria-label={`Information about ${label}`}
            >
              <Info className="h-4 w-4 text-muted-foreground" />
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            align="center"
            className="max-w-xs bg-gray-800 text-white p-3 rounded-lg shadow-xl border-none"
          >
            <h6 className="font-semibold mb-1">{tooltipTitle}</h6>
            <p className="text-sm">{tooltipBody}</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-6 rounded-lg border border-gray-200 transition-colors"
      >
        {/* Volume Input */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Volume
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>

          <Input
            type="text"
            inputMode="decimal"
            value={displayValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder={placeholder}
            className={`${error ? "border-red-300 focus:border-red-500" : "border-gray-300"}`}
            disabled={disabled}
          // no maxLength here so users can type as many digits as they want
          />

          {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
        </div>

        {/* Unit Select - Conditional rendering */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Unit
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>

          {customUnit ? (
            // Custom unit - read-only display
            <div className="h-10 px-3 py-2 bg-gray-100 border border-gray-300 rounded-md flex items-center text-gray-700">
              {customUnit}
            </div>
          ) : (
            // Default UnitSelect component with context
            <UnitSelect
              value={unitValue}
              onValueChange={handleUnitChange}
              error={unitError}
              context={context}
            />
          )}
        </div>
      </div>
    </div>
  );
}
