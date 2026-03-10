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

interface GuageProps {
  score: number;
  initialEmission: number | string;
  currentEmission: number | string;
  targetEmission: number | string;
  reductionPercentage?: number;
  baselineYear?: number;
  currentYear?: number;
  targetYear?: number;
  /** When true, renders a smaller compact version for the 3-column scope layout */
  compact?: boolean;
  /** When set, tooltips and labels are scoped to this specific scope */
  scopeLabel?: "Scope 1" | "Scope 2" | "Scope 3";
  /** Short description shown in the compact scope gauge header */
  scopeDescription?: string;
}

function toEmissionFigure(value: number | string): string {
  const num = typeof value === "number" ? value : Number(String(value).replace(/,/g, ""));
  return formatNumberFigures(Number.isNaN(num) ? 0 : num);
}

function toRawNumber(value: number | string): number {
  const num = typeof value === "number" ? value : Number(String(value).replace(/,/g, ""));
  return Number.isNaN(num) ? 0 : num;
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
  compact = false,
  scopeLabel: sl,
  scopeDescription,
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

  const isScope = !!sl;
  const chartHeight = compact ? 380 : 380;
  // In compact scope mode the title is rendered as HTML outside the chart (left-aligned)
  const chartTitle = compact && isScope ? "" : isScope ? `${sl} Progress` : "Net Zero Progress (Carbon Footprint)";
  const chartTitleSize = compact ? "18px" : "22px";

  const options: Highcharts.Options = {
    chart: {
      type: "gauge",
      plotBackgroundColor: "",
      plotBackgroundImage: "",
      plotBorderWidth: 0,
      plotShadow: false,
      height: chartHeight,
      marginTop: compact && isScope ? 40 : undefined,
    },
    title: {
      text: chartTitle,
      margin: compact ? 30 : 30,
      style: { fontSize: chartTitleSize },
    },
    pane: {
      startAngle: -90,
      endAngle: 89.9,
      background: undefined,
      center: ["50%", "75%"],
      size: "140%",
    },
    credits: { enabled: false },
    tooltip: { enabled: true },
    yAxis: {
      min: 0,
      max: 100,
      tickPositions: [0, 25, 50, 75, 100],
      tickPosition: "inside",
      tickColor: "#FFFFFF",
      tickLength: 26,
      tickWidth: 2,
      minorTickInterval: undefined,
      labels: {
        enabled: true,
        distance: 25,
        style: {
          fontSize: "13px",
          fontWeight: "600",
          color: "#555",
        },
        formatter: function () {
          const v = this.value as number;
          if (v === 0) return "0%";
          if (v === 50) return "50%";
          if (v === 100) return "100%";
          return "";
        },
      },
      lineWidth: 0,
      plotBands: [
        { from: 0, to: score, color: "#119B95", thickness: 26 },
        { from: score, to: 100, color: "#CDFAF3", thickness: 26 },
      ],
    },
    series: [
      {
        type: "gauge",
        name: isScope ? `${sl} Progress` : "Net Zero Progress",
        data: [score],
        tooltip: {
          pointFormatter: function () {
            const lines = [
              `<span style="color:#119B95;font-weight:bold">${isScope ? sl : "Net Zero"} Progress: ${attainedPct}%</span>`,
              `<br/>Reduced so far: <b>${formatWithCommas(reducedSoFar)} tCO₂e</b>`,
              stillNeeded > 0
                ? `<br/>Still needed: <b>${formatWithCommas(stillNeeded)} tCO₂e</b>`
                : `<br/><span style="color:#22c55e;font-weight:bold">Target Achieved!</span>`,
            ];
            return lines.join("");
          },
        },
        dataLabels: { enabled: false },
        dial: {
          radius: "85%",
          backgroundColor: "#119B95",
          baseWidth: 16,
          baseLength: "0%",
          rearLength: "0%",
        },
        pivot: { backgroundColor: "#119B95", radius: 8 },
      },
    ],
  };

  const labelStyle: React.CSSProperties = {
    color: "#666",
    fontSize: "14px",
    marginTop: "6px",
    fontWeight: "bold",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
  };

  const valueStyle: React.CSSProperties = {
    color: "red",
    fontSize: "18px",
    fontWeight: 600,
  };

  const yearStyle: React.CSSProperties = {
    color: "#119B95",
    fontSize: "12px",
    fontWeight: 600,
    marginTop: "2px",
  };

  return (
    <TooltipProvider>
      <div
        className="highcharts-figure"
        style={{
          width: "100%",
          maxWidth: compact ? "900px" : "900px",
          minHeight: compact ? "420px" : "420px",
          margin: "0 auto",
        }}
      >
        <HighchartsReact highcharts={Highcharts} options={options} />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: compact ? "4px" : "8px",
            padding: "0 8px",
            position: "relative",
          }}
        >
          {/* Baseline */}
          <div style={{ textAlign: "center", flex: 1, transform: "translateX(-10px)" }}>
            <div style={valueStyle}>{initial}</div>
            {baselineYear && <div style={yearStyle}>{baselineYear}</div>}
            <div style={labelStyle}>
              {isScope ? `${sl} Baseline` : "Baseline year emission"}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="max-w-xs bg-primary text-white p-3 rounded-lg shadow-xl border-none text-xs"
                >
                  <p className="font-medium mb-1">
                    {isScope ? `${sl} Baseline Emission` : "General Target Baseline Emission"}
                  </p>
                  {isScope ? (
                    <p>
                      {scopeDescription} — recorded in the baseline year ({baselineYear}) when the
                      target was created.
                    </p>
                  ) : (
                    <p>
                      Total company-wide GHG emissions from the assessment selected as your general
                      target baseline year ({baselineYear}).
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Current */}
          <div style={{ textAlign: "center", flex: 1, transform: "translateX(-10px)" }}>
            <div style={valueStyle}>{current}</div>
            {currentYear && <div style={yearStyle}>{currentYear}</div>}
            <div style={labelStyle}>
              {isScope ? `${sl} Current` : "Current emission"}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="max-w-xs bg-primary text-white p-3 rounded-lg shadow-xl border-none text-xs"
                >
                  <p className="font-medium mb-1">
                    {isScope ? `${sl} Current Emission` : "General Target Current Emission"}
                  </p>
                  {isScope ? (
                    <p>
                      {scopeDescription} — from your most recent approved assessment. Updates each
                      time a new assessment is approved.
                    </p>
                  ) : (
                    <p>
                      Total company-wide GHG emissions from your most recent approved assessment.
                      Updates each time a new assessment is approved.
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Target */}
          <div style={{ textAlign: "center", flex: 1, transform: "translateX(-10px)" }}>
            <div style={valueStyle}>{target}</div>
            {targetYear && (
              <div style={{ fontSize: "12px", fontWeight: 600, marginTop: "2px" }}>
                <span style={{ color: "#119B95" }}>{targetYear}</span>
                {reductionPercentage != null && (
                  <span style={{ color: "#f97316", marginLeft: "4px" }}>
                    (Goal: -{reductionPercentage}%)
                  </span>
                )}
              </div>
            )}
            <div style={labelStyle}>
              {isScope ? `${sl} Target` : "Target year emission"}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="max-w-xs bg-primary text-white p-3 rounded-lg shadow-xl border-none text-xs font-mono"
                >
                  <p className="font-sans font-medium mb-1">
                    {isScope ? `${sl} Target Emission` : "General Target Emission"}
                  </p>
                  <p>= {isScope ? `${sl} Baseline` : "General Baseline"} × (1 − Reduction% ÷ 100)</p>
                  <p>
                    = {formatWithCommas(baselineRaw)} × (1 − {reductionPercentage ?? 0} ÷ 100)
                  </p>
                  <p className="font-semibold">= {formatWithCommas(targetRaw)} tCO₂e</p>
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
