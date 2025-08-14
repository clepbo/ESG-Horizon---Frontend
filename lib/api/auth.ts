import { User } from "@/types/user";
import api from "./axios";
import { Company } from "@/context/AuthContext";

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

// export const loginUser = async (data: { email: string; password: string }) => {
//   const response = await api.post("/auth/login", data);
//   return response.data;
// };
export const loginUser = async (data: { email: string; password: string }) => {
  const response = await api.post("/auth/login", data);

  // If the backend sends the token here, store it
  if (response.data?.access_token) {
    localStorage.setItem("token", response.data.token);
  }

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
  const response = await api.get("/user/me");
  return response.data;
};
export const updateUserProfile = async (data: Partial<User>) => {
  console.log("Updating profile with:", data);
  const response = await api.patch("/user/me", data);
  return response.data;
};
export const updateCompanyProfile = async (data: Partial<Company>) => {
  console.log("Updating profile with:", data);
  const response = await api.patch("/user/me", data);
  return response.data;
};
