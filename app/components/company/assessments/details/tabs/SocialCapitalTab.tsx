import { Accordion } from "@/app/components/ui/accordion";
import { Users, Shield } from "lucide-react";
import { formatNumberShort } from "@/lib/numberFormat";
import { MetricAccordion } from "../MetricAccordion";
import { SubMetricSection } from "../SubMetricSection";
import { DataFieldGrid } from "../DataFieldGrid";
import { EmptyState } from "../EmptyState";
import { StatusDot } from "../StatusDot";
import { getFormSectionStatus } from "@/lib/assessmentStatusUtils";
import type { SectionStatus } from "@/lib/assessmentStatusUtils";
import type { FileWithMeta } from "../types";
import { extractFiles } from "../utils";

interface SocialCapitalTabProps {
  assessmentData: any;
  submittedGroups: string[];
  onFileClick: (file: FileWithMeta) => void;
  onEditSection?: (view: string, step?: string) => void;
  onClearSection?: (path: string) => void;
}

function hasData(obj: any) {
  if (!obj) return false;
  return Object.keys(obj).some((k) => {
    const v = obj[k];
    return (
      v !== undefined &&
      v !== null &&
      v !== "" &&
      !["filesAndLinks", "files", "additionalFields", "calculated"].includes(k)
    );
  });
}

