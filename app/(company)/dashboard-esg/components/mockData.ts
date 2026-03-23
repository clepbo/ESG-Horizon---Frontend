import type {
  PillarScore,
  EmissionTrendPoint,
  ReductionTarget,
  ESGReportMetric,
} from "./types";

// TODO: Wire to real endpoint when 5-pillar scoring backend is ready
export const MOCK_PILLAR_SCORES: PillarScore[] = [
  {
    id: "environmental",
    name: "Environmental",
    score: 78,
    maxScore: 100,
    color: "#22C55E",
    iconSrc: "/icons/leafgreen.svg",
  },
  {
    id: "social-capital",
    name: "Social Capital",
    score: 64,
    maxScore: 100,
    color: "#3B82F6",
    iconSrc: "/icons/userstwo.svg",
  },
  {
    id: "human-capital",
    name: "Human Capital",
    score: 71,
    maxScore: 100,
    color: "#F59E0B",
    iconSrc: "/icons/userstwo.svg",
  },
  {
    id: "business-model",
    name: "Business Model",
    score: 58,
    maxScore: 100,
    color: "#EF4444",
    iconSrc: "/icons/injusticetwo.svg",
  },
  {
    id: "leadership-governance",
    name: "Leadership & Governance",
    score: 82,
    maxScore: 100,
    color: "#8B5CF6",
    iconSrc: "/icons/injusticetwo.svg",
  },
];

// TODO: Wire to real historical emissions endpoint
export const MOCK_EMISSION_TREND: EmissionTrendPoint[] = [
  { year: 2022, scope1: 40000, scope2: 8000, scope3: 152000, total: 200000 },
  { year: 2023, scope1: 38000, scope2: 7500, scope3: 148000, total: 193500 },
  { year: 2024, scope1: 35000, scope2: 7200, scope3: 140000, total: 182200 },
  { year: 2025, scope1: 32000, scope2: 7000, scope3: 130000, total: 169000 },
  { year: 2026, scope1: 30000, scope2: 6500, scope3: 125000, total: 161500 },
];

// TODO: Wire to useLatestTargetPair general target when available
export const MOCK_REDUCTION_TARGET: ReductionTarget = {
  reductionAchieved: 65,
  targetReduction: 50,
  targetYear: 2030,
  baselineYear: 2024,
  baselineEmission: 154000,
  currentYear: 2025,
  currentEmission: 126830,
  targetEmission: 5000,
};

// TODO: Wire to real scope breakdown from report endpoint
export const MOCK_TOTAL_EMISSION = {
  total: 461131,
  scope1: 32000,
  scope2: 7000,
  scope3: 422131,
};

// TODO: Wire to per-pillar summary endpoint when available
export const MOCK_REPORT_METRICS: ESGReportMetric[] = [
  {
    id: "activity-metrics",
    title: "Activity Metrics",
    borderColor: "#EF4444",
    iconSrc: "/icons/overall-esg.svg",
    metricLabel: "Total Production",
    metricValue: "538",
    metricUnit: "kbbl/day",
    changeText: "+3.2% MoM",
    changeDirection: "up",
  },
  {
    id: "environmental",
    title: "Environmental",
    borderColor: "#22C55E",
    iconSrc: "/icons/leafgreen.svg",
    metricLabel: "Total Emissions",
    metricValue: "154,000",
    metricUnit: "tCO₂e",
    changeText: "0.0%",
    changeDirection: "down",
  },
  {
    id: "social-capital",
    title: "Social Capital",
    borderColor: "#3B82F6",
    iconSrc: "/icons/userstwo.svg",
    metricLabel: "Operational Delays",
    metricValue: "High Risk",
    metricUnit: "in 2 Regions",
    changeText: "15 Incidents",
    changeDirection: "neutral",
  },
  {
    id: "human-capital",
    title: "Human Capital",
    borderColor: "#F59E0B",
    iconSrc: "/icons/userstwo.svg",
    metricLabel: "Total Recordable Incident Rate",
    metricValue: "0.45",
    metricUnit: "per 200k hrs",
    changeText: "10%",
    changeDirection: "down",
  },
  {
    id: "business-model",
    title: "Business Model",
    borderColor: "#EF4444",
    iconSrc: "/icons/injusticetwo.svg",
    metricLabel: "Reserves at Risk",
    metricValue: "₦150M",
    metricUnit: "Renewable Inv.",
    changeText: "12% Decrease",
    changeDirection: "down",
  },
  {
    id: "leadership-governance",
    title: "Leadership & Governance",
    borderColor: "#8B5CF6",
    iconSrc: "/icons/injusticetwo.svg",
    metricLabel: "Process Safety",
    metricValue: "100%",
    metricUnit: "Audit Compliance",
    changeText: "2 Tier-1 Events",
    changeDirection: "neutral",
  },
];
