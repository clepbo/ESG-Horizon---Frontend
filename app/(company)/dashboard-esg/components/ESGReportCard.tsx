"use client";

import { ArrowUp, ArrowDown } from "lucide-react";
import type { ESGReportMetric } from "./types";

interface ESGReportCardProps {
  metric: ESGReportMetric;
}

export default function ESGReportCard({ metric }: ESGReportCardProps) {
  return (
    <div
      className="rounded-2xl bg-white p-5 shadow-sm"
      style={{ borderTop: `3px solid ${metric.borderColor}` }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: metric.iconBg, color: metric.borderColor }}
          >
            {metric.icon}
          </div>
          <h4 className="text-base font-semibold text-gray-900">{metric.title}</h4>
        </div>
      </div>

      <p className="text-sm text-gray-900 mb-1">{metric.metricLabel}</p>

      <div className="flex items-end justify-between">
        <div>
          <span className="text-2xl font-bold text-gray-900">{metric.metricValue}</span>
          {metric.metricUnit && (
            <span className="text-xs text-gray-900 ml-1">{metric.metricUnit}</span>
          )}
        </div>

        <ChangeBadge text={metric.changeText} direction={metric.changeDirection} upIsBad={metric.upIsBad} />
      </div>
    </div>
  );
}

function ChangeBadge({
  text,
  direction,
  upIsBad,
}: {
  text: string;
  direction: "up" | "down" | "neutral";
  upIsBad?: boolean;
}) {
  // Determine if this change is favorable:
  // upIsBad=true (most ESG): up=red, down=green
  // upIsBad=false (production): up=green, down=red
  const isGood =
    direction === "neutral"
      ? null
      : upIsBad
        ? direction === "down"
        : direction === "up";

  const colorClasses =
    isGood === null
      ? "text-amber-700 bg-amber-50"
      : isGood
        ? "text-emerald-700 bg-emerald-50"
        : "text-red-600 bg-red-50";

  return (
    <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium ${colorClasses}`}>
      {direction === "up" && <ArrowUp className="w-3 h-3" />}
      {direction === "down" && <ArrowDown className="w-3 h-3" />}
      {text}
    </span>
  );
}
