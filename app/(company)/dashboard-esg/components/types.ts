import type { ReactNode } from "react";

// Dashboard-specific types for the redesigned company dashboard

export interface PillarIndicator {
  label: string;
  score: number;
}

export interface PillarScore {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  color: string; // left border color
  iconBg: string;
  icon: ReactNode;
  grade?: string;
  indicators?: PillarIndicator[];
}

export interface EmissionTrendPoint {
  year: number;
  scope1: number;
  scope2: number;
  scope3: number;
  total: number;
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
  /** Tooltip text shown on card hover. */
  tooltip?: string;
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
