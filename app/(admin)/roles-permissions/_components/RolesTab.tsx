"use client";

import { Plus } from "lucide-react";
import { roles } from "../_fixtures/roles";
import type { RoleDefinition } from "../_fixtures/roles";
import RoleCard from "./RoleCard";

interface RolesTabProps {
  onEditRole: (role: RoleDefinition) => void;
  onCreateRole: () => void;
}

export default function RolesTab({ onEditRole, onCreateRole }: RolesTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
      {roles.map((r) => (
        <RoleCard key={r.key} role={r} onEdit={onEditRole} />
      ))}
      <button
        type="button"
        onClick={onCreateRole}
        className="min-h-[360px] rounded-xl border-2 border-dashed border-gray-200 bg-white/50 text-gray-700 hover:bg-white hover:border-gray-300 transition-colors flex flex-col items-center justify-center gap-3 p-6"
      >
        <div className="w-12 h-12 rounded-full bg-[#119B95]/10 text-[#119B95] flex items-center justify-center">
          <Plus className="w-6 h-6" />
        </div>
        <div className="text-center">
          <p className="text-base font-semibold text-gray-900">Create New Role</p>
          <p className="text-xs text-gray-700 mt-0.5">Define custom permissions</p>
        </div>
      </button>
    </div>
  );
}
