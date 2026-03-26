import React from "react";
import { formatNumberFull, formatNumberShort, formatCurrencyCompact } from "@/lib/numberFormat";
import { FaLeaf } from "react-icons/fa";
import { PiUsersFill } from "react-icons/pi";
import { TbBriefcaseFilled } from "react-icons/tb";
import { CiWavePulse1 } from "react-icons/ci";
import { HardHat } from "lucide-react";
import { VscLaw } from "react-icons/vsc";
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
      iconBg: "#FEF2F2",
      icon: React.createElement(CiWavePulse1, { className: "w-5 h-5" }),
      metricLabel: "Total Production",
      metricValue: totalProduction > 0 ? formatNumberShort(totalProduction) : "—",
      metricTooltip: totalProduction > 0 ? `${formatNumberFull(totalProduction)} kbbl/day` : undefined,
      metricUnit: "kbbl/day",
      changeText: "",
      changeDirection: "neutral",
      upIsBad: false,
      tooltip: "Total crude + synthetic oil production from the latest assessment.",
    },
    {
      id: "environmental",
      title: "Environmental",
      borderColor: "#1e8a3d",
      iconBg: "#f1fcf4",
      icon: React.createElement(FaLeaf, { className: "w-5 h-5" }),
      metricLabel: "Total Emissions",
      metricValue: totalEmissions > 0 ? formatNumberShort(totalEmissions) : "—",
      metricTooltip: totalEmissions > 0 ? `${formatNumberFull(totalEmissions)} tCO₂e` : undefined,
      metricUnit: "tCO₂e",
      changeText: envChange != null ? `${formatNumberShort(Math.abs(envChange), { maximumFractionDigits: 1 })}%` : "",
      changeDirection:
        envChange == null ? "neutral" : envChange <= 0 ? "down" : "up",
      upIsBad: true,
      tooltip: "Combined Scope 1, 2, and 3 greenhouse gas emissions (tCO₂e). Change is year-over-year.",
    },
    {
      id: "social-capital",
      title: "Social Capital",
      borderColor: "#2570eb",
      iconBg: "#eff5ff",
      icon: React.createElement(PiUsersFill, { className: "w-5 h-5" }),
      metricLabel: "Operational Delays",
      metricValue: riskLevel,
      metricUnit: incidents > 0 ? `${incidents} Incidents` : "",
      changeText: "",
      changeDirection: "neutral",
      upIsBad: true,
      tooltip: "Community operational delay risk level and total incidents from community relations data.",
    },
    {
      id: "human-capital",
      title: "Human Capital",
      borderColor: "#F59E0B",
      iconBg: "#FEF9C3",
      icon: React.createElement(HardHat, { className: "w-5 h-5" }),
      metricLabel: "Total Recordable Incident Rate",
      metricValue: trir > 0 ? formatNumberShort(trir) : "—",
      metricTooltip: trir > 0 ? `${formatNumberFull(trir)} per 200k hrs` : undefined,
      metricUnit: "per 200k hrs",
      changeText: humanChange != null ? `${formatNumberShort(Math.abs(humanChange), { maximumFractionDigits: 1 })}%` : "",
      changeDirection:
        humanChange == null ? "neutral" : humanChange <= 0 ? "down" : "up",
      upIsBad: true,
      tooltip: "Total Recordable Incident Rate per 200,000 work hours. Lower is better.",
    },
    {
      id: "business-model",
      title: "Business Model",
      borderColor: "#af57db",
      iconBg: "#f5e2ff",
      icon: React.createElement(TbBriefcaseFilled, { className: "w-5 h-5" }),
      metricLabel: "Reserves at Risk",
      metricValue:
        reservesAtRisk > 0
          ? `${formatNumberShort(reservesAtRisk)} MMboe`
          : "—",
      metricTooltip: reservesAtRisk > 0 ? `${formatNumberFull(reservesAtRisk)} MMboe` : undefined,
      metricUnit: renewableInv > 0 ? `${formatCurrencyCompact(renewableInv)} Renewable Inv.` : "",
      changeText: businessChange != null ? `${formatNumberShort(Math.abs(businessChange), { maximumFractionDigits: 1 })}%` : "",
      changeDirection:
        businessChange == null
          ? "neutral"
          : businessChange <= 0
            ? "down"
            : "up",
      upIsBad: true,
      tooltip: "Total reserves at risk (MMboe) and renewable energy investment from capital expenditure strategy.",
    },
    {
      id: "leadership-governance",
      title: "Leadership & Governance",
      borderColor: "#4a4a4a",
      iconBg: "#e8e8e8",
      icon: React.createElement(VscLaw, { className: "w-5 h-5" }),
      metricLabel: "Process Safety Event Rate",
      metricValue: pser > 0 ? formatNumberShort(pser) : "—",
      metricTooltip: pser > 0 ? `${formatNumberFull(pser)} per 200k hrs` : undefined,
      metricUnit: "per 200k hrs",
      changeText: tierEvents !== "—" ? tierEvents : "",
      changeDirection: "neutral",
      upIsBad: true,
      tooltip: "Process safety event rate and tier classification from critical incident risk management.",
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
