"use client";
import { useId, useState, useRef, useCallback } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { FaArrowDown } from "react-icons/fa";
import { formatNumberFull, formatNumberShort } from "@/lib/numberFormat";

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
  const chartRef = useRef<HTMLDivElement>(null);
  const [tooltipData, setTooltipData] = useState<{
    x: number;
    point: EmissionPoint;
  } | null>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!chartRef.current || data.length === 0) return;
      const rect = chartRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const chartWidth = rect.width;

      // Map mouse X position to the nearest data point
      const index = Math.round((x / chartWidth) * (data.length - 1));
      const clampedIndex = Math.max(0, Math.min(data.length - 1, index));

      setTooltipData({ x, point: data[clampedIndex] });
    },
    [data]
  );

  const handleMouseLeave = useCallback(() => {
    setTooltipData(null);
  }, []);

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
            {formatNumberShort(value)}
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

      {/* Chart Section — custom tooltip via native mouse events */}
      <div
        ref={chartRef}
        style={{ width, height, position: "relative", cursor: data.length > 0 ? "crosshair" : "default" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
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
            <Area
              type="monotone"
              dataKey="emissions"
              stroke="#10b981"
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Custom tooltip overlay */}
        {tooltipData && (
          <div
            style={{
              position: "absolute",
              left: tooltipData.x,
              top: 0,
              transform: "translateX(-50%)",
              pointerEvents: "none",
              zIndex: 50,
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              padding: "6px 10px",
              fontSize: "12px",
              whiteSpace: "nowrap",
            }}
          >
            <div style={{ color: "#6b7280", marginBottom: "2px" }}>
              {tooltipData.point.period}
            </div>
            <div style={{ fontWeight: 600, color: "#111" }}>
              {formatNumberFull(tooltipData.point.emissions, { maximumFractionDigits: 2 })} tCO₂e
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmissionsChart;
