import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { BusinessModelPillar } from "@/types/report/reportResponse";
import { formatNumberFull, formatCurrencyCompact } from "@/lib/numberFormat";

interface BusinessEthicAndTransparencyProps {
  businessModel?: BusinessModelPillar;
}

export default function BusinessEthicAndTransparency({
  businessModel,
}: BusinessEthicAndTransparencyProps) {
  const climateImpact =
    businessModel?.reservesValuationAndCapitalExpenditure?.climateImpactOnReserves;
  const strategicAllocation =
    businessModel?.reservesValuationAndCapitalExpenditure?.strategicCapitalAllocation;

  // Calculate pie chart data — capexPercentage is the % of CAPEX on gas exploration
  const gasPercent = strategicAllocation?.gasProjectsValueCount ?? 0;
  const otherPercent = strategicAllocation?.maintenanceValueCount ?? 0;
  const total = gasPercent + otherPercent;

  const capitalData =
    total > 0
      ? [
          { name: "Gas Exploration", value: gasPercent, color: "#3B82F6" },
          { name: "Other CAPEX", value: otherPercent, color: "#9CA3AF" },
        ]
      : [
          { name: "Gas Exploration", value: 0, color: "#3B82F6" },
          { name: "Other CAPEX", value: 0, color: "#9CA3AF" },
        ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* LEFT CARD - Climate Impact on Reserves */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h3 className="mb-6 text-lg font-semibold text-gray-900">Climate Impact on Reserves</h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Carbon Price */}
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-sm text-gray-500">Carbon Price Scenario</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              ₦ {formatNumberFull(climateImpact?.carbonPriceScenario ?? 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="ml-1 text-sm font-normal text-gray-500">/tonne</span>
            </p>
          </div>

          {/* Reserves at Risk */}
          <div className="rounded-lg bg-red-50 p-4">
            <p className="text-sm font-medium text-red-500">Reserves at Risk</p>
            <p className="mt-2 text-3xl font-bold text-red-500">
              {formatNumberFull(climateImpact?.reservesAtRiskPercent ?? 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
            </p>
            <p className="text-sm text-red-400">Decrease in Proved Oil</p>
          </div>
        </div>

        <div className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Total Proved Reserves</span>
            <span className="font-medium text-gray-900">
              {formatNumberFull(climateImpact?.totalProvedReserves ?? 0, {
                minimumFractionDigits: 2, maximumFractionDigits: 2,
              })}{" "}
              MMboe
            </span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Estimated Decrease</span>
            <span className="font-medium text-red-600">
              {formatNumberFull(climateImpact?.totalProbableReserves ?? 0, {
                minimumFractionDigits: 2, maximumFractionDigits: 2,
              })}{" "}
              MMboe
            </span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Embedded Carbon</span>
            <span className="font-medium text-gray-900">
              {formatNumberFull(climateImpact?.embeddedCarbon ?? 0, {
                minimumFractionDigits: 2, maximumFractionDigits: 2,
              })}{" "}
              MtCO₂e
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT CARD - Strategic Capital Allocation */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h3 className="mb-6 text-lg font-semibold text-gray-900">Strategic Capital Allocation</h3>

        <div className="mb-6 flex justify-between text-sm">
          <div>
            <p className="text-gray-500">Renewable Investment</p>
            <p className="text-xl font-bold text-green-600">
              {formatCurrencyCompact(strategicAllocation?.renewableInvestmentAmount, "₦", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-500">Renewable Revenue</p>
            <p className="text-xl font-bold text-green-600">
              {formatCurrencyCompact(strategicAllocation?.renewableRevenueAmount, "₦", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
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
              <Tooltip
                formatter={(value) => `${formatNumberFull(Number(value) || 0, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 flex justify-center gap-2 text-sm">
          {capitalData.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <span className="h-3 w-3" style={{ backgroundColor: item.color }} />
              <span className="text-gray-900 font-medium">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
