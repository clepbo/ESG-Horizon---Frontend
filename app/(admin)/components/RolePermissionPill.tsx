export type RolePermissionKey = "Super" | "Sub" | "Officer" | "Viewer" | "All";

interface RolePermissionPillProps {
  /** "Sub +" means "Sub Admin and above". "All" means all roles. */
  label: RolePermissionKey;
  plus?: boolean;
}

const STYLES: Record<RolePermissionKey, string> = {
  Super: "bg-red-50 text-red-700",
  Sub: "bg-blue-50 text-blue-700",
  Officer: "bg-amber-50 text-amber-700",
  Viewer: "bg-purple-50 text-purple-700",
  All: "bg-gray-100 text-gray-700",
};

export default function RolePermissionPill({ label, plus = false }: RolePermissionPillProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STYLES[label]}`}
    >
      {label}
      {plus ? " +" : ""}
    </span>
  );
}
