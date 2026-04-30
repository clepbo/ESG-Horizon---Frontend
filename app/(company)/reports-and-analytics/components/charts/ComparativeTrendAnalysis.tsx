"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatNumberFull } from "@/lib/numberFormat";

interface TrendData {
  year: string | number;
  [key: string]: string | number;
}

interface ComparativeTrendAnalysisProps {
  data: TrendData[];
  keys: string[]; // ["Scope 1", "Scope 2", "Scope 3"]
  colors: string[]; // matching colors
}

// ---------- Component ----------
export default function ComparativeTrendAnalysis({
  data,
  keys,
  colors,
}: ComparativeTrendAnalysisProps) {
  return (
    <div className="w-full">
      <h2 className="text-lg font-semibold mb-2">Comparative Trend Analysis</h2>

      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip
            formatter={(value) =>
              formatNumberFull(Number(value) || 0, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            }
          />
          <Legend />

          {keys.map((key, index) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stackId="1"
              stroke={colors[index]}
              fill={colors[index]}
              fillOpacity={0.3} // soft area shading
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
