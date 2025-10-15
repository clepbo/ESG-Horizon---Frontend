import api from "@/lib/api/axios";

export type Subsidiary = {
  id: number;
  name: string;
  industryId?: number;
  industry?: {
    id?: number;
    industry: string;
    sector?: string;
  };
  address: string;
  status: string;
  teamLead_email?: string;
  teamLead_name?: string;
  teamLeadId?: number;
};

export const subsidiariesService = {
  getAll: async () => {
    const data = await api.get(`/subsidiary`);
    return data;
  },
  getCompanySubsidiaries: async () => {
    const data = await api.get("subsidiary/company-subsidiaries");
    return data;
  },
  getCompanySubsidiaryUsers: async (id: number) => {
    const data = await api.get(`/subsidiary/${id}/users`);
    return data;
  },
  createSubsidiary: async (payload: Partial<Subsidiary>) => {
    const data = await api.post(`/subsidiary`, payload);
    return data;
  },
  editSubsidiaries: async (payload: Partial<Subsidiary>) => {
    const data = await api.patch(`/subsidiary/${payload.id}`, payload);
    return data;
  },
  getSubsidiariesById: async () => {
    const data = await api.get(`/subsidiary`);
    return data;
  },
  deleteSubsidiaries: async (id: number) => {
    const data = await api.delete(`/subsidiary/${id}`);
    return data;
  },
};
