import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

// #region Sample data
export const emissionByScopedata = [
  {
    name: "2023",
    scope1: 4000,
    scope2: 2400,
    scope3: 2400,
  },
  {
    name: "2024",
    scope1: 2300,
    scope2: 12203,
    scope3: 3394,
  },
  {
    name: "2025",
    scope1: 44433,
    scope2: 1223,
    scope3: 23344,
  },
];

export interface EmissionData {
  name: number | string;
  scope1: number;
  scope2: number;
  scope3: number;
}

interface EmissionByScopeProps { data: EmissionData[]; }
// #endregion
const EmissionByScope: React.FC<EmissionByScopeProps> = ({data}) => {
  return (
    <BarChart
      style={{ width: "100%", maxWidth: "700px", maxHeight: "70vh", aspectRatio: 1.618 }}
      responsive
      data={data}
      margin={{
        top: 20,
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
      <Bar dataKey="scope3" stackId="a" fill="#3b82f6" background />
      <Bar dataKey="scope2" stackId="a" fill="#f9b232" background />
      <Bar dataKey="scope1" stackId="a" fill="#af57db" background />
    </BarChart>
  );
};

export default EmissionByScope;
