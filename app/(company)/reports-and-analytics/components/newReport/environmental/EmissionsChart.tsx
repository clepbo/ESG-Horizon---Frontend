import { useId } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FaArrowDown } from "react-icons/fa";
import { formatNumberFigures } from "@/app/(company)/components/ranking/FormatNumberFigures";
import { formatNumberFull } from "@/lib/numberFormat";

interface EmissionPoint {
  period: string; // label for X-axis
  emissions: number; // value for Y-axis
}

interface EmissionsChartProps {
  data: EmissionPoint[];
  title?: string;
  value?: string;
  change?: string;
  unit?: string;
  height?: number;
  width?: string;
  borderColor?: string;
  rotateIcon?: string;
  bgColor?: string;
  color?: string;
  period?: string;
}

const EmissionsChart = ({
  data,
  title = "Total Emissions",
  value = "0",
  change,
  unit = "tCO₂e",
  height = 100,
  width = "100%",
  borderColor = "",
  rotateIcon = "",
  bgColor = "",
  color = "",
  period,
}: EmissionsChartProps) => {
  const gradientId = `colorEmissions-${useId().replace(/:/g, "")}`;

  return (
    <div
      className="emissions-card border-l-4 p-4 w-full"
      style={{
        fontFamily: "system-ui, -apple-system, sans-serif",
        borderColor: borderColor,
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        backgroundColor: "white",
        margin: "0 auto",
        overflow: "visible",
        position: "relative",
      }}
    >
      {/* Header Section */}
      <div style={{ marginBottom: "0px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "0px",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: "16px",
              fontWeight: 500,
              color: "#666",
            }}
          >
            {title}
          </h3>
          {change && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: bgColor,
                padding: "4px 8px",
                borderRadius: "12px",
                fontSize: "14px",
                color: color,
              }}
            >
              <span style={{ marginRight: "4px", rotate: rotateIcon, display: "flex" }}>
                <FaArrowDown />
              </span>
              {change}
            </div>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "baseline" }}>
          <div
            style={{
              fontSize: "24px",
              fontWeight: 600,
              color: "#111",
              marginRight: "0px",
            }}
          >
            {formatNumberFigures(Number(value))}
          </div>
          <div
            style={{
              fontSize: "16px",
              color: "#666",
              fontWeight: 500,
            }}
          >
            {unit}
          </div>
        </div>
        {period && (
          <div style={{ fontSize: "12px", color: "#999", marginTop: "2px" }}>{period}</div>
        )}
      </div>

      {/* Chart Section */}
      <div style={{ width, height, position: "relative", overflow: "visible" }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: 0,
              left: 0,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="period" axisLine={false} tickLine={false} hide />

            <YAxis
              axisLine={false}
              tickLine={false}
              hide={true}
              domain={["dataMin - 1000", "dataMax + 1000"]}
            />
            <Tooltip
              formatter={(value) => [
                `${formatNumberFull(value as number, { maximumFractionDigits: 2 })} tCO₂e`,
                "Emissions",
              ]}
              labelFormatter={(label) => `Period: ${label}`}
              cursor={{ stroke: "#d1d5db", strokeDasharray: "3 3" }}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                fontSize: "14px",
              }}
              wrapperStyle={{ zIndex: 10 }}
              position={{ y: -60 }}
            />
            <Area
              type="monotone"
              dataKey="emissions"
              stroke="#10b981"
              strokeWidth={1}
              fill={`url(#${gradientId})`}
              activeDot={{ r: 4, fill: "#10b981" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EmissionsChart;
