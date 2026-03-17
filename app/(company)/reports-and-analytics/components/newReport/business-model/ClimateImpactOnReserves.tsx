"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { formatNumberFigures } from "@/app/(company)/components/ranking/FormatNumberFigures";
import { ShieldCheck } from "lucide-react";
import { BusinessModelPillar } from "@/types/report/reportResponse";

interface ClimaticImpactOnReservesProps {
  businessModel?: BusinessModelPillar;
}

export default function ClimaticImpactOnReserves({ businessModel }: ClimaticImpactOnReservesProps) {
  const geopoliticalRisk =
    businessModel?.businessEthicsAndTransparency?.geopoliticalAndCorruptionRisk;
  const antiCorruptionManagement =
    businessModel?.businessEthicsAndTransparency?.antiCorruptionManagement;

  // Use actual data if available, otherwise show placeholder
  const riskData = [
    {
      name: "Proved",
      total: geopoliticalRisk?.proved?.total ?? 0,
      highRisk: geopoliticalRisk?.proved?.risk ?? 0,
    },
    {
      name: "Probable",
      total: geopoliticalRisk?.probable?.total ?? 0,
      highRisk: geopoliticalRisk?.probable?.risk ?? 0,
    },
  ];

  const hasRiskData = riskData.some((d) => d.total > 0 || d.highRisk > 0);
  const hasAntiCorruptionData =
    antiCorruptionManagement && antiCorruptionManagement.trim().length > 0;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* LEFT CARD - Geopolitical & Corruption Risk */}
      <div className="rounded-xl bg-white p-6 shadow-sm overflow-visible">
        <h3 className="mb-6 text-lg font-semibold text-gray-900">Geopolitical & Corruption Risk</h3>

        <div className="h-64 w-full">
          {hasRiskData ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={riskData}
                barGap={12}
                barCategoryGap={32}
                margin={{ top: 10, right: 110, left: 0, bottom: 5 }}
                style={{ overflow: "visible" }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis
                  dataKey="name"
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
                <Tooltip
                  cursor={false}
                  formatter={(value) => formatNumberFigures(Number(value) || 0)}
                />
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  iconType="rect"
                  wrapperStyle={{ fontSize: 14, color: "#111827", fontWeight: 500 }}
                />
                <Bar
                  dataKey="total"
                  name="Total"
                  fill="#BDBDBD"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={60}
                />
                <Bar
                  dataKey="highRisk"
                  name="High Risk"
                  fill="#EF4444"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-gray-600">
              No corruption risk data available
            </div>
          )}
        </div>
      </div>

      {/* RIGHT CARD - Anti-Corruption Management */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h3 className="mb-6 text-lg font-semibold text-gray-900">Anti-Corruption Management</h3>

        {/* Status row */}
        <div className="mb-6 flex items-center justify-between rounded-lg bg-gray-50 p-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-green-600" />
            <p className="text-sm text-gray-700">Independent third party anonymous whistleblower</p>
          </div>
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
            Active
          </span>
        </div>

        {/* Description box */}
        <div className="rounded-lg shadow-md border border-gray-200 p-5">
          <h4 className="mb-2 text-sm font-semibold text-gray-900">System Description</h4>
          <p className="text-sm leading-relaxed text-gray-600">
            {hasAntiCorruptionData
              ? antiCorruptionManagement
              : "No anti-corruption management system description available."}
          </p>
        </div>
      </div>
    </div>
  );
}
