"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { ReportResponse } from "@/types/report/reportResponse";
import { formatCurrencyCompact, formatNumberFull, formatNumberShort } from "@/lib/numberFormat";

const COUNT_COLOR = "#9CA3AF";
const DURATION_COLOR = "#F97316";

interface SocialStepThreeProps {
  reportData?: ReportResponse;
}

function HCDTContributionCard({ hcdtData }: { hcdtData?: any }) {
  const priorYearOpex = hcdtData?.priorYearOpexAmount || 0;
  const annualContribution = hcdtData?.annualContribution || 0;
  const percentage = hcdtData?.percentage || 0;

  return (
    <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border border-gray-100 flex flex-col">
      <h3 className="text-sm 2xl:text-base font-semibold text-gray-800 mb-3">
        HCDT Contribution (PIA 2021)
      </h3>
      <hr className="text-gray-200" />
      <div className="border-b border-gray-200 pb-4 space-y-3 flex-1">
        <div>
          <p className="text-sm pt-4 text-gray-500">Prior Year OPEX</p>
          <p className="text-lg md:text-xl font-bold text-gray-800">
            {formatCurrencyCompact(priorYearOpex, "₦", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Annual Contribution ({formatNumberFull(percentage, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%)</p>
          <p className="text-xl md:text-2xl font-bold text-gray-800">
            {formatCurrencyCompact(annualContribution, "₦", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>
      <div className="pt-4 flex justify-center">
        <span
          className="inline-block px-4 py-2 rounded-lg text-sm font-medium"
          style={{ backgroundColor: "#DCFCE7", color: "#166534" }}
        >
          HCDTs Incorporated & Funded
        </span>
      </div>
    </div>
  );
}

function CommunityDisputeCard({ disputeData }: { disputeData?: any }) {
  const referred = disputeData?.disputesReferred || 0;
  const resolved = disputeData?.disputesResolved || 0;
  const pending = Math.max(0, referred - resolved);
  const total = referred;

  const DISPUTE_DATA = [
    { name: "Resolved", value: resolved, color: "#22c55e" },
    { name: "Pending", value: pending, color: "#F97316" },
  ];

  const CustomLegend = ({ payload }: { payload?: Array<{ value: string; color: string }> }) => {
    if (!payload) return null;
    return (
      <div className="flex justify-center gap-6 mt-4">
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="w-3 h-3 shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-700">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border border-gray-100 flex flex-col">
      <h3 className="text-sm 2xl:text-base font-semibold text-gray-800 mb-3">
        Community Dispute Resolution
      </h3>
      <hr className="text-gray-200" />
      <div className="border-b border-gray-200 pb-4 flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={DISPUTE_DATA}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="45%"
              innerRadius={55}
              outerRadius={75}
              paddingAngle={2}
              stroke="none"
              label={({ cx, cy, midAngle, outerRadius, value, name }: any) => {
                const RADIAN = Math.PI / 180;
                const radius = (outerRadius ?? 75) + 10;
                const x = cx + radius * Math.cos(-(midAngle ?? 0) * RADIAN);
                const y = cy + radius * Math.sin(-(midAngle ?? 0) * RADIAN);
                return (
                  <text
                    x={x}
                    y={y}
                    fill="#374151"
                    textAnchor={x > cx ? "start" : "end"}
                    dominantBaseline="central"
                    fontSize={12}
                    fontWeight={600}
                  >
                    {formatNumberShort(value, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </text>
                );
              }}
              labelLine={false}
            >
              {DISPUTE_DATA.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatNumberShort(Number(value) || 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <p className="text-sm font-medium text-gray-800 pt-2">Total Referred: {formatNumberFull(total, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
    </div>
  );
}

function OperationalDelaysCard({ delaysData }: { delaysData?: any }) {
  const protestsCount = delaysData?.protests?.count || 0;
  const protestsDelay = delaysData?.protests?.delay || 0;
  const otherIssuesCount = delaysData?.otherIssues?.count || 0;
  const otherIssuesDelay = delaysData?.otherIssues?.delay || 0;

  const DELAYS_DATA = [
    { category: "Protests", count: protestsCount, duration: protestsDelay },
    { category: "Other Issues", count: otherIssuesCount, duration: otherIssuesDelay },
  ];

  const maxDuration = Math.max(protestsDelay, otherIssuesDelay, 60);

  const CustomLegend = ({ payload }: { payload?: Array<{ value: string; color: string }> }) => {
    if (!payload) return null;
    return (
      <div className="flex justify-center gap-6 mt-4">
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="w-3 h-3 shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span
              className="text-sm"
              style={
                entry.value === "Duration (Days)" ? { color: DURATION_COLOR } : { color: "#374151" }
              }
            >
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border border-gray-100 flex flex-col overflow-visible">
      <h3 className="text-sm 2xl:text-base font-semibold text-gray-800 mb-3">Operational Delays</h3>
      <hr className="text-gray-200" />
      <div className="border-b border-gray-200 pb-2 flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={DELAYS_DATA}
            margin={{ top: 12, right: 12, left: 10, bottom: 8 }}
            style={{ overflow: "visible" }}
            barGap={6}
            barCategoryGap="25%"
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis
              dataKey="category"
              tick={{ fill: "#6B7280", fontSize: 12 }}
              axisLine={{ stroke: "#D1D5DB" }}
            />
            <YAxis
              domain={[0, maxDuration]}
              tick={{ fill: "#6B7280", fontSize: 12 }}
              axisLine={{ stroke: "#D1D5DB" }}
              width={48}
              tickFormatter={(value) => formatNumberShort(value, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            />
            <Tooltip
              cursor={false}
              formatter={(value) => formatNumberShort(Number(value) || 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            />
            <Legend content={<CustomLegend />} />
            <Bar dataKey="count" name="Count" fill={COUNT_COLOR} radius={[4, 4, 0, 0]} />
            <Bar
              dataKey="duration"
              name="Duration (Days)"
              fill={DURATION_COLOR}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function SocialStepThree({ reportData }: SocialStepThreeProps) {
  const communityRelations = reportData?.socialCapital?.communityRelations;

  return (
    <div className="w-full grid gap-4">
      <span className="">
        <h6 className="py-2 "> Community Relations </h6>
        <hr className="text-gray-200" />
      </span>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <HCDTContributionCard hcdtData={communityRelations?.hcdtContribution} />
        <CommunityDisputeCard disputeData={communityRelations?.communityDisputeResolution} />
        <OperationalDelaysCard delaysData={communityRelations?.operationalDelays} />
      </div>
    </div>
  );
}
