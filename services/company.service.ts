import api from "@/lib/api/axios";
import { User } from "./user.service";

export interface Company {
    id: number;
    name: string;
    registration_number: string;
    isinCode?: string | null;
    isoCountryCode?: string;
    sector?: string | null;
    subSector?: string | null;
    industry?: string | null;
    address?: string;
    country?: string;
    contact_email?: string;
    website?: string;
    contact_phone?: string;
    company_logo_url?: string | null;
    status: "pending" | "active" | "suspended" | "under review";
    description?: string;
    staff?: string;
    category?: string;
}

export const companyService = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    invite: async (payload: any) => {
        const data = await api.post("/company/esg/invitations", payload);
        return data;
    },

    // Verify invitation token
    verifyInviteToken: async (token: string) => {
        const data = await api.get(`/company/esg/invitations/${token}`);
        return data;
    },

    // Edit a company user by ID
    editUser: async (id: string | number, payload: Partial<User>) => {
        const data = await api.patch(`/company/users/${id}`, payload);
        return data;
    },

    // Delete a company user by ID
    deleteUser: async (id: string | number) => {
        const data = await api.delete(`/company/users/${id}`);
        return data;
    },

    // Get all users for a company
    getUsers: async (companyId: string | number) => {
        const data = await api.get(`/company/users/${companyId}`);
        return data;
    },

    // Get all companies
    getAll: async () => {
        const data = await api.get(`/company/esg/all`);
        return data;
    },

    // Retrieve a Company profile
    viewProfile: async (id: string | number) => {
        const data = await api.get(`/company/esg/${id}`);
        return data;
    },

    // Get company details
    getDetails: async (): Promise<Company> => {
        const data = await api.get("/company/esg/profile");
        return data;
    },

    // Update company details by ID
    updateDetails: async (id: string | number, payload: Partial<Company>) => {
        const data = await api.patch(`/company/esg/${id}`, payload);
        return data;
    },

    // Update company status
    updateStatus: async (id: string | number, status: string) => {
        const data = await api.patch(`/company/esg/${id}/status`, { status });
        return data;
    },
};
