import type { PlanTier, SubscriptionStatus, BillingCycle } from "./subscriptions";

export interface Invoice {
  id: string; // invoice number
  date: string; // ISO date
  amount: number;
  nextPayment: string | null;
  status: SubscriptionStatus;
}

export interface BillingContact {
  name: string;
  email: string;
  address: string;
}

export interface BillingInfo {
  subscriptionId: string;
  currentPlan: PlanTier;
  status: SubscriptionStatus;
  lastPayment: string | null;
  nextPayment: string | null;
  billingCycle: BillingCycle;
  amount: number;
  autoRenewal: boolean;
  company: {
    name: string;
    industry: string;
    companyId: string;
    billingContact: BillingContact;
  };
  invoices: Invoice[];
}

// Mock lookup — in real wiring, replace with a hook keyed by subscriptionId.
export const billingInfoFixture: BillingInfo = {
  subscriptionId: "sub_2",
  currentPlan: "Enterprise",
  status: "Active",
  lastPayment: "2024-01-15",
  nextPayment: "2024-09-15",
  billingCycle: "Yearly",
  amount: 38800,
  autoRenewal: true,
  company: {
    name: "GreenTech Solutions",
    industry: "Renewable Energy",
    companyId: "ESG-2024-0042",
    billingContact: {
      name: "Sarah Johnson",
      email: "billing@greenenergy.com",
      address: "123 Green St, Eco City, EC 12345",
    },
  },
  invoices: [
    {
      id: "PMT-1562792785478",
      date: "2026-12-30T05:18:00Z",
      amount: 38800,
      nextPayment: "2027-12-30",
      status: "Active",
    },
    {
      id: "PMT-1562792774779",
      date: "2025-12-30T07:52:00Z",
      amount: 38800,
      nextPayment: "2026-12-30",
      status: "Active",
    },
    {
      id: "PMT-1562792779605",
      date: "2024-12-30T07:52:00Z",
      amount: 38800,
      nextPayment: "2025-12-30",
      status: "Active",
    },
    {
      id: "PMT-1562792778679",
      date: "2023-12-30T07:52:00Z",
      amount: 38800,
      nextPayment: "2024-12-30",
      status: "Expired",
    },
  ],
};
