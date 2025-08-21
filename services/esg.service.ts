import api from "@/lib/api/axios";

export const esgService = {
    checkMail: async (email: string) => {
        const data = await api.get("/company/esg/check-email", {
            params: { email },
        });
        return data;
    },

    signup: async (payload: any) => {
        const data = await api.post("/company/esg/signup", payload);
        return data;
    },

    completeSignup: async (payload: any) => {
        const data = await api.post(
            "/company/esg/complete-signup",
            payload
        );
        return data;
    },
};
