"use client";

import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { FieldError } from "react-hook-form";
import React from "react";

type CommonProps = {
  label: string;
  error?: FieldError;
  required?: boolean;
  options?: { label: string; value: string }[];
};

type InputFieldProps = CommonProps &
  React.InputHTMLAttributes<HTMLInputElement> & {
    as?: "input";
  };

type TextareaFieldProps = CommonProps &
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    as: "textarea";
  };

type SelectFieldProps = CommonProps &
  React.SelectHTMLAttributes<HTMLSelectElement> & {
    as: "select";
    options: { label: string; value: string }[];
  };

type FormFieldProps = InputFieldProps | TextareaFieldProps | SelectFieldProps;

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  required,
  as = "input",
  options,
  ...props
}) => {
  return (
    <div className="space-y-2">
      <Label>
        {label} {required && <span className="text-neutral-1000">*</span>}
      </Label>

      {as === "input" && (
        <Input
          {...(props as InputFieldProps)}
          className={`${props.className || ""} ${error ? "border-red-500" : ""}`}
        />
      )}

      {as === "textarea" && (
        <Textarea
          {...(props as TextareaFieldProps)}
          className={`${props.className || ""} ${error ? "border-red-500" : ""}`}
        />
      )}

      {as === "select" && options && (
        <select
          {...(props as SelectFieldProps)}
          className={`h-12 w-full px-4 text-sm rounded-xs border hover:shadow-sm ${
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
