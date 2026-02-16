import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LabelList } from "recharts";
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
    <BarChart
      style={{ width: "100%", height: "100%", minHeight: "400px", aspectRatio: 1.618 }}
      responsive
      data={data}
      margin={{
        top: 5,
        right: 0,
        left: 0,
        bottom: 5,
      }}
    >
      {/* <CartesianGrid strokeDasharray="3 3" /> */}
      <XAxis dataKey="name" />
      <YAxis width="auto" tickFormatter={(value) => formatNumberFigures(Number(value) || 0)} />
      <Tooltip />
      <Legend type="circle" />
      <Bar dataKey="total" fill="#0000FF" radius={[10, 10, 0, 0]}>
        <LabelList
          dataKey="total"
          position="top"
          formatter={(value) => formatNumberFigures(Number(value) || 0)}
        />
      </Bar>
      <Bar dataKey="sensitive" fill="#f9b232" radius={[10, 10, 0, 0]}>
        <LabelList
          dataKey="sensitive"
          position="top"
          formatter={(value) => formatNumberFigures(Number(value) || 0)}
        />
      </Bar>
    </BarChart>
  );
}

export default ReserveInSensitiveAreasChart;
