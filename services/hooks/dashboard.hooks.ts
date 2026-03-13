"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../dashboard.service";

export interface ESGJourneyItem {
  period: string;
  score: number | string | null;
}

export interface CompanyDashboardData {
  overallScore: number | null;
  breakdown: { environment: number; social: number; governance: number };
  recentActivities: any[];
  esgJourney: ESGJourneyItem[];
  stats: { totalAssessments: number; reviewedAssessments: number };
  hubStats?: {
    environment: { progress: number; completed: string; status: string };
    social: { progress: number; completed: string; status: string };
    governance: { progress: number; completed: string; status: string };
  } | null;
  latestAssessmentId?: number | null;
  latestAssessmentStatus?: string | null;
}

export interface CompanyDashboardApiResponse {
  message: string;
  data: CompanyDashboardData;
}

export type DashboardQueryData = Awaited<ReturnType<typeof dashboardService.getDashboard>>;

export const useCompanyDashboard = (enabled = true) => {
  return useQuery<DashboardQueryData, Error>({
    queryKey: ["company-dashboard"],
    queryFn: () => dashboardService.getDashboard(),
    enabled,
  });
};
