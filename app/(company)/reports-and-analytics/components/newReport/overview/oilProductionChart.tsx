"use client";

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
import { Cell } from "recharts";
import NotAvailablePlaceholder from "../components/NotAvailablePlaceholder";

interface ProductionVolumesChartProps {
  data?: any[];
}

export default function ProductionVolumesChart({ data = [] }: ProductionVolumesChartProps) {
  const hasData = data.length > 0 && data.some((d) => d.primary > 0 || d.secondary > 0);

  const renderLegend = (props: any) => {
    const payload = [
      { value: "Crude Oil", color: "#f7931a" },
      { value: "Synthetic Oil", color: "#fcd88b" },
      { value: "Natural Gas", color: "#3b82f6" },
      { value: "Synthetic Gas", color: "#bfdbfe" },
    ];
    return (
      <ul className="flex justify-center gap-4 mt-4 text-xs lg:text-sm text-gray-600">
        {payload.map((entry, index) => (
          <li key={`item-${index}`} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: entry.color }} />
            {entry.value}
          </li>
        ))}
      </ul>
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-100 rounded-lg shadow-lg text-xs md:text-sm">
          <p className="font-semibold mb-2 text-gray-700">{label}</p>
          {payload.map((entry: any, index: number) => {
            // Get the data object for this bar group
            const dataItem = entry.payload;
            // Determine if this is the primary or secondary bar
            const isPrimary = entry.dataKey === "primary";
            const itemLabel = isPrimary ? dataItem.primaryLabel : dataItem.secondaryLabel;
            const itemColor = isPrimary ? dataItem.fillPrimary : dataItem.fillSecondary;

            // Only show if value > 0 to avoid empty tooltips for zero values
            if (entry.value === 0 && !entry.value) return null;

            return (
              <div key={index} className="flex items-center gap-2 mb-1 last:mb-0">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: itemColor }} />
                <span className="text-gray-600">{itemLabel}:</span>
                <span className="font-medium text-gray-900">
                  {Number(entry.value).toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full bg-white rounded-lg p-6 shadow">
      <h3 className="text-lg font-semibold mb-4">Production Volumes</h3>

      {hasData ? (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} barGap={4} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
            <Legend content={renderLegend} />

            <Bar dataKey="primary" radius={[6, 6, 0, 0]} maxBarSize={60}>
              {data.map((entry, index) => (
                <Cell key={`cell-primary-${index}`} fill={entry.fillPrimary} />
              ))}
            </Bar>
            <Bar dataKey="secondary" radius={[6, 6, 0, 0]} maxBarSize={60}>
              {data.map((entry, index) => (
                <Cell key={`cell-secondary-${index}`} fill={entry.fillSecondary} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <NotAvailablePlaceholder />
      )}
    </div>
  );
}
