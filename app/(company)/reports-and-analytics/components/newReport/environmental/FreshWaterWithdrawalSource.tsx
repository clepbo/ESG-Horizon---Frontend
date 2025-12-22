import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

const data = [
  { source: "Surface Water", quantity: 580000 },
  { source: "Groundwater", quantity: 280000 },
  { source: "Municipal", quantity: 120000 },
];

export const FreshWaterWithdrawalSource = () => (
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
    <Bar dataKey="quantity" fill="#3b82f6" radius={[0, 10, 10, 0]} />
  </BarChart>
);
