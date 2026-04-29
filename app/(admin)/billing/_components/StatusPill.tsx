import type { SubscriptionStatus } from "../_fixtures/subscriptions";

const STATUS_STYLES: Record<SubscriptionStatus, string> = {
  Active: "bg-emerald-50 text-emerald-700",
  Expired: "bg-red-50 text-red-700",
  Pending: "bg-amber-50 text-amber-700",
  Cancelled: "bg-gray-100 text-gray-700",
};

export default function StatusPill({ status }: { status: SubscriptionStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}
