"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardService, DashboardData } from "../dashboard.service";

export const useCompanyDashboard = () => {
    return useQuery<DashboardData>({
        queryKey: ["companyDashboard"],
        queryFn: dashboardService.getDashboard,
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });
};
