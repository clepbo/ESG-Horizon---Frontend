"use client";

import React, { useState } from "react";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Button } from "@/app/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/components/ui/tooltip";
import { AlertTriangle, Info, RefreshCcw } from "lucide-react";
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
  editableFactor?: boolean;
  onCustomFactorChange?: (value: number | null) => void;
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
  editableFactor = false,
  onCustomFactorChange,
}: ScopeInputProps) {
  const defaultEmissionFactor = getScopeEmissionFactor(category);

  const hasCustomFactor = customEmissionFactor !== null && customEmissionFactor !== undefined;

  const emissionFactor = React.useMemo(
    () =>
      hasCustomFactor
        ? defaultEmissionFactor
          ? { ...defaultEmissionFactor, factor: customEmissionFactor! }
          : null
        : defaultEmissionFactor,
    [hasCustomFactor, defaultEmissionFactor, customEmissionFactor]
  );

  const [isEditing, setIsEditing] = useState(false);
  const [tempFactor, setTempFactor] = useState<number | null>(null);

  const handleEditClick = () => {
    setTempFactor(
      hasCustomFactor ? customEmissionFactor! : (defaultEmissionFactor?.factor ?? null)
    );
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    if (onCustomFactorChange) onCustomFactorChange(tempFactor);
    setIsEditing(false);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setTempFactor(null);
  };

  const handleResetClick = () => {
    setTempFactor(defaultEmissionFactor?.factor ?? null);
  };

  const tCO2e = React.useMemo(() => {
    if (!emissionFactor || !emissionFactor.factor) return 0;

    return calculateTCO2eForSource({
      volume: formattedValue.rawValue,
      emissionFactor: emissionFactor.factor,
      unit: emissionFactor.unit,
    });
  }, [formattedValue.rawValue, emissionFactor]);

  const formattedTCO2e = formatTCO2eOutput(tCO2e);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    formattedValue.handleChange(e.target.value);
    if (error && onErrorClear) onErrorClear();
  };

  const shouldShowEmission =
    formattedValue.rawValue !== "" &&
    formattedValue.rawValue !== null &&
    formattedValue.rawValue !== undefined &&
    !isNaN(Number(formattedValue.rawValue)) &&
    Number(formattedValue.rawValue) >= 0 &&
    emissionFactor;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label htmlFor={`scope-${category}`}>
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}

      {/* ▶ Emission Factor Display Box */}
      {showEmissionFactor && (
        <div className="bg-teal-50 border-l-4 border-teal-500 p-3 rounded-r-lg mb-3">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-teal-600 mt-0.5 shrink-0" />
            <div className="text-xs flex-1">
              {isEditing ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-teal-900 whitespace-nowrap">
                      Emission Factor:
                    </span>
                    <div className="relative grow">
                      <Input
                        type="number"
                        step="0.0001"
                        value={tempFactor ?? ""}
                        onChange={(e) =>
                          setTempFactor(e.target.value === "" ? null : parseFloat(e.target.value))
                        }
                        className="pr-8 h-8 text-xs"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleResetClick}
                        className="absolute inset-y-0 right-0 flex items-center justify-center p-2 text-muted-foreground hover:text-primary"
                        aria-label="Reset to default factor"
                      >
                        <RefreshCcw className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <span className="text-xs text-teal-900 whitespace-nowrap">
                      kgCO₂e/{defaultEmissionFactor?.unit}
                    </span>
                  </div>
                  <div className="flex items-start text-yellow-700 bg-yellow-500/10 p-2 rounded-md border border-yellow-600">
                    <AlertTriangle className="h-4 w-4 mt-0.5 mr-2 shrink-0" />
                    <p className="text-xs">
                      Editing emission factors will change your total emissions calculations. Only
                      update with verified data to ensure accurate reporting.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveClick} className="text-xs text-white h-7 px-3">
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancelClick}
                      className="text-xs border-gray-300 h-7 px-3"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <div>
                    {emissionFactor && (
                      <p className="font-semibold text-teal-900">
                        Emission Factor: {emissionFactor.factor} kgCO₂e/{emissionFactor.unit}
                      </p>
                    )}

                    {isMarketBased && hasCustomFactor && (
                      <p className="text-teal-700 mt-1">
                        Custom emission factor applied (Market-Based)
                      </p>
                    )}

                    {!isMarketBased && hasCustomFactor && (
                      <p className="text-teal-700 mt-1">Custom emission factor applied</p>
                    )}
                  </div>

                  {editableFactor && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleEditClick}
                      className="h-auto text-primary text-xs shrink-0"
                    >
                      Edit Factor
                    </Button>
                  )}
                </div>
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
        {shouldShowEmission && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="absolute bottom-1 right-0 flex items-center pr-1.5 cursor-pointer"
                  onClick={(e) => e.preventDefault()}
                >
                  <span className="text-sm font-semibold bg-teal-100 text-teal-700 px-2 py-1 rounded-full whitespace-nowrap shadow-md border border-teal-200 hover:bg-teal-200 transition-colors">
                    {formattedTCO2e}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-white border border-teal-600 text-teal-800 shadow-lg">
                <p className="font-semibold text-center">Volume Emission</p>
                <p className="text-xs">
                  This is the tCO₂e emission calculated from the volume and emission factor.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
