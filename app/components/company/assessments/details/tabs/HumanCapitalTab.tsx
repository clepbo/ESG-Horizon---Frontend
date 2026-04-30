import { Accordion } from "@/app/components/ui/accordion";
import { HardHat } from "lucide-react";
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

interface HumanCapitalTabProps {
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

export function HumanCapitalTab({
  assessmentData,
  submittedGroups,
  onFileClick,
  onEditSection,
  onClearSection,
}: HumanCapitalTabProps) {
  const humanCapital = assessmentData.humanCapital || {};
  const hsp = humanCapital.riskAndOpportunityManagement?.healthAndSafetyPerformance || {};
  const directEmployees = hsp.direct || {};
  const contractEmployees = hsp.contract || {};
  const safetyMgmt =
    humanCapital.workforceHealthAndSafety?.riskAndOpportunityManagement?.safetyManagementSystems ||
    humanCapital.workforceHealthSafety?.riskAndOpportunityManagement?.safetyManagementSystems ||
    {};

  // Status
  const hspStatus = getFormSectionStatus(
    submittedGroups,
    "humanCapital.riskAndOpportunityManagement.healthAndSafetyPerformance",
    hsp
  );
  const directStatus = getFormSectionStatus(
    submittedGroups,
    "humanCapital.riskAndOpportunityManagement.healthAndSafetyPerformance",
    directEmployees
  );
  const contractStatus = getFormSectionStatus(
    submittedGroups,
    "humanCapital.riskAndOpportunityManagement.healthAndSafetyPerformance",
    contractEmployees
  );
  const safetyStatus = getFormSectionStatus(
    submittedGroups,
    "humanCapital.workforceHealthSafety",
    safetyMgmt
  );

  const hcStatuses: SectionStatus[] = [hspStatus, safetyStatus];
  const hcStatus: SectionStatus = hcStatuses.every((s) => s === "submitted")
    ? "submitted"
    : hcStatuses.some((s) => s !== "not-started")
      ? "in-progress"
      : "not-started";

  // Badge: total recordable incidents (direct + contract)
  const directIncidents = Number(directEmployees.recordableIncidents) || 0;
  const contractIncidents = Number(contractEmployees.recordableIncidents) || 0;
  const totalIncidents = directIncidents + contractIncidents;
  const hasIncidentData =
    directEmployees.recordableIncidents != null || contractEmployees.recordableIncidents != null;

  // Badge: total fatalities
  const directFatalities = Number(directEmployees.fatalities) || 0;
  const contractFatalities = Number(contractEmployees.fatalities) || 0;
  const totalFatalities = directFatalities + contractFatalities;

  const badgeParts: string[] = [];
  if (hasIncidentData) badgeParts.push(`${formatNumberShort(totalIncidents)} incidents`);
  if (totalFatalities > 0) badgeParts.push(`${formatNumberShort(totalFatalities)} fatalities`);

  const hcIncomplete = hcStatuses.filter((s) => s !== "submitted").length;

  // Files
  const hspFiles: FileWithMeta[] = [];
  const safetyFiles: FileWithMeta[] = [];
  extractFiles(directEmployees, "Direct Employees", hspFiles);
  extractFiles(contractEmployees, "Contract Employees", hspFiles);
  extractFiles(safetyMgmt, "Safety Management Systems", safetyFiles);

  return (
    <Accordion type="multiple" defaultValue={[]} className="space-y-4">
      <MetricAccordion
        value="workforce-health-safety"
        icon={HardHat}
        title="Workforce Health & Safety"
        description="2 form · IFRS: EM-EP-320a.1, 320a.2"
        badge={badgeParts.length > 0 ? badgeParts.join(" · ") : undefined}
        status={hcStatus}
        incompleteCount={hcIncomplete > 0 ? hcIncomplete : undefined}
      >
        <div className="space-y-6">
          {/* ── Health & Safety Performance ── */}
          <SubMetricSection
            title="HEALTH & SAFETY PERFORMANCE"
            status={hspStatus}
            documents={hspFiles}
            onFileClick={onFileClick}
            onEdit={
              onEditSection &&
              (() => onEditSection("workforce-health-and-safety", "health-safety-performance"))
            }
            onClear={
              onClearSection &&
              (() =>
                onClearSection(
                  "humanCapital.riskAndOpportunityManagement.healthAndSafetyPerformance"
                ))
            }
          >
            {!hasData(hsp) ? (
              <EmptyState />
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-xs text-gray-700 font-medium">
                    Health &amp; Safety Performance
                  </span>
                  <StatusDot status={hspStatus} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Direct Employees Card */}
                  <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <span className="text-sm font-semibold text-gray-800">Direct Employees</span>
                      <StatusDot status={directStatus} />
                    </div>
                    <div className="p-4">
                      <DataFieldGrid
                        columns={3}
                        fields={[
                          {
                            label: "Total Hours Worked",
                            value: directEmployees.totalHoursWorked,
                            unit: directEmployees.totalHoursWorkedUnit || "hours",
                          },
                          {
                            label: "Number of Recordable Incidents",
                            value: directEmployees.recordableIncidents,
                            unit: directEmployees.recordableIncidentsUnit,
                          },
                          {
                            label: "Number of Fatalities",
                            value: directEmployees.fatalities,
                            unit: directEmployees.fatalitiesUnit,
                          },
                          {
                            label: "Number of Near Misses",
                            value: directEmployees.nearMisses,
                            unit: directEmployees.nearMissesUnit,
                          },
                          {
                            label: "Avg. Safety Training Hours per Employee",
                            value: directEmployees.safetyTrainingHours,
                            unit: directEmployees.safetyTrainingHoursUnit || "hrs/yr",
                          },
                        ]}
                      />
                    </div>
                  </div>

                  {/* Contract Employees Card */}
                  <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <span className="text-sm font-semibold text-gray-800">
                        Contract Employees
                      </span>
                      <StatusDot status={contractStatus} />
                    </div>
                    <div className="p-4">
                      <DataFieldGrid
                        columns={3}
                        fields={[
                          {
                            label: "Total Hours Worked",
                            value: contractEmployees.totalHoursWorked,
                            unit: contractEmployees.totalHoursWorkedUnit || "hours",
                          },
                          {
                            label: "Number of Recordable Incidents",
                            value: contractEmployees.recordableIncidents,
                            unit: contractEmployees.recordableIncidentsUnit,
                          },
                          {
                            label: "Number of Fatalities",
                            value: contractEmployees.fatalities,
                            unit: contractEmployees.fatalitiesUnit,
                          },
                          {
                            label: "Number of Near Misses",
                            value: contractEmployees.nearMisses,
                            unit: contractEmployees.nearMissesUnit,
                          },
                          {
                            label: "Avg. Safety Training Hours per Employee",
                            value: contractEmployees.safetyTrainingHours,
                            unit: contractEmployees.safetyTrainingHoursUnit || "hrs/yr",
                          },
                        ]}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </SubMetricSection>

          {/* ── Safety Management Systems ── */}
          <SubMetricSection
            title="SAFETY MANAGEMENT SYSTEMS"
            status={safetyStatus}
            documents={safetyFiles}
            onFileClick={onFileClick}
            onEdit={
              onEditSection &&
              (() => onEditSection("workforce-health-and-safety", "safety-management-systems"))
            }
            onClear={
              onClearSection &&
              (() =>
                onClearSection(
                  "humanCapital.workforceHealthAndSafety.riskAndOpportunityManagement.safetyManagementSystems"
                ))
            }
          >
            {!hasData(safetyMgmt) ? (
              <EmptyState />
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-xs text-gray-700 font-medium">
                    Safety Management System
                  </span>
                  <StatusDot status={safetyStatus} />
                </div>
                <DataFieldGrid
                  columns={2}
                  fields={[
                    {
                      label: "Executive Remuneration Linked to Safety KPIs?",
                      value:
                        safetyMgmt.executiveRemunerationLinked === true ||
                        safetyMgmt.executiveRemunerationLinked === "yes"
                          ? "Yes"
                          : safetyMgmt.executiveRemunerationLinked === false ||
                              safetyMgmt.executiveRemunerationLinked === "no"
                            ? "No"
                            : safetyMgmt.executiveRemunerationLinked,
                    },
                    {
                      label: "Description of Safety Management Systems",
                      value: safetyMgmt.safetyDescription,
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
