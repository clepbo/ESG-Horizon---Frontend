// Enums to match your schema
export enum TargetType {
  GENERAL = "GENERAL",
  SCOPE = "SCOPE",
  BOTH = "BOTH",
}

export enum EmissionScope {
  SCOPE1 = "SCOPE1",
  SCOPE2 = "SCOPE2",
  SCOPE3 = "SCOPE3",
}

// Interface for GeneralTarget
export interface GeneralTarget {
  id: number;
  reductionPercentage: number;
  targetEmission: number;
  baselineYearEmission?: number;
  currentEmission?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

// Interface for ScopeTarget
export interface ScopeTarget {
  id: number;
  scope: EmissionScope;
  reductionPercentage: number;
  targetEmission: number;
  baselineYearEmission: number;
  currentEmission: number | null;
  baselineYear?: number | null;
  targetYear?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

// Main Target interface that can handle both types
export interface Target {
  id: number;
  companyId: number;
  name: string;
  type: TargetType;
  createdById: number;
  description: string;
  baselineYear: number;
  targetYear: number;
  currentAssessmentYear?: number | null;
  createdAt: string;
  updatedAt: string;
  generalTarget?: GeneralTarget | null;
  scopeTargets: ScopeTarget[];
}
