import api from "@/lib/api/axios";

export const authService = {
  // Register a new user
  register: async (payload: any) => {
    const { data } = await api.post("/auth/register", payload);
    return data;
  },

  // Login with email and password
  login: async (payload: { email: string; password: string }) => {
    const { data } = await api.post("/auth/login", payload);
    return data;
  },

  // Refresh token
  refresh: async (payload: { refresh_token: string }) => {
    const { data } = await api.post("/auth/refresh", payload);
    return data;
  },

  // Resend token (verification / OTP)
  resendToken: async (payload: { email: string }) => {
    const { data } = await api.post("/auth/resend-token", payload);
    return data;
  },
};
