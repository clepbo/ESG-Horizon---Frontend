import api from "./axios";

type SignupData = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  company_name: string;
  reg_number: string;
  industry_type: string;
  address: string;
  contact_email: string;
  contact_phone: string;
  company_website: string;
};

export const loginUser = async (data: { email: string; password: string }) => {
  const response = await api.post("/auth/login", data);
  return response.data;
};

export const signupUser = async (data: SignupData) => {
  const response = await api.post("/esg/auth/signup", data);
  return response.data;
};

export const forgotPassword = async (data: { email: string }) => {
  const response = await api.post("/auth/forgot-password", data);
  return response.data;
};

export const getUserProfile = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};