export function SocialCapitalTab({
  assessmentData,
  submittedGroups,
  onFileClick,
  onEditSection,
  onClearSection,
}: SocialCapitalTabProps) {
  const socialCapital = assessmentData.socialCapital || {};
  const communityRelations = socialCapital.communityRelations || {};
  const securityRights = socialCapital.securityRights || socialCapital.securityHumanRights || {};

  // Community Relations subtopics
  const communityRisk = communityRelations.communityRisk || {};
  const hcdtContribution = communityRelations.hcdtContribution || {};
  const disputeResolution = communityRelations.disputeResolution || {};
  const operationalDelays = communityRelations.operationalDelays || {};

  // Security & Human Rights subtopics
  const reservesAreaConflict =
    securityRights.reservesAreaConflict || securityRights.operationsInConflictZones || {};
  const reservesIndigenousLand =
    securityRights.reservesIndigenousLand || securityRights.reservesInNearIndigenousLand || {};
  const humanRightEngagement =
    securityRights.humanRightEngagement || securityRights.humanRightsEngagementProcesses || {};

  // Status checks
  const communityRiskStatus = getFormSectionStatus(
    submittedGroups,
    "socialCapital.communityRelations.communityRiskOpportunityManagement",
    communityRisk
  );
  const hcdtStatus = getFormSectionStatus(
    submittedGroups,
    "socialCapital.communityRelations.hcdtContribution",
    hcdtContribution
  );
  const disputeStatus = getFormSectionStatus(
    submittedGroups,
    "socialCapital.communityRelations.communityDisputeResolution",
    disputeResolution
  );
  const delaysStatus = getFormSectionStatus(
    submittedGroups,
    "socialCapital.communityRelations.operationalDelays",
    operationalDelays
  );

  const conflictStatus = getFormSectionStatus(
    submittedGroups,
    "socialCapital.securityHumanRights.operationsInConflictZones",
    reservesAreaConflict
  );
  const indigenousStatus = getFormSectionStatus(
    submittedGroups,
    "socialCapital.securityHumanRights.reservesInNearIndigenousLand",
    reservesIndigenousLand
  );
  const humanRightsStatus = getFormSectionStatus(
    submittedGroups,
    "socialCapital.securityHumanRights.humanRightsEngagementProcesses",
    humanRightEngagement
  );

  // Overall accordion statuses
  const communityStatuses: SectionStatus[] = [
    communityRiskStatus,
    hcdtStatus,
    disputeStatus,
    delaysStatus,
  ];
  const communityStatus: SectionStatus = communityStatuses.every((s) => s === "submitted")
    ? "submitted"
    : communityStatuses.some((s) => s !== "not-started")
      ? "in-progress"
      : "not-started";

  const securityStatuses: SectionStatus[] = [conflictStatus, indigenousStatus, humanRightsStatus];
  const securityStatus: SectionStatus = securityStatuses.every((s) => s === "submitted")
    ? "submitted"
    : securityStatuses.some((s) => s !== "not-started")
      ? "in-progress"
      : "not-started";

  // Community Relations badge — HCDT % of OPEX
  const opex = Number(hcdtContribution.opexAmount) || 0;
  const hcdt = Number(hcdtContribution.hcdtAmount) || 0;
  const communityBadge =
    opex > 0 && hcdt > 0 ? `${((hcdt / opex) * 100).toFixed(2)}% HCDT/OPEX` : undefined;
  const communityIncomplete = communityStatuses.filter((s) => s !== "submitted").length;

  // Security badge — proved reserves in conflict areas
  const conflictReserves = Number(reservesAreaConflict.provedReservesInConflictVolume) || 0;
  const securityBadge =
    conflictReserves > 0
      ? `${formatNumberShort(conflictReserves)} ${reservesAreaConflict.provedReservesInConflictUnit || "MMbbls"} in conflict zones`
      : undefined;
  const securityIncomplete = securityStatuses.filter((s) => s !== "submitted").length;

  // Files
  const communityRiskFiles: FileWithMeta[] = [];
  const hcdtFiles: FileWithMeta[] = [];
  const disputeFiles: FileWithMeta[] = [];
  const delaysFiles: FileWithMeta[] = [];
  const conflictFiles: FileWithMeta[] = [];
  const indigenousFiles: FileWithMeta[] = [];
  const humanRightsFiles: FileWithMeta[] = [];
  extractFiles(communityRisk, "Community Risk", communityRiskFiles);
  extractFiles(hcdtContribution, "HCDT Contribution", hcdtFiles);
  extractFiles(disputeResolution, "Dispute Resolution", disputeFiles);
  extractFiles(operationalDelays, "Operational Delays", delaysFiles);
  extractFiles(reservesAreaConflict, "Conflict Zones", conflictFiles);
  extractFiles(reservesIndigenousLand, "Indigenous Land", indigenousFiles);
  extractFiles(humanRightEngagement, "Human Rights", humanRightsFiles);

  return (
    <Accordion type="multiple" defaultValue={[]} className="space-y-4">
      {/* ══════════════════ COMMUNITY RELATIONS ══════════════════ */}
      <MetricAccordion
        value="community-relations"
        icon={Users}
        title="Community Relations"
        description="4 forms · SASB: EM-EP-210a"
        badge={communityBadge}
        status={communityStatus}
        incompleteCount={communityIncomplete > 0 ? communityIncomplete : undefined}
      >
        <div className="space-y-6">
          {/* ── Community Risk & Opportunity Management ── */}
          <SubMetricSection
            title="COMMUNITY RISK & OPPORTUNITY MANAGEMENT"
            status={communityRiskStatus}
            documents={communityRiskFiles}
            onFileClick={onFileClick}
            onEdit={onEditSection && (() => onEditSection("crs", "risk-&-opportunity-management"))}
            onClear={
              onClearSection &&
              (() => onClearSection("socialCapital.communityRelations.communityRisk"))
            }
          >
            {!hasData(communityRisk) ? (
              <EmptyState />
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-xs text-gray-700 font-medium">Risk Assessment</span>
                  <StatusDot status={communityRiskStatus} />
                </div>
                <DataFieldGrid
                  columns={2}
                  fields={[
                    {
                      label: "HCDT Incorporated into Risk Assessment",
                      value:
                        communityRisk.hcdtIncorporated === true ||
                        communityRisk.hcdtIncorporated === "yes"
                          ? "Yes"
                          : communityRisk.hcdtIncorporated === false ||
                              communityRisk.hcdtIncorporated === "no"
                            ? "No"
                            : communityRisk.hcdtIncorporated,
                    },
                    {
                      label: "Risk Description",
                      value: communityRisk.riskDescription,
                      paragraph: true,
                    },
                  ]}
                />
              </div>
            )}
          </SubMetricSection>

          {/* ── HCDT Contribution ── */}
          <SubMetricSection
            title="HCDT CONTRIBUTION"
            status={hcdtStatus}
            documents={hcdtFiles}
            onFileClick={onFileClick}
            onEdit={
              onEditSection && (() => onEditSection("crs", "host-community-development-(pia)"))
            }
            onClear={
              onClearSection &&
              (() => onClearSection("socialCapital.communityRelations.hcdtContribution"))
            }
          >
            {!hasData(hcdtContribution) ? (
              <EmptyState />
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-xs text-gray-700 font-medium">Contribution Breakdown</span>
                  <StatusDot status={hcdtStatus} />
                </div>
                <DataFieldGrid
                  columns={3}
                  fields={[
                    {
                      label: `Total OPEX (${hcdtContribution.opexUnit || "USD"})`,
                      value: hcdtContribution.opexAmount,
                      unit: hcdtContribution.opexUnit || "USD",
                    },
                    {
                      label: `HCDT Amount (${hcdtContribution.hcdtUnit || "USD"})`,
                      value: hcdtContribution.hcdtAmount,
                      unit: hcdtContribution.hcdtUnit || "USD",
                    },
                    {
                      label: "% of OPEX",
                      value:
                        hcdtContribution.opexAmount &&
                        hcdtContribution.hcdtAmount &&
                        Number(hcdtContribution.opexAmount) > 0
                          ? `${((Number(hcdtContribution.hcdtAmount) / Number(hcdtContribution.opexAmount)) * 100).toFixed(2)}%`
                          : "N/A",
                    },
                  ]}
                />
              </div>
            )}
          </SubMetricSection>

          {/* ── Community Dispute Resolution ── */}
          <SubMetricSection
            title="COMMUNITY DISPUTE RESOLUTION"
            status={disputeStatus}
            documents={disputeFiles}
            onFileClick={onFileClick}
            onEdit={onEditSection && (() => onEditSection("crs", "community-dispute-resolution"))}
            onClear={
              onClearSection &&
              (() => onClearSection("socialCapital.communityRelations.disputeResolution"))
            }
          >
            {!hasData(disputeResolution) ? (
              <EmptyState />
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-xs text-gray-700 font-medium">Dispute Metrics</span>
                  <StatusDot status={disputeStatus} />
                </div>
                <DataFieldGrid
                  columns={2}
                  fields={[
                    {
                      label: "Number of Disputes Referred to Mechanism",
                      value: disputeResolution.disputesReferred,
                      unit: "disputes",
                    },
                    {
                      label: "Number of Disputes Resolved",
                      value: disputeResolution.disputesResolved,
                      unit: "disputes",
                    },
                  ]}
                />
              </div>
            )}
          </SubMetricSection>

          {/* ── Operational Delays ── */}
          <SubMetricSection
            title="OPERATIONAL DELAYS"
            status={delaysStatus}
            documents={delaysFiles}
            onFileClick={onFileClick}
            onEdit={onEditSection && (() => onEditSection("crs", "operational-delays"))}
            onClear={
              onClearSection &&
              (() => onClearSection("socialCapital.communityRelations.operationalDelays"))
            }
          >
            {!hasData(operationalDelays) ? (
              <EmptyState />
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-xs text-gray-700 font-medium">Operational Delays</span>
                  <StatusDot status={delaysStatus} />
                </div>
                <div className="space-y-3">
                  <h5 className="text-sm font-semibold text-gray-700">Community Protests</h5>
                  <DataFieldGrid
                    columns={2}
                    fields={[
                      {
                        label: "Number of Delays (Community Protests)",
                        value: operationalDelays.numberOfDelaysCommunityProtests,
                        unit: "delays",
                      },
                      {
                        label: "Duration of Delays (Days)",
                        value: operationalDelays.durationDelaysCommunityProtests,
                        unit: "days",
                      },
                    ]}
                  />
                </div>
                <div className="space-y-3">
                  <h5 className="text-sm font-semibold text-gray-700">Other Stakeholder Issues</h5>
                  <DataFieldGrid
                    columns={2}
                    fields={[
                      {
                        label: "Number of Delays (Other Stakeholder Issues)",
                        value: operationalDelays.numberOfDelaysOtherStakeholder,
                        unit: "delays",
                      },
                      {
                        label: "Duration of Delays (Days)",
                        value: operationalDelays.durationDelaysOtherIssues,
                        unit: "days",
                      },
                    ]}
                  />
                </div>
              </div>
            )}
          </SubMetricSection>
        </div>
      </MetricAccordion>

      {/* ══════════════════ SECURITY, HUMAN RIGHTS & INDIGENOUS PEOPLES ══════════════════ */}
      <MetricAccordion
        value="security-human-rights"
        icon={Shield}
        title="Security, Human Rights & Indigenous Peoples"
        description="3 forms · SASB: EM-EP-210b"
        badge={securityBadge}
        status={securityStatus}
        incompleteCount={securityIncomplete > 0 ? securityIncomplete : undefined}
      >
        <div className="space-y-6">
          {/* ── Reserves in/near Areas of Conflict ── */}
          <SubMetricSection
            title="RESERVES IN/NEAR AREAS OF CONFLICT"
            status={conflictStatus}
            documents={conflictFiles}
            onFileClick={onFileClick}
            onEdit={
              onEditSection &&
              (() => onEditSection("security-human-rights", "reserves-in-conflict"))
            }
            onClear={
              onClearSection &&
              (() => onClearSection("socialCapital.securityRights.reservesAreaConflict"))
            }
          >
            {!hasData(reservesAreaConflict) ? (
              <EmptyState />
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-xs text-gray-700 font-medium">
                    Reserves in/near Areas of Conflict
                  </span>
                  <StatusDot status={conflictStatus} />
                </div>
                <DataFieldGrid
                  columns={4}
                  fields={[
                    {
                      label: `Total Proved Reserves (${reservesAreaConflict.totalProvedReservesUnit || "MMbbls"})`,
                      value: reservesAreaConflict.totalProvedReservesVolume,
                      unit: reservesAreaConflict.totalProvedReservesUnit || "MMbbls",
                    },
                    {
                      label: `Proved Reserves in Conflict Areas (${reservesAreaConflict.provedReservesInConflictUnit || "MMbbls"})`,
                      value: reservesAreaConflict.provedReservesInConflictVolume,
                      unit: reservesAreaConflict.provedReservesInConflictUnit || "MMbbls",
                      highlight: true,
                    },
                    {
                      label: `Total Probable Reserves (${reservesAreaConflict.totalProbableReservesUnit || "MMbbls"})`,
                      value: reservesAreaConflict.totalProbableReservesVolume,
                      unit: reservesAreaConflict.totalProbableReservesUnit || "MMbbls",
                    },
                    {
                      label: `Probable Reserves in Conflict Areas (${reservesAreaConflict.probableReservesInConflictUnit || "MMbbls"})`,
                      value: reservesAreaConflict.probableReservesInConflictVolume,
                      unit: reservesAreaConflict.probableReservesInConflictUnit || "MMbbls",
                      highlight: true,
                    },
                  ]}
                />
              </div>
            )}
          </SubMetricSection>

          {/* ── Reserves in/near Indigenous Land ── */}
          <SubMetricSection
            title="RESERVES IN/NEAR INDIGENOUS LAND"
            status={indigenousStatus}
            documents={indigenousFiles}
            onFileClick={onFileClick}
            onEdit={
              onEditSection &&
              (() => onEditSection("security-human-rights", "reserves-indigenous-land"))
            }
            onClear={
              onClearSection &&
              (() => onClearSection("socialCapital.securityRights.reservesIndigenousLand"))
            }
          >
            {!hasData(reservesIndigenousLand) ? (
              <EmptyState />
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-xs text-gray-700 font-medium">
                    Reserves in/near Indigenous Land
                  </span>
                  <StatusDot status={indigenousStatus} />
                </div>
                <DataFieldGrid
                  columns={4}
                  fields={[
                    {
                      label: `Total Proved Reserves (${reservesIndigenousLand.totalProvedReservesUnit || "MMbbls"})`,
                      value: reservesIndigenousLand.totalProvedReservesVolume,
                      unit: reservesIndigenousLand.totalProvedReservesUnit || "MMbbls",
                    },
                    {
                      label: `Proved Reserves in Indigenous Land (${reservesIndigenousLand.provedIndigenousUnit || "MMbbls"})`,
                      value: reservesIndigenousLand.provedIndigenousVolume,
                      unit: reservesIndigenousLand.provedIndigenousUnit || "MMbbls",
                      highlight: true,
                    },
                    {
                      label: `Total Probable Reserves (${reservesIndigenousLand.totalProbableReservesUnit || "MMbbls"})`,
                      value: reservesIndigenousLand.totalProbableReservesVolume,
                      unit: reservesIndigenousLand.totalProbableReservesUnit || "MMbbls",
                    },
                    {
                      label: `Probable Reserves in Indigenous Land (${reservesIndigenousLand.probableIndigenousUnit || "MMbbls"})`,
                      value: reservesIndigenousLand.probableIndigenousVolume,
                      unit: reservesIndigenousLand.probableIndigenousUnit || "MMbbls",
                      highlight: true,
                    },
                  ]}
                />
              </div>
            )}
          </SubMetricSection>

          {/* ── Human Rights Engagement Processes ── */}
          <SubMetricSection
            title="HUMAN RIGHTS ENGAGEMENT PROCESSES"
            status={humanRightsStatus}
            documents={humanRightsFiles}
            onFileClick={onFileClick}
            onEdit={
              onEditSection &&
              (() => onEditSection("security-human-rights", "human-rights-engagement"))
            }
            onClear={
              onClearSection &&
              (() => onClearSection("socialCapital.securityRights.humanRightEngagement"))
            }
          >
            {!hasData(humanRightEngagement) ? (
              <EmptyState />
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-xs text-gray-700 font-medium">
                    Human Rights Engagement Processes
                  </span>
                  <StatusDot status={humanRightsStatus} />
                </div>
                <DataFieldGrid
                  columns={2}
                  fields={[
                    {
                      label: "Third-Party Grievance Mechanism in Place",
                      value:
                        humanRightEngagement.hasGrievanceMechanism === true ||
                        humanRightEngagement.hasGrievanceMechanism === "yes"
                          ? "Yes"
                          : humanRightEngagement.hasGrievanceMechanism === false ||
                              humanRightEngagement.hasGrievanceMechanism === "no"
                            ? "No"
                            : humanRightEngagement.hasGrievanceMechanism,
                    },
                    {
                      label: "Engagement & Due Diligence Description",
                      value: humanRightEngagement.engagementDescription,
                      paragraph: true,
                    },
                  ]}
                />
              </div>
            )}
          </SubMetricSection>
        </div>
      </MetricAccordion>
    </Accordion>
  );
}
