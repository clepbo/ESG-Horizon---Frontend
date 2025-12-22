import { Pie, PieChart, Legend } from "recharts";

// #region Sample data
const data = [
  { name: "Recycled", value: 1400, fill: "#2fb856" },
  { name: "Injected", value: 1050, fill: "#dca54b" },
  { name: "Discharged", value: 700, fill: "#eb6f70" },
];
// #endregion

export default function ProducedWaterManagementChart({
  isAnimationActive = true,
}: {
  isAnimationActive?: boolean;
}) {
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
