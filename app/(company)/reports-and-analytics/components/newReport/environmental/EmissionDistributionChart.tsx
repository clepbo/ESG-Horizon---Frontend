import { Pie, PieChart, Legend, Tooltip, ResponsiveContainer } from "recharts";
import type { PieLabelRenderProps } from "recharts";
import { formatNumberFigures } from "@/app/(company)/components/ranking/FormatNumberFigures";
import { formatNumberFull } from "@/lib/numberFormat";

interface EmissionDistributionChartProps {
  isAnimationActive?: boolean;
  NOx: number;
  SOx: number;
  VOCs: number;
  PM10: number;
}

const RADIAN = Math.PI / 180;

function polarToCartesian(cx: number, cy: number, radius: number, angleInDegrees: number) {
  const angleInRadians = -angleInDegrees * RADIAN;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
}

function renderCustomLabel(props: PieLabelRenderProps) {
  const { cx = 0, cy = 0, midAngle = 0, outerRadius = 0, value = 0 } = props;

  const labelRadius = outerRadius + 8;
  const point = polarToCartesian(cx, cy, labelRadius, midAngle);
  const textAnchor = point.x >= cx ? "start" : "end";

  return (
    <text
      x={point.x}
      y={point.y}
      fill="#374151"
      textAnchor={textAnchor}
      dominantBaseline="central"
      fontSize={13}
      fontWeight={600}
    >
      {typeof value === "number" ? formatNumberFigures(value) : String(value)}
    </text>
  );
}

export default function EmissionDistributionChart({
  isAnimationActive = true,
  NOx,
  SOx,
  VOCs,
  PM10,
}: EmissionDistributionChartProps) {
  const data = [
    { name: "NOx", value: NOx, fill: "#3b82f6" },
    { name: "SOx", value: SOx, fill: "#10B981" },
    { name: "VOCs", value: VOCs, fill: "#af57db" },
    { name: "PM10", value: PM10, fill: "#eb6f70" },
  ];

  return (
    <>
      <h6 className="border-b pb-2 border-gray-200">Distribution</h6>

      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={4}
            cornerRadius={6}
            label={renderCustomLabel}
            labelLine={false}
            isAnimationActive={isAnimationActive}
          />

          <Tooltip
            formatter={(value: number | undefined) =>
              value != null ? formatNumberFull(value, { maximumFractionDigits: 2 }) : ""
            }
          />

          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            iconType="rect"
            wrapperStyle={{ fontSize: 14, color: "#111827", fontWeight: 500 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </>
  );
}
