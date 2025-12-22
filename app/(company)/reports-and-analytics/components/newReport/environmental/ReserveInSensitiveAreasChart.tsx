import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

// #region Sample data
const data = [
  {
    name: "Proved",
    total: 9000,
    sensitive: 1400,
    amt: 2400,
  },
  {
    name: "Probable",
    total: 13000,
    sensitive: 1398,
    amt: 2210,
  },
];

// #endregion
const ReserveInSensitiveAreasChart = () => {
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
