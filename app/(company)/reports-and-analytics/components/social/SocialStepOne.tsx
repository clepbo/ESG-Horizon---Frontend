"use client";

import React from "react";
import { ReportResponse } from "@/types/report/reportResponse";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ReservesData {
  reserveType: string;
  total: number;
  specific: number;
}

interface ChartData {
  title: string;
  totalLabel: string;
  specificLabel: string;
  totalColor: string;
  specificColor: string;
  data: ReservesData[];
}


interface SocialStepOneProps {
  reportData?: ReportResponse;
}

export default function SocialStepOne({ reportData }: SocialStepOneProps) {
  const conflictZonesData: ReservesData[] = [
    {
      reserveType: "Proved Reserves",
      total:
        reportData?.socialCapital?.securityHumanRightsAndIndigenousPeople?.operationsInConflictZones
          ?.provedReserves || 0,
      specific:
        reportData?.socialCapital?.securityHumanRightsAndIndigenousPeople?.operationsInConflictZones
          ?.provedReserves || 0,
    },
    {
      reserveType: "Probable Reserves",
      total:
        reportData?.socialCapital?.securityHumanRightsAndIndigenousPeople?.operationsInConflictZones
          ?.probableReserves || 0,
      specific:
        reportData?.socialCapital?.securityHumanRightsAndIndigenousPeople?.operationsInConflictZones
          ?.probableReserves || 0,
    },
  ];

  const indigenousLandData: ReservesData[] = [
    {
      reserveType: "Proved Reserves",
      total:
        reportData?.socialCapital?.securityHumanRightsAndIndigenousPeople
          ?.reservesInNearIndigenousLand?.provedReserves || 0,
      specific:
        reportData?.socialCapital?.securityHumanRightsAndIndigenousPeople
          ?.reservesInNearIndigenousLand?.provedReserves || 0,
    },
    {
      reserveType: "Probable Reserves",
      total:
        reportData?.socialCapital?.securityHumanRightsAndIndigenousPeople
          ?.reservesInNearIndigenousLand?.probableReserves || 0,
      specific:
        reportData?.socialCapital?.securityHumanRightsAndIndigenousPeople
          ?.reservesInNearIndigenousLand?.probableReserves || 0,
    },
  ];

  const chartsConfig: ChartData[] = [
    {
      title: "Operations in Conflict Zones",
      totalLabel: "Total",
      specificLabel: "In Conflict",
      totalColor: "#9CA3AF", // grey
      specificColor: "#EF4444", // red
      data: conflictZonesData,
    },
    {
      title: "Reserves in/near Indigenous Land",
      totalLabel: "Total",
      specificLabel: "In/Near Indigenous",
      totalColor: "#9CA3AF", // grey
      specificColor: "#F97316", // orange
      data: indigenousLandData,
    },
  ];

  const CustomLegend = ({ payload }: any) => {
    if (!payload) return null;
    return (
      <div className="flex justify-center gap-6 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={`legend-${index}`} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-sm text-gray-700">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-sm mb-2">{payload[0].payload.reserveType}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`tooltip-${index}`} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {chartsConfig.map((chart, chartIndex) => (
          <div
            key={chartIndex}
            className="bg-white rounded-lg p-4 md:p-6 shadow-sm border border-gray-100"
          >
            <h3 className="text-lg md:text-xl font-semibold mb-4 md:mb-6 text-gray-800">
              {chart.title}
            </h3>
            <hr className="text-gray-200" />
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={chart.data}
                margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
                barGap={8}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis
                  dataKey="reserveType"
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                  axisLine={{ stroke: "#D1D5DB" }}
                />
                <YAxis
                  domain={[0, 600]}
                  ticks={[0, 150, 300, 450, 600]}
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                  axisLine={{ stroke: "#D1D5DB" }}
                  width={40}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend content={<CustomLegend />} />
                <Bar
                  dataKey="total"
                  name={chart.totalLabel}
                  fill={chart.totalColor}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="specific"
                  name={chart.specificLabel}
                  fill={chart.specificColor}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>
    </div>
  );
}
