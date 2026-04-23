"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import UserAvatar from "./UserAvatar";
import UserRolePill from "./UserRolePill";
import UserStatusPill from "./UserStatusPill";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import Checkbox from "../../components/Checkbox";
import { userDetailsFixture, PERMISSIONS, type Permission } from "../_fixtures/userDetails";
import type { UserRole } from "../_fixtures/users";

const ROLE_OPTIONS: UserRole[] = ["Super Admin", "Sub Admin", "Data Officer", "Viewer"];

interface UserDetailsModalProps {
  open: boolean;
  onClose: () => void;
  onSave?: (payload: { role: UserRole; permissions: Permission[] }) => void;
  onSuspend?: () => void;
  // Left for real lookups; fixture ignores it for now.
  userId?: string;
}

export default function UserDetailsModal({ open, onClose, onSave, onSuspend }: UserDetailsModalProps) {
  const u = userDetailsFixture;
  const [role, setRole] = useState<UserRole>(u.role);
  const [permissions, setPermissions] = useState<Permission[]>(u.permissions);

  // Reset form state whenever the modal (re)opens
  useEffect(() => {
    if (open) {
      setRole(u.role);
      setPermissions(u.permissions);
    }
  }, [open, u.role, u.permissions]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const togglePermission = (p: Permission) => {
    setPermissions((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl mt-20 mb-6 bg-white rounded-xl shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">User Details</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="scale-125 origin-left">
              <UserAvatar firstName={u.firstName} lastName={u.lastName} color={u.avatarColor} />
            </div>
            <div className="ml-2 flex-1 min-w-0">
              <h3 className="text-xl font-bold text-gray-900 truncate">
                {u.firstName} {u.lastName}
              </h3>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <UserRolePill role={role} />
                <UserStatusPill status={u.status} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-5 text-sm">
            <Field label="Email Address" value={u.email} />
            <Field label="Company" value={u.company} />
            <Field label="Contact Phone Number" value={u.contactPhone} />
            <Field label="Department" value={u.department} />

            <div>
              <label className="block text-xs text-gray-700 mb-1">Role</label>
              <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="z-[70]">
                  {ROLE_OPTIONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs text-gray-700 mb-2">Permission</label>
              <ul className="space-y-1.5">
                {PERMISSIONS.map((p) => (
                  <li key={p}>
                    <Checkbox
                      checked={permissions.includes(p)}
                      onChange={() => togglePermission(p)}
                      label={p}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-5 rounded-lg border border-gray-200 text-sm text-gray-800 hover:bg-gray-50"
          >
            Close
          </button>
          <button
            type="button"
            onClick={onSuspend}
            className="h-10 px-5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
          >
            Suspend User
          </button>
          <button
            type="button"
            onClick={() => {
              onSave?.({ role, permissions });
              onClose();
            }}
            className="h-10 px-5 rounded-lg bg-[#119B95] hover:bg-[#0f877f] text-white text-sm font-medium transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-gray-700 mb-1">{label}</dt>
      <dd className="text-gray-900 font-medium break-words">{value}</dd>
    </div>
  );
}
