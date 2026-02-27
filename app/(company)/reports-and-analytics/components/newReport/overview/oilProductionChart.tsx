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
  LabelList,
} from "recharts";
import { Cell } from "recharts";
import { formatNumberFigures } from "@/app/(company)/components/ranking/FormatNumberFigures";
import NotAvailablePlaceholder from "../components/NotAvailablePlaceholder";

interface LegendItem {
  value: string;
  color: string;
}

interface ProductionVolumesChartProps {
  data?: any[];
  title?: string;
  legendItems?: LegendItem[];
}

export default function ProductionVolumesChart({
  data = [],
  title = "Production Volumes",
  legendItems = [],
}: ProductionVolumesChartProps) {
  const hasData = data.length > 0 && data.some((d) => d.primary > 0 || d.secondary > 0);

  const renderLegend = (_props: any) => {
    return (
      <ul className="flex justify-center gap-4 mt-4 text-sm font-medium text-gray-900">
        {legendItems.map((entry, index) => (
          <li key={`item-${index}`} className="flex items-center gap-2">
            <span className="w-3 h-3 " style={{ backgroundColor: entry.color }} />
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
                <span className="w-3 h-3 " style={{ backgroundColor: itemColor }} />
                <span className="text-gray-600">{itemLabel}:</span>
                <span className="font-medium text-gray-900">
                  {formatNumberFigures(Number(entry.value))}
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
    <div className="w-full h-full bg-white rounded-lg p-6 shadow overflow-visible">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>

      {hasData ? (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} barGap={4} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#111827", fontSize: 14 }}
            />
            <YAxis
              width={70}
              axisLine={false}
              tickLine={false}
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
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
            <Legend content={renderLegend} />

            <Bar dataKey="primary" radius={[6, 6, 0, 0]} maxBarSize={60}>
              <LabelList
                dataKey="primary"
                position="top"
                formatter={(value) => formatNumberFigures(Number(value) || 0)}
              />
              {data.map((entry, index) => (
                <Cell key={`cell-primary-${index}`} fill={entry.fillPrimary} />
              ))}
            </Bar>
            <Bar dataKey="secondary" radius={[6, 6, 0, 0]} maxBarSize={60}>
              <LabelList
                dataKey="secondary"
                position="top"
                formatter={(value) => formatNumberFigures(Number(value) || 0)}
              />
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
