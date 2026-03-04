import React from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import "highcharts/highcharts-more";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/components/ui/tooltip";
import { formatNumberFigures, formatWithCommas } from "./FormatNumberFigures";

export interface ScopeBreakdown {
  scope1: number;
  scope2: number;
  scope3: number;
}

interface GuageProps {
  score: number;
  initialEmission: number | string;
  currentEmission: number | string;
  targetEmission: number | string;
  reductionPercentage?: number;
  baselineYear?: number;
  currentYear?: number;
  targetYear?: number;
  baselineBreakdown?: ScopeBreakdown;
  currentBreakdown?: ScopeBreakdown;
}

function toEmissionFigure(value: number | string): string {
  const num = typeof value === "number" ? value : Number(String(value).replace(/,/g, ""));
  return formatNumberFigures(Number.isNaN(num) ? 0 : num);
}

function toRawNumber(value: number | string): number {
  const num = typeof value === "number" ? value : Number(String(value).replace(/,/g, ""));
  return Number.isNaN(num) ? 0 : num;
}

function hasScopeData(breakdown: ScopeBreakdown) {
  return breakdown.scope1 > 0 || breakdown.scope2 > 0 || breakdown.scope3 > 0;
}

function scopeLabel(breakdown: ScopeBreakdown) {
  const parts: string[] = [];
  if (breakdown.scope1 > 0) parts.push("Scope 1");
  if (breakdown.scope2 > 0) parts.push("Scope 2");
  if (breakdown.scope3 > 0) parts.push("Scope 3");
  return parts.join(" + ");
}

function ScopeRows({ breakdown }: { breakdown: ScopeBreakdown }) {
  return (
    <>
      {breakdown.scope1 > 0 && <p>Scope 1: {formatWithCommas(breakdown.scope1)} tCO₂e</p>}
      {breakdown.scope2 > 0 && <p>Scope 2: {formatWithCommas(breakdown.scope2)} tCO₂e</p>}
      {breakdown.scope3 > 0 && <p>Scope 3: {formatWithCommas(breakdown.scope3)} tCO₂e</p>}
    </>
  );
}

