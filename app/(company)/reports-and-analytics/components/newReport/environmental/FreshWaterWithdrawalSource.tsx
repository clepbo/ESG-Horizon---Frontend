import { BarChart, Bar, XAxis, YAxis, Tooltip, LabelList } from "recharts";
import { formatNumberFigures } from "@/app/(company)/components/ranking/FormatNumberFigures";

interface FreshWaterWithdrawalSourceProps {
  surfaceWater?: number;
  groundwater?: number;
  municipal?: number;
}
export function FreshWaterWithdrawalSource({
  surfaceWater,
  groundwater,
  municipal,
}: FreshWaterWithdrawalSourceProps) {
  const data = [
    { source: "Surface Water", quantity: surfaceWater || 0 },
    { source: "Groundwater", quantity: groundwater || 0 },
    { source: "Municipal", quantity: municipal || 0 },
  ];
  return (
    <BarChart
      layout="vertical"
      width={600}
      height={300}
      data={data}
      margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
    >
      {/* <CartesianGrid strokeDasharray="3 3" /> */}
      <XAxis type="number" />
      <YAxis dataKey="source" type="category" />
      <Tooltip />
      {/* <Legend /> */}
      <Bar dataKey="quantity" fill="#3b82f6" radius={[0, 10, 10, 0]}>
        <LabelList
          dataKey="quantity"
          position="right"
          formatter={(value) => formatNumberFigures(Number(value) || 0)}
        />
      </Bar>
    </BarChart>
  );
}
