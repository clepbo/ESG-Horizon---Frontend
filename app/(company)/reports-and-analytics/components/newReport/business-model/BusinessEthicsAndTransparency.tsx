"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

type CapitalAllocation = {
  name: string;
  value: number;
  color: string;
};

const capitalData: CapitalAllocation[] = [
  { name: "Gas Projects", value: 55, color: "#3B82F6" },
  { name: "Renewable Projects", value: 25, color: "#22C55E" },
  { name: "Maintenance", value: 20, color: "#9CA3AF" },
];

export default function BusinessEthicAndTransparency() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* LEFT CARD */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h3 className="mb-6 text-lg font-semibold text-gray-900">Climate Impact on Reserves</h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Carbon Price */}
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-sm text-gray-500">Carbon Price Scenario</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              ₦ 5,000
              <span className="ml-1 text-sm font-normal text-gray-500">/tonne</span>
            </p>
          </div>

          {/* Reserves at Risk */}
          <div className="rounded-lg bg-red-50 p-4">
            <p className="text-sm font-medium text-red-500">Reserves at Risk</p>
            <p className="mt-2 text-3xl font-bold text-red-500">12%</p>
            <p className="text-sm text-red-400">Decrease in Proved Oil</p>
          </div>
        </div>

        <div className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Total Proved Reserves</span>
            <span className="font-medium text-gray-900">1200 MMboe</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Embedded Carbon</span>
            <span className="font-medium text-gray-900">450 MtCO₂e</span>
          </div>
        </div>
      </div>

      {/* RIGHT CARD */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h3 className="mb-6 text-lg font-semibold text-gray-900">Strategic Capital Allocation</h3>

        <div className="mb-6 flex justify-between text-sm">
          <div>
            <p className="text-gray-500">Renewable Investment</p>
            <p className="text-xl font-bold text-green-600">₦150M</p>
          </div>
          <div className="text-right">
            <p className="text-gray-500">Renewable Revenue</p>
            <p className="text-xl font-bold text-green-600">₦45M</p>
          </div>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={capitalData}
                dataKey="value"
                innerRadius={80}
                outerRadius={90}
                paddingAngle={4}
              >
                {capitalData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 flex justify-center gap-2 text-sm">
          {capitalData.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-gray-600">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
