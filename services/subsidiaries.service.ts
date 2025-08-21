// import api from "@/lib/api/axios";

export type Subsidiary = {
    id: number;
    name: string;
    sector: string;
    industry: string;
    address: string;
    status: string;
};

export const mockSubsidiaries: Subsidiary[] = [
    {
        id: 1,
        name: "Offshore Drilling",
        sector: "Extractives and Minerals Processing",
        industry: "Oil & Gas – Exploration & Production",
        address: "3517 W. Gray St. Utica, Pennsylvania 57867",
        status: "active",
    },
    {
        id: 2,
        name: "Refinery Upgrade",
        sector: "Extractives and Minerals Processing",
        industry: "Oil & Gas – Exploration & Production",
        address: "2715 Ash Dr. San Jose, South Dakota 83475",
        status: "inactive",
    },
    {
        id: 3,
        name: "Pipeline Expansion",
        sector: "Extractives and Minerals Processing",
        industry: "Oil & Gas – Exploration & Production",
        address: "6391 Elgin St. Celina, Delaware 10299",
        status: "active",
    },
];

export const subsidiariesService = {
    getAll: async () => {
        // const data = await api.get(`/subsidiaries`);
        // console.log(data);
        return mockSubsidiaries;
    },
    createSubsidiaries: async (payload: Subsidiary) => {
        // const data = await api.post(`/subsidiaries`, payload);
        // console.log(data);
        return payload;
    },
    editSubsidiaries: async (payload: Subsidiary) => {
        // const data = await api.patch(`/subsidiaries`);
        // console.log(data);
        return payload;
    },
    getSubsidiariesById: async () => {
        // const data = await api.get(`/subsidiaries`);
        // console.log(data);
        return mockSubsidiaries;
    },
    deleteSubsidiaries: async () => {
        // const data = await api.get(`/subsidiaries`);
        // console.log(data);
        return mockSubsidiaries;
    },
};
