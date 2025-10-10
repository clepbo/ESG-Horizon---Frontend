import api from "@/lib/api/axios";

/**
 * Dashboard data structure (matches backend endpoint)
 */
export interface DashboardData {
    overallScore: number;
    breakdown: {
        environment: number;
        social: number;
        governance: number;
    },
    recentActivities: {
        id: number;
        title: string;
        description?: string;
        status?: string;
        createdAt: string;
    }[];
    subscription: {
        tier: string;
        amount: number;
        dueDate: string;
    } | null;
    esgJourney: {
        month: string;
        score: number;
    }[];
}

/**
 * Dashboard API service
 */
export const dashboardService = {
    /**
     * Fetch ESG dashboard overview for the current company
     */
    getDashboard: async (): Promise<DashboardData> => {
        const data = await api.get("/company/esg/dashboard");
        return data.data; // Return `data.data` because our backend wraps response as { message, data }
    },
};
