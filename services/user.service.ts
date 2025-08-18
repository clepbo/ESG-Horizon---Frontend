import api from "@/lib/api/axios";

export const userService = {
  // Get current logged-in user
  getCurrent: async () => {
    const { data } = await api.get("/users/me");
    return data;
  },

  // Edit current logged-in user
  editCurrent: async (payload: Record<string, any>) => {
    const { data } = await api.patch("/users/me", payload);
    return data;
  },

  // Get all users (with optional query params)
  getAll: async (params?: Record<string, any>) => {
    const { data } = await api.get("/users/all", { params });
    return data;
  },
};
