import api from "@/lib/api/axios";

export const authService = {
    // Register a new user
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    forgotPassword: async (payload: { email: string }) => {
        const { data } = await api.post("/auth/forgot-password", payload);
        return data;
    },

    verifyOtp: async (payload: { email: string; otp: string }) => {
        const { data } = await api.post("/auth/verify-otp", payload);
        return data;
    },

    resetPassword: async (payload: {
        email: string;
        otp: string;
        new_password: string;
    }) => {
        const { data } = await api.post("/auth/reset-password", payload);
        return data;
    },
};
