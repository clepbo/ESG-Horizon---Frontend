"use client";

import { permissionGroups } from "../_fixtures/permissionGroups";
import RolePermissionPill from "../../components/RolePermissionPill";
import type { PermissionGroupCard } from "../_fixtures/permissionGroups";

interface PermissionGroupsTabProps {
  onEditGroup: (group: PermissionGroupCard) => void;
}

export default function PermissionGroupsTab({ onEditGroup }: PermissionGroupsTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
      {permissionGroups.map((group) => (
        <div key={group.id} className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">{group.title}</h3>
            <button
              type="button"
              onClick={() => onEditGroup(group)}
              className="h-8 px-3 text-xs font-medium border border-gray-200 rounded-md text-gray-800 hover:bg-gray-50"
            >
              Edit
            </button>
          </div>
          <ul className="space-y-3">
            {group.items.map((item) => (
              <li key={item.label} className="flex items-center justify-between gap-3">
                <span className="text-sm text-gray-800">{item.label}</span>
                <RolePermissionPill label={item.minRole} plus={item.plus} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
