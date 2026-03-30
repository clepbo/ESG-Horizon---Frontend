"use client";

import ESGReportCard from "./ESGReportCard";
import type { ESGReportMetric } from "./types";

interface ESGReportGridProps {
  metrics: ESGReportMetric[];
}

export default function ESGReportGrid({ metrics }: ESGReportGridProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-3">ESG Assessment Report</h2>
      {metrics.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 shadow-sm text-center">
          <p className="text-sm text-gray-900">No approved assessment report available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((metric) => (
            <ESGReportCard key={metric.id} metric={metric} />
          ))}
        </div>
      )}
    </div>
  );
}
