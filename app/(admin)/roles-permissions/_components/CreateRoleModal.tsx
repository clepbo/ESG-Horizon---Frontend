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

const STATUS_OPTIONS = ["Draft", "Active"];
const INHERIT_OPTIONS = ["None (Scratch)", "Super Admin", "Sub Admin", "Data Officer", "Viewer"];
const ROLE_PERMISSIONS = [
  "User Management",
  "Data & Reports (view)",
  "Data & Reports (submit)",
  "Platform Config",
  "Company Management",
  "Assessment Management",
];

interface CreateRoleModalProps {
  open: boolean;
  mode: "create" | "edit";
  onClose: () => void;
  onSaveDraft?: (payload: RolePayload) => void;
  onActivate?: (payload: RolePayload) => void;
}

export interface RolePayload {
  name: string;
  description: string;
  status: string;
  inheritFrom: string;
  permissions: string[];
}

const EMPTY: RolePayload = {
  name: "",
  description: "",
  status: "Draft",
  inheritFrom: "None (Scratch)",
  permissions: [],
};

export default function CreateRoleModal({
  open,
  mode,
  onClose,
  onSaveDraft,
  onActivate,
}: CreateRoleModalProps) {
  const [form, setForm] = useState<RolePayload>(EMPTY);
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

  const nameMissing = !form.name.trim();
  const permsMissing = form.permissions.length === 0;
  const hasErrors = nameMissing || permsMissing;

  const togglePermission = (p: string) => {
    setForm((f) => ({
      ...f,
      permissions: f.permissions.includes(p)
        ? f.permissions.filter((x) => x !== p)
        : [...f.permissions, p],
    }));
  };

  const submit = (handler?: (payload: RolePayload) => void) => {
    setAttempted(true);
    if (hasErrors) return;
    handler?.(form);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl mt-20 mb-6 bg-white rounded-xl shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {mode === "edit" ? "Edit Role" : "Create Role"}
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

        <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-4">
            <Field label="Role Name" required error={attempted && nameMissing ? "Required" : null}>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. ESG Analyst"
                className={inputClass(attempted && nameMissing)}
              />
            </Field>

            <Field label="Description" error={null}>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Describe what his role can do..."
                rows={3}
                className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#119B95]/20 text-gray-900 resize-none"
              />
            </Field>

            <Field label="Status" required error={null}>
              <Select
                value={form.status}
                onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[70]">
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Inherit from" required error={null}>
              <Select
                value={form.inheritFrom}
                onValueChange={(v) => setForm((f) => ({ ...f, inheritFrom: v }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[70]">
                  {INHERIT_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div>
            <label className="block text-sm text-gray-800 mb-1.5">
              Assign to Permissions <span className="text-red-500">*</span>
            </label>
            <ul className="space-y-2.5">
              {ROLE_PERMISSIONS.map((p) => (
                <li key={p}>
                  <Checkbox
                    checked={form.permissions.includes(p)}
                    onChange={() => togglePermission(p)}
                    label={p}
                  />
                </li>
              ))}
            </ul>
            {attempted && permsMissing && (
              <p className="text-xs text-red-600 mt-1">Select at least one permission</p>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-5 rounded-lg border border-gray-200 text-sm text-gray-800 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => submit(onSaveDraft)}
            className="h-10 px-5 rounded-lg border border-gray-200 text-sm text-gray-800 hover:bg-gray-50"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => submit(onActivate)}
            className="h-10 px-5 rounded-lg bg-[#119B95] hover:bg-[#0f877f] text-white text-sm font-medium"
          >
            Save & Activate
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
