import { GeneralTargetData } from "@/types/target";

export interface EmissionData {
  ghg_scope_one: number;
  ghg_scope_two: number;
  ghg_scope_three: number;
  ghg_total_emissions: number;
  startYear: number;
  endYear: number;
}

export interface EmissionDataResponse {
  startYear: number;
  endYear: number;
  totals: {
    total: number;
    scope1: number;
    scope2: number;
    scope3: number;
  };
}

export interface ScopeTargetData {
  scope1: GeneralTargetData;
  scope2: GeneralTargetData;
  scope3: GeneralTargetData;
}

export interface ScopeSummaryData {
  scopeTargetData: ScopeTargetData;
  emissionData: {
    startYear: number;
    endYear: number;
    totals: {
      total: number;
      scope1: number;
      scope2: number;
      scope3: number;
    };
  };
  calculations: {
    scope1: {
      targetEmission: number;
      totalReduction: number;
      timeline: number;
      annualRate: number;
    };
    scope2: {
      targetEmission: number;
      totalReduction: number;
      timeline: number;
      annualRate: number;
    };
    scope3: {
      targetEmission: number;
      totalReduction: number;
      timeline: number;
      annualRate: number;
    };
  };
}
