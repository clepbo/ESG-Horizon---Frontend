export interface GeneralTargetData {
  name?: string | null;
  reductionPercentage: number | null;
  baselineYear: number | null;
  targetYear: number | null;
  description: string;
  targetEmission: number | null;
  totalReduction: number | null;
  /** Set when user selects a baseline from baseline-options (KPI create flow). */
  baselineAssessmentId?: number | null;
  /** Human-readable baseline period (e.g. "Jan 2024 – Dec 2024"). */
  baselinePeriodLabel?: string;
}

export type TargetType = "general" | "scope" | "both";
