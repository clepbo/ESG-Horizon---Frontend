import { Pie, PieChart, Legend } from "recharts";

// #region Sample data

// #endregion
interface EmissionDistributionChartProps {
  isAnimationActive?: boolean;
  NOx: number;
  SOx: number;
  VOCs: number;
  PM10: number;
}

export default function EmissionDistributionChart({
  isAnimationActive = true,
  NOx,
  SOx,
  VOCs,
  PM10,
}: EmissionDistributionChartProps) {
  const data = [
    { name: "NOx", value: NOx, fill: "#0088FE" },
    { name: "SOx", value: SOx, fill: "#f9b232" },
    { name: "VOCs", value: VOCs, fill: "#af57db" },
    { name: "PM10", value: PM10, fill: "#eb6f70" },
  ];

  return (
    <>
      <h6 className="border-b pb-2 border-gray-200">Distribution</h6>

      <PieChart
        className="mt-3"
        style={{
          width: "100%",
          maxWidth: "500px",
          height: "90%",
          maxHeight: "80vh",
          aspectRatio: 1,
        }}
      >
        <Pie
          data={data}
          innerRadius="80%"
          outerRadius="100%"
          cornerRadius="50%"
          paddingAngle={5}
          dataKey="value"
          isAnimationActive={isAnimationActive}
        />
        <Legend layout="horizontal" verticalAlign="bottom" align="center" className="mt-4" />
      </PieChart>
    </>
  );
}
