import api from "@/lib/api/axios";

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

export const companyService = {
  // Invite a company
  invite: async (payload: Company) => {
    const data = await api.post("/company/esg/invitations", payload);
    return data;
  },

  // Verify invitation token
  verifyInviteToken: async (token: string) => {
    const data = await api.get(`/company/esg/invitations/${token}`);
    return data;
  },

  // Edit a company user by ID
  editUser: async (id: string | number, payload: Company) => {
    const data = await api.patch(`/company/users/${id}`, payload);
    return data;
  },

  // Delete a company user by ID
  deleteUser: async (id: string | number) => {
    const data = await api.delete(`/company/users/${id}`);
    return data;
  },

  // Get all users for a company
  getUsers: async (companyId: string | number) => {
    const data = await api.get(`/company/users/${companyId}`);
    return data;
  },

  // Get all companies
  getAll: async () => {
    const data = await api.get(`/company/esg/all`);
    return data;
  },

  // Retrieve a Company profile
  getProfile: async () => {
    const data = await api.get(`/company/esg/profile`);
    return data;
  },

  // Get company details by ID
  getDetails: async (id: string | number): Promise<Company> => {
    const data = await api.get(`/company/esg/${id}`);
    return data;
  },

  // Update company details by ID
  updateDetails: async (id: string | number, payload: Company) => {
    const data = await api.patch(`/company/esg/${id}`, payload);
    return data;
  },

  // Update company status
  updateStatus: async (id: string | number, status: string) => {
    const data = await api.patch(`/company/esg/${id}/status`, { status });
    return data;
  },
};
