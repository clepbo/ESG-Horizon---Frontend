import { Card, CardContent } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Progress } from "@/app/components/ui/progress";
import { formatNumberShort, formatPercent } from "@/lib/numberFormat";
import { getFormSectionStatus, resolveDataPath } from "@/lib/assessmentStatusUtils";
import { STATUS_CONFIG } from "./constants";
import type { PillarTabId } from "./types";

/**
 * Business Model group keys use a different dotted path in assessmentData
 * (stored under `businessInnovation.*`) vs their submission group key (`businessModel.*`).
 * All other group keys double as their own data path.
 */
const BIZ_DATA_PATH_OVERRIDES: Record<string, string> = {
  "businessModel.reservesValuation.reservesSensitivity":
    "businessInnovation.reservesValuationAndCapitalExpenditures.reservesSensitivityToCarbonPricing",
  "businessModel.reservesValuation.embeddedCarbon":
    "businessInnovation.reservesValuationAndCapitalExpenditures.embeddedCarbonInReserves",
  "businessModel.reservesValuation.renewableEnergyInvestment":
    "businessInnovation.reservesValuationAndCapitalExpenditures.renewableEnergyInvestment",
  "businessModel.reservesValuation.capitalExpenditureStrategy":
    "businessInnovation.reservesValuationAndCapitalExpenditures.capitalExpenditureStrategy",
  "businessModel.businessEthics.reservesCountriesCorruptionRisk":
    "businessInnovation.businessEthicsAndTransparency.reservesInCountriesWithHighCorruptionRisk",
  "businessModel.businessEthics.antiCorruptionManagement":
    "businessInnovation.businessEthicsAndTransparency.antiCorruptionManagementSystem",
};

/** All 38 group keys that getGroupPath() can emit — the group key IS the data path. */
const ALL_GROUP_KEYS = [
  "environment.ghg.scope1.stationarySources",
  "environment.ghg.scope1.mobileSources",
  "environment.ghg.scope1.processEmissions",
  "environment.ghg.scope1.fugitiveEmissions",
  "environment.ghg.scope2.locationBased",
  "environment.ghg.scope2.marketBased",
  "environment.ghg.scope3.upstream",
  "environment.ghg.scope3.downstream",
  "environment.airQuality.airPollutantEmissions",
  "environment.waterManagement.waterAndProducedWaterManagement.freshwaterWithdrawals",
  "environment.waterManagement.waterAndProducedWaterManagement.producedWaterManagement",
  "environment.waterManagement.hydraulicFracturingImpacts.waterQualityImpacts",
  "environment.waterManagement.hydraulicFracturingImpacts.chemicalDisclosure",
  "environment.biodiversityImpact.environmentalManagement.hydrocarbonSpills",
  "environment.biodiversityImpact.environmentalManagement.environmentalManagementPolicies",
  "environment.biodiversityImpact.environmentalManagement.reservesInSensitiveAreas",
  "foundationalData.activityMetrics.productionVolumes",
  "foundationalData.activityMetrics.offshoreSites",
  "foundationalData.activityMetrics.terrestrialSites",
  "socialCapital.securityHumanRights.operationsInConflictZones",
  "socialCapital.securityHumanRights.reservesInNearIndigenousLand",
  "socialCapital.securityHumanRights.humanRightsEngagementProcesses",
  "socialCapital.communityRelations.communityRiskOpportunityManagement",
  "socialCapital.communityRelations.hcdtContribution",
  "socialCapital.communityRelations.communityDisputeResolution",
  "socialCapital.communityRelations.operationalDelays",
  "humanCapital.workforceHealthSafety",
  "humanCapital.riskAndOpportunityManagement.healthAndSafetyPerformance",
  "businessModel.reservesValuation.reservesSensitivity",
  "businessModel.reservesValuation.embeddedCarbon",
  "businessModel.reservesValuation.renewableEnergyInvestment",
  "businessModel.reservesValuation.capitalExpenditureStrategy",
  "businessModel.businessEthics.reservesCountriesCorruptionRisk",
  "businessModel.businessEthics.antiCorruptionManagement",
  "leadershipGovernance.criticalIncidentRiskManagement.processSafetyEvents",
  "leadershipGovernance.criticalIncidentRiskManagement.catastrophicRiskManagementSystems",
  "leadershipGovernance.legalRegulatoryEnvironment.boardManagementOversight",
  "leadershipGovernance.legalRegulatoryEnvironment.publicPolicyEngagement",
] as const;

interface InfoCardsRowProps {
  activeTabId: PillarTabId;
  assessmentData: any;
  fullAssessment: any;
}

