import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

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
      <YAxis width="auto" />
      <Tooltip />
      <Legend type="circle" />
      <Bar dataKey="total" fill="#bbbbbb" radius={[10, 10, 0, 0]} />
      <Bar dataKey="sensitive" fill="#f9b232" radius={[10, 10, 0, 0]} />
    </BarChart>
  );
};

export default ReserveInSensitiveAreasChart;
