"use client";

import { useFormattedNumber } from "@/hooks/useNumberFormater";
import { useCallback, useEffect, useState } from "react";

interface SmartInputProps {
  label?: string;
  type?: "text" | "number";
  value?: string | number;
  onChange?: (value: string) => void;
  unit?: string;
  required?: boolean;
  errorTrigger?: boolean; // parent toggles this to show error
  errorMessage?: string;
  placeholder?: string;
  onErrorStateChange?: (hasError: boolean) => void; // NEW: notify parent when error state changes
}

export default function SmartInput({
  label,
  type = "text",
  value = "",
  onChange,
  unit,
  required = false,
  errorTrigger = false,
  placeholder = "Enter value",
  errorMessage = "This field is required",
  onErrorStateChange, // NEW prop
}: SmartInputProps) {
  const { rawValue, displayValue, handleChange, setRawValue } = useFormattedNumber(value);

  const [internalError, setInternalError] = useState(false);
  const [_hasValue, setHasValue] = useState(!!value);
  const [touched, setTouched] = useState(false); // Track if user has interacted

  // FIX: Check if field has valid value - accept 0 as valid
  const validateField = useCallback(() => {
    if (!required) return true;

    const val = type === "number" ? rawValue : String(value);

    // FIX: For numbers, check if it's a valid number >= 0
    if (type === "number") {
      return (
        val !== "" && val !== null && val !== undefined && !isNaN(Number(val)) && Number(val) >= 0
      );
    }

    // For text, just check if not empty
    return val.trim().length > 0;
  }, [required, type, rawValue, value]);

  // Update error state based on validation
  useEffect(() => {
    if (errorTrigger) {
      // Only show error if this field is invalid
      const isValid = validateField();
      setInternalError(!isValid);

      if (onErrorStateChange) {
        onErrorStateChange(!isValid);
      }
    } else {
      setInternalError(false);
    }
  }, [errorTrigger, validateField, onErrorStateChange]);

  // Auto-clear error when user starts typing
  useEffect(() => {
    if (internalError && touched && validateField()) {
      setInternalError(false);
      if (onErrorStateChange) {
        onErrorStateChange(false);
      }
    }
  }, [value, rawValue, touched, onErrorStateChange, internalError, validateField]);

  const onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    // Mark as touched when user starts typing
    if (!touched) {
      setTouched(true);
    }

    if (type === "number") {
      handleChange(input);
      onChange?.(input.replace(/,/g, "")); // raw number
    } else {
      onChange?.(input); // normal text
    }

    // FIX: Auto-clear error as user types (if field becomes valid)
    const newValue = type === "number" ? input.replace(/,/g, "") : input;

    // FIX: For numbers, check if valid (including 0)
    const isValidValue =
      type === "number"
        ? newValue !== "" && !isNaN(Number(newValue)) && Number(newValue) >= 0
        : newValue.trim().length > 0;

    setHasValue(isValidValue);

    if (internalError && isValidValue) {
      setInternalError(false);
      if (onErrorStateChange) {
        onErrorStateChange(false);
      }
    }
  };

  // Handle blur - validate when user leaves field
  const onBlur = () => {
    if (required) {
      const isValid = validateField();
      setInternalError(!isValid);
      if (onErrorStateChange) {
        onErrorStateChange(!isValid);
      }
    }
  };

  // Keep internal value synced if user passes "value" prop
  useEffect(() => {
    if (type === "number") {
      setRawValue(String(value || ""));
    }

    // FIX: For numbers, check if valid (including 0)
    const isValidValue =
      type === "number"
        ? value !== "" &&
          value !== null &&
          value !== undefined &&
          !isNaN(Number(value)) &&
          Number(value) >= 0
        : !!value;

    setHasValue(isValidValue);
  }, [value, setRawValue, type]);

  return (
    <div className="w-full space-y-1">
      {label && (
        <label className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        <input
          type="text"
          value={type === "number" ? displayValue : value}
          onChange={onInput}
          onBlur={onBlur}
          className={`w-full border rounded-md px-3 py-2 pr-12 outline-none transition-colors
            ${
              internalError
                ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                : "border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
            }`}
          placeholder={placeholder}
        />

        {unit && (
          <span
            className={`absolute right-3 text-sm ${internalError ? "text-red-500" : "text-gray-600"}`}
          >
            {unit}
          </span>
        )}
      </div>

      {internalError && <p className="text-red-500 text-xs animate-fade">{errorMessage}</p>}
    </div>
  );
}
