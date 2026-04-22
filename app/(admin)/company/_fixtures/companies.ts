import type { PlanTier } from "../../billing/_fixtures/subscriptions";

export type CompanyCategory = "Company" | "Investor" | "Regulator";
export type CompanyAccountStatus = "Approved" | "Pending" | "Suspended";

export interface CompanyRow {
  id: string;
  name: string;
  category: CompanyCategory;
  industry: string;
  contact: string;
  subscription: PlanTier;
  esgScore: number | null;
  status: CompanyAccountStatus;
}

export const companies: CompanyRow[] = [
  {
    id: "co_1",
    name: "GreenTech Solutions",
    category: "Company",
    industry: "Renewable Energy",
    contact: "sarah@greentech.com",
    subscription: "Premium",
    esgScore: 82,
    status: "Approved",
  },
  {
    id: "co_2",
    name: "EcoBuild Limited",
    category: "Company",
    industry: "Construction",
    contact: "info@ecobuild.ng",
    subscription: "Basic",
    esgScore: 74,
    status: "Approved",
  },
  {
    id: "co_3",
    name: "Barone LLC",
    category: "Investor",
    industry: "Financial Services",
    contact: "admin@barone.com",
    subscription: "Free",
    esgScore: null,
    status: "Pending",
  },
  {
    id: "co_4",
    name: "SafeGrid Partners",
    category: "Regulator",
    industry: "Utilities",
    contact: "contact@safegrid.ng",
    subscription: "Enterprise",
    esgScore: null,
    status: "Approved",
  },
  {
    id: "co_5",
    name: "Biffco Enterprises",
    category: "Company",
    industry: "Manufacturing",
    contact: "ops@biffco.com",
    subscription: "Premium",
    esgScore: 61,
    status: "Suspended",
  },
];
