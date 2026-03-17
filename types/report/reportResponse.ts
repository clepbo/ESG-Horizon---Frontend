import { GeneralTarget } from "@/app/(company)/reports-and-analytics/components/newReport/environmental/ReductionTarget";

export interface EvidenceFile {
  name: string;
  url: string;
  section: string;
  size?: number;
  uploadedAt?: string;
}

export interface ReportEvidence {
  environmental: EvidenceFile[];
  socialCapital: EvidenceFile[];
  humanCapital: EvidenceFile[];
  businessModel: EvidenceFile[];
  leadershipAndGovernance: EvidenceFile[];
}

export interface ReportResponse {
  report?: {
    subsidiary: string;
    startMonth: string;
    startYear: string;
    endMonth: string;
    endYear: string;
    assessmentId: number;
  };
  status?: string;
  subsidiary?: string;
  startMonth?: string;
  startYear?: string;
  endMonth?: string;
  endYear?: string;
  activityMetrics?: ActivityMetrics;
  environmental?: EnvironmentalPillar;
  environment?: EnvironmentPillar; // Legacy guy
  socialCapital?: SocialCapitalPillar;
  social?: SocialPillar; // Legacy
  humanCapital?: HumanCapitalPillar;
  businessModel?: BusinessModelPillar;
  leadershipAndGovernance?: LeadershipAndGovernancePillar;
  targets?: Target | null;
  percentage_emission_summary?: PercentageEmissionSummary;
  evidence?: ReportEvidence;
  summary?: any; // Legacy field
}

export interface ActivityMetrics {
  productionData?: {
    oilProduction?: {
      crudeOil: number;
      syntheticOil: number;
    };
    gasProduction?: {
      naturalGas: number;
      syntheticGas: number;
    };
  };
  assetPortfolio?: {
    offshoreSites?: {
      totalNumber: number;
      productionPlatforms: number;
      FPSOs: number;
      otherSites: number;
    };
    terrestrialSites?: {
      totalNumber: number;
      flowStations: number;
      gasProcessingPlants: number;
      otherSites: number;
    };
  };
}

export interface EnvironmentalPillar {
  total_emission?: number;
  desc?: string;
  changePercentage?: number;
  greenhouseGasEmission?: {
    totalEmissions: number;
    totalChange: number | null;
    totalHistory: EmissionHistory[];
    scope1Emissions: number;
    scope1Change: number | null;
    scope1History: EmissionHistory[];
    scope2Emissions: number;
    scope2Change: number | null;
    scope2History: EmissionHistory[];
    scope3Emissions: number;
    scope3Change: number | null;
    scope3History: EmissionHistory[];
  };
  ghg?: GHGData;
  airQuality?: AirQualityData;
  waterManagement?: WaterManagementData;
  biodiversityImpact?: BiodiversityImpactsData;
  biodiversityImpacts?: BiodiversityImpactsData; // Alternative naming
}

export interface SocialCapitalPillar {
  operationalDelaysLevel?: string;
  desc?: string;
  totalNumberOfIncidents?: number;
  securityHumanRightsAndIndigenousPeople?: {
    operationsInConflictZones?: {
      totalProvedReserves: number;
      provedReserves: number;
      totalProbableReserves: number;
      probableReserves: number;
    };
    reservesInNearIndigenousLand?: {
      totalProvedReserves: number;
      provedReserves: number;
      totalProbableReserves: number;
      probableReserves: number;
    };
  };
  communityRelations?: {
    hcdtContribution?: {
      priorYearOpexAmount: number;
      annualContribution: number;
      percentage: number;
    };
    communityDisputeResolution?: {
      disputesReferred: number;
      disputesResolved: number;
    };
    operationalDelays?: {
      protests?: {
        count: number;
        delay: number;
      };
      otherIssues?: {
        count: number;
        delay: number;
      };
    };
  };
}

export interface HumanCapitalPillar {
  totalRecordableIncidentRatePer200kHours?: number;
  desc?: string;
  changePercentage?: number;
  recordableIncidents?: number;
  fatalities?: number;
  nearMisses?: number;
  averageSafetyTrainingHoursPerEmployee?: number;
  direct?: HumanCapitalMetrics;
  contract?: HumanCapitalMetrics;
  safetyManagementSystems?: {
    title: string;
    tag: string;
    description: string;
  }[];
}

export interface HumanCapitalMetrics {
  recordableIncidents?: number;
  fatalities?: number;
  nearMisses?: number;
  totalHoursWorked?: number;
  trir?: number;
}

