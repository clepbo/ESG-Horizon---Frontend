import type { AuditModule } from "../_fixtures/events";

const STYLES: Record<AuditModule, string> = {
  Algorithm: "bg-amber-50 text-amber-700",
  Assessment: "bg-purple-50 text-purple-700",
  Auth: "bg-gray-100 text-gray-700",
  Roles: "bg-blue-50 text-blue-700",
  Reports: "bg-emerald-50 text-emerald-700",
  Users: "bg-teal-50 text-teal-700",
};

export default function ModulePill({ module }: { module: AuditModule }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STYLES[module]}`}
    >
      {module}
    </span>
  );
}
