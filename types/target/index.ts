export interface ScopeTarget {
  reductionPercentage: number;
  targetEmission?: number;
  baselineYearEmission?: number;
  currentEmission?: number | null;
}

// Payload used when creating a general (aggregate) target
export interface GeneralTargetPayload {
  name: string;
  type: "GENERAL";
  description: string;
  baselineYear: number;
  targetYear: number;
  reductionPercentage: number;
  targetEmission: number | null;
  baselineYearEmission: number;
  currentEmission: number | null;
  baselineAssessmentId?: number;
}

// Backwards‑compatible alias – older code still imports TargetPayload
export type TargetPayload = GeneralTargetPayload;

// Payload used when creating a scope‑based target
export interface ScopeTargetPayload {
  name: string;
  type: "SCOPE";
  description: string;
  baselineYear: number;
  targetYear: number;
  scopes: {
    scope1: ScopeTarget;
    scope2: ScopeTarget;
    scope3: ScopeTarget;
  };
  baselineAssessmentId?: number;
}

// Payload used when creating a combined (general + scope) target
export interface BothTargetPayload {
  name: string;
  type: "BOTH";
  description: string;
  baselineYear: number;
  targetYear: number;
  reductionPercentage: number;
  targetEmission: number | null;
  baselineYearEmission: number;
  currentEmission: number | null;
  scopes: {
    scope1: ScopeTarget;
    scope2: ScopeTarget;
    scope3: ScopeTarget;
  };
  baselineAssessmentId?: number;
}

export type CreateTargetPayload = GeneralTargetPayload | ScopeTargetPayload | BothTargetPayload;

// Baseline selection option returned from /target/baseline-options
export interface BaselineOption {
  assessmentId: number;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
  totalEmission: number;
  hasReport: boolean;
  // ISO string from the API
  createdAt: string;
  submittedAt: string | null;
  approvedAt: string | null;
}

/** Minimal target shape for overlap checks (GET /target list). */
export interface CompanyTargetSummary {
  id: number;
  type: string;
  baselineYear: number;
  targetYear: number;
  name: string;
}

/** True if [baselineA, targetA] overlaps [baselineB, targetB]. */
export function targetRangesOverlap(
  baselineA: number,
  targetA: number,
  baselineB: number,
  targetB: number
): boolean {
  return baselineA <= targetB && targetA >= baselineB;
}