export interface BusinessModelPillar {
  totalReservesAmountAtRisk?: number;
  desc?: string;
  changePercentage?: number;
  reservesValuationAndCapitalExpenditure?: {
    climateImpactOnReserves?: {
      carbonPriceScenario: number;
      reservesAtRiskPercent: number;
      totalProvedReserves: number;
      totalProbableReserves: number;
      embeddedCarbon: number;
    };
    strategicCapitalAllocation?: {
      renewableInvestmentAmount: number;
      renewableRevenueAmount: number;
      gasProjectsValueCount: number;
      maintenanceValueCount: number;
      renewableProjectsValueCount: number;
    };
  };
  businessEthicsAndTransparency?: {
    geopoliticalAndCorruptionRisk?: {
      proved: {
        total: number;
        risk: number;
      };
      probable: {
        total: number;
        risk: number;
      };
    };
    antiCorruptionManagement?: string;
  };
}

export interface LeadershipAndGovernancePillar {
  processSafetyPercentage?: number;
  desc?: string;
  numberOfTierEventsAndWhatTier?: string;
  managementOfLegalAndRegulatoryEnvironment?: {
    publicPolicyAndLobbying?: string;
    policyPosition?: string;
    sustainabilityGovernance?: string;
    sustainabilityPosition?: string;
    hasBoardCommittee?: string;
  };
  criticalIncidenceRiskManagement?: {
    processSafetyEvents?: {
      tierOneEvents: number;
      totalHoursWorked: number;
      rate: number;
    };
    catastrophicEvents?: {
      lastAssetIntegrityAudit: string;
      description: string;
    };
  };
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

export interface PercentageEmissionSummary {
  scope1_emission_summary: number;
  scope2_emission_summary: number;
  scope3_emission_summary: number;
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
  totalAirPollutantEmission?: number;
  totalEmission?: number;
  nox: number;
  sox: number;
  voc: number;
  pm10?: number;
  pm?: number;
}

export interface WaterManagementData {
  totalWaterWithdrawal?: number;
  totalWaterConsumed?: number;
  totalProducedWaterGenerated?: number;
  recycledWater: number;
  injectedForDisposal?: number;
  dischargedToSurface?: number;
  averageHydrocarbonContent?: number;
  freshwaterWithdrawals?: {
    surfaceWater: number;
    groundwater: number;
    municipal: number;
    total: number;
  };
  freshwaterWithdrawalBySource?: {
    surfaceWater: number;
    groundwater: number;
    municipalWater: number;
  };
  waterConsumed?: {
    total: number;
  };
  producedWater?: {
    totalGenerated: number;
    recycledReused: number;
    injectedForDisposal: number;
    dischargedToSurface: number;
  };
  hydraulicFracturing?: {
    totalFracturedWells?: number;
    volumeRecycledReused?: number;
    wells?: {
      total: number;
      withPublicDisclosure: number;
      percentageWithDisclosure: number;
    };
    sites?: {
      total: number;
      withDeterioratedWaterQuality: number;
    };
    chemicalDisclosure?: {
      volumeRecycled: number;
    };
  };
  hydraulicFracturingChemicalDisclosure?: {
    wells?: {
      totalFracturedWells: number;
      numberOfWellsWithPublicDisclosure: number;
      percentageWithDisclosure: number;
    };
    sites?: {
      totalFracturedSitesMonitored: number;
      withDeterioratedWaterQuality: number;
      percentageWithDeterioratedWaterQuality: number;
    };
  };
  hydraulicFracturingWaterQualityImpacts?: {
    sites?: {
      totalFracturedSitesMonitored: number;
      withDeterioratedWaterQuality: number;
      percentageWithDeterioratedWaterQuality: number;
    };
  };
  waterQualityImpacts?: {
    wellsWithPublicChemicalDisclosure?: number;
    volumeRecycledReused?: number;
  };
}

export interface BiodiversityImpactsData {
  hydrocarbonSpills?: {
    numberOfSpills: number;
    totalVolumeSpilled: number;
    volumeRecovered: number;
    volumeInArctic?: number;
    volumeImpactingSensitiveShorelines?: number;
  };
  reservesInSensitiveAreas?: {
    totalProvedReserves?: number;
    proved?: number;
    probable?: number;
    provedReserves?: number;
    totalProbableReserves?: number;
    probableReserves?: number;
  };
  volumeInArctic?: number;
}

// Placeholder pillar interfaces (keep for backwards compatibility)
export interface SocialPillar { }

export interface Target {
  id?: number;
  name: string;
  companyId?: number;
  type: string;
  description?: string;
  baselineYear: number;
  targetYear: number;
  createdAt?: string;
  updatedAt?: string;
  createdById?: number;
  scopeTargets?: any[];
  generalTarget?: GeneralTarget & {
    id?: number;
    targetId?: number;
    reductionPercentage: number;
    createdAt?: string;
    updatedAt?: string;
    baselineYearEmission?: number;
    targetEmission?: number;
    currentEmission?: number;
  };
  reductionPercentage?: number;
  baselineValue?: number;
  currentValue?: number | null;
  targetValue?: number;
}
