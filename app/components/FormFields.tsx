"use client";

import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { FieldError } from "react-hook-form";

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: FieldError;
  required?: boolean;
  as?: "input" | "textarea" | "select";
  options?: { label: string; value: string }[];
}

export const FormField = ({
  label,
  error,
  required,
  as = "input",
  options,
  ...props
}: FormFieldProps) => {
  return (
    <div className="space-y-2">
      <Label>
        {label} {required && <span className="text-neutral-1000">*</span>}
      </Label>

      {as === "input" && (
        <Input
          {...props}
          className={`${props.className || ""} ${
            error ? "border-red-500" : ""
          }`}
        />
      )}

      {as === "textarea" && (
        <Textarea
          {...(props as any)}
          className={`${props.className || ""} ${
            error ? "border-red-500" : ""
          }`}
        />
      )}

      {as === "select" && options && (
        <select
          {...(props as any)}
          className={`h-12 w-full px-4 text-sm rounded-md border hover:shadow-sm ${
            error ? "border-red-500" : "border-gray-300"
          }`}
        >
          <option value="">Select {label}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {error && <p className="text-sm text-red-500">{error.message}</p>}
    </div>
  );
};
