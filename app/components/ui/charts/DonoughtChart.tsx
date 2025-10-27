"use client";

import { PieChart, Pie, Cell } from "recharts";
import React from "react";
import { cn } from "@/lib/utils";
import { CustomButton } from "../reusables/CustomButton";
import { Edit, Plus } from "lucide-react";

interface MiniDonutChartProps {
  label: string;
  percentage: number;
  value: number;
  color: string;
}

export function MiniDonutChart({ label, percentage, value, color }: MiniDonutChartProps) {
  const data = [
    { value: percentage },
    { value: 100 - percentage },
  ];

  return (
    <div className="flex flex-col items-center text-center space-y-2">
      <PieChart width={100} height={100}>
        <Pie
          data={data}
          cx={50}
          cy={50}
          innerRadius={30}
          outerRadius={45}
          startAngle={90}
          endAngle={-270}
          dataKey="value"
        >
          <Cell fill={color} />
          <Cell fill="#E5E7EB" />
        </Pie>
        {/* Center text using Recharts Text component */}
        <text
          x={50}
          y={50}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-base font-semibold"
        >
          {percentage}%
        </text>
      </PieChart>
      <div className="text-sm">
        <p className="font-semibold">{label}</p>
        <p className="text-gray-600">{value.toLocaleString()} tCO₂e</p>
      </div>
    </div>
  );
}


interface KpiCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({ title, children, className }) => {
  return (
    <div className={cn("w-full rounded-lg bg-white p-6 shadow-sm", className)}>
      {/* {title && <h2 className="text-lg font-semibold mb-4">{title}</h2>} */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold mb-4">{title}

        </h2>
        <div className="flex flex-wrap justify-end gap-3">
        <CustomButton variant="outlined" icon={<Plus />}>
          Set New Target
        </CustomButton>
        <CustomButton variant="filled" icon={<Edit />}>
          Edit Target
        </CustomButton>
      </div>
      </div>
      {children}
    </div>
  );
};


interface GaugeChartProps {
  current: number;
  target: number;
  baseline: number;
}

export function GaugeChart({ current, target, baseline }: GaugeChartProps) {
  const percentage = Math.round((current / baseline) * 100);
  const data = [
    { value: percentage },
    { value: 100 - percentage },
  ];

  const COLORS = ["#009688", "#D6F4F0"];

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <h3 className="text-lg font-semibold mb-2">Overall ESG Performance</h3>

      <div className="relative">
        <PieChart width={300} height={200}>
          <Pie
            data={data}
            startAngle={180}
            endAngle={0}
            innerRadius={80}
            outerRadius={100}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
        </PieChart>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
          <p className="text-xl font-bold">{current.toLocaleString()} tCO₂e ({percentage}%)</p>
          <p className="text-sm text-gray-600">Current Emission</p>
        </div>
      </div>

      {/* <div className="flex justify-between w-full mt-4 text-sm">
        <div className="text-center">
          <p className="text-red-500 font-semibold">{baseline.toLocaleString()} tCO₂e</p>
          <p>Baseline Year Emission</p>
        </div>
        <div className="text-center">
          <p className="text-teal-600 font-semibold">{target.toLocaleString()} tCO₂e</p>
          <p>Target Year Emission</p>
        </div>
      </div> */}
    </div>
  );
}
