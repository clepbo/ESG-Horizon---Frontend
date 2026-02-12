import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { formatNumberFigures } from "@/app/(company)/components/ranking/FormatNumberFigures";

export interface PollutantData {
  NOx: number;
  SOx: number;
  VOCs: number;
  PM10: number;
}

const COLORS = {
  NOx: "#3b82f6",
  SOx: "#f9b232",
  VOCs: "#af57db",
  PM10: "#eb6f70",
} as const;

const renderLegend = () => (
  <ul style={{ listStyle: "none", display: "flex", justifyContent: "center", gap: "20px" }}>
    {Object.entries(COLORS).map(([key, color]) => (
      <li key={key} style={{ display: "flex", alignItems: "center" }}>
        <span
          style={{
            display: "inline-block",
            width: 12,
            height: 12,
            backgroundColor: color,
            marginRight: 6,
          }}
        />
        {key}
      </li>
    ))}
  </ul>
);

const PollutantEmissionChart = ({ NOx, SOx, VOCs, PM10 }: PollutantData) => {
  const transformedData = [
    { name: "NOx", value: NOx },
    { name: "SOx", value: SOx },
    { name: "VOCs", value: VOCs },
    { name: "PM10", value: PM10 },
  ];

  return (
    <>
      <h6 className="border-b pb-2 border-gray-200"> Pollutant Emission</h6>
      <div className="w-full h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={transformedData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#374151", fontSize: 14, fontWeight: 500 }}
            />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
            />
            <Legend content={renderLegend} />
            <Bar dataKey="value" fill="#8884d8" radius={[10, 10, 0, 0]} isAnimationActive={false}>
              <LabelList
                dataKey="value"
                position="top"
                formatter={(value) => formatNumberFigures(Number(value) || 0)}
              />
              <Cell fill="#3b82f6" />
              <Cell fill="#f9b232" />
              <Cell fill="#af57db" />
              <Cell fill="#eb6f70" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};

export default PollutantEmissionChart;
