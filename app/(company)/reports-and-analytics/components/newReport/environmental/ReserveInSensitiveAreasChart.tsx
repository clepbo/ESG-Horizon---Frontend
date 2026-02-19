import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LabelList, ResponsiveContainer } from "recharts";
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
          tick={{ fill: "#111827", fontSize: 14 }}
          tickFormatter={(value) => formatNumberFigures(Number(value) || 0)}
        />
        <Tooltip cursor={false} />
        <Legend
          layout="vertical"
          align="right"
          verticalAlign="middle"
          iconType="circle"
          wrapperStyle={{ fontSize: 14, color: "#111827", fontWeight: 500, paddingLeft: "12px" }}
        />
        <Bar dataKey="total" name="Total" fill="#3b82f6" radius={[10, 10, 0, 0]} maxBarSize={60}>
          <LabelList
            dataKey="total"
            position="top"
            fontSize={13}
            fill="#111827"
            formatter={(value) => formatNumberFigures(Number(value) || 0)}
          />
        </Bar>
        <Bar dataKey="sensitive" name="Sensitive Area" fill="#EF4444" radius={[10, 10, 0, 0]} maxBarSize={60}>
          <LabelList
            dataKey="sensitive"
            position="top"
            fontSize={13}
            fill="#111827"
            formatter={(value) => formatNumberFigures(Number(value) || 0)}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default ReserveInSensitiveAreasChart;
