import CustomTooltip from "@/app/(company)/ranking/create/components/CustomTooltip";
import { TooltipMessage } from "@/app/(company)/ranking/create/components/TooltipMessage";
import { Input } from "@/app/components/ui/input";
import React from "react";

interface Props {
  title: string;
  tipTitle: string;
  tipMessage: string;
  count: number;
  countPlaceholder: string;
  setCount: (value: number) => void;
  unit?: string;
  unitPlaceholder?: string;
  setUnit?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  countLabel?: string;
  unitLabel?: string;
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
  countLabel = "Count",
  unitLabel = "Unit",
}: Props) {
  const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty or numeric values only
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      const numValue = value === "" ? 0 : parseFloat(value);
      setCount(numValue);
    }
  };

  const handleUnitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUnit?.(e.target.value);
  };

  return (
    <div className="space-y-3">
      {/* Title Section */}
      <div className="flex items-center gap-1 mb-1">
        <label className="text-sm font-medium text-gray-900">
          {title}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {tipTitle && tipMessage && (
          <CustomTooltip detail={<TooltipMessage title={tipTitle} message={tipMessage} />} />
        )}
      </div>

      {/* Input Section */}
      <div
        className={`bg-gray-50 rounded-lg p-4 border transition-colors ${
          error
            ? "border-red-300 bg-red-50/50"
            : "border-gray-200 focus-within:border-blue-500 focus-within:bg-blue-50/50"
        }`}
      >
        <div className="grid grid-cols-3 gap-4">
          {/* Count Input */}
          <div className="flex flex-col col-span-2 space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {countLabel}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Input
              className={`[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                error ? "border-red-300 focus:border-red-500" : ""
              }`}
              type="number"
              value={count === 0 ? "" : count}
              onChange={handleCountChange}
              placeholder={countPlaceholder}
              disabled={disabled}
              min="0"
              step="0.1"
            />
          </div>

          {/* Unit Input */}
          <div className="flex flex-col col-span-1 space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {unitLabel}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Input
              className={error ? "border-red-300 focus:border-red-500" : ""}
              value={unit || ""}
              placeholder={unitPlaceholder}
              onChange={handleUnitChange}
              disabled={disabled}
            />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-2">
          <p className="text-red-500 text-xs flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        </div>
      )}
    </div>
  );
}
