"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { ShieldCheck } from "lucide-react";

type RiskData = {
  name: string;
  total: number;
  highRisk: number;
};

const riskData: RiskData[] = [
  {
    name: "Proved",
    total: 1200,
    highRisk: 300,
  },
  {
    name: "Probable",
    total: 800,
    highRisk: 400,
  },
];

export default function ClimaticImpactOnReserves() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* LEFT CARD */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h3 className="mb-6 text-lg font-semibold text-gray-900">Geopolitical & Corruption Risk</h3>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={riskData} barGap={12} barCategoryGap={32}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis
                dataKey="name"
                tick={{ fill: "#6B7280", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fill: "#6B7280", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Bar dataKey="total" fill="#BDBDBD" radius={[6, 6, 0, 0]} />
              <Bar dataKey="highRisk" fill="#EF4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 flex justify-center gap-6 text-sm">
          <div className="flex items-center gap-2 text-gray-500">
            <span className="h-3 w-3 rounded-full bg-gray-400" />
            Total
          </div>
          <div className="flex items-center gap-2 text-red-500">
            <span className="h-3 w-3 rounded-full bg-red-500" />
            High Risk
          </div>
        </div>
      </div>

      {/* RIGHT CARD */}
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
            Independent third-party managed hotline available 24/7 in all operating languages.
            Zero-retaliation policy strictly enforced and audited annually.
          </p>
        </div>
      </div>
    </div>
  );
}
