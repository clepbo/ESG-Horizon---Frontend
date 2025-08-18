import api from "@/lib/api/axios";

export const otpService = {
  // Send OTP
  send: async (payload: { email: string; [key: string]: any }) => {
    const { data } = await api.post("/otp/send", payload);
    return data;
  },

  // Verify OTP
  verify: async (payload: {
    email: string;
    otp: string;
    [key: string]: any;
  }) => {
    const { data } = await api.post("/otp/verify", payload);
    return data;
  },

  // Resend OTP
  resend: async (payload: { email: string; [key: string]: any }) => {
    const { data } = await api.post("/otp/resend", payload);
    return data;
  },

  // Send test email OTP
  sendTestEmail: async (payload: { email: string; [key: string]: any }) => {
    const { data } = await api.post("/test-email", payload);
    return data;
  },
};
