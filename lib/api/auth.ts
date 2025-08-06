import api from "./axios";

export interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  // Add more fields as needed
}

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
