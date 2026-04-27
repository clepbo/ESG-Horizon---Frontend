"use client";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/app/components/ui/accordion";
import { Leaf, Wind, Droplets, Sprout } from "lucide-react";
import { formatNumberShort } from "@/lib/numberFormat";

import { MetricAccordion } from "../MetricAccordion";
import { SubMetricSection } from "../SubMetricSection";
import { DataFieldGrid } from "../DataFieldGrid";
import { EmptyState } from "../EmptyState";
import { SourceEntryCard } from "../SourceEntryCard";
import { StatusDot } from "../StatusDot";
import type { FileWithMeta } from "../types";
import { extractFiles } from "../utils";
import { getFormSectionStatus } from "@/lib/assessmentStatusUtils";
import type { SectionStatus } from "@/lib/assessmentStatusUtils";

interface EnvironmentalTabProps {
  assessmentData: any;
  submittedGroups?: string[];
  onFileClick: (file: FileWithMeta) => void;
  onEditSection?: (view: string, step?: string) => void;
  onClearSection?: (path: string) => void;
}

/* ─────────────────────── helpers ─────────────────────── */

function hasData(obj: any) {
  if (!obj) return false;
  return Object.keys(obj).some((k) => {
    const v = obj[k];
    return (
      v !== undefined &&
      v !== null &&
      v !== "" &&
      !["filesAndLinks", "files", "additionalFields", "calculated", "percentages"].includes(k)
    );
  });
}

/* ─────────────────────── DataEntryCard ─────────────────────── */

interface DataEntryCardField {
  label: string;
  value?: string | number | null;
  unit?: string;
  highlight?: boolean;
}

