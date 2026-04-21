"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface InviteUserModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (payload: InvitePayload) => void;
}

export interface InvitePayload {
  email: string;
  role: string;
  department: string;
  company: string;
}

const ROLE_OPTIONS = ["Super Admin", "Sub Admin", "Data Officer", "Viewer"];
const DEPARTMENT_OPTIONS = ["Administration", "Sustainability", "Digital", "Investment", "Operations"];
const COMPANY_OPTIONS = ["Teasoo Consulting", "GreenTech Solutions", "Barone LLC", "EcoBuild Limited"];

const EMPTY: InvitePayload = { email: "", role: "", department: "", company: "Teasoo Consulting" };

export default function InviteUserModal({ open, onClose, onSubmit }: InviteUserModalProps) {
  const [form, setForm] = useState<InvitePayload>(EMPTY);
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setForm(EMPTY);
      setAttempted(false);
    }
  }, [open]);

  if (!open) return null;

  const errors = {
    email: !form.email.trim() || !form.email.includes("@"),
    role: !form.role,
    department: !form.department,
    company: !form.company,
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const handleSubmit = () => {
    setAttempted(true);
    if (hasErrors) return;
    onSubmit?.(form);
    onClose();
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
          <h2 className="text-lg font-semibold text-gray-900">Invite New User</h2>
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
          <Field label="Email Address" required error={attempted && errors.email ? "Enter a valid email" : null}>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="user@company.com"
              className={inputClass(attempted && errors.email)}
            />
          </Field>

          <Field label="Role" required error={attempted && errors.role ? "Select a role" : null}>
            <select
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              className={selectClass(attempted && errors.role)}
            >
              <option value="">Select role</option>
              {ROLE_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Department" required error={attempted && errors.department ? "Select a department" : null}>
            <select
              value={form.department}
              onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
              className={selectClass(attempted && errors.department)}
            >
              <option value="">Select department</option>
              {DEPARTMENT_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Company" required error={attempted && errors.company ? "Select a company" : null}>
            <select
              value={form.company}
              onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
              className={selectClass(attempted && errors.company)}
            >
              {COMPANY_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </Field>
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
            className="h-10 px-5 rounded-lg bg-[#119B95] hover:bg-[#0f877f] text-white text-sm font-medium transition-colors"
          >
            Send Invite
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

function selectClass(invalid?: boolean) {
  return `w-full h-10 pl-3 pr-9 text-sm bg-white border rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#119B95]/20 text-gray-900 ${
    invalid ? "border-red-400" : "border-gray-200"
  }`;
}
