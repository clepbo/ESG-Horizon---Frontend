import api from "@/lib/api/axios";

export const adminAuthService = {
  register: async (payload: any) => {
    const { data } = await api.post("/admin/register", payload);
    return data;
  },

  verifyEmail: async (payload: any) => {
    const { data } = await api.post("/admin/verify-email", payload);
    return data;
  },

  completeRegistration: async (payload: any) => {
    const { data } = await api.post("/admin/complete-registration", payload);
    return data;
  },

  verifyInviteToken: async (payload: any) => {
    const { data } = await api.post("/admin/verify-invite-token", payload);
    return data;
  },

  invite: async (payload: any) => {
    const { data } = await api.post("/admin/invite-admin", payload);
    return data;
  },

  getUsers: async () => {
    const { data } = await api.get("/admin/get-users");
    return data;
  },
};
