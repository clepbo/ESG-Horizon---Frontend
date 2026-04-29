import type { CompanyCategory, CompanyAccountStatus } from "./companies";
import type { PlanTier } from "../../billing/_fixtures/subscriptions";

export interface CompanyDetails {
  id: string;
  name: string;
  category: CompanyCategory;
  status: CompanyAccountStatus;
  email: string;
  industry: string;
  website: string;
  contactPhone: string;
  staffStrength: number;
  registrationNumber: string;
  esgScore: number | null;
  address: string;
  subscription: PlanTier;
}

export const companyDetailsFixture: CompanyDetails = {
  id: "co_1",
  name: "ClearWatts Energy",
  category: "Company",
  status: "Approved",
  email: "name@companyname.net",
  industry: "Oil and Gas",
  website: "www.zephyrsofttechnologies.com",
  contactPhone: "(684) 555-0102",
  staffStrength: 20,
  registrationNumber: "555-0102",
  esgScore: 82,
  address: "2972 Westheimer Rd. Santa Ana, Illinois 85486",
  subscription: "Premium",
};
