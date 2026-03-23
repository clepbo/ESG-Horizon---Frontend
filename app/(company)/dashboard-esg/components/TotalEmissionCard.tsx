"use client";

import { formatNumberWithCommas } from "@/app/(company)/reports-and-analytics/components/utils/helpers";

interface TotalEmissionCardProps {
  total: number;
  scope1: number;
  scope2: number;
  scope3: number;
}

export default function TotalEmissionCard({
  total,
  scope1,
  scope2,
  scope3,
}: TotalEmissionCardProps) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#0d3b3b] to-[#1a5c5c] p-6 text-white flex flex-col justify-between h-full min-h-[180px]">
      <p className="text-sm font-semibold tracking-widest uppercase text-emerald-300">
        Total Emission
      </p>

      <div className="mt-3">
        <span className="text-4xl font-bold">{formatNumberWithCommas(total)}</span>
        <span className="text-lg ml-2 text-white">tCO₂e</span>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        <ScopeChip label="Scope 1" value={formatNumberWithCommas(scope1)} />
        <ScopeChip label="Scope 2" value={formatNumberWithCommas(scope2)} />
        <ScopeChip label="Scope 3" value={formatNumberWithCommas(scope3)} />
      </div>
    </div>
  );
}

function ScopeChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white">
      {label}: {value}
    </span>
  );
}
