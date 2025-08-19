import api from "@/lib/api/axios";

export type TeamUserStatus =
    | "pending"
    | "active"
    | "approved"
    | "suspended"
    | "disabled";

export interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone_number?: string;
    profile_photo_url?: string;
    status: TeamUserStatus;
    company?: {
        name?: string;
    };
    department?: string;
    role?: {
        name?: string;
    };
}

export const userService = {
    getCurrent: async () => {
        const { data } = await api.get("/users/me");
        return data;
    },

    editCurrent: async (payload: User) => {
        const { data } = await api.patch("/users/me", payload);
        return data;
    },

    getAll: async (params?: User) => {
        const { data } = await api.get("/users/all", { params });
        return data;
    },
};
