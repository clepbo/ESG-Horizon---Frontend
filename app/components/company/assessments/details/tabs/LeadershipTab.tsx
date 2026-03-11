import { Accordion } from "@/app/components/ui/accordion";
import { Shield, Gavel } from "lucide-react";
import { MetricAccordion } from "../MetricAccordion";
import { SubMetricSection } from "../SubMetricSection";
import { DataFieldGrid } from "../DataFieldGrid";
import { EmptyState } from "../EmptyState";
import { StatusDot } from "../StatusDot";
import { getFormSectionStatus } from "@/lib/assessmentStatusUtils";
import type { SectionStatus } from "@/lib/assessmentStatusUtils";
import type { FileWithMeta } from "../types";
import { extractFiles } from "../utils";

interface LeadershipTabProps {
  assessmentData: any;
  submittedGroups: string[];
  onFileClick: (file: FileWithMeta) => void;
}

function hasData(obj: any) {
  if (!obj) return false;
  return Object.keys(obj).some((k) => {
    const v = obj[k];
    return v !== undefined && v !== null && v !== "" && !["filesAndLinks", "files", "additionalFields", "calculated"].includes(k);
  });
}

export function LeadershipTab({ assessmentData, submittedGroups, onFileClick }: LeadershipTabProps) {
  const lg = assessmentData.leadershipGovernance || {};
  const criticalIncident = lg.criticalIncidentRiskManagement || {};
  const legalReg = lg.managementOfTheLegalAndRegulatoryEnvironment || {};

  // Subtopics
  const processSafety = criticalIncident.processSafetyEvents || {};
  const catastrophicRisk = criticalIncident.catastrophicRiskManagementSystems || {};
  const publicPolicy = legalReg.publicPolicyEngagement || {};
  const boardOversight = legalReg.boardAndManagementOversight || legalReg.boardManagementOversight || {};

  // Status
  const processStatus = getFormSectionStatus(
    submittedGroups,
    "leadershipGovernance.criticalIncidentRiskManagement.processSafetyEvents",
    processSafety
  );
  const catastrophicStatus = getFormSectionStatus(
    submittedGroups,
    "leadershipGovernance.criticalIncidentRiskManagement.catastrophicRiskManagementSystems",
    catastrophicRisk
  );
  const policyStatus = getFormSectionStatus(
    submittedGroups,
    "leadershipGovernance.legalRegulatoryEnvironment.publicPolicyEngagement",
    publicPolicy
  );
  const boardStatus = getFormSectionStatus(
    submittedGroups,
    "leadershipGovernance.legalRegulatoryEnvironment.boardManagementOversight",
    boardOversight
  );

  const criticalStatuses: SectionStatus[] = [processStatus, catastrophicStatus];
  const criticalStatus: SectionStatus = criticalStatuses.every((s) => s === "submitted")
    ? "submitted"
    : criticalStatuses.some((s) => s !== "not-started")
    ? "in-progress"
    : "not-started";

  const legalStatuses: SectionStatus[] = [policyStatus, boardStatus];
  const legalStatus: SectionStatus = legalStatuses.every((s) => s === "submitted")
    ? "submitted"
    : legalStatuses.some((s) => s !== "not-started")
    ? "in-progress"
    : "not-started";

  // Docs
  const processFiles: FileWithMeta[] = [];
  const catastrophicFiles: FileWithMeta[] = [];
  const policyFiles: FileWithMeta[] = [];
  const boardFiles: FileWithMeta[] = [];
  extractFiles(processSafety, "Process Safety", processFiles);
  extractFiles(catastrophicRisk, "Catastrophic Risk", catastrophicFiles);
  extractFiles(publicPolicy, "Public Policy", policyFiles);
  extractFiles(boardOversight, "Board Oversight", boardFiles);

  return (
    <Accordion type="multiple" defaultValue={[]} className="space-y-4">
      {/* ══════════════════ CRITICAL INCIDENT RISK MANAGEMENT ══════════════════ */}
      <MetricAccordion
        value="critical-incident"
        icon={Shield}
        title="Critical Incident Risk Management"
        description="2 form · IFRS: EM-EP-540a.1, 540a.2"
        status={criticalStatus}
      >
        <div className="space-y-6">
          {/* ── Process Safety Events (Tier 1) ── */}
          <SubMetricSection
            title="Process Safety Events (Tier 1)"
            status={processStatus}
            documents={processFiles}
            onFileClick={onFileClick}
            onEdit={() => {}}
            onClear={() => {}}
          >
            {!hasData(processSafety) ? (
              <EmptyState />
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-xs text-gray-700 font-medium">Process Safety Events</span>
                  <StatusDot status={processStatus} />
                </div>
                <DataFieldGrid
                  columns={2}
                  fields={[
                    {
                      label: "Total Hours Worked (Employees + Contractors)",
                      value: processSafety.totalHoursWorked,
                      unit: "hours",
                    },
                    {
                      label: "Number of Tier 1 Process Safety Events",
                      value: processSafety.numberOfEvents,
                    },
                  ]}
                />
              </div>
            )}
          </SubMetricSection>

          {/* ── Catastrophic Risk Management Systems ── */}
          <SubMetricSection
            title="Catastrophic Risk Management Systems"
            status={catastrophicStatus}
            documents={catastrophicFiles}
            onFileClick={onFileClick}
            onEdit={() => {}}
            onClear={() => {}}
          >
            {!hasData(catastrophicRisk) ? (
              <EmptyState />
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-xs text-gray-700 font-medium">Catastrophic Risk Management Systems</span>
                  <StatusDot status={catastrophicStatus} />
                </div>
                <DataFieldGrid
                  columns={2}
                  fields={[
                    {
                      label: "Date of Most Recent External Asset Integrity Audit",
                      value: catastrophicRisk.auditDate,
                    },
                    {
                      label: "Description of Catastrophic Risk Management Systems",
                      value: catastrophicRisk.systemDescription,
                    },
                  ]}
                />
              </div>
            )}
          </SubMetricSection>
        </div>
      </MetricAccordion>

      {/* ══════════════════ MANAGEMENT OF LEGAL & REGULATORY ENVIRONMENT ══════════════════ */}
      <MetricAccordion
        value="legal-regulatory"
        icon={Gavel}
        title="Management of Legal & Regulatory Environment"
        description="2 form · IFRS: EM-EP-530a.1, NGA.G1"
        status={legalStatus}
      >
        <div className="space-y-6">
          {/* ── Public Policy Engagement ── */}
          <SubMetricSection
            title="Public Policy Engagement"
            status={policyStatus}
            documents={policyFiles}
            onFileClick={onFileClick}
            onEdit={() => {}}
            onClear={() => {}}
          >
            {!hasData(publicPolicy) ? (
              <EmptyState />
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-xs text-gray-700 font-medium">Public Policy Engagement</span>
                  <StatusDot status={policyStatus} />
                </div>
                <DataFieldGrid
                  columns={2}
                  fields={[
                    {
                      label: "Publicly Discloses Lobbying/Trade Association Contributions?",
                      value:
                        publicPolicy.disclosesContributions === true || publicPolicy.disclosesContributions === "yes"
                          ? "Yes"
                          : publicPolicy.disclosesContributions === false || publicPolicy.disclosesContributions === "no"
                          ? "No"
                          : publicPolicy.disclosesContributions,
                    },
                    {
                      label: "Discussion of Corporate Positions on Policy and Regulation",
                      value: publicPolicy.policyPositions,
                    },
                  ]}
                />
              </div>
            )}
          </SubMetricSection>

          {/* ── Board & Management Oversight of Sustainability ── */}
          <SubMetricSection
            title="Board & Management Oversight of Sustainability"
            status={boardStatus}
            documents={boardFiles}
            onFileClick={onFileClick}
            onEdit={() => {}}
            onClear={() => {}}
          >
            {!hasData(boardOversight) ? (
              <EmptyState />
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-xs text-gray-700 font-medium">Board &amp; Management Oversight</span>
                  <StatusDot status={boardStatus} />
                </div>
                <DataFieldGrid
                  columns={2}
                  fields={[
                    {
                      label: "Board-Level ESG/Sustainability Committee?",
                      value:
                        boardOversight.hasBoardCommittee === true || boardOversight.hasBoardCommittee === "yes"
                          ? "Yes"
                          : boardOversight.hasBoardCommittee === false || boardOversight.hasBoardCommittee === "no"
                          ? "No"
                          : boardOversight.hasBoardCommittee,
                    },
                    {
                      label: "Discussion of Board Oversight and Management's Role",
                      value: boardOversight.oversightDiscussion,
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
