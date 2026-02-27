"use client";

import { PieChart, Pie, Cell } from "recharts";
import React from "react";
import { cn } from "@/lib/utils";
import { formatNumberWithCommas } from "@/app/(company)/reports-and-analytics/components/utils/helpers";
import { formatNumberFull } from "@/lib/numberFormat";

interface MiniDonutChartProps {
  label: string;
  percentage: number;
  value: number;
  color: string;
}

export function MiniDonutChart({ label, percentage, value, color }: MiniDonutChartProps) {
  const data = [{ value: percentage }, { value: 100 - percentage }];
  return (
    <div className="flex flex-col items-center text-center space-y-2">
      <PieChart width={120} height={120}>
        <Pie
          data={data}
          cx={60}
          cy={60}
          innerRadius={38}
          outerRadius={55}
          startAngle={90}
          endAngle={-270}
          dataKey="value"
          labelLine={false}
          label={({ cx, cy }) => (
            <text
              x={cx}
              y={cy}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-sm font-semibold"
            >
              {parseFloat(percentage.toFixed(2))}%
            </text>
          )}
        >
          <Cell fill={color} />
          <Cell fill="#E5E7EB" />
        </Pie>
      </PieChart>
      <div className="text-sm">
        <p className="font-semibold">{label}</p>
        <p className="text-gray-600">{formatNumberWithCommas(value)} tCO₂e</p>
      </div>
    </div>
  );
}

export function ScopeTargetDonutChart({ label, percentage, value, color }: MiniDonutChartProps) {
  const data = [{ value: percentage }, { value: 100 - percentage }];
  return (
    <div className="flex items-center gap-3 text-center space-y-2">
      <PieChart width={120} height={120}>
        <Pie
          data={data}
          cx={60}
          cy={60}
          innerRadius={38}
          outerRadius={55}
          startAngle={90}
          endAngle={-270}
          dataKey="value"
          labelLine={false}
          label={({ cx, cy }) => (
            <text
              x={cx}
              y={cy}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-sm font-semibold"
            >
              {parseFloat(percentage.toFixed(2))}%
            </text>
          )}
        >
          <Cell fill={color} />
          <Cell fill="#E5E7EB" />
        </Pie>
      </PieChart>
      <div className="text-sm">
        <p className="font-semibold">{label}</p>
        <p className="text-gray-600">{formatNumberWithCommas(value)} tCO₂e</p>
      </div>
    </div>
  );
}
interface KpiCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  isTarget?: boolean;
}

export const KpiCard: React.FC<KpiCardProps> = ({ title, children, className }) => {
  return (
    <div className={cn("w-full rounded-lg bg-white p-6 shadow-sm", className)}>
      {title && <h2 className="text-lg font-semibold mb-4">{title}</h2>}
      {children}
    </div>
  );
};

interface GaugeChartProps {
  current: number;
  target: number;
  baseline: number;
}

export function GaugeChart() {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <h3 className="text-lg font-semibold mb-2">Net Zero Progress (Carbon Footprint)</h3>
    </div>
  );
}

interface GaugeChartProps {
  baselineEmission: number;
  currentEmission: number;
  targetEmission: number;
}

export function RechartsGaugeChart({
  baselineEmission,
  currentEmission,
  targetEmission,
}: GaugeChartProps) {
  const percentage = Math.round((currentEmission / baselineEmission) * 100);

  const data = [
    { name: "Progress", value: percentage, color: "#3b82f6" },
    { name: "Remaining", value: 100 - percentage, color: "#e5e7eb" },
  ];

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-lg">
      <div className="relative mb-8">
        <PieChart width={200} height={120}>
          <Pie
            data={data}
            cx="50%"
            cy="100%"
            startAngle={180}
            endAngle={0}
            innerRadius={80}
            outerRadius={100}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>

        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 -translate-y-8 text-center">
          <div className="text-2xl font-bold text-gray-900">{percentage}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 w-full max-w-md">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-lg font-semibold text-gray-900">
            {formatNumberFull(baselineEmission)} tCO₂e
          </div>
          <div className="text-sm text-gray-600">Baseline Year Emission</div>
        </div>

        <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-lg font-semibold text-blue-700">
            {formatNumberFull(currentEmission)} tCO₂e ({percentage}%)
          </div>
          <div className="text-sm text-blue-600">Current Emission</div>
        </div>

        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-lg font-semibold text-gray-900">
            {formatNumberFull(targetEmission)} tCO₂e
          </div>
          <div className="text-sm text-gray-600">Target Year Emission</div>
        </div>
      </div>
    </div>
  );
}
