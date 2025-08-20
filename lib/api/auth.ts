import { Company } from "@/services/company.service";
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

    // If the backend sends the token here, store it
    if (response.data?.access_token) {
        localStorage.setItem("token", response.data.token);
    }

    return response.data;
};

export const signupUser = async (data: SignupData) => {
    const response = await api.post("/company/esg/signup", data);
    return response.data;
};

export const forgotPassword = async (data: { email: string }) => {
    const response = await api.post("/auth/forgot-password", data);
    return response.data;
};

// export const getUserProfile = async () => {
//   const response = await api.get("/user/me");
//   return response.data;
// };
export const getCompanyProfile = async () => {
    const response = await api.get("/company/esg/all");
    return response.data;
};

// export const updateUserProfile = async (data: Partial<User>) => {
//   const payload = {
//     first_name: data.first_name,
//     last_name: data.last_name,
//     phone_number: data.phone_number,
//     profile_photo_url: data.profile_photo_url,
//     department: data.department,
//     job_title: data.job_title,
//   };

//   console.log("Updating user profile with:", payload);
//   const response = await api.patch("/user/me", payload);
//   return response.data;
// };
// Company profile update
export const updateCompanyProfile = async (
    id: number,
    data: Partial<Company>
) => {
    const payload = {
        name: data.name,
        registration_number: data.registration_number,
        industry: data.industry,
        address: data.address,
        contact_email: data.contact_email,
        contact_phone: data.contact_phone,
        website: data.website,
        company_logo_url: data.company_logo_url,
        isoCountryCode: data.isoCountryCode,
        role: "",
    };

    console.log("Updating company profile with:", payload);

    // ✅ interpolate id
    const response = await api.patch(`/company/esg/${id}`, payload);

    return response.data;
};
