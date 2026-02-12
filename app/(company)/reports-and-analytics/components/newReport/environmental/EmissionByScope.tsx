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

// #region Sample data

type ChartData = {
  name: string; // usually a year or period label
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
// #endregion
const EmissionByScope: React.FC<EmissionByScopeProps> = ({ data }) => {
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
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
          <YAxis axisLine={false} tickLine={false} tick={{ fill: "#666", fontSize: 12 }} />
          <Tooltip
            cursor={{ fill: "transparent" }}
            contentStyle={{
              borderRadius: "8px",
              border: "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          />
          <Legend
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            wrapperStyle={{ paddingTop: "20px" }}
          />
          <Bar dataKey="scope1" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} name="Scope 1">
            <LabelList
              dataKey="scope1"
              position="center"
              formatter={(value) => formatNumberFigures(Number(value) || 0)}
            />
          </Bar>
          <Bar dataKey="scope2" stackId="a" fill="#f9b232" radius={[0, 0, 0, 0]} name="Scope 2">
            <LabelList
              dataKey="scope2"
              position="center"
              formatter={(value) => formatNumberFigures(Number(value) || 0)}
            />
          </Bar>
          <Bar dataKey="scope3" stackId="a" fill="#af57db" radius={[4, 4, 0, 0]} name="Scope 3">
            <LabelList
              dataKey="scope3"
              position="top"
              formatter={(value) => formatNumberFigures(Number(value) || 0)}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EmissionByScope;
