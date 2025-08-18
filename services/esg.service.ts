import api from "@/lib/api/axios";

export const esgService = {
  // Check if email already exists
  checkMail: async (email: string) => {
    const { data } = await api.get("/company/esg/check-mail", {
      params: { email },
    });
    return data;
  },

  // Start ESG signup
  signup: async (payload: any) => {
    const { data } = await api.post("/company/esg/signup", payload);
    return data;
  },

  // Complete ESG signup
  completeSignup: async (payload: any) => {
    const { data } = await api.post("/company/esg/complete-signup", payload);
    return data;
  },
};
