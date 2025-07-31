"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { PieLabelRenderProps } from "recharts/types/polar/Pie";

const USER_METRICS_DATA = [
  { name: "Admins", value: 4 },
  { name: "Managers", value: 8 },
  { name: "Investors", value: 6 },
  { name: "Guests", value: 2 },
];

const CHART_COLORS = ["#8884d8", "#facc15", "#60a5fa", "#94a3b8"];

const renderPercentageLabel = ({ percent }: PieLabelRenderProps) =>
  `${(percent ?? 0) * 100}%`;

export default function UserPieChart() {
  return (
    <section
      className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
      aria-label="User distribution pie chart"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Users Metrics
      </h3>

      <div className="w-full h-[280px] md:h-[310px]">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={USER_METRICS_DATA}
              dataKey="value"
              cx="50%"
              cy="50%"
              outerRadius="80%"
              label={renderPercentageLabel}
              isAnimationActive={false}
            >
              {USER_METRICS_DATA.map((_, index) => (
                <Cell
                  key={`slice-${index}`}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend layout="horizontal" verticalAlign="bottom" align="center" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
