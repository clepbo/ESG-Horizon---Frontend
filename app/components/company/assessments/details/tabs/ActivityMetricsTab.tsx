import { Accordion } from "@/app/components/ui/accordion";
import { BarChart3 } from "lucide-react";
import { MetricAccordion } from "../MetricAccordion";
import { SubMetricSection } from "../SubMetricSection";
import { DataFieldGrid } from "../DataFieldGrid";
import { StatusDot } from "../StatusDot";
import { getFormSectionStatus } from "@/lib/assessmentStatusUtils";
import type { SectionStatus } from "@/lib/assessmentStatusUtils";
import type { FileWithMeta } from "../types";
import { extractFiles } from "../utils";

interface ActivityMetricsTabProps {
  assessmentData: any;
  submittedGroups: string[];
  onFileClick: (file: FileWithMeta) => void;
  onEditSection?: (view: string, step?: string) => void;
  onClearSection?: (path: string) => void;
}

function getOverallStatus(statuses: SectionStatus[]): SectionStatus {
  if (statuses.every((s) => s === "submitted")) return "submitted";
  if (statuses.some((s) => s === "submitted" || s === "in-progress")) return "in-progress";
  return "not-started";
}

export function ActivityMetricsTab({ assessmentData, submittedGroups, onFileClick, onEditSection, onClearSection }: ActivityMetricsTabProps) {
  const activityMetrics = assessmentData.foundationalData?.activityMetrics || {};
  const productionVolume = activityMetrics.productionVolume || {};
  const offshore = activityMetrics.assetPortfolio?.offshoreSites || {};
  const terrestrial = activityMetrics.assetPortfolio?.terrestrialSites || {};

  const pvStatus = getFormSectionStatus(submittedGroups, "foundationalData.activityMetrics.productionVolumes", productionVolume);
  const offshoreStatus = getFormSectionStatus(submittedGroups, "foundationalData.activityMetrics.offshoreSites", offshore);
  const terrestrialStatus = getFormSectionStatus(submittedGroups, "foundationalData.activityMetrics.terrestrialSites", terrestrial);
  const overallStatus = getOverallStatus([pvStatus, offshoreStatus, terrestrialStatus]);

  // Collect documents
  const pvFiles: FileWithMeta[] = [];
  const offshoreFiles: FileWithMeta[] = [];
  const terrestrialFiles: FileWithMeta[] = [];
  extractFiles(productionVolume, "Production Volumes", pvFiles);
  extractFiles(offshore, "Offshore Sites", offshoreFiles);
  extractFiles(terrestrial, "Terrestrial Sites", terrestrialFiles);

  return (
    <Accordion type="multiple" defaultValue={[]} className="space-y-4">
      <MetricAccordion
        value="activity-metrics"
        icon={BarChart3}
        title="Activity Metrics"
        description="3 form · IFRS: EM-EP-000.A – 000.C · Production data and portfolio"
        status={overallStatus}
      >
        {/* ── Production Volumes ── */}
        <SubMetricSection
          title="Production Volumes"
          status={pvStatus}
          onEdit={onEditSection && (() => onEditSection("activity-metrics", "production-volume"))}
          onClear={onClearSection && (() => onClearSection("foundationalData.activityMetrics.productionVolume"))}
          documents={pvFiles}
          onFileClick={onFileClick}
        >
          <div className="mb-4">
            <h5 className="text-sm font-semibold text-gray-700">Production Data</h5>
            <div className="flex items-center justify-between mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-xs text-gray-700 font-medium">Average Daily Production (Reporting Year)</span>
              <StatusDot status={pvStatus} />
            </div>
          </div>
          <DataFieldGrid
            columns={4}
            fields={[
              {
                label: "Crude Oil Production",
                value: productionVolume.crudeOilProductionVolume,
                unit: productionVolume.crudeOilProductionUnit || "Thousand barrels/day (kbl/day)",
              },
              {
                label: "Natural Gas Production",
                value: productionVolume.naturalGasProductionVolume,
                unit: productionVolume.naturalGasProductionUnit || "Million standard cubic feet/day (mmscfd)",
              },
              {
                label: "Synthetic Oil Production",
                value: productionVolume.syntheticOilProductionVolume,
                unit: productionVolume.syntheticOilProductionUnit || "Thousand barrels/day (kbl/day)",
              },
              {
                label: "Synthetic Gas Production",
                value: productionVolume.syntheticGasProductionVolume,
                unit: productionVolume.syntheticGasProductionUnit || "Million standard cubic feet/day (mmscfd)",
              },
            ]}
          />
        </SubMetricSection>

        {/* ── Offshore Sites ── */}
        <SubMetricSection
          title="Offshore Sites"
          status={offshoreStatus}
          onEdit={onEditSection && (() => onEditSection("activity-metrics", "offshore-sites"))}
          onClear={onClearSection && (() => onClearSection("foundationalData.activityMetrics.assetPortfolio.offshoreSites"))}
          documents={offshoreFiles}
          onFileClick={onFileClick}
        >
          <div className="mb-4">
            <h5 className="text-sm font-semibold text-gray-700">Asset Portfolio</h5>
            <div className="flex items-center justify-between mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-xs text-gray-700 font-medium">Offshore Site Breakdown</span>
              <StatusDot status={offshoreStatus} />
            </div>
          </div>
          <DataFieldGrid
            columns={4}
            fields={[
              { label: "Total Number of Offshore Sites (Calculated)", value: offshore.totalNumber, unit: "sites", highlight: true },
              { label: "Number of Production Platforms", value: offshore.productionPlatforms },
              { label: "Number of FPSOs", value: offshore.FPSOs },
              { label: "Number of Other Offshore Sites (FSOs, Drilling Rigs, SBMs)", value: offshore.otherSites },
            ]}
          />
        </SubMetricSection>

        {/* ── Terrestrial Sites ── */}
        <SubMetricSection
          title="Terrestrial Sites"
          status={terrestrialStatus}
          onEdit={onEditSection && (() => onEditSection("activity-metrics", "terrestrial-sites"))}
          onClear={onClearSection && (() => onClearSection("foundationalData.activityMetrics.assetPortfolio.terrestrialSites"))}
          documents={terrestrialFiles}
          onFileClick={onFileClick}
        >
          <div className="mb-4">
            <h5 className="text-sm font-semibold text-gray-700">Asset Portfolio</h5>
            <div className="flex items-center justify-between mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-xs text-gray-700 font-medium">Terrestrial Site Breakdown</span>
              <StatusDot status={terrestrialStatus} />
            </div>
          </div>
          <DataFieldGrid
            columns={4}
            fields={[
              { label: "Total Number of Terrestrial Sites (Calculated)", value: terrestrial.totalNumber, unit: "sites", highlight: true },
              { label: "Number of Flow Stations", value: terrestrial.flowStations },
              { label: "Number of Gas Processing Plants", value: terrestrial.gasProcessingPlants },
              { label: "Number of Other Terrestrial Sites (Terminals, Logistics Bases)", value: terrestrial.otherSites },
            ]}
          />
        </SubMetricSection>
      </MetricAccordion>
    </Accordion>
  );
}
