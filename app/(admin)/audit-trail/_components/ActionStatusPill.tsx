import type { AuditStatus } from "../_fixtures/events";

const STYLES: Record<AuditStatus, string> = {
  Success: "bg-emerald-50 text-emerald-700",
  Failed: "bg-red-50 text-red-700",
  "Under Review": "bg-amber-50 text-amber-700",
};

export default function ActionStatusPill({ status }: { status: AuditStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STYLES[status]}`}
    >
      {status}
    </span>
  );
}
