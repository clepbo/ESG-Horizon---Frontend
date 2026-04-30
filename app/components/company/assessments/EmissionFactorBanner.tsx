"use client";

import { Info } from "lucide-react";

interface EmissionFactorBannerProps {
  /** Numeric factor displayed to the user */
  factor: number;
  /** e.g. "kgCO₂e/$", "kgCO₂e/km" */
  unit: string;
  /** Short attribution shown beneath the factor */
  source?: string;
  className?: string;
}

/**
 * Read-only emission factor banner. Used on Scope 3 forms (and anywhere
 * else that wants to surface the default factor without offering an edit).
 *
 * Visual style mirrors the teal banner inside ScopeInput so users see a
 * consistent treatment across the assessment.
 */
export function EmissionFactorBanner({
  factor,
  unit,
  source,
  className = "",
}: EmissionFactorBannerProps) {
  return (
    <div
      className={`bg-teal-50 border-l-4 border-teal-500 p-3 rounded-r-lg ${className}`}
    >
      <div className="flex items-start gap-2">
        <Info className="h-4 w-4 text-teal-600 mt-0.5 shrink-0" />
        <div className="text-xs flex-1">
          <p className="font-semibold text-teal-900">
            Emission Factor: {factor} {unit}
          </p>
          {source && <p className="text-teal-700 mt-1">Source: {source}</p>}
        </div>
      </div>
    </div>
  );
}
