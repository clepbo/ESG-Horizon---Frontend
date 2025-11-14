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
