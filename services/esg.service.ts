import api from "@/lib/api/axios";
import { SignupData } from "@/context/AuthContext";
export interface CompleteSignup {
  first_name: string;
  last_name?: string;
  phone_number?: string;
  password: string;
  token?: string;
}

export const esgService = {
  checkMail: async (email: string) => {
    const data = await api.get("/company/esg/check-email", {
      params: { email },
    });
    return data;
  },

  signup: async (payload: SignupData) => {
    const data = await api.post("/company/esg/signup", payload);
    return data;
  },

  completeSignup: async (payload: CompleteSignup) => {
    const data = await api.post("/company/esg/complete-signup", payload);
    return data;
  },
};
