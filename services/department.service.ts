import api from "@/lib/api/axios";

export interface Department {
    id: number;
    name: string;
    description?: string;
    companyId?: number;
    subsidiaryId?: number;
    subsidiary?: {
        id?: number;
        name?: string;
    };
    leadId?: number;
    contact_email?: string;
    lead?: {
        id: number;
        first_name: string;
        last_name: string;
        email: string;
    };
}

export interface DepartmentUser {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    status: string;
    profile_photo_url?: string;
}

export interface UpdateDepartment {
    name?: string;
    description?: string;
    leadId?: number;
    contact_email?: string;
}

export interface CreateDepartment {
    name: string;
    description?: string;
    leadId?: number;
    contact_email?: string;
    subsidiaryId?: number;
}

export const departmentService = {
    create: async (companyId: string | number, payload?: CreateDepartment) => {
        const data = await api.post(`/departments/${companyId}`, payload);
        return data;
    },

    getAll: async (companyId: string | number) => {
        const data = await api.get(`/departments/${companyId}`);
        return data;
    },

    update: async (id: string | number, payload?: UpdateDepartment) => {
        const data = await api.patch(`/departments/${id}`, payload);
        return data;
    },

    delete: async (id: string | number) => {
        const { data } = await api.delete(`/departments/${id}`);
        return data;
    },

    getUsers: async (
        departmentId: string | number
    ): Promise<DepartmentUser[]> => {
        const response = await api.get(`/departments/${departmentId}/users`);
        return response.data;
    },
};
