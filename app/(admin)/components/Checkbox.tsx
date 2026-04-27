"use client";

import { Check } from "lucide-react";
import clsx from "clsx";

interface CheckboxProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: React.ReactNode;
  disabled?: boolean;
  size?: "sm" | "md";
  className?: string;
}

/**
 * Teal design-system checkbox. Unchecked renders a teal-outlined empty square;
 * checked renders a filled teal square with a white check. Used across the
 * admin redesign (permission matrix, modals, user details, etc.).
 */
export default function Checkbox({
  checked,
  onChange,
  label,
  disabled = false,
  size = "md",
  className,
}: CheckboxProps) {
  const box = size === "sm" ? "w-4 h-4" : "w-[18px] h-[18px]";
  const tick = size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5";

  return (
    <label
      className={clsx(
        "inline-flex items-center gap-2",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
        className
      )}
    >
      <span
        role="checkbox"
        aria-checked={checked}
        aria-disabled={disabled}
        onClick={(e) => {
          if (disabled) return;
          e.preventDefault();
          onChange(!checked);
        }}
        className={clsx(
          "inline-flex items-center justify-center rounded-[4px] border-2 transition-colors shrink-0",
          box,
          checked ? "bg-[#119B95] border-[#119B95] text-white" : "bg-white border-[#119B95]"
        )}
      >
        {checked && <Check className={clsx(tick, "stroke-[3]")} />}
      </span>
      {label && <span className="text-sm text-gray-800 select-none">{label}</span>}
    </label>
  );
}
