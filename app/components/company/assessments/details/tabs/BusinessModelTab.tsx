import { Accordion } from "@/app/components/ui/accordion";
import { Lightbulb, Scale } from "lucide-react";
import { MetricAccordion } from "../MetricAccordion";
import { SubMetricSection } from "../SubMetricSection";
import { DataFieldGrid } from "../DataFieldGrid";
import { EmptyState } from "../EmptyState";
import { StatusDot } from "../StatusDot";
import { getFormSectionStatus } from "@/lib/assessmentStatusUtils";
import type { SectionStatus } from "@/lib/assessmentStatusUtils";
import type { FileWithMeta } from "../types";
import { extractFiles } from "../utils";

interface BusinessModelTabProps {
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

export function BusinessModelTab({ assessmentData, submittedGroups, onFileClick }: BusinessModelTabProps) {
  const biz = assessmentData.businessInnovation || {};
  const reserves = biz.reservesValuationAndCapitalExpenditures || {};
  const ethics = biz.businessEthicsAndTransparency || {};

  // Reserves subtopics
  const carbonPricing = reserves.reservesSensitivityToCarbonPricing || {};
  const embeddedCarbon = reserves.embeddedCarbonInReserves || {};
  const renewableEnergy = reserves.renewableEnergyInvestment || {};
  const capexStrategy = reserves.capitalExpenditureStrategy || {};

  // Ethics subtopics
  const corruptionRisk = ethics.reservesInCountriesWithHighCorruptionRisk || ethics.reservesCountriesCorruptionRisk || {};
  const antiCorruption = ethics.antiCorruptionManagementSystem || {};

  // Status
  const carbonStatus = getFormSectionStatus(submittedGroups, "businessModel.reservesValuation.reservesSensitivity", carbonPricing);
  const embeddedStatus = getFormSectionStatus(submittedGroups, "businessModel.reservesValuation.embeddedCarbon", embeddedCarbon);
  const renewableStatus = getFormSectionStatus(submittedGroups, "businessModel.reservesValuation.renewableEnergyInvestment", renewableEnergy);
  const capexStatus = getFormSectionStatus(submittedGroups, "businessModel.reservesValuation.capitalExpenditureStrategy", capexStrategy);
  const corruptionStatus = getFormSectionStatus(submittedGroups, "businessModel.businessEthics.reservesCountriesCorruptionRisk", corruptionRisk);
  const antiCorruptionStatus = getFormSectionStatus(submittedGroups, "businessModel.businessEthics.antiCorruptionManagement", antiCorruption);

  const reservesStatuses: SectionStatus[] = [carbonStatus, embeddedStatus, renewableStatus, capexStatus];
  const reservesStatus: SectionStatus = reservesStatuses.every((s) => s === "submitted")
    ? "submitted"
    : reservesStatuses.some((s) => s !== "not-started")
    ? "in-progress"
    : "not-started";

  const ethicsStatuses: SectionStatus[] = [corruptionStatus, antiCorruptionStatus];
  const ethicsStatus: SectionStatus = ethicsStatuses.every((s) => s === "submitted")
    ? "submitted"
    : ethicsStatuses.some((s) => s !== "not-started")
    ? "in-progress"
    : "not-started";

  // Docs
  const carbonFiles: FileWithMeta[] = [];
  const embeddedFiles: FileWithMeta[] = [];
  const renewableFiles: FileWithMeta[] = [];
  const capexFiles: FileWithMeta[] = [];
  const corruptionFiles: FileWithMeta[] = [];
  const antiCorruptionFiles: FileWithMeta[] = [];
  extractFiles(carbonPricing, "Carbon Pricing", carbonFiles);
  extractFiles(embeddedCarbon, "Embedded Carbon", embeddedFiles);
  extractFiles(renewableEnergy, "Renewable Energy", renewableFiles);
  extractFiles(capexStrategy, "CapEx Strategy", capexFiles);
  extractFiles(corruptionRisk, "Corruption Risk", corruptionFiles);
  extractFiles(antiCorruption, "Anti-Corruption", antiCorruptionFiles);

  return (
    <Accordion type="multiple" defaultValue={[]} className="space-y-4">
      {/* ══════════════════ RESERVES VALUATION & CAPITAL EXPENDITURES ══════════════════ */}
      <MetricAccordion
        value="reserves-valuation"
        icon={Lightbulb}
        title="Reserves Valuation & Capital Expenditures"
        description="4 form · IFRS: EM-EP-420a.1 – 420a.4"
        status={reservesStatus}
      >
        <div className="space-y-6">
          {/* ── Reserves Sensitivity to Carbon Pricing ── */}
          <SubMetricSection
            title="Reserves Sensitivity to Carbon Pricing"
            status={carbonStatus}
            documents={carbonFiles}
            onFileClick={onFileClick}
            onEdit={() => {}}
            onClear={() => {}}
          >
            {!hasData(carbonPricing) ? (
              <EmptyState />
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-xs text-gray-700 font-medium">Carbon Pricing Sensitivity</span>
                  <StatusDot status={carbonStatus} />
                </div>
                <DataFieldGrid
                  columns={3}
                  fields={[
                    {
                      label: `Carbon Price Scenario Used (${carbonPricing.carbonPriceScenarioUnit || "$/tonne CO₂e"})`,
                      value: carbonPricing.carbonPriceScenario,
                      unit: carbonPricing.carbonPriceScenarioUnit || "$/tonne CO₂e",
                    },
                    {
                      label: `Estimated % Decrease in Proved Oil Reserves`,
                      value: carbonPricing.percentageDecrease,
                      unit: carbonPricing.percentageDecreaseUnit || "%",
                    },
                    {
                      label: `Estimated Decrease in Volume (${carbonPricing.estimatedDecreaseUnit || "MMbbls"})`,
                      value: carbonPricing.estimatedDecrease,
                      unit: carbonPricing.estimatedDecreaseUnit || "MMbbls",
                    },
                  ]}
                />
              </div>
            )}
          </SubMetricSection>

          {/* ── Embedded Carbon in Reserves ── */}
          <SubMetricSection
            title="Embedded Carbon in Reserves"
            status={embeddedStatus}
            documents={embeddedFiles}
            onFileClick={onFileClick}
            onEdit={() => {}}
            onClear={() => {}}
          >
            {!hasData(embeddedCarbon) ? (
              <EmptyState />
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-xs text-gray-700 font-medium">Embedded Carbon</span>
                  <StatusDot status={embeddedStatus} />
                </div>
                <DataFieldGrid
                  columns={2}
                  fields={[
                    {
                      label: `Total Proved Reserves (${embeddedCarbon.totalProvedReservesUnit || "BOE"})`,
                      value: embeddedCarbon.totalProvedReserves,
                      unit: embeddedCarbon.totalProvedReservesUnit || "BOE",
                    },
                    {
                      label: `Estimated Embedded CO₂ Emissions (${embeddedCarbon.estimatedEmbeddedEmissionsUnit || "MtCO₂e"})`,
                      value: embeddedCarbon.estimatedEmbeddedEmissions,
                      unit: embeddedCarbon.estimatedEmbeddedEmissionsUnit || "MtCO₂e",
                      highlight: true,
                    },
                  ]}
                />
              </div>
            )}
          </SubMetricSection>

          {/* ── Renewable Energy Investment ── */}
          <SubMetricSection
            title="Renewable Energy Investment"
            status={renewableStatus}
            documents={renewableFiles}
            onFileClick={onFileClick}
            onEdit={() => {}}
            onClear={() => {}}
          >
            {!hasData(renewableEnergy) ? (
              <EmptyState />
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-xs text-gray-700 font-medium">Renewable Energy Investment</span>
                  <StatusDot status={renewableStatus} />
                </div>
                <DataFieldGrid
                  columns={3}
                  fields={[
                    {
                      label: "Investment in Renewable Energy",
                      value: renewableEnergy.investmentAmount,
                      unit: renewableEnergy.investmentAmountUnit,
                    },
                    {
                      label: "Revenue from Renewable Energy Sales",
                      value: renewableEnergy.revenueAmount,
                      unit: renewableEnergy.revenueAmountUnit,
                    },
                    {
                      label: "Project Description",
                      value: renewableEnergy.projectDescription,
                    },
                  ]}
                />
              </div>
            )}
          </SubMetricSection>

          {/* ── Capital Expenditure Strategy ── */}
          <SubMetricSection
            title="Capital Expenditure Strategy"
            status={capexStatus}
            documents={capexFiles}
            onFileClick={onFileClick}
            onEdit={() => {}}
            onClear={() => {}}
          >
            {!hasData(capexStrategy) ? (
              <EmptyState />
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-xs text-gray-700 font-medium">Capital Expenditure Strategy</span>
                  <StatusDot status={capexStatus} />
                </div>
                <DataFieldGrid
                  columns={2}
                  fields={[
                    {
                      label: "% CAPEX Allocated to Gas or Renewable Projects",
                      value: capexStrategy.capexPercentage,
                      unit: "%",
                    },
                    {
                      label: "Discussion of CAPEX Strategy",
                      value: capexStrategy.capexDiscussion,
                    },
                  ]}
                />
              </div>
            )}
          </SubMetricSection>
        </div>
      </MetricAccordion>

      {/* ══════════════════ BUSINESS ETHICS & TRANSPARENCY ══════════════════ */}
      <MetricAccordion
        value="business-ethics"
        icon={Scale}
        title="Business Ethics & Transparency"
        description="2 form · IFRS: EM-EP-510a.1, 510a.2"
        status={ethicsStatus}
      >
        <div className="space-y-6">
          {/* ── Reserves in Countries with High Corruption Risk ── */}
          <SubMetricSection
            title="Reserves in Countries with High Corruption Risk"
            status={corruptionStatus}
            documents={corruptionFiles}
            onFileClick={onFileClick}
            onEdit={() => {}}
            onClear={() => {}}
          >
            {!hasData(corruptionRisk) ? (
              <EmptyState />
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-xs text-gray-700 font-medium">Reserves in High-Risk Countries</span>
                  <StatusDot status={corruptionStatus} />
                </div>
                <DataFieldGrid
                  columns={4}
                  fields={[
                    {
                      label: `Total Proved Reserves (${corruptionRisk.totalProvedReservesUnit || "MMbbls"})`,
                      value: corruptionRisk.totalProvedReserves,
                      unit: corruptionRisk.totalProvedReservesUnit || "MMbbls",
                    },
                    {
                      label: `Proved Reserves in High-Risk Countries (${corruptionRisk.provedReservesHighRiskUnit || "MMbbls"})`,
                      value: corruptionRisk.provedReservesHighRisk,
                      unit: corruptionRisk.provedReservesHighRiskUnit || "MMbbls",
                      highlight: true,
                    },
                    {
                      label: `Total Probable Reserves (${corruptionRisk.totalProbableReservesUnit || "MMbbls"})`,
                      value: corruptionRisk.totalProbableReserves,
                      unit: corruptionRisk.totalProbableReservesUnit || "MMbbls",
                    },
                    {
                      label: `Probable Reserves in High-Risk Countries (${corruptionRisk.probableReservesHighRiskUnit || "MMbbls"})`,
                      value: corruptionRisk.probableReservesHighRisk,
                      unit: corruptionRisk.probableReservesHighRiskUnit || "MMbbls",
                      highlight: true,
                    },
                  ]}
                />
              </div>
            )}
          </SubMetricSection>

          {/* ── Anti-Corruption Management System ── */}
          <SubMetricSection
            title="Anti-Corruption Management System"
            status={antiCorruptionStatus}
            documents={antiCorruptionFiles}
            onFileClick={onFileClick}
            onEdit={() => {}}
            onClear={() => {}}
          >
            {!hasData(antiCorruption) ? (
              <EmptyState />
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-xs text-gray-700 font-medium">Anti-Corruption Management System</span>
                  <StatusDot status={antiCorruptionStatus} />
                </div>
                <DataFieldGrid
                  columns={2}
                  fields={[
                    {
                      label: "Anonymous Whistleblower Hotline (Independent Third Party)?",
                      value:
                        antiCorruption.hasWhistleblowerHotline === true || antiCorruption.hasWhistleblowerHotline === "yes"
                          ? "Yes"
                          : antiCorruption.hasWhistleblowerHotline === false || antiCorruption.hasWhistleblowerHotline === "no"
                          ? "No"
                          : antiCorruption.hasWhistleblowerHotline,
                    },
                    {
                      label: "Description of Anti-Corruption Management System",
                      value: antiCorruption.systemDescription,
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