const SpeedometerGauge: React.FC<GuageProps> = ({
  score,
  initialEmission,
  currentEmission,
  targetEmission,
  reductionPercentage,
  baselineYear,
  currentYear,
  targetYear,
  baselineBreakdown,
  currentBreakdown,
}) => {
  const initial = toEmissionFigure(initialEmission);
  const current = toEmissionFigure(currentEmission);
  const target = toEmissionFigure(targetEmission);

  const baselineRaw = toRawNumber(initialEmission);
  const currentRaw = toRawNumber(currentEmission);
  const targetRaw = toRawNumber(targetEmission);
  const totalReductionNeeded = baselineRaw - targetRaw;
  const reducedSoFar = Math.max(0, baselineRaw - currentRaw);
  const attainedPct =
    totalReductionNeeded > 0
      ? Math.min(100, Math.max(0, Math.round((reducedSoFar / totalReductionNeeded) * 100)))
      : 0;
  const stillNeeded = Math.max(0, currentRaw - targetRaw);
  const options: Highcharts.Options = {
    chart: {
      type: "gauge",
      plotBackgroundColor: "",
      plotBackgroundImage: "",
      plotBorderWidth: 0,
      plotShadow: false,
      height: 380,
    },
    title: {
      text: "Net Zero Progress (Carbon Footprint)",
      margin: 30,
      style: { fontSize: "22px" },
    },
    pane: {
      startAngle: -90,
      endAngle: 89.9,
      background: undefined,
      center: ["50%", "75%"],
      size: "140%",
    },
    credits: {
      enabled: false,
    },
    yAxis: {
      min: 0,
      max: 200,
      tickPixelInterval: 72,
      tickPosition: "inside",
      tickColor: "#FFFFFF",
      tickLength: 26,
      tickWidth: 2,
      minorTickInterval: undefined,
      labels: {
        enabled: false,
        distance: 20,
        style: {
          fontSize: "18px",
        },
      },
      lineWidth: 0,
      plotBands: [
        {
          from: 0,
          to: score,
          color: "#119B95",
          thickness: 26,
        },
        {
          from: score,
          to: 200,
          color: "#CDFAF3",
          thickness: 26,
        },
      ],
    },
    series: [
      {
        type: "gauge",
        name: "ESG Score",
        data: [score],
        tooltip: {
          pointFormatter: function () {
            return `ESG Score: <b>N/A</b>`;
          },
        },
        dataLabels: {
          enabled: false,
        },
        dial: {
          radius: "85%",
          backgroundColor: "#119B95",
          baseWidth: 16,
          baseLength: "0%",
          rearLength: "0%",
        },
        pivot: {
          backgroundColor: "#119B95",
          radius: 8,
        },
      },
    ],
  };

  return (
    <TooltipProvider>
      <div
        className="highcharts-figure"
        style={{
          width: "100%",
          maxWidth: "900px",
          minHeight: "420px",
          margin: "1.25em auto",
        }}
      >
        <HighchartsReact highcharts={Highcharts} options={options} />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "8px",
            padding: "0 8px",
            position: "relative",
          }}
        >
          {/* Label 1 - Left (Baseline) */}
          <div style={{ textAlign: "center", flex: 1, transform: "translateX(-10px)" }}>
            <div style={{ color: "red", fontSize: "18px", fontWeight: 600 }}>{initial}</div>
            {baselineYear && (
              <div style={{ color: "#119B95", fontSize: "12px", fontWeight: 600, marginTop: "2px" }}>
                {baselineYear}
              </div>
            )}
            <div
              style={{
                color: "#666",
                fontSize: "14px",
                marginTop: "6px",
                fontWeight: "bold",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              Baseline year emission
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="max-w-xs bg-gray-800 text-white p-3 rounded-lg shadow-xl border-none text-xs"
                >
                  <p className="font-medium mb-1">Baseline Year Emission</p>
                  {baselineBreakdown && hasScopeData(baselineBreakdown) ? (
                    <>
                      <p className="mb-1">
                        It is the total GHG emissions ({scopeLabel(baselineBreakdown)}) from the
                        assessment selected as your baseline when the target was created.
                      </p>
                      <div className="mt-2 border-t border-gray-600 pt-2">
                        <p className="font-medium mb-1">Scope breakdown:</p>
                        <ScopeRows breakdown={baselineBreakdown} />
                      </div>
                    </>
                  ) : (
                    <p>
                      It is the total GHG emissions from the assessment selected as your baseline
                      when the target was created.
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Label 2 - Center (Current) */}
          <div style={{ textAlign: "center", flex: 1, transform: "translateX(-10px)" }}>
            <div style={{ color: "red", fontSize: "18px", fontWeight: 600 }}>{current}</div>
            {currentYear && (
              <div style={{ color: "#119B95", fontSize: "12px", fontWeight: 600, marginTop: "2px" }}>
                {currentYear}
              </div>
            )}
            <div
              style={{
                color: "#666",
                fontSize: "14px",
                marginTop: "6px",
                fontWeight: "bold",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              Current emission
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="max-w-xs bg-gray-800 text-white p-3 rounded-lg shadow-xl border-none text-xs"
                >
                  <p className="font-medium mb-1">Current Emission</p>
                  {currentBreakdown && hasScopeData(currentBreakdown) ? (
                    <>
                      <p className="mb-1">
                        It is the total GHG emissions ({scopeLabel(currentBreakdown)}) from your
                        most recent assessment. This value updates each time a new assessment is approved.
                      </p>
                      <div className="mt-2 border-t border-gray-600 pt-2">
                        <p className="font-medium mb-1">Scope breakdown:</p>
                        <ScopeRows breakdown={currentBreakdown} />
                      </div>
                    </>
                  ) : (
                    <p>
                      It is the total GHG emissions from your most recent assessment. This value
                      updates each time this page loads.
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Label 3 - Right (Target) */}
          <div style={{ textAlign: "center", flex: 1, transform: "translateX(-10px)" }}>
            <div style={{ color: "red", fontSize: "18px", fontWeight: 600 }}>{target}</div>
            {targetYear && (
              <div style={{ color: "#119B95", fontSize: "12px", fontWeight: 600, marginTop: "2px" }}>
                {targetYear}
              </div>
            )}
            {reductionPercentage != null && (
              <div style={{ color: "#f97316", fontSize: "12px", fontWeight: 600, marginTop: "2px" }}>
                Goal: -{reductionPercentage}%
              </div>
            )}
            <div
              style={{
                color: "#666",
                fontSize: "14px",
                marginTop: "6px",
                fontWeight: "bold",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              Target year emission
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="max-w-xs bg-gray-800 text-white p-3 rounded-lg shadow-xl border-none text-xs font-mono"
                >
                  <p className="font-sans font-medium mb-1">Target Year Emission</p>
                  <p>= Baseline x (1 - Reduction% / 100)</p>
                  <p>
                    = {formatWithCommas(baselineRaw)} x (1 -{" "}
                    {reductionPercentage ?? 0} / 100)
                  </p>
                  <p className="font-semibold">
                    = {formatWithCommas(targetRaw)} tCO₂e
                  </p>
                  {totalReductionNeeded > 0 && (
                    <div className="mt-2 border-t border-gray-600 pt-2 font-sans">
                      <p className="font-medium mb-1">Progress toward goal:</p>
                      <p>
                        Reduced so far:{" "}
                        <span className="font-semibold">{formatWithCommas(reducedSoFar)} tCO₂e</span>{" "}
                        ({attainedPct}%)
                      </p>
                      {stillNeeded > 0 ? (
                        <p>
                          Still needed:{" "}
                          <span className="font-semibold">{formatWithCommas(stillNeeded)} tCO₂e</span>
                        </p>
                      ) : (
                        <p className="text-green-400 font-semibold">Goal achieved!</p>
                      )}
                    </div>
                  )}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default React.memo(SpeedometerGauge);
