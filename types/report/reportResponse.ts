import { GeneralTarget } from "@/app/(company)/reports-and-analytics/components/newReport/environmental/ReductionTarget";

export interface ReportResponse {
  period: ReportingPeriod;
  totals: Totals;
  environment: EnvironmentPillar;
  social: SocialPillar;
  humanCapital: HumanCapitalPillar;
  businessModel: BusinessModelPillar;
  leadershipAndGovernance: LeadershipAndGovernancePillar;
  targets: Target | null;
}

export interface ReportingPeriod {
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
  subsidiary: string;
  status: string;
}

export interface Totals {
  ghg_total_emissions: number;
  environmental_total_emissions: number;
  social_total_emissions: number;
  governance_total_emissions: number;
}

export interface EnvironmentPillar {
  ghg: GHGData;
  airQuality: AirQualityData;
  waterManagement: WaterManagementData;
  biodiversityImpacts: BiodiversityImpactsData;
}

export interface GHGData {
  totalEmissions: number;
  scope1: ScopeData;
  scope2: ScopeData;
  scope3: ScopeData;
  allHistory: EmissionHistory[];
}

export interface ScopeData {
  emissions: number;
  percentage: number;
  history: EmissionHistory[];
}

export interface EmissionHistory {
  score: number;
  period: string;
}

export interface AirQualityData {
  totalEmission: number;
  nox: number;
  sox: number;
  voc: number;
  pm10: number;
}

export interface WaterManagementData {
  freshwaterWithdrawals: {
    surfaceWater: number;
    groundwater: number;
    municipal: number;
    total: number;
  };
  waterConsumed: {
    total: number;
  };
  producedWater: {
    totalGenerated: number;
    recycledReused: number;
    injectedForDisposal: number;
    dischargedToSurface: number;
  };
  hydraulicFracturing: {
    wells: {
      total: number;
      withPublicDisclosure: number;
      percentageWithDisclosure: number;
    };
    sites: {
      total: number;
      withDeterioratedWaterQuality: number;
    };
    chemicalDisclosure: {
      volumeRecycled: number;
    };
  };
}

export interface BiodiversityImpactsData {
  hydrocarbonSpills: {
    numberOfSpills: number;
    totalVolumeSpilled: number;
    volumeRecovered: number;
    volumeInArctic: number;
    volumeImpactingShorelines: number;
  };
  reservesInSensitiveAreas: {
    proved: number;
    probable: number;
  };
}

// Placeholder pillar interfaces
export interface SocialPillar {}
export interface HumanCapitalPillar {}
export interface BusinessModelPillar {}
export interface LeadershipAndGovernancePillar {}

export interface Target {
  name: string;
  type: string;
  baselineYear: number;
  targetYear: number;
  reductionPercentage: number;
  baselineValue?: number;
  generalTarget?: GeneralTarget;
  currentValue?: number | null;
  targetValue?: number;
}
