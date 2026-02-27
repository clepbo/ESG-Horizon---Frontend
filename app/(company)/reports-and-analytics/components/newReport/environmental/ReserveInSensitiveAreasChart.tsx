import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatNumberFigures } from "@/app/(company)/components/ranking/FormatNumberFigures";

// #region Sample data

// #endregion
interface ReserveInSensitiveAreasChartProps {
  provedTotal: number;
  provedSensitive?: number;
  probableTotal: number;
  probableSensitive?: number;
}
function ReserveInSensitiveAreasChart({
  provedTotal,
  provedSensitive = 0,
  probableTotal,
  probableSensitive = 0,
}: ReserveInSensitiveAreasChartProps) {
  const data = [
    {
      name: "Proved",
      total: provedTotal,
      sensitive: provedSensitive,
    },
    {
      name: "Probable",
      total: probableTotal,
      sensitive: probableSensitive,
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{ top: 10, right: 130, left: 10, bottom: 5 }}
        barCategoryGap="30%"
      >
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#111827", fontSize: 14, fontWeight: 500 }}
        />
        <YAxis
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
              {formatNumberFigures(Number(props.payload.value))}
            </text>
          )}
          width={65}
        />
        <Tooltip cursor={false} formatter={(value) => formatNumberFigures(Number(value) || 0)} />
        <Legend
          layout="vertical"
          align="right"
          verticalAlign="middle"
          iconType="rect"
          wrapperStyle={{ fontSize: 14, color: "#111827", fontWeight: 500, paddingLeft: "12px" }}
        />
        <Bar dataKey="total" name="Total" fill="#3b82f6" radius={[10, 10, 0, 0]} maxBarSize={60} />
        <Bar
          dataKey="sensitive"
          name="Sensitive Area"
          fill="#EF4444"
          radius={[10, 10, 0, 0]}
          maxBarSize={60}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default ReserveInSensitiveAreasChart;
