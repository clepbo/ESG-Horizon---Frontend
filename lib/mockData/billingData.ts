// /mockData/billingData.ts
export interface BillingRecord {
  id: string;
  company: string;
  plan: string;
  cycle: string;
  amount: string;
  last: string;
  next: string;
  status: string;
}

export const mockBillingData: BillingRecord[] = [
  {
    id: "1",
    company: "EcoCorp Ltd.",
    plan: "Premium",
    cycle: "Monthly",
    amount: "₦50,000",
    last: "2025-07-01",
    next: "2025-08-01",
    status: "Active",
  },
  {
    id: "2",
    company: "FinTech Innovations",
    plan: "Enterprise",
    cycle: "Yearly",
    amount: "₦500,000",
    last: "2025-01-10",
    next: "2026-01-10",
    status: "Pending",
  },
  {
    id: "3",
    company: "GreenTech Solutions",
    plan: "Basic",
    cycle: "Quarterly",
    amount: "₦120,000",
    last: "2025-06-15",
    next: "2025-09-15",
    status: "Expired",
  },
];
