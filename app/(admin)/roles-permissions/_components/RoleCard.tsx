"use client";

import UserRolePill from "../../users/_components/UserRolePill";
import UserStatusPill from "../../users/_components/UserStatusPill";
import CheckIndicator from "../../components/CheckIndicator";
import type { RoleDefinition } from "../_fixtures/roles";
import type { UserStatus } from "../../users/_fixtures/users";

interface RoleCardProps {
  role: RoleDefinition;
  onEdit: (role: RoleDefinition) => void;
}

export default function RoleCard({ role, onEdit }: RoleCardProps) {
  const totalLabel =
    role.permissionsGranted === role.permissionsTotal
      ? `All (${role.permissionsTotal})`
      : `${role.permissionsGranted}/${role.permissionsTotal}`;

  return (
    <div
      className="bg-white rounded-xl border border-gray-100 overflow-hidden"
      style={{ borderTop: `3px solid ${role.accentColor}` }}
    >
      <div className="p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <UserRolePill role={role.key} />
            <UserStatusPill status={role.status as UserStatus} />
          </div>
          <button
            type="button"
            onClick={() => onEdit(role)}
            className="h-8 px-3 text-xs font-medium border border-gray-200 rounded-md text-gray-800 hover:bg-gray-50"
          >
            Edit
          </button>
        </div>

        <p className="text-sm text-gray-700 leading-relaxed">{role.description}</p>

        <dl className="flex flex-col gap-1.5 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-gray-700">Users assigned</dt>
            <dd className="font-semibold text-gray-900">{role.usersAssigned}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-gray-700">Permissions</dt>
            <dd className="font-semibold text-gray-900">{totalLabel}</dd>
          </div>
        </dl>

        <ul className="space-y-2 pt-1">
          {role.highlights.map((h) => (
            <li key={h.label}>
              <CheckIndicator granted={h.granted} label={h.label} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
