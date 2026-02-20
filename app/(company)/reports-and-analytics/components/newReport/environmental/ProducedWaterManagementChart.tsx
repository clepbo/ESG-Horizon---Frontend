"use client";

import { formatNumberFigures } from "@/app/(company)/components/ranking/FormatNumberFigures";
import { Pie, PieChart, Legend, ResponsiveContainer, Cell, Tooltip } from "recharts";

interface ProducedWaterManagementChartProps {
  isAnimationActive?: boolean;
  recycled?: number;
  injected?: number;
  discharged?: number;
}

export default function ProducedWaterManagementChart({
  isAnimationActive = true,
  recycled = 0,
  injected = 0,
  discharged = 0,
}: ProducedWaterManagementChartProps) {
  const data = [
    { name: "Recycled", value: recycled, color: "#10B981" },
    { name: "Injected", value: injected, color: "#6366F1" },
    { name: "Discharged", value: discharged, color: "#eb6f70" },
  ].filter((item) => item.value > 0);

  const renderCustomLabel = (entry: any) => {
    return formatNumberFigures(entry.value);
  };
  return (
    <>
      <h6 className="border-b pb-2 border-gray-200">Produced Water Management</h6>

      <div className="mt-3 w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={50}
              outerRadius={60}
              cornerRadius={8}
              paddingAngle={4}
              isAnimationActive={isAnimationActive}
              label={renderCustomLabel}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>

            <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ fontSize: 14, color: "#111827", fontWeight: 500 }} />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
