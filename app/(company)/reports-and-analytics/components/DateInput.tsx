import React, { forwardRef } from "react";
import { Calendar } from "lucide-react"; // or any icon you use

export const CustomDateInput = forwardRef<HTMLInputElement, any>(
  ({ value, onClick, placeholder }, ref) => {
    return (
      <button
        onClick={onClick}
        ref={ref as any}
        className="w-full flex items-center gap-2 border rounded border-gray-300 px-3 py-2 text-left text-gray-500"
      >
        <Calendar className="w-4 h-4 text-gray-500" />

        <span className={value ? "text-gray-900" : "text-gray-500"}>{value || placeholder}</span>
      </button>
    );
  }
);
CustomDateInput.displayName = "CustomDateInput";
