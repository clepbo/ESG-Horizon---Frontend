import api from "@/lib/api/axios";

export const departmentService = {
  // Create a department for a company
  create: async (companyId: string | number, payload?: any) => {
    const { data } = await api.post(`/departments/${companyId}`, payload);
    return data;
  },

  // Get all departments for a company
  getAll: async (companyId: string | number) => {
    const { data } = await api.get(`/departments/${companyId}`);
    return data;
  },

  // Update a department by ID
  update: async (id: string | number, payload?: any) => {
    const { data } = await api.patch(`/departments/${id}`, payload);
    return data;
  },

  // Delete a department by ID
  delete: async (id: string | number) => {
    const { data } = await api.delete(`/departments/${id}`);
    return data;
  },
};
