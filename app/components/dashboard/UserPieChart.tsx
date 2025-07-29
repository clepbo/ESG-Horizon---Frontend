"use client";

import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const data = [
  { name: "Admins", value: 4 },
  { name: "ESG Company", value: 25 },
  { name: "Regulators", value: 5 },
  { name: "Investor", value: 10 },
];

const COLORS = ["#8884d8", "#facc15", "#60a5fa", "#94a3b8"];

const renderLabel = ({ percent }: any) => `${(percent * 100).toFixed(0)}%`;

export default function UserPieChart() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Users Metrics
      </h3>
      <PieChart width={400} height={310}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={100}
          dataKey="value"
          label={renderLabel}
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
}
