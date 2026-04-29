"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import Checkbox from "../../components/Checkbox";

const GROUP_OPTIONS = [
  "User Management",
  "Data & Reports",
  "Company Mgmt",
  "Platform Config",
  "Assessment Mgmt",
  "Audit",
];

const ROLE_OPTIONS = [
  "Platform Super Administrator",
  "Platform Sub Administrator",
  "Platform Data Officer",
  "Platform Viewer",
];

interface CreatePermissionModalProps {
  open: boolean;
  mode: "create" | "edit";
  onClose: () => void;
  onSubmit?: (payload: PermissionPayload) => void;
}

export interface PermissionPayload {
  key: string;
  label: string;
  group: string;
  roles: string[];
}

const EMPTY: PermissionPayload = { key: "", label: "", group: "", roles: [] };

export default function CreatePermissionModal({
  open,
  mode,
  onClose,
  onSubmit,
}: CreatePermissionModalProps) {
  const [form, setForm] = useState<PermissionPayload>(EMPTY);
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    if (!open) {
      setForm(EMPTY);
      setAttempted(false);
      return;
    }
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const errors = {
    key: !form.key.trim(),
    label: !form.label.trim(),
    group: !form.group,
    roles: form.roles.length === 0,
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const handleSubmit = () => {
    setAttempted(true);
    if (hasErrors) return;
    onSubmit?.(form);
    onClose();
  };

  const toggleRole = (r: string) => {
    setForm((f) => ({
      ...f,
      roles: f.roles.includes(r) ? f.roles.filter((x) => x !== r) : [...f.roles, r],
    }));
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md mt-20 mb-6 bg-white rounded-xl shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {mode === "edit" ? "Edit Permission" : "Create Permission"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <Field
            label="Permission Key"
            required
            error={attempted && errors.key ? "Required" : null}
          >
            <input
              value={form.key}
              onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))}
              placeholder="e.g. approve_reports"
              className={inputClass(attempted && errors.key)}
            />
          </Field>

          <Field
            label="Display Label"
            required
            error={attempted && errors.label ? "Required" : null}
          >
            <input
              value={form.label}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              placeholder="e.g. Approve Reports"
              className={inputClass(attempted && errors.label)}
            />
          </Field>

          <Field label="Group" required error={attempted && errors.group ? "Select a group" : null}>
            <Select value={form.group} onValueChange={(v) => setForm((f) => ({ ...f, group: v }))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select group" />
              </SelectTrigger>
              <SelectContent className="z-[70]">
                {GROUP_OPTIONS.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <div>
            <label className="block text-sm text-gray-800 mb-1.5">
              Assign to Roles <span className="text-red-500">*</span>
            </label>
            <ul className="space-y-2">
              {ROLE_OPTIONS.map((r) => (
                <li key={r}>
                  <Checkbox
                    checked={form.roles.includes(r)}
                    onChange={() => toggleRole(r)}
                    label={r}
                  />
                </li>
              ))}
            </ul>
            {attempted && errors.roles && (
              <p className="text-xs text-red-600 mt-1">Select at least one role</p>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-5 rounded-lg border border-gray-200 text-sm text-gray-800 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="h-10 px-5 rounded-lg bg-[#119B95] hover:bg-[#0f877f] text-white text-sm font-medium"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error: string | null;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm text-gray-800 mb-1.5">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

function inputClass(invalid?: boolean) {
  return `w-full h-10 px-3 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#119B95]/20 text-gray-900 ${
    invalid ? "border-red-400" : "border-gray-200 focus:border-[#119B95]/40"
  }`;
}
