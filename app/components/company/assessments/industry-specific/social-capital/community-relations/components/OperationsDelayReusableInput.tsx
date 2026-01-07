import CustomTooltip from "@/app/(company)/kpis/create/components/CustomTooltip";
import { TooltipMessage } from "@/app/(company)/kpis/create/components/TooltipMessage";
import { Input } from "@/app/components/ui/input";
import React, { useState, useEffect } from "react";

interface Props {
  title: string;
  tipTitle?: string;
  tipMessage?: string;
  count: number;
  countPlaceholder: string;
  setCount: (value: number) => void;
  unit?: string;
  unitPlaceholder?: string;
  setUnit?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  showError?: boolean;
  onValidationError?: (hasError: boolean) => void;
}

export default function OperationsDelayReusableInput({
  title,
  tipTitle,
  tipMessage,
  count,
  countPlaceholder,
  unit,
  unitPlaceholder,
  setUnit,
  setCount,
  disabled = false,
  required = false,
  error,
  showError = false,
}: Props) {
  const [isTouched, setIsTouched] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [displayValue, setDisplayValue] = useState<string>("");
  const [shouldDisplayError, setShouldDisplayError] = useState(false);

  // ✅ CRITICAL FIX: useEffect to monitor showError and error changes
  useEffect(() => {
    if (showError) {
      // When parent forces show, display error if it exists
      setShouldDisplayError(!!error);
    } else {
      // Otherwise, only show if field was touched
      setShouldDisplayError(isTouched && !!error);
    }
  }, [showError, error, isTouched]);

  // Format number with thousands separators
  const formatNumber = (num: number): string => {
    if (num === 0) return "";
    return num.toLocaleString("en-US", {
      maximumFractionDigits: 2,
    });
  };

  // Parse formatted string back to number
  const parseFormattedNumber = (formatted: string): number => {
    const clean = formatted.replace(/[^\d.]/g, "");
    return clean === "" ? 0 : parseFloat(clean);
  };

  // Initialize display value (only when not focused to preserve user input)
  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(formatNumber(count));
    }
  }, [count, isFocused]);

  const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsTouched(true);
    const value = e.target.value;

    // Allow only numbers, commas, and decimal point
    const isValidInput = /^[\d,.]*$/.test(value);
    if (!isValidInput) return;

    // Update display value immediately to preserve user input
    setDisplayValue(value);

    // Parse the raw number (remove commas)
    const rawNumber = parseFormattedNumber(value);

    // Update parent with raw number
    setCount(rawNumber);
  };

  const handleUnitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUnit?.(e.target.value);
  };

  const handleBlur = () => {
    setIsTouched(true);
    setIsFocused(false);
    setDisplayValue(formatNumber(count));
  };

  const handleFocus = () => {
    setIsTouched(true);
    setIsFocused(true);
    if (count !== 0) {
      setDisplayValue(count.toString());
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1">
        <label className="text-sm font-medium">
          {title}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {tipTitle && tipMessage && (
          <CustomTooltip detail={<TooltipMessage title={tipTitle} message={tipMessage} />} />
        )}
      </div>

      <div
        className={`grid grid-cols-3 bg-gray-100 rounded-md p-3 gap-3 border ${shouldDisplayError ? "border-red-300" : "border-gray-200"} focus-within:border-blue-500 focus-within:bg-blue-50 transition-colors`}
      >
        <Input
          className="col-span-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          type="text"
          value={displayValue}
          onChange={handleCountChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={countPlaceholder}
          disabled={disabled}
          inputMode="decimal"
        />
        <Input
          className="col-span-1"
          value={unit || ""}
          placeholder={unitPlaceholder}
          onChange={handleUnitChange}
          onFocus={() => setIsTouched(true)}
          disabled={disabled || !setUnit}
        />
      </div>

      {/* ✅ Show error based on state */}
      {shouldDisplayError && error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