function DataEntryCard({
  number,
  title,
  fields,
  status,
}: {
  number: string;
  title: string;
  fields: DataEntryCardField[];
  status?: SectionStatus;
}) {
  const effectiveStatus: SectionStatus = status ?? "in-progress";
  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <span className="text-sm font-semibold text-gray-800">
          {number} {title}
        </span>
        <StatusDot status={effectiveStatus} />
      </div>
      <div className="p-4 flex flex-wrap gap-3">
        {fields.map((f, i) => {
          // Form fields persist as strings ("150000"), so a strict
          // typeof === "number" check would skip formatting and render the
          // raw string. Detect numeric-ish values (after stripping any
          // existing commas) the same way DataField/DataList do, so every
          // numeric value gets the thousands separators consistently.
          const isNumericLike =
            f.value != null && f.value !== "" && !isNaN(Number(String(f.value).replace(/,/g, "")));
          const displayVal =
            f.value != null && f.value !== ""
              ? `${isNumericLike ? formatNumberShort(f.value) : f.value}${f.unit ? ` ${f.unit}` : ""}`
              : undefined;
          return f.highlight ? (
            <div
              key={i}
              className="flex flex-col gap-1 p-2.5 rounded-md border border-teal-200 bg-teal-50/50 min-w-[160px] flex-1"
            >
              <span className="text-xs text-teal-700 font-semibold">{f.label}</span>
              <span className="text-sm font-bold text-teal-800">{displayVal || "—"}</span>
            </div>
          ) : (
            <div
              key={i}
              className="flex flex-col gap-1 p-2.5 rounded-md border border-gray-100 bg-gray-50/50 min-w-[160px] flex-1"
            >
              <span className="text-xs text-gray-600 font-semibold">{f.label}</span>
              <span className="text-sm font-bold text-gray-900">{displayVal || "—"}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────── MAIN COMPONENT ─────────────────────── */

export function EnvironmentalTab({
  assessmentData,
  submittedGroups = [],
  onFileClick,
  onEditSection,
  onClearSection,
}: EnvironmentalTabProps) {
  const env = assessmentData.environment || {};
  const ghg = env.ghg || {};
  const scope1 = ghg.scope1 || {};
  const scope2 = ghg.scope2 || {};
  const scope3 = ghg.scope3 || {};

  // Totals — backend stores at ghg.scopeX.totalEmission
  const scope1Total = scope1.totalEmission ?? scope1.calculated?.totalScope1Emission ?? 0;
  const scope2Total = scope2.totalEmission ?? scope2.calculated?.totalScope2Emission ?? 0;
  const scope3Total = scope3.totalEmission ?? scope3.calculated?.totalScope3Emission ?? 0;
  const totalEmission =
    assessmentData.totalEmission ?? env.totalEmission ?? scope1Total + scope2Total + scope3Total;

  // GHG incomplete count — count major sub-sections with no data
  const ghgHasStationary = !!(
    scope1.stationarySources?.electricityHeat?.dieselGenerators?.length ||
    scope1.stationarySources?.electricityHeat?.gasTurbines?.length ||
    scope1.stationarySources?.industrialProcesses?.boilerFurnaces?.length ||
    scope1.stationarySources?.oilGasOperations?.onShoreProduction?.length
  );
  const ghgHasMobile = !!(
    scope1.mobileSources?.roadTransport?.vehicleFleet?.length ||
    scope1.mobileSources?.roadTransport?.carsBuses?.length ||
    scope1.mobileSources?.vehicleEquipment?.forkliftFuelType?.length ||
    scope1.mobileSources?.vehicleEquipment?.heavyDutyFuelType?.length ||
    scope1.mobileSources?.vehicleEquipment?.tractorFuelType?.length ||
    scope1.mobileSources?.marineAviation?.air?.length ||
    scope1.mobileSources?.marineAviation?.marine?.length
  );
  const ghgHasProcess = !!(
    hasData(scope1.processEmissions?.cementManufacturing) ||
    hasData(scope1.processEmissions?.gasFlaring) ||
    hasData(scope1.fugitiveEmissions?.ventingNaturalGas) ||
    hasData(scope1.fugitiveEmissions?.hfcLeaks)
  );
  const ghgHasLocation = !!(
    hasData(scope2.locationBased?.electricity) ||
    hasData(scope2.locationBased?.cooling) ||
    hasData(scope2.locationBased?.heating) ||
    hasData(scope2.locationBased?.steam)
  );
  const ghgHasMarket = !!(
    hasData(scope2.marketBased?.ipps) ||
    hasData(scope2.marketBased?.eac) ||
    hasData(scope2.marketBased?.residual) ||
    hasData(scope2.marketBased?.coolingSteam)
  );
  const ghgHasUpstream = hasData(scope3.upstream || {});
  const ghgHasDownstream = hasData(scope3.downstream || {});

  const ghgSubAreas = [
    ghgHasStationary,
    ghgHasMobile,
    ghgHasProcess,
    ghgHasLocation,
    ghgHasMarket,
    ghgHasUpstream,
    ghgHasDownstream,
  ];
  const ghgIncompleteCount = ghgSubAreas.filter((v) => !v).length;

  const GHG_KEYS = [
    "environment.ghg.scope1.stationarySources",
    "environment.ghg.scope1.mobileSources",
    "environment.ghg.scope1.processEmissions",
    "environment.ghg.scope1.fugitiveEmissions",
    "environment.ghg.scope2.locationBased",
    "environment.ghg.scope2.marketBased",
    "environment.ghg.scope3.upstream",
    "environment.ghg.scope3.downstream",
  ];
  const ghgSubmittedCount = GHG_KEYS.filter((k) => submittedGroups.includes(k)).length;
  const ghgStatus: SectionStatus =
    ghgSubmittedCount === GHG_KEYS.length
      ? "submitted"
      : ghgSubmittedCount > 0 || ghgSubAreas.some(Boolean)
        ? "in-progress"
        : "not-started";

  return (
    <Accordion type="multiple" defaultValue={[]} className="space-y-4">
      {/* ══════════════════ GHG EMISSIONS ══════════════════ */}
      <GHGSection
        scope1={scope1}
        scope2={scope2}
        scope3={scope3}
        scope1Total={scope1Total}
        scope2Total={scope2Total}
        scope3Total={scope3Total}
        totalEmission={totalEmission}
        status={ghgStatus}
        submittedGroups={submittedGroups}
        incompleteCount={ghgIncompleteCount}
        onFileClick={onFileClick}
        onEditSection={onEditSection}
        onClearSection={onClearSection}
      />

      {/* ══════════════════ AIR QUALITY ══════════════════ */}
      <AirQualitySection
        env={env}
        submittedGroups={submittedGroups}
        onFileClick={onFileClick}
        onEditSection={onEditSection}
        onClearSection={onClearSection}
      />

      {/* ══════════════════ WATER & WASTEWATER ══════════════════ */}
      <WaterManagementSection
        env={env}
        submittedGroups={submittedGroups}
        onFileClick={onFileClick}
        onEditSection={onEditSection}
        onClearSection={onClearSection}
      />

      {/* ══════════════════ BIODIVERSITY ══════════════════ */}
      <BiodiversitySection
        env={env}
        submittedGroups={submittedGroups}
        onFileClick={onFileClick}
        onEditSection={onEditSection}
        onClearSection={onClearSection}
      />
    </Accordion>
  );
}

/* ═══════════════════════════════════════════════════════════════
   GHG EMISSIONS SECTION
   ═══════════════════════════════════════════════════════════════ */

function ScopeHeader({
  label,
  description,
  total,
}: {
  label: string;
  description: string;
  total: number;
}) {
  return (
    <div className="flex items-center gap-3 flex-1 min-w-0">
      <span className="shrink-0 text-[11px] font-bold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full tracking-wide">
        {label}
      </span>
      <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide truncate">
        {description}
      </span>
      <span className="ml-auto shrink-0 text-sm font-bold text-gray-800 pr-2">
        {formatNumberShort(total)} tCO₂e
      </span>
    </div>
  );
}

function GHGSection({
  scope1,
  scope2,
  scope3,
  scope1Total,
  scope2Total,
  scope3Total,
  totalEmission,
  status,
  submittedGroups,
  incompleteCount,
  onFileClick,
  onEditSection,
  onClearSection,
}: {
  scope1: any;
  scope2: any;
  scope3: any;
  scope1Total: number;
  scope2Total: number;
  scope3Total: number;
  totalEmission: number;
  status: SectionStatus;
  submittedGroups: string[];
  incompleteCount: number;
  onFileClick: (f: FileWithMeta) => void;
  onEditSection?: (view: string, step?: string) => void;
  onClearSection?: (path: string) => void;
}) {
  return (
    <MetricAccordion
      value="ghg-emissions"
      icon={Leaf}
      title="Greenhouse Gas Emissions"
      description="Scope 1, 2, and 3 · 12 sub-metrics · IFRS:EM-EP-110a"
      badge={`${formatNumberShort(totalEmission)} tCO2e`}
      status={status}
      incompleteCount={incompleteCount > 0 ? incompleteCount : undefined}
    >
      <Accordion
        type="multiple"
        defaultValue={["scope1", "scope2", "scope3"]}
        className="space-y-4"
      >
        {/* ── SCOPE 1 ── */}
        <AccordionItem
          value="scope1"
          className="border border-gray-200 rounded-xl overflow-hidden bg-white"
        >
          <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-gray-50 [&[data-state=open]>svg]:rotate-180">
            <ScopeHeader label="SCOPE 1" description="Direct Emission" total={scope1Total} />
          </AccordionTrigger>
          <AccordionContent className="px-5 pb-5 pt-0">
            <div className="space-y-6">
              <Scope1Content
                scope1={scope1}
                submittedGroups={submittedGroups}
                onFileClick={onFileClick}
                onEditSection={onEditSection}
                onClearSection={onClearSection}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ── SCOPE 2 ── */}
        <AccordionItem
          value="scope2"
          className="border border-gray-200 rounded-xl overflow-hidden bg-white"
        >
          <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-gray-50 [&[data-state=open]>svg]:rotate-180">
            <ScopeHeader
              label="SCOPE 2"
              description="Indirect Emission (Location / Market-Based)"
              total={scope2Total}
            />
          </AccordionTrigger>
          <AccordionContent className="px-5 pb-5 pt-0">
            <div className="space-y-6">
              <Scope2Content
                scope2={scope2}
                submittedGroups={submittedGroups}
                onFileClick={onFileClick}
                onEditSection={onEditSection}
                onClearSection={onClearSection}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ── SCOPE 3 ── */}
        <AccordionItem
          value="scope3"
          className="border border-gray-200 rounded-xl overflow-hidden bg-white"
        >
          <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-gray-50 [&[data-state=open]>svg]:rotate-180">
            <ScopeHeader
              label="SCOPE 3"
              description="Other Indirect Emission"
              total={scope3Total}
            />
          </AccordionTrigger>
          <AccordionContent className="px-5 pb-5 pt-0">
            <div className="space-y-6">
              <Scope3Content
                scope3={scope3}
                submittedGroups={submittedGroups}
                onFileClick={onFileClick}
                onEditSection={onEditSection}
                onClearSection={onClearSection}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </MetricAccordion>
  );
}

/* ─── Scope 1 ─── */

function Scope1Content({
  scope1,
  submittedGroups,
  onFileClick,
  onEditSection,
  onClearSection,
}: {
  scope1: any;
  submittedGroups: string[];
  onFileClick: (f: FileWithMeta) => void;
  onEditSection?: (view: string, step?: string) => void;
  onClearSection?: (path: string) => void;
}) {
  const stationary = scope1.stationarySources || {};
  const mobile = scope1.mobileSources || {};
  const process = scope1.processEmissions || {};
  const fugitive = scope1.fugitiveEmissions || {};

  // Stationary source arrays
  const dieselGens = stationary.electricityHeat?.dieselGenerators || [];
  const gasTurbines = stationary.electricityHeat?.gasTurbines || [];
  const boilers = stationary.industrialProcesses?.boilerFurnaces || [];
  const oilGas = stationary.oilGasOperations?.onShoreProduction || [];

  // Mobile source arrays
  const vehicleFleet = mobile.roadTransport?.vehicleFleet || [];
  const carsBuses = mobile.roadTransport?.carsBuses || [];
  const forklifts = mobile.vehicleEquipment?.forkliftFuelType || [];
  const heavyDuty = mobile.vehicleEquipment?.heavyDutyFuelType || [];
  const tractors = mobile.vehicleEquipment?.tractorFuelType || [];
  const air = mobile.marineAviation?.air || [];
  const marine = mobile.marineAviation?.marine || [];

  // Files
  const stationaryFiles: FileWithMeta[] = [];
  extractFiles(stationary.electricityHeat, "Stationary - Electricity & Heat", stationaryFiles);
  extractFiles(stationary.industrialProcesses, "Stationary - Industrial", stationaryFiles);
  extractFiles(stationary.oilGasOperations, "Stationary - Oil & Gas", stationaryFiles);

  const mobileFiles: FileWithMeta[] = [];
  extractFiles(mobile.roadTransport, "Mobile - Road Transport", mobileFiles);
  extractFiles(mobile.vehicleEquipment, "Mobile - Vehicle Equipment", mobileFiles);
  extractFiles(mobile.marineAviation, "Mobile - Marine/Aviation", mobileFiles);

  const processEmissionFiles: FileWithMeta[] = [];
  extractFiles(process.cementManufacturing, "Process - Cement", processEmissionFiles);
  extractFiles(process.gasFlaring, "Process - Gas Flaring", processEmissionFiles);

  const fugitiveFiles: FileWithMeta[] = [];
  extractFiles(fugitive.ventingNaturalGas, "Fugitive - Venting", fugitiveFiles);
  extractFiles(fugitive.hfcLeaks, "Fugitive - HFC Leaks", fugitiveFiles);

  const hasStationary =
    dieselGens.length > 0 || gasTurbines.length > 0 || boilers.length > 0 || oilGas.length > 0;
  const hasMobile =
    vehicleFleet.length > 0 ||
    carsBuses.length > 0 ||
    forklifts.length > 0 ||
    heavyDuty.length > 0 ||
    tractors.length > 0 ||
    air.length > 0 ||
    marine.length > 0;

  const stationaryStatus = getFormSectionStatus(
    submittedGroups,
    "environment.ghg.scope1.stationarySources",
    stationary
  );
  const mobileStatus = getFormSectionStatus(
    submittedGroups,
    "environment.ghg.scope1.mobileSources",
    mobile
  );
  const processStatus = getFormSectionStatus(
    submittedGroups,
    "environment.ghg.scope1.processEmissions",
    process
  );
  const fugitiveStatus = getFormSectionStatus(
    submittedGroups,
    "environment.ghg.scope1.fugitiveEmissions",
    fugitive
  );

  return (
    <>
      {/* ── STATIONARY SOURCES ── */}
      <SubMetricSection
        title="STATIONARY SOURCES"
        status={stationaryStatus}
        documents={stationaryFiles}
        onFileClick={onFileClick}
        onEdit={onEditSection && (() => onEditSection("ghg-stationary-sources"))}
        onClear={
          onClearSection && (() => onClearSection("environment.ghg.scope1.stationarySources"))
        }
      >
        {!hasStationary ? (
          <EmptyState />
        ) : (
          <div className="space-y-6">
            {/* 1. Electricity & Heat Generation */}
            {(dieselGens.length > 0 || gasTurbines.length > 0) && (
              <div className="space-y-3">
                <h5 className="text-sm font-semibold text-gray-700">
                  1. Electricity &amp; Heat Generation
                </h5>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {dieselGens.map((item: any, i: number) => (
                    <SourceEntryCard
                      key={item.id || `dg-${i}`}
                      number={`1.${i + 1}`}
                      title="Fuel-Powered Generators / Engines"
                      data={item}
                      status={stationaryStatus === "submitted" ? "submitted" : undefined}
                    />
                  ))}
                  {gasTurbines.map((item: any, i: number) => (
                    <SourceEntryCard
                      key={item.id || `gt-${i}`}
                      number={`1.${dieselGens.length + i + 1}`}
                      title="Gas-Fired Turbines at Power Plants"
                      data={item}
                      status={stationaryStatus === "submitted" ? "submitted" : undefined}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 2. Industrial Processes */}
            {boilers.length > 0 && (
              <div className="space-y-3">
                <h5 className="text-sm font-semibold text-gray-700">2. Industrial Processes</h5>
                <div className="space-y-3">
                  {boilers.map((item: any, i: number) => (
                    <SourceEntryCard
                      key={item.id || `bf-${i}`}
                      number={`2.${i + 1}`}
                      title="Boilers & Furnaces"
                      data={item}
                      status={stationaryStatus === "submitted" ? "submitted" : undefined}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 3. Oil & Gas Operations */}
            {oilGas.length > 0 && (
              <div className="space-y-3">
                <h5 className="text-sm font-semibold text-gray-700">3. Oil &amp; Gas Operations</h5>
                <div className="space-y-3">
                  {oilGas.map((item: any, i: number) => (
                    <SourceEntryCard
                      key={item.id || `og-${i}`}
                      number={`3.${i + 1}`}
                      title="Heaters & Boilers (Production Facilities, Terminals, Gas Processing Plants)"
                      data={item}
                      status={stationaryStatus === "submitted" ? "submitted" : undefined}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </SubMetricSection>

      {/* ── MOBILE SOURCES ── */}
      <SubMetricSection
        title="MOBILE SOURCES"
        status={mobileStatus}
        documents={mobileFiles}
        onFileClick={onFileClick}
        onEdit={onEditSection && (() => onEditSection("ghg-mobile-sources"))}
        onClear={onClearSection && (() => onClearSection("environment.ghg.scope1.mobileSources"))}
      >
        {!hasMobile ? (
          <EmptyState />
        ) : (
          <div className="space-y-6">
            {/* 1. Road Transportation */}
            {(vehicleFleet.length > 0 || carsBuses.length > 0) && (
              <div className="space-y-3">
                <h5 className="text-sm font-semibold text-gray-700">1. Road Transportation</h5>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {vehicleFleet.map((item: any, i: number) => (
                    <SourceEntryCard
                      key={item.id || `vf-${i}`}
                      number={`1.${i + 1}`}
                      title="Fleet Vehicles for Product Distribution & Logistics"
                      data={item}
                      status={mobileStatus === "submitted" ? "submitted" : undefined}
                    />
                  ))}
                  {carsBuses.map((item: any, i: number) => (
                    <SourceEntryCard
                      key={item.id || `cb-${i}`}
                      number={`1.${vehicleFleet.length + i + 1}`}
                      title="Company Cars & Buses – Employee Transportation"
                      data={item}
                      status={mobileStatus === "submitted" ? "submitted" : undefined}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 2. Off-Road Vehicles & Equipment */}
            {(forklifts.length > 0 || heavyDuty.length > 0 || tractors.length > 0) && (
              <div className="space-y-3">
                <h5 className="text-sm font-semibold text-gray-700">
                  2. Off-Road Vehicles &amp; Equipment
                </h5>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {forklifts.map((item: any, i: number) => (
                    <SourceEntryCard
                      key={item.id || `fl-${i}`}
                      number={`2.${i + 1}`}
                      title="Forklifts & Machinery"
                      data={item}
                      status={mobileStatus === "submitted" ? "submitted" : undefined}
                    />
                  ))}
                  {heavyDuty.map((item: any, i: number) => (
                    <SourceEntryCard
                      key={item.id || `hd-${i}`}
                      number={`2.${forklifts.length + i + 1}`}
                      title="Heavy-Duty Vehicles & Equipment"
                      data={item}
                      status={mobileStatus === "submitted" ? "submitted" : undefined}
                    />
                  ))}
                  {tractors.map((item: any, i: number) => (
                    <SourceEntryCard
                      key={item.id || `tr-${i}`}
                      number={`2.${forklifts.length + heavyDuty.length + i + 1}`}
                      title="Tractors & Machinery"
                      data={item}
                      status={mobileStatus === "submitted" ? "submitted" : undefined}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 3. Marine & Aviation */}
            {(air.length > 0 || marine.length > 0) && (
              <div className="space-y-3">
                <h5 className="text-sm font-semibold text-gray-700">3. Marine &amp; Aviation</h5>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {air.map((item: any, i: number) => (
                    <SourceEntryCard
                      key={item.id || `air-${i}`}
                      number={`3.${i + 1}`}
                      title="Helicopters – Personnel & Equipment to Offshore Platforms"
                      data={item}
                      status={mobileStatus === "submitted" ? "submitted" : undefined}
                    />
                  ))}
                  {marine.map((item: any, i: number) => (
                    <SourceEntryCard
                      key={item.id || `mar-${i}`}
                      number={`3.${air.length + i + 1}`}
                      title="Company-Owned Boats & Vessels"
                      data={item}
                      status={mobileStatus === "submitted" ? "submitted" : undefined}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </SubMetricSection>

      {/* ── PROCESS EMISSIONS ── */}
      <SubMetricSection
        title="Process Emissions"
        status={processStatus}
        documents={processEmissionFiles}
        onFileClick={onFileClick}
        onEdit={onEditSection && (() => onEditSection("ghg-process-emissions"))}
        onClear={
          onClearSection && (() => onClearSection("environment.ghg.scope1.processEmissions"))
        }
      >
        {!hasData(process.cementManufacturing) && !hasData(process.gasFlaring) ? (
          <EmptyState />
        ) : (
          <div className="space-y-6">
            {hasData(process.cementManufacturing) && (
              <div className="space-y-3">
                <h5 className="text-sm font-semibold text-gray-700">1. Cement Manufacturing</h5>
                <DataEntryCard
                  number="1.1"
                  title="Cement Manufacturing (Calcination of Limestone)"
                  status={
                    processStatus === "submitted"
                      ? "submitted"
                      : process.cementManufacturing?.calculated?.emission != null
                        ? "submitted"
                        : "in-progress"
                  }
                  fields={[
                    {
                      label: "Quantity / Mass of Cement Produced",
                      value: process.cementManufacturing?.cementQuantity,
                    },
                    { label: "Unit", value: "Metric Tonnes" },
                    {
                      label: "Process",
                      value: "Clinker Production via Calcination (CaCO₃ → CaO + CO₂)",
                    },
                    {
                      label: "Emission Factor",
                      value: process.cementManufacturing?.emissionFactor,
                    },
                    {
                      label: "Computed Emissions",
                      value: process.cementManufacturing?.calculated?.emission,
                      unit: "tCO₂e",
                      highlight: true,
                    },
                  ]}
                />
              </div>
            )}
            {hasData(process.gasFlaring) && (
              <div className="space-y-3">
                <h5 className="text-sm font-semibold text-gray-700">2. Gas Flaring</h5>
                <DataEntryCard
                  number="2.1"
                  title="Gas Flaring – Deliberate Burning of Associated Gas"
                  status={
                    processStatus === "submitted"
                      ? "submitted"
                      : process.gasFlaring?.calculated?.emission != null
                        ? "submitted"
                        : "in-progress"
                  }
                  fields={[
                    { label: "Volume of Gas Flared", value: process.gasFlaring?.gasVolume },
                    { label: "Unit", value: "Standard Cubic Metres (m³)" },
                    {
                      label: "Carbon Composition of Flared Gas",
                      value: process.gasFlaring?.carbonContent,
                    },
                    { label: "Emission Factor", value: process.gasFlaring?.emissionFactor },
                    {
                      label: "Computed Emissions",
                      value: process.gasFlaring?.calculated?.emission,
                      unit: "tCO₂e",
                      highlight: true,
                    },
                  ]}
                />
              </div>
            )}
          </div>
        )}
      </SubMetricSection>

      {/* ── FUGITIVE EMISSIONS ── */}
      <SubMetricSection
        title="Fugitive Emissions"
        status={fugitiveStatus}
        documents={fugitiveFiles}
        onFileClick={onFileClick}
        onEdit={onEditSection && (() => onEditSection("ghg-fugitive-emissions"))}
        onClear={
          onClearSection && (() => onClearSection("environment.ghg.scope1.fugitiveEmissions"))
        }
      >
        {!hasData(fugitive.ventingNaturalGas) && !hasData(fugitive.hfcLeaks) ? (
          <EmptyState />
        ) : (
          <div className="space-y-6">
            {hasData(fugitive.ventingNaturalGas) && (
              <div className="space-y-3">
                <h5 className="text-sm font-semibold text-gray-700">1. Venting of Natural Gas</h5>
                <DataEntryCard
                  number="1.1"
                  title="Venting from Wells & Processing Facilities"
                  status={
                    fugitiveStatus === "submitted"
                      ? "submitted"
                      : fugitive.ventingNaturalGas?.calculated?.emission != null
                        ? "submitted"
                        : "in-progress"
                  }
                  fields={[
                    {
                      label: "Volume of Gas Vented",
                      value: fugitive.ventingNaturalGas?.volumeOfGasVented,
                    },
                    { label: "Unit", value: "Standard Cubic Metres (m³)" },
                    {
                      label: "Methane Content",
                      value:
                        fugitive.ventingNaturalGas?.calculated?.methaneContent ??
                        fugitive.ventingNaturalGas?.methaneContent,
                    },
                    {
                      label: "Methane Density",
                      value:
                        fugitive.ventingNaturalGas?.calculated?.methaneDensity ??
                        fugitive.ventingNaturalGas?.methaneDensity,
                    },
                    {
                      label: "GWP (AR6, 100-yr)",
                      value:
                        fugitive.ventingNaturalGas?.calculated?.gwp ??
                        fugitive.ventingNaturalGas?.gwp,
                    },
                    {
                      label: "Computed Emissions",
                      value: fugitive.ventingNaturalGas?.calculated?.emission,
                      unit: "tCO₂e",
                      highlight: true,
                    },
                  ]}
                />
              </div>
            )}
            {hasData(fugitive.hfcLeaks) && (
              <div className="space-y-3">
                <h5 className="text-sm font-semibold text-gray-700">
                  2. HFC Leaks from Cooling & Air Conditioning
                </h5>
                <DataEntryCard
                  number="2.1"
                  title="Leaks of HFCs from Cooling / AC Units"
                  status={
                    fugitiveStatus === "submitted"
                      ? "submitted"
                      : fugitive.hfcLeaks?.calculated?.emission != null
                        ? "submitted"
                        : "in-progress"
                  }
                  fields={[
                    {
                      label: "Type of HFC (Refrigerant)",
                      value:
                        [
                          fugitive.hfcLeaks?.R134a && "R-134a",
                          fugitive.hfcLeaks?.R410A && "R-410A",
                          fugitive.hfcLeaks?.R404A && "R-404A",
                          fugitive.hfcLeaks?.R407C && "R-407C",
                          fugitive.hfcLeaks?.R507A && "R-507A",
                        ]
                          .filter(Boolean)
                          .join(", ") || null,
                    },
                    {
                      label: "Mass of Refrigerant Leaked (kg)",
                      value: fugitive.hfcLeaks?.refrigerantAdded,
                    },
                    {
                      label: "GWP of Refrigerant",
                      value:
                        fugitive.hfcLeaks?.calculated?.gwp ?? "e.g., R-134a = 1,430 (IPCC AR6)",
                    },
                    {
                      label: "Computed Emissions",
                      value: fugitive.hfcLeaks?.calculated?.emission,
                      unit: "tCO₂e",
                      highlight: true,
                    },
                  ]}
                />
              </div>
            )}
          </div>
        )}
      </SubMetricSection>
    </>
  );
}

/* ─── Scope 2 ─── */

function Scope2Content({
  scope2,
  submittedGroups,
  onFileClick,
  onEditSection,
  onClearSection,
}: {
  scope2: any;
  submittedGroups: string[];
  onFileClick: (f: FileWithMeta) => void;
  onEditSection?: (view: string, step?: string) => void;
  onClearSection?: (path: string) => void;
}) {
  const location = scope2.locationBased || {};
  const market = scope2.marketBased || {};

  const locationFiles: FileWithMeta[] = [];
  extractFiles(location.electricity, "Location - Electricity", locationFiles);
  extractFiles(location.cooling, "Location - Cooling", locationFiles);
  extractFiles(location.heating, "Location - Heating", locationFiles);
  extractFiles(location.steam, "Location - Steam", locationFiles);

  const marketFiles: FileWithMeta[] = [];
  extractFiles(market.ipps, "Market - IPPs", marketFiles);
  extractFiles(market.eac, "Market - EACs", marketFiles);
  extractFiles(market.residual, "Market - Residual", marketFiles);
  extractFiles(market.coolingSteam, "Market - Cooling/Steam", marketFiles);

  const elec = location.electricity || {};
  const cooling = location.cooling || {};
  const heating = location.heating || {};
  const steam = location.steam || {};
  const ipps = market.ipps || {};
  const eac = market.eac || {};
  const residual = market.residual || {};
  const coolingSteam = market.coolingSteam || {};

  const locationStatus = getFormSectionStatus(
    submittedGroups,
    "environment.ghg.scope2.locationBased",
    location
  );
  const marketStatus = getFormSectionStatus(
    submittedGroups,
    "environment.ghg.scope2.marketBased",
    market
  );

  // Card-level status: if parent section is submitted, all cards inherit submitted; else data-based
  const cardStatus = (parentStatus: SectionStatus, obj: any): SectionStatus =>
    parentStatus === "submitted"
      ? "submitted"
      : !hasData(obj)
        ? "not-started"
        : obj.calculated?.emission != null
          ? "submitted"
          : "in-progress";

  return (
    <>
      {/* ── LOCATION-BASED ── */}
      <SubMetricSection
        title="Location-Based"
        status={locationStatus}
        documents={locationFiles}
        onFileClick={onFileClick}
        onEdit={onEditSection && (() => onEditSection("ghg-location-based"))}
        onClear={onClearSection && (() => onClearSection("environment.ghg.scope2.locationBased"))}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. Purchased Electricity */}
          <div className="space-y-2">
            <h5 className="text-sm font-semibold text-gray-700">1. Purchased Electricity</h5>
            <DataEntryCard
              number="1.1"
              title="National Grid (Electricity)"
              status={cardStatus(locationStatus, elec)}
              fields={[
                {
                  label: "Total Electricity Consumed",
                  value: elec.electricityConsumed,
                  unit: "kWh",
                },
                { label: "Electricity Supplier", value: elec.supplier },
                { label: "Grid Emission Factor", value: elec.emissionFactor },
                {
                  label: "Computed Emissions",
                  value: elec.calculated?.emission,
                  unit: "tCO₂e",
                  highlight: true,
                },
              ]}
            />
          </div>

          {/* 2. Purchased Cooling */}
          <div className="space-y-2">
            <h5 className="text-sm font-semibold text-gray-700">2. Purchased Cooling</h5>
            <DataEntryCard
              number="2.1"
              title="Cooling Energy from Third Parties"
              status={cardStatus(locationStatus, cooling)}
              fields={[
                {
                  label: "Amount of Cooling Energy Consumed",
                  value: cooling.coolingConsumed,
                  unit: "kWh",
                },
                {
                  label: "Type of Cooling System",
                  value: Array.isArray(cooling.selectedSystems)
                    ? cooling.selectedSystems.join(", ")
                    : cooling.selectedSystems,
                },
                { label: "Emission Factor", value: cooling.emissionFactor },
                {
                  label: "Computed Emissions",
                  value: cooling.calculated?.emission,
                  unit: "tCO₂e",
                  highlight: true,
                },
              ]}
            />
          </div>

          {/* 3. Purchased Steam */}
          <div className="space-y-2">
            <h5 className="text-sm font-semibold text-gray-700">3. Purchased Steam</h5>
            <DataEntryCard
              number="3.1"
              title="Steam from External Suppliers"
              status={cardStatus(locationStatus, steam)}
              fields={[
                { label: "Total Steam Consumed", value: steam.volume, unit: "kWh" },
                {
                  label: "Source of Steam Purchased",
                  value: Array.isArray(steam.selectedSources)
                    ? steam.selectedSources.join(", ")
                    : steam.selectedSources,
                },
                {
                  label: "Computed Emissions",
                  value: steam.calculated?.emission,
                  unit: "tCO₂e",
                  highlight: true,
                },
              ]}
            />
          </div>

          {/* 4. Purchased Heating */}
          <div className="space-y-2">
            <h5 className="text-sm font-semibold text-gray-700">4. Purchased Heating</h5>
            <DataEntryCard
              number="4.1"
              title="Heating Energy Purchased"
              status={cardStatus(locationStatus, heating)}
              fields={[
                { label: "Was Heating Energy Purchased?", value: heating.heatingPurchased },
                {
                  label: "Total Heating Energy Consumed",
                  value: heating.heatingConsumed,
                  unit: "kWh",
                },
                { label: "Supplier", value: heating.supplierName },
                {
                  label: "Computed Emissions",
                  value: heating.calculated?.emission,
                  unit: "tCO₂e",
                  highlight: true,
                },
              ]}
            />
          </div>
        </div>
      </SubMetricSection>

      {/* ── MARKET-BASED ── */}
      <SubMetricSection
        title="Market-Based"
        status={marketStatus}
        documents={marketFiles}
        onFileClick={onFileClick}
        onEdit={onEditSection && (() => onEditSection("ghg-market-based"))}
        onClear={onClearSection && (() => onClearSection("environment.ghg.scope2.marketBased"))}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. Purchased Electricity from IPPs */}
          <div className="space-y-2">
            <h5 className="text-sm font-semibold text-gray-700">
              1. Purchased Electricity from IPPs
            </h5>
            <DataEntryCard
              number="1.1"
              title="Independent Power Producers (IPPs)"
              status={cardStatus(marketStatus, ipps)}
              fields={[
                {
                  label: "Total Electricity Consumed",
                  value: ipps.electricityConsumed,
                  unit: "kWh",
                },
                { label: "Supplier", value: ipps.supplier },
                { label: "Supplier-Specific Emission Factor", value: ipps.emissionFactor },
                {
                  label: "Computed Emissions",
                  value: ipps.calculated?.emission,
                  unit: "tCO₂e",
                  highlight: true,
                },
              ]}
            />
          </div>

          {/* 2. Purchased Electricity with EACs / RECs */}
          <div className="space-y-2">
            <h5 className="text-sm font-semibold text-gray-700">
              2. Purchased Electricity with EACs / RECs
            </h5>
            <DataEntryCard
              number="2.1"
              title="Energy Attribute Certificates (EACs / RECs)"
              status={cardStatus(marketStatus, eac)}
              fields={[
                {
                  label: "Total Grid Electricity Consumed",
                  value: eac.gridElectricity,
                  unit: "kWh",
                },
                { label: "EAC / REC Certificate", value: eac.certificateType ?? eac.eacType },
                { label: "Emission Factor Applied", value: eac.emissionFactor },
                {
                  label: "Computed Emissions",
                  value: eac.calculated?.emission,
                  unit: "tCO₂e",
                  highlight: true,
                },
              ]}
            />
          </div>

          {/* 3. Residual Mix */}
          <div className="space-y-2">
            <h5 className="text-sm font-semibold text-gray-700">3. Residual Mix</h5>
            <DataEntryCard
              number="3.1"
              title="Residual Mix Factor"
              status={cardStatus(marketStatus, residual)}
              fields={[
                {
                  label: "Total Electricity Consumed",
                  value: residual.electricityConsumed,
                  unit: "kWh",
                },
                { label: "Residual Mix Emission Factor", value: residual.emissionFactor },
                {
                  label: "Computed Emissions",
                  value: residual.calculated?.emission,
                  unit: "tCO₂e",
                  highlight: true,
                },
              ]}
            />
          </div>

          {/* 4. Purchased Cooling / Steam (Market) */}
          <div className="space-y-2">
            <h5 className="text-sm font-semibold text-gray-700">
              4. Purchased Cooling / Steam (Market)
            </h5>
            <DataEntryCard
              number="4.1"
              title="Supplier-Specific Cooling / Steam"
              status={cardStatus(marketStatus, coolingSteam)}
              fields={[
                { label: "Quantity Consumed", value: coolingSteam.energyConsumed, unit: "kWh" },
                { label: "Supplier-Specific Emission Factor", value: coolingSteam.emissionFactor },
                {
                  label: "Computed Emissions",
                  value: coolingSteam.calculated?.emission,
                  unit: "tCO₂e",
                  highlight: true,
                },
              ]}
            />
          </div>
        </div>
      </SubMetricSection>
    </>
  );
}

/* ─── Scope 3 ─── */

function Scope3Content({
  scope3,
  submittedGroups,
  onFileClick,
  onEditSection,
  onClearSection,
}: {
  scope3: any;
  submittedGroups: string[];
  onFileClick: (f: FileWithMeta) => void;
  onEditSection?: (view: string, step?: string) => void;
  onClearSection?: (path: string) => void;
}) {
  const upstream = scope3.upstream || {};
  const downstream = scope3.downstream || {};

  const upstreamFiles: FileWithMeta[] = [];
  extractFiles(upstream.purchasedGoodsAndServices, "Purchased Goods", upstreamFiles);
  extractFiles(upstream.capitalGoods, "Capital Goods", upstreamFiles);
  extractFiles(upstream.fuelEnergyRelatedActivities, "Fuel/Energy", upstreamFiles);
  extractFiles(upstream.upstreamTransportationDistribution, "Upstream Transport", upstreamFiles);
  extractFiles(upstream.wasteGeneratedInOperations, "Waste in Ops", upstreamFiles);
  extractFiles(upstream.businessTravel, "Business Travel", upstreamFiles);
  extractFiles(upstream.employeeCommuting, "Employee Commuting", upstreamFiles);
  extractFiles(upstream.upstreamLeasedAssets, "Upstream Leased", upstreamFiles);

  const downstreamFiles: FileWithMeta[] = [];
  extractFiles(
    downstream.downstreamTransportationDistribution,
    "Downstream Transport",
    downstreamFiles
  );
  extractFiles(downstream.processingSoldProducts, "Processing Sold", downstreamFiles);
  extractFiles(downstream.useOfSoldProducts, "Use of Sold Products", downstreamFiles);
  extractFiles(downstream.endOfLifeTreatment, "End of Life", downstreamFiles);
  extractFiles(downstream.downstreamLeasedAssets, "Downstream Leased", downstreamFiles);
  extractFiles(downstream.franchises, "Franchises", downstreamFiles);
  extractFiles(downstream.investments, "Investments", downstreamFiles);

  const upstreamStatus = getFormSectionStatus(
    submittedGroups,
    "environment.ghg.scope3.upstream",
    upstream
  );
  const downstreamStatus = getFormSectionStatus(
    submittedGroups,
    "environment.ghg.scope3.downstream",
    downstream
  );

  // Card-level: inherit parent section's submitted status; else data-based
  const catStatus = (parentStatus: SectionStatus, obj: any): SectionStatus =>
    parentStatus === "submitted"
      ? "submitted"
      : !hasData(obj)
        ? "not-started"
        : obj.calculated?.emission != null
          ? "submitted"
          : "in-progress";

  const pgs = upstream.purchasedGoodsAndServices || {};
  const cg = upstream.capitalGoods || {};
  const fera = upstream.fuelEnergyRelatedActivities || {};
  const utd = upstream.upstreamTransportationDistribution || {};
  const wgo = upstream.wasteGeneratedInOperations || {};
  const bt = upstream.businessTravel || {};
  const ec = upstream.employeeCommuting || {};
  const ula = upstream.upstreamLeasedAssets || {};

  return (
    <>
      {/* ── UPSTREAM (Categories 1–8) ── */}
      <SubMetricSection
        title="Upstream Emissions (Categories 1–8)"
        status={upstreamStatus}
        documents={upstreamFiles}
        onFileClick={onFileClick}
        onEdit={onEditSection && (() => onEditSection("ghg-upstream-emissions"))}
        onClear={onClearSection && (() => onClearSection("environment.ghg.scope3.upstream"))}
      >
        <div className="space-y-6">
          {/* Cat. 1 – Purchased Goods & Services */}
          <div className="space-y-2">
            <h5 className="text-sm font-semibold text-gray-700">
              Cat. 1 – Purchased Goods &amp; Services
            </h5>
            <DataEntryCard
              number="1.1"
              title="Goods & Services Purchased (Spend-Based)"
              status={catStatus(upstreamStatus, pgs)}
              fields={[
                {
                  label: "Total Spend on Goods / Services",
                  value: pgs.totalAmountSpent,
                  unit: "$",
                },
                { label: "Mass of Goods Purchased", value: pgs.massOfGoods, unit: "kg" },
                {
                  label: "Category",
                  value: Array.isArray(pgs.selectedCategories)
                    ? pgs.selectedCategories.join(", ")
                    : pgs.selectedCategories,
                },
                {
                  label: "Computed Emissions",
                  value: pgs.calculated?.emission,
                  unit: "tCO₂e",
                  highlight: true,
                },
              ]}
            />
          </div>

          {/* Cat. 2 – Capital Goods */}
          <div className="space-y-2">
            <h5 className="text-sm font-semibold text-gray-700">Cat. 2 – Capital Goods</h5>
            <DataEntryCard
              number="2.1"
              title="Capital Goods Purchased"
              status={catStatus(upstreamStatus, cg)}
              fields={[
                { label: "Total Cost of Capital Goods", value: cg.totalCost, unit: "$" },
                { label: "Weight of Primary Materials", value: cg.materialWeight, unit: "kg" },
                {
                  label: "Computed Emissions",
                  value: cg.calculated?.emission,
                  unit: "tCO₂e",
                  highlight: true,
                },
              ]}
            />
          </div>

          {/* Cat. 3 – Fuel & Energy-Related Activities */}
          <div className="space-y-2">
            <h5 className="text-sm font-semibold text-gray-700">
              Cat. 3 – Fuel &amp; Energy-Related Activities
            </h5>
            <DataEntryCard
              number="3.1"
              title="Upstream Fuel & Energy (Well-to-Tank)"
              status={catStatus(upstreamStatus, fera)}
              fields={[
                { label: "Volume of Diesel Consumed", value: fera.fuelVolume, unit: "L" },
                { label: "Electricity Consumed", value: fera.energyType },
                {
                  label: "Computed Emissions",
                  value: fera.calculated?.emission,
                  unit: "tCO₂e",
                  highlight: true,
                },
              ]}
            />
          </div>

          {/* Cat. 4 – Upstream Transportation & Distribution */}
          <div className="space-y-2">
            <h5 className="text-sm font-semibold text-gray-700">
              Cat. 4 – Upstream Transportation &amp; Distribution
            </h5>
            <DataEntryCard
              number="4.1"
              title="Upstream Transport of Purchased Inputs"
              status={catStatus(upstreamStatus, utd)}
              fields={[
                { label: "Mass of Goods Transported", value: utd.massTransported, unit: "kg" },
                { label: "Distance Travelled", value: utd.distanceTravelled, unit: "km" },
                { label: "Total Logistics Spend", value: utd.logisticsSpend, unit: "$" },
                { label: "Emission Factor", value: utd.emissionFactor },
                {
                  label: "Computed Emissions",
                  value: utd.calculated?.emission,
                  unit: "tCO₂e",
                  highlight: true,
                },
              ]}
            />
          </div>

          {/* Cat. 5 – Waste Generated in Operations */}
          <div className="space-y-2">
            <h5 className="text-sm font-semibold text-gray-700">
              Cat. 5 – Waste Generated in Operations
            </h5>
            <DataEntryCard
              number="5.1"
              title="Operational Waste"
              status={catStatus(upstreamStatus, wgo)}
              fields={[
                { label: "Total Weight of Waste Generated", value: wgo.wasteWeight, unit: "kg" },
                {
                  label: "Waste Management Method",
                  value: Array.isArray(wgo.selectedMethods)
                    ? wgo.selectedMethods.join(", ")
                    : wgo.selectedMethods,
                },
                {
                  label: "Computed Emissions",
                  value: wgo.calculated?.emission,
                  unit: "tCO₂e",
                  highlight: true,
                },
              ]}
            />
          </div>

          {/* Cat. 6 – Business Travel */}
          <div className="space-y-2">
            <h5 className="text-sm font-semibold text-gray-700">Cat. 6 – Business Travel</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DataEntryCard
                number="6.1.1"
                title="Air Travel"
                status={catStatus(upstreamStatus, bt)}
                fields={[
                  { label: "Number of Flights", value: bt.totalFlights },
                  { label: "Air Distance", value: bt.airDistance, unit: "km" },
                  { label: "Employees Travelling", value: bt.airEmployees },
                  {
                    label: "Class Split",
                    value:
                      [
                        bt.economyPercent != null && `Economy: ${bt.economyPercent}%`,
                        bt.businessPercent != null && `Business: ${bt.businessPercent}%`,
                        bt.firstClassPercent != null && `First: ${bt.firstClassPercent}%`,
                      ]
                        .filter(Boolean)
                        .join(" / ") || null,
                  },
                  {
                    label: "Computed Emissions",
                    value: bt.calculated?.emission,
                    unit: "tCO₂e",
                    highlight: true,
                  },
                ]}
              />
              <DataEntryCard
                number="6.1.3"
                title="Accommodation"
                status={
                  upstreamStatus === "submitted"
                    ? "submitted"
                    : bt.hotelNights != null
                      ? "in-progress"
                      : "not-started"
                }
                fields={[
                  { label: "Hotel Nights", value: bt.hotelNights },
                  {
                    label: "Computed Emissions",
                    value: bt.calculated?.hotelEmission,
                    unit: "tCO₂e",
                    highlight: true,
                  },
                ]}
              />
            </div>
          </div>

          {/* Cat. 7 – Employee Commuting */}
          <div className="space-y-2">
            <h5 className="text-sm font-semibold text-gray-700">Cat. 7 – Employee Commuting</h5>
            <DataEntryCard
              number="7.1"
              title="Employee Commuting"
              status={catStatus(upstreamStatus, ec)}
              fields={[
                { label: "Number of Employees", value: ec.numberOfEmployees },
                { label: "Average Distance", value: ec.averageDistance, unit: "km" },
                { label: "Workdays per Year", value: ec.workdaysPerYear },
                {
                  label: "Commute Mode(s)",
                  value: Array.isArray(ec.selectedMethods)
                    ? ec.selectedMethods.join(", ")
                    : ec.selectedMethods,
                },
                {
                  label: "Computed Emissions",
                  value: ec.calculated?.emission,
                  unit: "tCO₂e",
                  highlight: true,
                },
              ]}
            />
          </div>

          {/* Cat. 8 – Upstream Leased Assets */}
          <div className="space-y-2">
            <h5 className="text-sm font-semibold text-gray-700">Cat. 8 – Upstream Leased Assets</h5>
            <DataEntryCard
              number="8.1"
              title="Assets Leased from Third Parties"
              status={catStatus(upstreamStatus, ula)}
              fields={[
                { label: "Electricity Consumed", value: ula.electricityConsumed, unit: "kWh" },
                { label: "Fuel Consumed", value: ula.fuelConsumed, unit: "L" },
                { label: "Floor Area", value: ula.floorArea, unit: "m²" },
                {
                  label: "Computed Emissions",
                  value: ula.calculated?.emission,
                  unit: "tCO₂e",
                  highlight: true,
                },
              ]}
            />
          </div>
        </div>
      </SubMetricSection>

      {/* ── DOWNSTREAM (Categories 9–15) ── */}
      <SubMetricSection
        title="Downstream Emissions (Categories 9–15)"
        status={downstreamStatus}
        documents={downstreamFiles}
        onFileClick={onFileClick}
        onEdit={onEditSection && (() => onEditSection("ghg-downstream-emissions"))}
        onClear={onClearSection && (() => onClearSection("environment.ghg.scope3.downstream"))}
      >
        <div className="space-y-6">
          {/* Cat. 9 – Downstream Transportation & Distribution */}
          {(() => {
            const dtd = downstream.downstreamTransportationDistribution || {};
            return (
              <div className="space-y-2">
                <h5 className="text-sm font-semibold text-gray-700">
                  Cat. 9 – Downstream Transportation &amp; Distribution
                </h5>
                <DataEntryCard
                  number="9.1"
                  title="Downstream Distribution Network"
                  status={catStatus(downstreamStatus, dtd)}
                  fields={[
                    {
                      label: "Mass of Products Sold",
                      value: dtd.massOfProductsSold,
                      unit: "tonnes",
                    },
                    {
                      label: "Average Distribution Distance",
                      value: dtd.averageDistributionDistance,
                      unit: "km",
                    },
                    { label: "Fuel by Downstream Network", value: dtd.fuelConsumedByDistribution },
                    { label: "Emission Factor", value: dtd.emissionFactor },
                    {
                      label: "Computed Emissions",
                      value: dtd.calculated?.emission,
                      unit: "tCO₂e",
                      highlight: true,
                    },
                  ]}
                />
              </div>
            );
          })()}

          {/* Cat. 10 – Processing of Sold Products */}
          {(() => {
            const psp = downstream.processingSoldProducts || {};
            return (
              <div className="space-y-2">
                <h5 className="text-sm font-semibold text-gray-700">
                  Cat. 10 – Processing of Sold Products
                </h5>
                <DataEntryCard
                  number="10.1"
                  title="Downstream Processing of Intermediate Products"
                  status={catStatus(downstreamStatus, psp)}
                  fields={[
                    {
                      label: "Quantity of Intermediate Product Sold",
                      value: psp.processedQuantity,
                      unit: "tonnes",
                    },
                    { label: "Fuel Consumed by Downstream Processor", value: psp.fuelConsumed },
                    {
                      label: "Electricity Consumed by Processor",
                      value: psp.electricityConsumed,
                      unit: "kWh",
                    },
                    {
                      label: "Computed Emissions",
                      value: psp.calculated?.emission,
                      unit: "tCO₂e",
                      highlight: true,
                    },
                  ]}
                />
              </div>
            );
          })()}

          {/* Cat. 11 – Use of Sold Products */}
          {(() => {
            const usp = downstream.useOfSoldProducts || {};
            return (
              <div className="space-y-2">
                <h5 className="text-sm font-semibold text-gray-700">
                  Cat. 11 – Use of Sold Products
                </h5>
                <DataEntryCard
                  number="11.1"
                  title="Combustion of Sold Hydrocarbons by Customers"
                  status={catStatus(downstreamStatus, usp)}
                  fields={[
                    { label: "Number of Units Sold", value: usp.unitsSold },
                    {
                      label: "Expected Lifetime of Product",
                      value: usp.productLifetime,
                      unit: "years",
                    },
                    {
                      label: "Average Annual Fuel/Energy Consumption",
                      value: usp.averageAnnualConsumption,
                      unit: "per unit",
                    },
                    {
                      label: "Emission Factor",
                      value: usp.emissionFactor ?? "0.526 kgCO₂e/kWh (if electricity)",
                    },
                    {
                      label: "Computed Emissions",
                      value: usp.calculated?.emission,
                      unit: "tCO₂e",
                      highlight: true,
                    },
                  ]}
                />
              </div>
            );
          })()}

          {/* Cat. 12 – End-of-Life Treatment of Sold Products */}
          {(() => {
            const elt = downstream.endOfLifeTreatment || {};
            const disposalMethods = elt.selectedMethods
              ? Object.entries(elt.selectedMethods)
                  .filter(([, v]) => v === true)
                  .map(([k]) => k.charAt(0).toUpperCase() + k.slice(1))
                  .join(", ")
              : null;
            return (
              <div className="space-y-2">
                <h5 className="text-sm font-semibold text-gray-700">
                  Cat. 12 – End-of-Life Treatment of Sold Products
                </h5>
                <DataEntryCard
                  number="12.1"
                  title="End-of-Life Disposal"
                  status={catStatus(downstreamStatus, elt)}
                  fields={[
                    {
                      label: "Total Mass of Products Sold (by material type)",
                      value: elt.products?.length ? `${elt.products.length} product type(s)` : null,
                    },
                    {
                      label: "Disposal Method (Landfill / Recycling / Incineration)",
                      value: disposalMethods ?? elt.otherDisposalMethod,
                    },
                    { label: "Emission Factor", value: "IPCC Vol.5 Waste Factors" },
                    {
                      label: "Computed Emissions",
                      value: elt.calculated?.emission,
                      unit: "tCO₂e",
                      highlight: true,
                    },
                  ]}
                />
              </div>
            );
          })()}

          {/* Cat. 13 – Downstream Leased Assets */}
          {(() => {
            const dla = downstream.downstreamLeasedAssets || {};
            return (
              <div className="space-y-2">
                <h5 className="text-sm font-semibold text-gray-700">
                  Cat. 13 – Downstream Leased Assets
                </h5>
                <DataEntryCard
                  number="13.1"
                  title="Assets Owned & Leased to Tenants"
                  status={catStatus(downstreamStatus, dla)}
                  fields={[
                    {
                      label: "Total Electricity Consumed by Tenants",
                      value: dla.electricityConsumed,
                      unit: "kWh",
                    },
                    { label: "Other Energy Consumed", value: dla.otherEnergyConsumed },
                    {
                      label: "Computed Emissions",
                      value: dla.calculated?.emission,
                      unit: "tCO₂e",
                      highlight: true,
                    },
                  ]}
                />
              </div>
            );
          })()}

          {/* Cat. 14 – Franchises */}
          {(() => {
            const fr = downstream.franchises || {};
            return (
              <div className="space-y-2">
                <h5 className="text-sm font-semibold text-gray-700">Cat. 14 – Franchises</h5>
                <DataEntryCard
                  number="14.1"
                  title="Franchise Operations"
                  status={catStatus(downstreamStatus, fr)}
                  fields={[
                    { label: "Total Fuel Consumption by Franchisees", value: fr.fuelConsumption },
                    {
                      label: "Total Electricity by Franchisees",
                      value: fr.electricityConsumption,
                      unit: "kWh",
                    },
                    {
                      label: "Computed Emissions",
                      value: fr.calculated?.emission,
                      unit: "tCO₂e",
                      highlight: true,
                    },
                  ]}
                />
              </div>
            );
          })()}

          {/* Cat. 15 – Investments */}
          {(() => {
            const inv = downstream.investments || {};
            return (
              <div className="space-y-2">
                <h5 className="text-sm font-semibold text-gray-700">Cat. 15 – Investments</h5>
                <DataEntryCard
                  number="15.1"
                  title="Financed Emissions (Portfolio Companies)"
                  status={catStatus(downstreamStatus, inv)}
                  fields={[
                    {
                      label: "Loan / Equity Share in Invested Companies",
                      value: inv.investmentAmount,
                      unit: "%",
                    },
                    {
                      label: "Reported Scope 1 & 2 of Portfolio Companies",
                      value: inv.portfolioEmissions,
                      unit: "tCO₂e",
                    },
                    {
                      label: "Computed Emissions",
                      value: inv.calculated?.emission,
                      unit: "tCO₂e",
                      highlight: true,
                    },
                  ]}
                />
              </div>
            );
          })()}
        </div>
      </SubMetricSection>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   AIR QUALITY SECTION
   ═══════════════════════════════════════════════════════════════ */

function AirQualitySection({
  env,
  submittedGroups,
  onFileClick,
  onEditSection,
  onClearSection,
}: {
  env: any;
  submittedGroups: string[];
  onFileClick: (f: FileWithMeta) => void;
  onEditSection?: (view: string, step?: string) => void;
  onClearSection?: (path: string) => void;
}) {
  const aq = env.airQuality?.airPollutantEmissions || {};
  const calc = aq.calculated?.breakdown || {};

  const nox = calc.oxidesOfNitrogen?.volume ?? aq.oxidesOfNitrogen;
  const sox = calc.oxidesOfSulphur?.volume ?? aq.oxidesOfSulphur ?? aq.oxidesOfSuplphur;
  const voc =
    calc.volatileOrganicCompounds?.volume ??
    aq.volatileOrganicCompound ??
    aq.volatileOrganicCompounds;
  const pm = calc.particulateMatter?.volume ?? aq.particulateMatter;
  const totalPollutants =
    aq.calculated?.totalAirPollutantEmissions ??
    [nox, sox, voc, pm].reduce((sum: number, v: any) => sum + (Number(v) || 0), 0);

  const hasAirData = nox != null || sox != null || voc != null || pm != null;

  const files: FileWithMeta[] = [];
  extractFiles(aq, "Air Pollutant Emissions", files);
  extractFiles(env.airQuality, "Air Quality", files);

  return (
    <MetricAccordion
      value="air-quality"
      icon={Wind}
      title="Air Quality"
      description="1 form · IFRS: EM-EP-140a.1 – 140a.4"
      badge={hasAirData ? `${formatNumberShort(totalPollutants)} t pollutants` : undefined}
      status={getFormSectionStatus(
        submittedGroups,
        "environment.airQuality.airPollutantEmissions",
        aq
      )}
    >
      <SubMetricSection
        title="Air Pollutant Emissions"
        status={getFormSectionStatus(
          submittedGroups,
          "environment.airQuality.airPollutantEmissions",
          aq
        )}
        documents={files}
        onFileClick={onFileClick}
        onEdit={onEditSection && (() => onEditSection("air-quality"))}
        onClear={
          onClearSection && (() => onClearSection("environment.airQuality.airPollutantEmissions"))
        }
      >
        {!hasAirData ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            <h5 className="text-sm font-semibold text-gray-700">
              1. Electricity &amp; Heat Generation
            </h5>
            <DataFieldGrid
              columns={5}
              fields={[
                { label: "NOx – Oxides of Nitrogen (t)", value: nox, unit: "t" },
                { label: "SOx – Oxides of Sulphur (t)", value: sox, unit: "t" },
                { label: "VOCs – Volatile Organic Compounds (t)", value: voc, unit: "t" },
                { label: "PM₁₀ – Particulate Matter ≤10μm (t)", value: pm, unit: "t" },
                {
                  label: "Total Air Pollutant Emissions",
                  value: totalPollutants,
                  unit: "metric tonnes",
                  highlight: true,
                },
              ]}
            />
          </div>
        )}
      </SubMetricSection>
    </MetricAccordion>
  );
}

/* ═══════════════════════════════════════════════════════════════
   WATER & WASTEWATER MANAGEMENT SECTION
   ═══════════════════════════════════════════════════════════════ */

function WaterManagementSection({
  env,
  submittedGroups,
  onFileClick,
  onEditSection,
  onClearSection,
}: {
  env: any;
  submittedGroups: string[];
  onFileClick: (f: FileWithMeta) => void;
  onEditSection?: (view: string, step?: string) => void;
  onClearSection?: (path: string) => void;
}) {
  const wm = env.waterManagement?.waterAndProducedWaterManagement || {};
  const fw = wm.freshwaterWithdrawals || {};
  const pw = wm.producedWaterManagement || {};
  const hf = env.waterManagement?.hydraulicFracturingImpacts || {};
  const chem = hf.chemicalDisclosure || {};
  const wqi = hf.waterQualityImpacts || {};

  const totalWithdrawn = fw.totalWaterConsumed;
  const hasFw = hasData(fw);
  const hasPw = hasData(pw);
  const hasChem = hasData(chem);
  const hasWqi = hasData(wqi);
  const incompleteCount = [hasFw, hasPw, hasChem, hasWqi].filter((v) => !v).length;

  const fwStatus = getFormSectionStatus(
    submittedGroups,
    "environment.waterManagement.waterAndProducedWaterManagement.freshwaterWithdrawals",
    fw
  );
  const pwStatus = getFormSectionStatus(
    submittedGroups,
    "environment.waterManagement.waterAndProducedWaterManagement.producedWaterManagement",
    pw
  );
  const chemStatus = getFormSectionStatus(
    submittedGroups,
    "environment.waterManagement.hydraulicFracturingImpacts.chemicalDisclosure",
    chem
  );
  const wqiStatus = getFormSectionStatus(
    submittedGroups,
    "environment.waterManagement.hydraulicFracturingImpacts.waterQualityImpacts",
    wqi
  );

  const WATER_KEYS = [
    "environment.waterManagement.waterAndProducedWaterManagement.freshwaterWithdrawals",
    "environment.waterManagement.waterAndProducedWaterManagement.producedWaterManagement",
    "environment.waterManagement.hydraulicFracturingImpacts.chemicalDisclosure",
    "environment.waterManagement.hydraulicFracturingImpacts.waterQualityImpacts",
  ];
  const waterSubmittedCount = WATER_KEYS.filter((k) => submittedGroups.includes(k)).length;
  const waterStatus: SectionStatus =
    waterSubmittedCount === WATER_KEYS.length
      ? "submitted"
      : waterSubmittedCount > 0 || hasFw || hasPw || hasChem || hasWqi
        ? "in-progress"
        : "not-started";

  // Files
  const fwFiles: FileWithMeta[] = [];
  const pwFiles: FileWithMeta[] = [];
  const chemFiles: FileWithMeta[] = [];
  const wqiFiles: FileWithMeta[] = [];
  extractFiles(fw, "Freshwater Withdrawal", fwFiles);
  extractFiles(pw, "Produced Water Management", pwFiles);
  extractFiles(chem, "Chemical Disclosure", chemFiles);
  extractFiles(wqi, "Water Quality Impacts", wqiFiles);

  return (
    <MetricAccordion
      value="water-management"
      icon={Droplets}
      title="Water & Wastewater Management"
      description="4 form · IFRS: EM-EP-140a.1 – 140a.4"
      badge={
        totalWithdrawn != null ? `${formatNumberShort(totalWithdrawn)} m³ withdrawn` : undefined
      }
      status={waterStatus}
      incompleteCount={incompleteCount > 0 ? incompleteCount : undefined}
    >
      {/* ── Freshwater Withdrawal & Consumption ── */}
      <SubMetricSection
        title="Freshwater Withdrawal & Consumption"
        status={fwStatus}
        documents={fwFiles}
        onFileClick={onFileClick}
        onEdit={onEditSection && (() => onEditSection("water-and-wastewater-management"))}
        onClear={
          onClearSection &&
          (() =>
            onClearSection(
              "environment.waterManagement.waterAndProducedWaterManagement.freshwaterWithdrawals"
            ))
        }
      >
        {!hasFw ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            <h5 className="text-sm font-semibold text-gray-700">Source Breakdown</h5>
            <DataFieldGrid
              columns={5}
              fields={[
                {
                  label: `Withdrawal from Surface Water (${fw.withdrawalfromSurfaceWaterUnit || "Thousand m³"})`,
                  value: fw.withdrawalfromSurfaceWater,
                  unit: fw.withdrawalfromSurfaceWaterUnit || "Thousand m³",
                },
                {
                  label: `Withdrawal from Groundwater (${fw.withdrawalfromGroundwaterUnit || "Thousand m³"})`,
                  value: fw.withdrawalfromGroundwater,
                  unit: fw.withdrawalfromGroundwaterUnit || "Thousand m³",
                },
                {
                  label: `Withdrawal from Municipal & Other (${fw.withdrawalfromMunicipalotherOtherSourcesUnit || "Thousand m³"})`,
                  value: fw.withdrawalfromMunicipalotherOtherSources,
                  unit: fw.withdrawalfromMunicipalotherOtherSourcesUnit || "Thousand m³",
                },
                {
                  label: `Total Water Consumed (${fw.totalWaterConsumedUnit || "Thousand m³"})`,
                  value: fw.totalWaterConsumed,
                  unit: fw.totalWaterConsumedUnit || "Thousand m³",
                },
                {
                  label: `Volume from Water-Stressed Regions (${fw.volumeWithdrawnfromWaterStressedRegionsUnit || "Thousand m³"})`,
                  value: fw.volumeWithdrawnfromWaterStressedRegions,
                  unit: fw.volumeWithdrawnfromWaterStressedRegionsUnit || "Thousand m³",
                },
              ]}
            />
          </div>
        )}
      </SubMetricSection>

      {/* ── Produced Water Management ── */}
      <SubMetricSection
        title="Produced Water Management"
        status={pwStatus}
        documents={pwFiles}
        onFileClick={onFileClick}
        onEdit={onEditSection && (() => onEditSection("water-and-wastewater-management"))}
        onClear={
          onClearSection &&
          (() =>
            onClearSection(
              "environment.waterManagement.waterAndProducedWaterManagement.producedWaterManagement"
            ))
        }
      >
        {!hasPw ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            <h5 className="text-sm font-semibold text-gray-700">Volume Data</h5>
            <DataFieldGrid
              columns={4}
              fields={[
                {
                  label: `Total Produced Water Generated (${pw.totalProducedWaterGeneratedUnit || "Thousand m³"})`,
                  value: pw.totalProducedWaterGenerated,
                  unit: pw.totalProducedWaterGeneratedUnit || "Thousand m³",
                },
                {
                  label: `Volume Discharged to Surface (${pw.volumeDischargedToSurfaceUnit || "Thousand m³"})`,
                  value: pw.volumeDischargedToSurface,
                  unit: pw.volumeDischargedToSurfaceUnit || "Thousand m³",
                },
                {
                  label: `Volume Injected for Disposal (${pw.volumeInjectedForDisposalUnit || "Thousand m³"})`,
                  value: pw.volumeInjectedForDisposal,
                  unit: pw.volumeInjectedForDisposalUnit || "Thousand m³",
                },
                {
                  label: `Volume Recycled / Reused (${pw.volumeRecycledReusedUnit || "Thousand m³"})`,
                  value: pw.volumeRecycledReused,
                  unit: pw.volumeRecycledReusedUnit || "Thousand m³",
                },
              ]}
            />
          </div>
        )}
      </SubMetricSection>

      {/* ── Hydraulic Fracturing – Chemical Disclosure ── */}
      <SubMetricSection
        title="Hydraulic Fracturing – Chemical Disclosure"
        status={chemStatus}
        documents={chemFiles}
        onFileClick={onFileClick}
        onEdit={onEditSection && (() => onEditSection("water-and-wastewater-management"))}
        onClear={
          onClearSection &&
          (() =>
            onClearSection(
              "environment.waterManagement.hydraulicFracturingImpacts.chemicalDisclosure"
            ))
        }
      >
        {!hasChem ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            <DataFieldGrid
              columns={3}
              fields={[
                {
                  label: "Operates Hydraulic Fracturing Wells",
                  value: chem.operatesHydraulicFracturingWells,
                },
                {
                  label: "Total Number of Fractured Wells",
                  value: chem.totalNumberOfFracturedWells,
                  unit: "Wells",
                },
                {
                  label: "Wells with Public Disclosure",
                  value: chem.numberOfWellsWithPublicDisclosure,
                  unit: "Wells",
                },
              ]}
            />
          </div>
        )}
      </SubMetricSection>

      {/* ── Hydraulic Fracturing – Water Quality Impacts ── */}
      <SubMetricSection
        title="Hydraulic Fracturing – Water Quality Impacts"
        status={wqiStatus}
        documents={wqiFiles}
        onFileClick={onFileClick}
        onEdit={onEditSection && (() => onEditSection("water-and-wastewater-management"))}
        onClear={
          onClearSection &&
          (() =>
            onClearSection(
              "environment.waterManagement.hydraulicFracturingImpacts.waterQualityImpacts"
            ))
        }
      >
        {!hasWqi ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            <DataFieldGrid
              columns={2}
              fields={[
                { label: "Operates Near Water Sources", value: wqi.operatesNearWaterSources },
                {
                  label: "Water Quality Details",
                  value: wqi.description || wqi.waterQualityDescription,
                  paragraph: true,
                },
              ]}
            />
          </div>
        )}
      </SubMetricSection>
    </MetricAccordion>
  );
}

/* ═══════════════════════════════════════════════════════════════
   BIODIVERSITY IMPACTS SECTION
   ═══════════════════════════════════════════════════════════════ */

function BiodiversitySection({
  env,
  submittedGroups,
  onFileClick,
  onEditSection,
  onClearSection,
}: {
  env: any;
  submittedGroups: string[];
  onFileClick: (f: FileWithMeta) => void;
  onEditSection?: (view: string, step?: string) => void;
  onClearSection?: (path: string) => void;
}) {
  const bio = env.biodiversityImpact?.environmentalManagement || {};
  const policies = bio.environmentalManagementPolicies || {};
  const spills = bio.hydrocarbonSpills || {};
  const reserves = bio.reservesInSensitiveAreas || {};

  const hasPolicies = hasData(policies);
  const hasSpills = hasData(spills);
  const hasReserves = hasData(reserves);
  const incompleteCount = [hasPolicies, hasSpills, hasReserves].filter((v) => !v).length;

  const policiesStatus = getFormSectionStatus(
    submittedGroups,
    "environment.biodiversityImpact.environmentalManagement.environmentalManagementPolicies",
    policies
  );
  const spillsStatus = getFormSectionStatus(
    submittedGroups,
    "environment.biodiversityImpact.environmentalManagement.hydrocarbonSpills",
    spills
  );
  const reservesStatus = getFormSectionStatus(
    submittedGroups,
    "environment.biodiversityImpact.environmentalManagement.reservesInSensitiveAreas",
    reserves
  );

  const BIO_KEYS = [
    "environment.biodiversityImpact.environmentalManagement.environmentalManagementPolicies",
    "environment.biodiversityImpact.environmentalManagement.hydrocarbonSpills",
    "environment.biodiversityImpact.environmentalManagement.reservesInSensitiveAreas",
  ];
  const bioSubmittedCount = BIO_KEYS.filter((k) => submittedGroups.includes(k)).length;
  const biodiversityStatus: SectionStatus =
    bioSubmittedCount === BIO_KEYS.length
      ? "submitted"
      : bioSubmittedCount > 0 || hasPolicies || hasSpills || hasReserves
        ? "in-progress"
        : "not-started";

  // Files
  const policyFiles: FileWithMeta[] = [];
  const spillFiles: FileWithMeta[] = [];
  const reserveFiles: FileWithMeta[] = [];
  extractFiles(policies, "Environmental Management Policies", policyFiles);
  extractFiles(spills, "Hydrocarbon Spills", spillFiles);
  extractFiles(reserves, "Reserves in Sensitive Areas", reserveFiles);

  // ISO certification
  const isCertified =
    policies.isISO14001Certified ??
    policies.calculated?.isISO14001Certified ??
    policies.calculated?.iso14001Certified;

  // Badge: spill count + total volume
  const spillCount = Number(spills.numberOfSpills ?? spills.calculated?.total_spills) || 0;
  const spillVolume =
    Number(spills.totalVolumeSpilled ?? spills.calculated?.totalVolumeSpilled?.volume) || 0;
  const hasSpillCount = (spills.numberOfSpills ?? spills.calculated?.total_spills) != null;
  const badgeParts: string[] = [];
  if (hasSpillCount) badgeParts.push(`${formatNumberShort(spillCount)} spills`);
  if (spillVolume > 0) badgeParts.push(`${formatNumberShort(spillVolume)} bbls spilled`);

  return (
    <MetricAccordion
      value="biodiversity"
      icon={Sprout}
      title="Biodiversity Impacts"
      description="3 form · IFRS: EM-EP-160a.1 – 160a.3"
      badge={badgeParts.length > 0 ? badgeParts.join(" · ") : undefined}
      status={biodiversityStatus}
      incompleteCount={incompleteCount > 0 ? incompleteCount : undefined}
    >
      {/* ── Environmental Management Policies ── */}
      <SubMetricSection
        title="Environmental Management Policies"
        status={policiesStatus}
        documents={policyFiles}
        onFileClick={onFileClick}
        onEdit={
          onEditSection &&
          (() => onEditSection("biodiversity", "environmental-management-policies"))
        }
        onClear={
          onClearSection &&
          (() =>
            onClearSection(
              "environment.biodiversityImpact.environmentalManagement.environmentalManagementPolicies"
            ))
        }
      >
        {!hasPolicies ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            <h5 className="text-sm font-semibold text-gray-700">Environmental Management System</h5>
            <DataFieldGrid
              columns={2}
              fields={[
                {
                  label: "EMS ISO 14001 Certified?",
                  value: isCertified,
                  isBoolean: true,
                },
                {
                  label: "Description of Environmental Management Policies and Practices",
                  value: policies.policiesDescription || policies.description,
                  paragraph: true,
                },
              ]}
            />
          </div>
        )}
      </SubMetricSection>

      {/* ── Hydrocarbon Spills ── */}
      <SubMetricSection
        title="Hydrocarbon Spills"
        status={spillsStatus}
        documents={spillFiles}
        onFileClick={onFileClick}
        onEdit={onEditSection && (() => onEditSection("biodiversity", "hydrocarbon-spills"))}
        onClear={
          onClearSection &&
          (() =>
            onClearSection(
              "environment.biodiversityImpact.environmentalManagement.hydrocarbonSpills"
            ))
        }
      >
        {!hasSpills ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            <h5 className="text-sm font-semibold text-gray-700">Volume Breakdown</h5>
            <DataFieldGrid
              columns={5}
              fields={[
                {
                  label: "Number of Spills (>1 bbl)",
                  value: spills.numberOfSpills ?? spills.calculated?.total_spills,
                },
                {
                  label: "Total Volume Spilled",
                  value: spills.totalVolumeSpilled ?? spills.calculated?.totalVolumeSpilled?.volume,
                  unit: "bbls",
                },
                {
                  label: "Volume Recovered from Environment (bbls)",
                  value: spills.volumeRecovered ?? spills.calculated?.volumeRecovered?.volume,
                  unit: "bbls",
                },
                {
                  label: "Volume in Arctic (bbls)",
                  value: spills.volumeInArctic ?? spills.calculated?.volumeInArctic?.volume,
                  unit: "bbls",
                },
                {
                  label: "Volume Impacting Sensitive Shorelines ESI 8-10 (bbls)",
                  value:
                    spills.volumeImpactingShorelines ??
                    spills.volumeImpactingSensitiveShorelines ??
                    spills.calculated?.volumeImpactingSensitiveShorelines?.volume,
                  unit: "bbls",
                },
              ]}
            />
          </div>
        )}
      </SubMetricSection>

      {/* ── Reserves in Sensitive Areas ── */}
      <SubMetricSection
        title="Reserves in Sensitive Areas"
        status={reservesStatus}
        documents={reserveFiles}
        onFileClick={onFileClick}
        onEdit={
          onEditSection && (() => onEditSection("biodiversity", "reserves-in-sensitive-areas"))
        }
        onClear={
          onClearSection &&
          (() =>
            onClearSection(
              "environment.biodiversityImpact.environmentalManagement.reservesInSensitiveAreas"
            ))
        }
      >
        {!hasReserves ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            <h5 className="text-sm font-semibold text-gray-700">Reserve Volumes</h5>
            <DataFieldGrid
              columns={5}
              fields={[
                {
                  label: "Total Proved Reserves (MMbbls / BOE)",
                  value:
                    reserves.totalProvedReserves ??
                    reserves.provedReservesVolume ??
                    reserves.calculated?.provedReservesInSensitiveAreas?.volume,
                  unit: "MMbbls",
                },
                {
                  label: "Proved Reserves in Sensitive Areas",
                  value:
                    reserves.provedReservesSensitiveVolume ??
                    reserves.calculated?.provedReservesInSensitiveAreas?.volume,
                },
                {
                  label: "Total Probable Reserves (MMbbls / BOE)",
                  value: reserves.totalProbableReserves ?? reserves.probableReservesVolume,
                  unit: "MMbbls",
                },
                {
                  label: "Probable Reserves in Sensitive Areas",
                  value:
                    reserves.probableReservesSensitiveVolume ??
                    reserves.calculated?.probableReservesInSensitiveAreas?.volume,
                },
                {
                  label: "Reference Database",
                  value: reserves.referenceDatabase,
                },
              ]}
            />
          </div>
        )}
      </SubMetricSection>
    </MetricAccordion>
  );
}
