import { Pie, PieChart, Legend } from "recharts";

// #region Sample data
const data = [
  { name: "Recycled", value: 1400, fill: "#2fb856" },
  { name: "Injected", value: 1050, fill: "#dca54b" },
  { name: "Discharged", value: 700, fill: "#eb6f70" },
];
// #endregion

interface ProducedWaterManagementChartProps {
  isAnimationActive?: boolean;
  recycled?: number;
  injected?: number;
  discharged?: number;
}

export default function ProducedWaterManagementChart({
  isAnimationActive = true,
  recycled = 1400,
  injected = 1050,
  discharged = 700,
  
}: ProducedWaterManagementChartProps) {
  const data = [
  { name: "Recycled", value: recycled, fill: "#2fb856" },
  { name: "Injected", value: injected, fill: "#dca54b" },
  { name: "Discharged", value: discharged, fill: "#eb6f70" },
];
  return (
    <>
      <h6 className="border-b pb-2 border-gray-200">Produced Water Management </h6>

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
        <Legend
          layout="horizontal"
          type="circle"
          verticalAlign="bottom"
          align="center"
          className="mt-4"
        />
      </PieChart>
    </>
  );
}
