import api from "@/lib/api/axios";

export const companyService = {
  // Invite a company
  invite: async (payload: any) => {
    const { data } = await api.post("/company/esg/invitations", payload);
    return data;
  },

  // Verify invitation token
  verifyInviteToken: async (token: string) => {
    const { data } = await api.get(`/company/esg/invitations/${token}`);
    return data;
  },

  // Edit a company user by ID
  editUser: async (id: string | number, payload: any) => {
    const { data } = await api.patch(`/company/users/${id}`, payload);
    return data;
  },

  // Delete a company user by ID
  deleteUser: async (id: string | number) => {
    const { data } = await api.delete(`/company/users/${id}`);
    return data;
  },

  // Get all users for a company
  getUsers: async (companyId: string | number) => {
    const { data } = await api.get(`/company/users/${companyId}`);
    return data;
  },

  // Get all companies
  getAll: async () => {
    const { data } = await api.get(`/company/esg/all`);
    return data;
  },

  // Retrieve a Company profile
  getProfile: async () => {
    const { data } = await api.get(`/company/esg/profile`);
    return data;
  },

  // Get company details by ID
  getDetails: async (id: string | number) => {
    const { data } = await api.get(`/company/esg/${id}`);
    return data;
  },

  // Update company details by ID
  updateDetails: async (id: string | number, payload: any) => {
    const { data } = await api.patch(`/company/esg/${id}`, payload);
    return data;
  },

  // Update company status
  updateStatus: async (id: string | number, status: string) => {
    const { data } = await api.patch(`/company/esg/${id}/status`, { status });
    return data;
  },
};
