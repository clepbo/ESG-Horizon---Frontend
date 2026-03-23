import { formatNumberWithCommas } from "@/app/(company)/reports-and-analytics/components/utils/helpers";
import type { ESGReportMetric, EmissionTrendPoint } from "./types";

/**
 * Transforms a report object from GET /report/:id into ESGReportMetric[]
 * for the dashboard ESG Assessment Report grid.
 */
export function buildReportMetrics(report: any): ESGReportMetric[] {
  if (!report) return [];

  const env = report.environmental;
  const social = report.socialCapital;
  const human = report.humanCapital;
  const business = report.businessModel;
  const leadership = report.leadershipAndGovernance;
  const activity = report.activityMetrics;

  // Activity Metrics — total production (crude + synthetic oil)
  const oilProd = activity?.productionData?.oilProduction;
  const totalProduction =
    (Number(oilProd?.crudeOil) || 0) + (Number(oilProd?.syntheticOil) || 0);

  // Environmental — total emissions
  const totalEmissions = Number(env?.total_emission) || 0;
  const envChange = env?.changePercentage;

  // Social Capital — operational delays risk level
  const riskLevel = social?.operationalDelaysLevel || "—";
  const incidents = Number(social?.totalNumberOfIncidents) || 0;

  // Human Capital — TRIR
  const trir = Number(human?.totalRecordableIncidentRatePer200kHours) || 0;
  const humanChange = human?.changePercentage;

  // Business Model — reserves at risk
  const reservesAtRisk = Number(business?.totalReservesAmountAtRisk) || 0;
  const renewableInv =
    Number(
      business?.reservesValuationAndCapitalExpenditure?.strategicCapitalAllocation
        ?.renewableInvestmentAmount
    ) || 0;
  const businessChange = business?.changePercentage;

  // Leadership & Governance — process safety
  const pser = Number(leadership?.processSafetyPercentage) || 0;
  const tierEvents = leadership?.numberOfTierEventsAndWhatTier || "—";

  return [
    {
      id: "activity-metrics",
      title: "Activity Metrics",
      borderColor: "#EF4444",
      iconSrc: "/icons/overall-esg.svg",
      metricLabel: "Total Production",
      metricValue: totalProduction > 0 ? formatNumberWithCommas(totalProduction) : "—",
      metricUnit: "kbbl/day",
      changeText: "",
      changeDirection: "neutral",
    },
    {
      id: "environmental",
      title: "Environmental",
      borderColor: "#22C55E",
      iconSrc: "/icons/leafgreen.svg",
      metricLabel: "Total Emissions",
      metricValue: totalEmissions > 0 ? formatNumberWithCommas(totalEmissions) : "—",
      metricUnit: "tCO₂e",
      changeText: envChange != null ? `${Math.abs(envChange)}%` : "",
      changeDirection:
        envChange == null ? "neutral" : envChange <= 0 ? "down" : "up",
    },
    {
      id: "social-capital",
      title: "Social Capital",
      borderColor: "#3B82F6",
      iconSrc: "/icons/userstwo.svg",
      metricLabel: "Operational Delays",
      metricValue: riskLevel,
      metricUnit: incidents > 0 ? `${incidents} Incidents` : "",
      changeText: "",
      changeDirection: "neutral",
    },
    {
      id: "human-capital",
      title: "Human Capital",
      borderColor: "#F59E0B",
      iconSrc: "/icons/userstwo.svg",
      metricLabel: "Total Recordable Incident Rate",
      metricValue: trir > 0 ? trir.toFixed(2) : "—",
      metricUnit: "per 200k hrs",
      changeText: humanChange != null ? `${Math.abs(humanChange)}%` : "",
      changeDirection:
        humanChange == null ? "neutral" : humanChange <= 0 ? "down" : "up",
    },
    {
      id: "business-model",
      title: "Business Model",
      borderColor: "#EF4444",
      iconSrc: "/icons/injusticetwo.svg",
      metricLabel: "Reserves at Risk",
      metricValue:
        reservesAtRisk > 0
          ? `₦${formatNumberWithCommas(reservesAtRisk)}`
          : "—",
      metricUnit: renewableInv > 0 ? `₦${formatNumberWithCommas(renewableInv)} Renewable Inv.` : "",
      changeText: businessChange != null ? `${Math.abs(businessChange)}%` : "",
      changeDirection:
        businessChange == null
          ? "neutral"
          : businessChange <= 0
            ? "down"
            : "up",
    },
    {
      id: "leadership-governance",
      title: "Leadership & Governance",
      borderColor: "#8B5CF6",
      iconSrc: "/icons/injusticetwo.svg",
      metricLabel: "Process Safety",
      metricValue: `${Math.round(pser)}%`,
      metricUnit: "Audit Compliance",
      changeText: tierEvents !== "—" ? tierEvents : "",
      changeDirection: "neutral",
    },
  ];
}

/**
 * Builds GHG emission trend data from the report's historical arrays.
 * Each scope has a history like [{ score: number; period: string }].
 * We merge them by period into EmissionTrendPoint[].
 */
export function buildEmissionTrend(report: any): EmissionTrendPoint[] {
  const ghg = report?.environmental?.greenhouseGasEmission;
  if (!ghg) return [];

  const totalHistory: { score: number; period: string }[] = ghg.totalHistory || [];
  const scope1History: { score: number; period: string }[] = ghg.scope1History || [];
  const scope2History: { score: number; period: string }[] = ghg.scope2History || [];
  const scope3History: { score: number; period: string }[] = ghg.scope3History || [];

  // Collect all unique periods
  const periodMap = new Map<string, EmissionTrendPoint>();

  for (const item of totalHistory) {
    const key = item.period;
    if (!periodMap.has(key)) {
      periodMap.set(key, { year: extractYear(key), scope1: 0, scope2: 0, scope3: 0, total: 0 });
    }
    periodMap.get(key)!.total = Number(item.score) || 0;
  }

  for (const item of scope1History) {
    const key = item.period;
    if (!periodMap.has(key)) {
      periodMap.set(key, { year: extractYear(key), scope1: 0, scope2: 0, scope3: 0, total: 0 });
    }
    periodMap.get(key)!.scope1 = Number(item.score) || 0;
  }

  for (const item of scope2History) {
    const key = item.period;
    if (!periodMap.has(key)) {
      periodMap.set(key, { year: extractYear(key), scope1: 0, scope2: 0, scope3: 0, total: 0 });
    }
    periodMap.get(key)!.scope2 = Number(item.score) || 0;
  }

  for (const item of scope3History) {
    const key = item.period;
    if (!periodMap.has(key)) {
      periodMap.set(key, { year: extractYear(key), scope1: 0, scope2: 0, scope3: 0, total: 0 });
    }
    periodMap.get(key)!.scope3 = Number(item.score) || 0;
  }

  return Array.from(periodMap.values()).sort((a, b) => a.year - b.year);
}

/** Extract a numeric year from period strings like "01/25 - 01/26" or "2025" */
function extractYear(period: string): number {
  // Try to find a 4-digit year
  const fourDigit = period.match(/\b(20\d{2})\b/);
  if (fourDigit) return parseInt(fourDigit[1], 10);

  // Try 2-digit year from the end portion (e.g. "01/25 - 01/26" → 26 → 2026)
  const twoDigit = period.match(/(\d{2})\s*$/);
  if (twoDigit) return 2000 + parseInt(twoDigit[1], 10);

  return 0;
}
