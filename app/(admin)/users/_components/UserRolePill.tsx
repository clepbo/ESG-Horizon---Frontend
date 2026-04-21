import type { UserRole } from "../_fixtures/users";

const STYLES: Record<UserRole, string> = {
  "Super Admin": "bg-emerald-50 text-emerald-700",
  "Sub Admin": "bg-blue-50 text-blue-700",
  "Data Officer": "bg-amber-50 text-amber-700",
  Viewer: "bg-gray-100 text-gray-700",
};

export default function UserRolePill({ role }: { role: UserRole }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STYLES[role]}`}
    >
      {role}
    </span>
  );
}
