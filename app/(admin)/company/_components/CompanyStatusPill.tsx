import type { CompanyAccountStatus } from "../_fixtures/companies";

const STYLES: Record<CompanyAccountStatus, string> = {
  Approved: "bg-emerald-50 text-emerald-700",
  Pending: "bg-amber-50 text-amber-700",
  Suspended: "bg-red-50 text-red-700",
};

export default function CompanyStatusPill({ status }: { status: CompanyAccountStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STYLES[status]}`}
    >
      {status}
    </span>
  );
}