export function InfoCardsRow({ activeTabId, assessmentData, fullAssessment }: InfoCardsRowProps) {
  const showEmissionsCard = activeTabId === "environmental";
  const submittedGroups: string[] = assessmentData.submittedGroups || [];

  // Exact counts — evaluate every known group key against submittedGroups + actual data
  const statuses = ALL_GROUP_KEYS.map((key) => {
    const dataPath = BIZ_DATA_PATH_OVERRIDES[key] ?? key;
    return getFormSectionStatus(submittedGroups, key, resolveDataPath(assessmentData, dataPath.split(".")));
  });
  const totalGroups = ALL_GROUP_KEYS.length;
  const completedCount = statuses.filter((s) => s === "submitted").length;
  const inProgressCount = statuses.filter((s) => s === "in-progress").length;
  const notStartedCount = statuses.filter((s) => s === "not-started").length;

  // All sections submitted → show 100%; otherwise use the backend-computed weighted value
  const progressPct = completedCount >= totalGroups
    ? 100
    : parseFloat((assessmentData.overallProgress || 0).toFixed(2));

  // Status config for subsidiary card badge
  const statusConfig = STATUS_CONFIG[fullAssessment.status] || STATUS_CONFIG.in_progress;

  // Scope breakdown — backend stores totals at environment.ghg.scopeN.totalEmission
  const scope1Total = assessmentData.environment?.ghg?.scope1?.totalEmission ?? 0;
  const scope2Total = assessmentData.environment?.ghg?.scope2?.totalEmission ?? 0;
  const scope3Total = assessmentData.environment?.ghg?.scope3?.totalEmission ?? 0;

  // Month abbreviation helper (backend stores full names e.g. "January" → "Jan")
  const abbr = (month?: string) => month?.slice(0, 3) ?? "";

  return (
    <div className={`grid grid-cols-1 gap-4 ${showEmissionsCard ? "md:grid-cols-4" : "md:grid-cols-3"}`}>
      {/* ── Total Emissions — Environmental tab only ── */}
      {showEmissionsCard && (
        <Card className="bg-[#109b95]/15 border border-[#109b95]/30 shadow-md">
          <CardContent className="px-3.5 py-4">
            <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Total Emission</p>
            <p className="text-3xl font-bold mt-1.5 text-gray-800">
              {formatNumberShort(assessmentData.totalEmission) || "0.00"}
            </p>
            <p className="text-gray-500 text-sm mt-0.5">tCO₂e</p>
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              <Badge className="bg-[#109b95]/15 text-gray-600 border-0 text-xs px-2 py-0.5">
                Scope 1: {formatNumberShort(scope1Total)}
              </Badge>
              <Badge className="bg-[#109b95]/15 text-gray-600 border-0 text-xs px-2 py-0.5">
                Scope 2: {formatNumberShort(scope2Total)}
              </Badge>
              <Badge className="bg-[#109b95]/15 text-gray-600 border-0 text-xs px-2 py-0.5">
                Scope 3: {formatNumberShort(scope3Total)}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Overall Progress ── */}
      <Card className="bg-[#3d9f56]/15 border border-[#3d9f56]/30 shadow-md">
        <CardContent className="px-3.5 py-4">
          <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Overall Progress</p>
          <div className="flex items-center gap-3 mt-1.5">
            <Progress value={progressPct} className="flex-1 [&>div]:bg-[#3d9f56] bg-gray-200" />
            <span className="text-xl font-bold text-gray-800">{formatPercent(progressPct)}</span>
          </div>
          <p className="text-sm text-gray-500 mt-1.5">
            {completedCount} of {totalGroups} sections completed
          </p>
          <div className="flex items-center gap-5 mt-2.5">
            <div className="text-center">
              <p className="text-lg font-bold text-[#3d9f56]">{completedCount}</p>
              <p className="text-xs text-gray-500">Complete</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-[#f9b233]">{inProgressCount}</p>
              <p className="text-xs text-gray-500">In Progress</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-400">{notStartedCount}</p>
              <p className="text-xs text-gray-500">Not Started</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Subsidiary ── */}
      <Card className="bg-[#f9b233]/15 border border-[#f9b233]/30 shadow-md">
        <CardContent className="px-3.5 py-4">
          <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Subsidiary</p>
          <p className="text-lg font-bold mt-1.5 text-gray-800">{fullAssessment.subsidiary}</p>
          <Badge className={`${statusConfig.color} border-0 text-xs mt-1.5`}>{statusConfig.label}</Badge>
          {fullAssessment.reportingLead && (
            <p className="text-sm text-gray-500 mt-2.5">
              Reporting Lead: <span className="font-medium text-gray-700">{fullAssessment.reportingLead}</span>
            </p>
          )}
        </CardContent>
      </Card>

      {/* ── Reporting Period ── */}
      <Card className="bg-[#82898c] text-white border-0 shadow-md">
        <CardContent className="px-3.5 py-4">
          <p className="text-white/80 text-sm font-semibold uppercase tracking-wider">Reporting Period</p>
          <p className="text-lg font-bold mt-1.5">
            {abbr(fullAssessment.startMonth)} {fullAssessment.startYear} –{" "}
            {abbr(fullAssessment.endMonth)} {fullAssessment.endYear}
          </p>
          {fullAssessment.quarter && (
            <p className="text-sm text-white/80 mt-1.5">{fullAssessment.quarter}</p>
          )}
          {fullAssessment.submissionDeadline && (
            <p className="text-sm text-white/80 mt-1.5">
              Submission Deadline{" "}
              <span className="text-yellow-200 font-medium">{fullAssessment.submissionDeadline}</span>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
