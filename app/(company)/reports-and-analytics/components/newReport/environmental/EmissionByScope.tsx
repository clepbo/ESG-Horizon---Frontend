import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
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
            top: 30, // Increased top margin for labels
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#666", fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#666", fontSize: 12 }}
            tickFormatter={(value) => formatNumberFigures(Number(value))}
          />
          <Tooltip
            cursor={{ fill: "rgba(0,0,0,0.05)" }}
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
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            wrapperStyle={{ paddingTop: "20px" }}
          />
          <Bar dataKey="scope1" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} name="Scope 1" />
          <Bar dataKey="scope2" stackId="a" fill="#f9b232" radius={[0, 0, 0, 0]} name="Scope 2" />
          <Bar dataKey="scope3" stackId="a" fill="#af57db" radius={[4, 4, 0, 0]} name="Scope 3">
            <LabelList
              dataKey="total"
              position="top"
              fill="#333"
              fontSize={12}
              fontWeight="bold"
              offset={10}
              formatter={(value) => formatNumberFigures(Number(value) || 0)}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EmissionByScope;
