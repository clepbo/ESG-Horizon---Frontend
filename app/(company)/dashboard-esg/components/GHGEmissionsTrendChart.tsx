"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatNumberFull } from "@/lib/numberFormat";
import type { EmissionTrendPoint } from "./types";

interface GHGEmissionsTrendChartProps {
  data: EmissionTrendPoint[];
}

type ScopeFilter = "all" | "scope1" | "scope2" | "scope3";

const TABS: { key: ScopeFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "scope1", label: "Scope 1" },
  { key: "scope2", label: "Scope 2" },
  { key: "scope3", label: "Scope 3" },
];

function formatYAxis(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
  return String(value);
}

export default function GHGEmissionsTrendChart({ data }: GHGEmissionsTrendChartProps) {
  const [activeTab, setActiveTab] = useState<ScopeFilter>("all");

  const dataKey = activeTab === "all" ? "total" : activeTab;

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm h-full flex flex-col min-h-[280px]">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h3 className="text-xl font-semibold text-gray-900">GHG Emissions Trend</h3>

        <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                activeTab === tab.key ? "bg-[#119B95] text-white" : "text-gray-900 hover:text-black"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-sm text-gray-900">
          No emissions data available yet.
        </div>
      ) : (
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="ghgGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#119B95" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#119B95" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis
                dataKey="year"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#1F2937" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={formatYAxis}
                tick={{ fontSize: 12, fill: "#1F2937" }}
              />
              <Tooltip
                formatter={(value) => {
                  const v = typeof value === "number" ? value : Number(value) || 0;
                  return [
                    `${formatNumberFull(v)} tCO₂e`,
                    activeTab === "all" ? "Total" : activeTab.replace("scope", "Scope "),
                  ];
                }}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #E5E7EB",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke="#119B95"
                strokeWidth={2}
                fill="url(#ghgGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
