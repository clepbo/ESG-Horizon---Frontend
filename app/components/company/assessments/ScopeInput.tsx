"use client";

import React from "react";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/components/ui/tooltip";
import { Info } from "lucide-react";
import { calculateTCO2eForSource, formatTCO2eOutput } from "@/lib/utils";
import { getScopeEmissionFactor, SCOPE_EMISSION_FACTORS } from "@/lib/scopeEmissionFactor";

interface ScopeInputProps {
  category: keyof typeof SCOPE_EMISSION_FACTORS;
  formattedValue: {
    rawValue: string;
    displayValue: string;
    handleChange: (value: string) => void;
    setRawValue: (value: string) => void;
  };
  label: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  showEmissionFactor?: boolean;
  className?: string;
  onErrorClear?: () => void;
  customEmissionFactor?: number | null;
  isMarketBased?: boolean;
}

export function ScopeInput({
  category,
  formattedValue,
  label,
  placeholder,
  required = false,
  error,
  showEmissionFactor = true,
  className = "",
  onErrorClear,
  customEmissionFactor,
  isMarketBased = false,
}: ScopeInputProps) {
  const defaultEmissionFactor = getScopeEmissionFactor(category);

  // ✅ Market-Based MUST NOT use default factor
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const emissionFactor = isMarketBased
    ? customEmissionFactor !== null && customEmissionFactor !== undefined
      ? { ...defaultEmissionFactor!, factor: customEmissionFactor } // Use custom factor
      : null // Force user to enter a factor
    : defaultEmissionFactor; // Location-Based uses default

  // 🚧 Stop calculation if factor is missing
  const tCO2e = React.useMemo(() => {
    if (!emissionFactor || !emissionFactor.factor) return 0;

    return calculateTCO2eForSource({
      volume: formattedValue.rawValue,
      emissionFactor: emissionFactor.factor,
    });
  }, [formattedValue.rawValue, emissionFactor]);

  const formattedTCO2e = formatTCO2eOutput(tCO2e);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    formattedValue.handleChange(e.target.value);
    if (error && onErrorClear) onErrorClear();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={`scope-${category}`}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>

      {/* ▶ Emission Factor Display Box */}
      {showEmissionFactor && (
        <div className="bg-teal-50 border-l-4 border-teal-500 p-3 rounded-r-lg mb-3">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-teal-600 mt-0.5 shrink-0" />
            <div className="text-xs">
              {emissionFactor && (
                <p className="font-semibold text-teal-900">
                  Emission Factor: {emissionFactor.factor} kgCO₂e/{emissionFactor.unit}
                </p>
              )}

              {/* 🚨 Market-Based: No custom EF entered */}
              {isMarketBased && !customEmissionFactor && (
                <p className="text-red-600 font-medium mt-1">
                  Enter emission factor for Market-Based method.
                </p>
              )}

              {isMarketBased && customEmissionFactor && (
                <p className="text-teal-700 mt-1">Custom emission factor applied (Market-Based)</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ▶ Input Field */}
      <div className="relative pb-5">
        <Input
          id={`scope-${category}`}
          type="text"
          placeholder={placeholder || `Enter ${emissionFactor?.unit || "amount"}`}
          value={formattedValue.displayValue}
          onChange={handleChange}
          className={`w-full ${error ? "border-red-500" : "border-gray-400"}`}
        />

        {/* ▶ tCO2e Badge */}
        {tCO2e > 0 && emissionFactor && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="absolute bottom-0 right-0 flex items-center pr-1.5 cursor-pointer transform translate-y-3"
                  onClick={(e) => e.preventDefault()}
                  style={{ zIndex: 20 }}
                >
                  <span className="text-sm font-semibold bg-teal-100 text-teal-700 px-2 py-1 rounded-full whitespace-nowrap shadow-md border border-teal-200 hover:bg-teal-200 transition-colors">
                    {formattedTCO2e}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-white border border-teal-600 text-teal-800 shadow-lg">
                This is the tCO₂e emission calculated from the volume and emission factor.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
