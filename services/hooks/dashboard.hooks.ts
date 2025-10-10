"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardService, DashboardData } from "../dashboard.service";

/**
 * Fetches the company dashboard (overall ESG metrics, activities, etc.)
 */
export const useCompanyDashboard = () => {
    return useQuery<DashboardData>({
        queryKey: ["companyDashboard"],
        queryFn: dashboardService.getDashboard,
        staleTime: 1000 * 60 * 5, // cache for 5 mins
        refetchOnWindowFocus: false,
    });
};
