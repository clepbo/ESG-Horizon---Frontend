export type PlanTier = "Enterprise" | "Premium" | "Basic" | "Free";
export type BillingCycle = "Yearly" | "Monthly" | "—";
export type SubscriptionStatus = "Active" | "Expired" | "Pending" | "Cancelled";

export interface Subscription {
  id: string;
  company: string;
  plan: PlanTier;
  billing: BillingCycle;
  amount: number; // in Naira
  lastPayment: string | null; // ISO date
  nextPayment: string | null;
  status: SubscriptionStatus;
}

export const subscriptions: Subscription[] = [
  {
    id: "sub_1",
    company: "EcoFriendly Manufacturing",
    plan: "Enterprise",
    billing: "Yearly",
    amount: 38800,
    lastPayment: "2024-01-01",
    nextPayment: "2025-01-01",
    status: "Active",
  },
  {
    id: "sub_2",
    company: "GreenTech Solutions",
    plan: "Premium",
    billing: "Yearly",
    amount: 15600,
    lastPayment: "2024-08-08",
    nextPayment: "2025-08-08",
    status: "Active",
  },
  {
    id: "sub_3",
    company: "Sustain Invest Capital",
    plan: "Free",
    billing: "—",
    amount: 0,
    lastPayment: null,
    nextPayment: null,
    status: "Active",
  },
  {
    id: "sub_4",
    company: "BlueEarth Corp",
    plan: "Basic",
    billing: "Monthly",
    amount: 7500,
    lastPayment: "2024-06-10",
    nextPayment: null,
    status: "Expired",
  },
];
