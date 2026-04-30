import type { PlanTier } from "../_fixtures/subscriptions";

const PLAN_STYLES: Record<PlanTier, string> = {
  Enterprise: "bg-purple-50 text-purple-700",
  Premium: "bg-emerald-50 text-emerald-700",
  Basic: "bg-blue-50 text-blue-700",
  Free: "bg-gray-100 text-gray-700",
};

export default function PlanPill({ plan }: { plan: PlanTier }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PLAN_STYLES[plan]}`}
    >
      {plan}
    </span>
  );
}
