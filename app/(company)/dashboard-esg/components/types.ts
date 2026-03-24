import type { ReactNode } from "react";

// Dashboard-specific types for the redesigned company dashboard

export interface PillarScore {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  color: string; // left border color
  iconBg: string;
  icon: ReactNode;
}

export interface EmissionTrendPoint {
  year: number;
  scope1: number;
  scope2: number;
  scope3: number;
  total: number;
}

export interface ReductionTarget {
  reductionAchieved: number; // percentage
  targetReduction: number; // percentage
  targetYear: number;
  baselineYear: number;
  baselineEmission: number;
  currentYear: number;
  currentEmission: number;
  targetEmission: number;
}

export interface ESGReportMetric {
  id: string;
  title: string;
  borderColor: string;
  iconBg: string;
  icon: ReactNode;
  metricLabel: string;
  metricValue: string;
  metricTooltip?: string;
  metricUnit?: string;
  changeText: string;
  changeDirection: "up" | "down" | "neutral";
  /** When true, "up" is bad (red) and "down" is good (green). Default ESG behavior. */
  upIsBad?: boolean;
}

export interface AssessmentListItem {
  id: number;
  name: string;
  period: string;
  status: string;
  progress: number;
}

export interface DashboardActivity {
  id: string | number;
  userName: string;
  initials: string;
  action: string;
  timestamp: string;
  color: string;
}
