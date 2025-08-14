import api from "./axios";

export interface Company {
  id: number;
  name: string;
  registration_number: string;
  sicsCode?: string;
  isinCode?: string | null;
  isoCountryCode?: string;
  sector?: string | null;
  subSector?: string | null;
  industry?: string | null;
  address?: string;
  country?: string;
  contact_email?: string;
  website?: string;
  contact_phone?: string;
  company_logo_url?: string | null;
  status: "pending" | "active" | "suspended" | "under review";
  description?: string;
  staff?: string;
  category?: string;
}

export const getAllCompanies = async () => {
  const response = await api.get("/company/esg/all");
  console.log("getAllCompanies response:", response.data);
  return response.data;
};
export const getCompanyById = async (id: number) => {
  const response = await api.get(`/company/esg/${id}`);
  return response.data;
};

export const updateCompanyStatus = async (
  id: number,
  status: Company["status"]
) => {
  console.log("Updating company status:", { id, status });
  const response = await api.patch(`/company/esg/${id}/status`, { status });
  return response.data;
};
