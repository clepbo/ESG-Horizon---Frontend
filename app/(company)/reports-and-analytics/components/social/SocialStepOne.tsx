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
import { formatNumberFigures } from "@/app/(company)/components/ranking/FormatNumberFigures";

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
  const indigenousLand =
    reportData?.socialCapital?.securityHumanRightsAndIndigenousPeople?.reservesInNearIndigenousLand;

  const indigenousTotalProved = indigenousLand?.totalProvedReserves || 0;
  const indigenousTotalProbable = indigenousLand?.totalProbableReserves || 0;

  const conflictZones =
    reportData?.socialCapital?.securityHumanRightsAndIndigenousPeople?.operationsInConflictZones;

  const conflictZonesData: ReservesData[] = [
    {
      reserveType: "Proved Reserves",
      total: conflictZones?.totalProvedReserves ?? 0,
      specific: conflictZones?.provedReserves ?? 0,
    },
    {
      reserveType: "Probable Reserves",
      total: conflictZones?.totalProbableReserves ?? 0,
      specific: conflictZones?.probableReserves ?? 0,
    },
  ];

  const indigenousLandData: ReservesData[] = [
    {
      reserveType: "Proved Reserves",
      total: indigenousTotalProved,
      specific: indigenousLand?.provedReserves || 0,
    },
    {
      reserveType: "Probable Reserves",
      total: indigenousTotalProbable,
      specific: indigenousLand?.probableReserves || 0,
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
      specificColor: "#6366F1", // indigo
      data: indigenousLandData,
    },
  ];

  const CustomLegend = ({ payload }: any) => {
    if (!payload) return null;
    return (
      <div className="flex flex-col gap-3 items-start pl-2">
        {payload.map((entry: any, index: number) => (
          <div key={`legend-${index}`} className="flex items-center gap-2">
            <div className="w-3 h-3" style={{ backgroundColor: entry.color }} />
            <span className="text-[14px] font-medium text-gray-900">{entry.value}</span>
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
              {`${entry.name}: ${formatNumberFigures(Number(entry.value) || 0)}`}
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
            className="bg-white rounded-lg p-4 md:p-6 shadow-sm border border-gray-100 overflow-visible"
          >
            <h3 className="text-lg md:text-xl font-semibold mb-4 md:mb-6 text-gray-800">
              {chart.title}
            </h3>
            <hr className="text-gray-200" />
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={chart.data}
                margin={{ top: 20, right: 120, left: 10, bottom: 20 }}
                barGap={8}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis
                  dataKey="reserveType"
                  tick={{ fill: "#111827", fontSize: 14 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  width={65}
                  tick={(props: any) => (
                    <text
                      x={props.x}
                      y={props.y}
                      fill="#111827"
                      fontSize={12}
                      textAnchor="end"
                      transform={`rotate(-35, ${props.x}, ${props.y})`}
                    >
                      {formatNumberFigures(Number(props.payload.value) || 0)}
                    </text>
                  )}
                />
                <Tooltip cursor={false} content={<CustomTooltip />} />
                <Legend
                  content={<CustomLegend />}
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                />
                <Bar
                  dataKey="total"
                  name={chart.totalLabel}
                  fill={chart.totalColor}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={60}
                />
                <Bar
                  dataKey="specific"
                  name={chart.specificLabel}
                  fill={chart.specificColor}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>
    </div>
  );
}
