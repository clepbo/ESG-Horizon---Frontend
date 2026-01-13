import { GeneralTarget } from "@/app/(company)/reports-and-analytics/components/newReport/environmental/ReductionTarget";

export interface ReportResponse {
  report: Report;
  percentage_emission_summary: PercentageEmissionSummary;
  status: string;
  top_5_sources: TopSources;
  fuel_mix_breakdown: FuelMix[];
  summary: Summary;
  environment_details: EnvironmentDetails;
  targets: Target;
}

interface GHGData {
  ghg_total_emissions: number;
  ghg_history: EmissionHistory[];
  ghg_scope_1: number;
  ghg_scope_1_history: EmissionHistory[];
  ghg_scope_2: number;
  ghg_scope_2_history: EmissionHistory[];
  ghg_scope_3: number;
  ghg_scope_3_history: EmissionHistory[];
}
interface EmissionHistory {
  score: number;
  period: string;
}
export interface Report {
  id: number;
  assessmentId: number;
  ghg_total_emissions: number;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
  subsidiary: string;
  progress: number | null;
  ghg_scope_one: number;
  ghg_scope_two: number;
  ghg_scope_three: number;
  environmental_total_emissions: number;
  // … add other scope fields as needed
}

export interface PercentageEmissionSummary {
  scope1_emission_summary: number;
  scope2_emission_summary: number;
  scope3_emission_summary: number;
}

export interface TopSources {
  breakdown: {
    fuelType: string;
    volume: number;
    percentage: number;
  }[];
}

export interface FuelMix {
  fuelType: string;
  scope1: number;
  scope2: number;
  scope3: number;
  total: number;
}

export interface Summary {
  startMonth: {
    environment: {
      ghg: {
        scope1: {
          totalEmission: number;
          mobileSources?: {
            totalEmission: number;
          };
          processEmissions?: {
            totalEmission: number;
          };
          fugitiveEmissions?: {
            totalEmission: number;
          };
          stationarySources?: {
            totalEmission: number;
          };
        };
        scope2: {
          totalEmission: number;
        };
        scope3: {
          totalEmission: number;
        };
      };
      airQuality?: {
        airPollutantEmissions?: {
          oxidesOfNitrogen?: number;
          oxidesOfSuplphur?: number;
          particulateMatter?: number;
        };
      };
      totalEmission: number;
    };
    totalEmission: number;
    overallProgress: number;
  };
}

// export interface EnvironmentDetails {
//   total: number;
//   ghg: {
//     total: number;
//     scope1: number;
//     scope2: number;
//     scope3: number;
//   };
//   airQuality: {
//     totalAirPollutantEmission: number;
//     nox: number;
//     sox: number;
//     voc: number;
//     pm: number;
//   };
//   waterManagement: WaterManagement;
//   biodiversityImpact: BiodiversityImpact;
//   // … add waterManagement, biodiversityImpacts, etc.
// }

export interface EnvironmentDetails {
  total: number;
  ghg: GHGData;
  airQuality: {
    totalAirPollutantEmission: number;
    nox: number;
    sox: number;
    voc: number;
    pm: number;
  };
  waterManagement: {
    totalWaterWithdrawal: number;
    totalWaterConsumed: number;
    totalProducedWaterGenerated: number;
    recycledReused: number;
    injectedForDisposal: number;
    dischargedToSurface: number;
    hydraulicFracturing: {
      totalFracturedWells: number;
      volumeRecycledReused: number;
    };
    waterQualityImpacts: {
      wellsWithPublicChemicalDisclosure: number;
      volumeRecycledReused: number;
    };
  };
  biodiversityImpacts: {
    hydrocarbonSpills: {
      numberOfSpills: number;
      totalVolumeSpilled: number;
      volumeRecovered: number;
    };
    reservesInSensitiveAreas: {
      proved: number;
      probable: number;
    };
    volumeInArctic: number;
    sensitiveShorelines: number;
  };
}

export interface Target {
  name: string;
  type: string;
  baselineYear: number;
  targetYear: number;
  reductionPercentage: number;
  baselineValue?: number;
  generalTarget?:GeneralTarget;
  currentValue?: number | null;
  targetValue?: number;
}
