"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Sample data (replace with your real data or props)
const data = [
  { name: "Production Platforms", value: 300, color: "#3b82f6" }, // blue
  { name: "FPSOs", value: 100, color: "#22c55e" }, // green
  { name: "Other Offshore Sites", value: 60, color: "#9ca3af" }, // gray
];

interface DonutChartProps {
  title?: string;
  data?: { name: string; value: number; color: string }[];
}

export default function DonutChart({
  title = "Offshore Sites",
  data: chartData = data,
}: DonutChartProps) {
  return (
    <div className="w-full h-[400px] bg-white rounded-lg p-4 shadow">
      <h3 className="text-lg font-semibold mb-4 border-b border-b-gray-300 pb-3">{title}</h3>

      <ResponsiveContainer width="100%" height="90%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={70} // donut thickness
            outerRadius={100}
            paddingAngle={4} // spacing between arcs
            cornerRadius={5} // rounded edges
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            wrapperStyle={{ fontSize: 14 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
