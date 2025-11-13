interface ScopeTarget {
  reductionPercentage: number;
}

export interface TargetPayload {
  name: string;
  type: "SCOPE" | "GENERAL";
  description: string;
  baselineYear: number;
  targetYear: number;
  reductionPercentage: number;
  targetEmission: number | null;
  baselineYearEmission: number;
  currentEmission: number | null;
}

export interface ScopeTargetPayload {
  name: string;
  type: "SCOPE" | "GENERAL";
  description: string;
  baselineYear: number;
  targetYear: number;
  scopes: {
    scope1: ScopeTarget;
    scope2: ScopeTarget;
    scope3: ScopeTarget;
  };
}
