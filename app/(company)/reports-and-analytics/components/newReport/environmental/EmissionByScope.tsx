import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { formatNumberFigures } from "@/app/(company)/components/ranking/FormatNumberFigures";
import { shortenPeriod } from "./GHGHistoryTransformer";

type ChartData = {
  name: string;
  scope1: number;
  scope2: number;
  scope3: number;
}[];

export function transformGHGData(ghg: any): ChartData {
  if (!ghg) return [];

  const result: Record<
    string,
    { name: string; scope1?: number; scope2?: number; scope3?: number }
  > = {};

  (ghg.scope1History ?? []).forEach((item: any) => {
    const key = shortenPeriod(item.period);
    if (!result[key]) result[key] = { name: key };
    result[key].scope1 = item.score;
  });

  (ghg.scope2History ?? []).forEach((item: any) => {
    const key = shortenPeriod(item.period);
    if (!result[key]) result[key] = { name: key };
    result[key].scope2 = item.score;
  });

  (ghg.scope3History ?? []).forEach((item: any) => {
    const key = shortenPeriod(item.period);
    if (!result[key]) result[key] = { name: key };
    result[key].scope3 = item.score;
  });

  return Object.values(result).map((item) => ({
    name: item.name,
    scope1: item.scope1 ?? 0,
    scope2: item.scope2 ?? 0,
    scope3: item.scope3 ?? 0,
  }));
}

export interface EmissionData {
  name: number | string;
  scope1: number;
  scope2: number;
  scope3: number;
}

interface EmissionByScopeProps {
  data: EmissionData[];
}

const EmissionByScope: React.FC<EmissionByScopeProps> = ({ data }) => {
  const enrichedData = data.map((d) => ({
    ...d,
    total: d.scope1 + d.scope2 + d.scope3,
  }));

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={enrichedData}
          margin={{
            top: 30,
            right: 130,
            left: 24,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#111827", fontSize: 14 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#111827", fontSize: 14 }}
            tickFormatter={(value) => formatNumberFigures(Number(value))}
            width={65}
          />
          <Tooltip
            cursor={false}
            contentStyle={{
              borderRadius: "8px",
              border: "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              padding: "10px",
            }}
            formatter={(value?: number, name?: string) => [
              formatNumberFigures(Number(value)),
              name ?? "",
            ]}
          />
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            iconType="rect"
            wrapperStyle={{ paddingLeft: "16px", fontSize: 14, color: "#111827", fontWeight: 500 }}
          />
          <Bar
            dataKey="scope1"
            stackId="a"
            fill="#3b82f6"
            radius={[0, 0, 0, 0]}
            name="Scope 1"
            maxBarSize={60}
          />
          <Bar
            dataKey="scope2"
            stackId="a"
            fill="#10B981"
            radius={[0, 0, 0, 0]}
            name="Scope 2"
            maxBarSize={60}
          />
          <Bar
            dataKey="scope3"
            stackId="a"
            fill="#af57db"
            radius={[4, 4, 0, 0]}
            name="Scope 3"
            maxBarSize={60}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EmissionByScope;
