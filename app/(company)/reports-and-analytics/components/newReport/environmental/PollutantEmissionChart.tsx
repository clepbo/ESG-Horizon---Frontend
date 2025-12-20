import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from "recharts";

const transformedData = [
  { name: "NOx", value: 1400 },
  { name: "SOx", value: 1050 },
  { name: "VOCs", value: 700 },
  { name: "PM10", value: 350 },
];

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

const PollutantEmissionChart = () => {
  return (
    <>
      <h6 className="border-b pb-2 border-gray-200"> Polutant Emission</h6>
      <BarChart
        width={600}
        className="mt-3"
        height={400}
        data={transformedData} // Use transformed data
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="name" // Shows NOx, SOx, VOCs, PM10 under each bar
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#374151", fontSize: 14, fontWeight: 500 }}
        />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} />
        <Tooltip />
        <Legend content={renderLegend} />
        <Bar dataKey="value" fill="#8884d8" radius={[10, 10, 0, 0]}>
          {/* Custom colors */}
          <Cell fill="#3b82f6" />
          <Cell fill="#f9b232" />
          <Cell fill="#af57db" />
          <Cell fill="#eb6f70" />
        </Bar>
      </BarChart>
    </>
  );
};

export default PollutantEmissionChart;
