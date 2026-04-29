import api from "@/lib/api/axios";
import { Industry } from "./industries.services";

export type Subsidiary = {
  id: number;
  name: string;
  industryId?: number;
  industry?: Industry;
  address: string;
  status: string;
  teamLead?: {
    first_name?: string;
    last_name?: string;
    email?: string;
  };
  teamLeadId?: number;
  leadId?: number;
  teamSize?: number;
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
  getSubsidiariesById: async (id: number) => {
    const data = await api.get(`/subsidiary/${id}`);
    return data;
  },
  deleteSubsidiaries: async (id: number) => {
    const data = await api.delete(`/subsidiary/${id}`);
    return data;
  },
  getCompanySubsidiaryDepartments: async (id: number) => {
    const data = await api.get(`/subsidiary/${id}/company`);
    return data;
  },
};
