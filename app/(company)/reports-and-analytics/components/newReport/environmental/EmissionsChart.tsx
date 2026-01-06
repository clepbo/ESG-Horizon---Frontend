import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FaArrowDown } from "react-icons/fa";
import { formatNumberFigures } from "@/app/(company)/components/ranking/FormatNumberFigures";

interface EmissionPoint {
  period: string; // label for X-axis
  emissions: number; // value for Y-axis
}

interface EmissionsChartProps {
  ghgData?: any;
}

function transformHistory(ghg: any): EmissionPoint[] {
  if (!ghg?.ghg_history) return [];

  return ghg.ghg_history.map((item: any) => ({
    period: item.period,
    emissions: item.score, // use "score" as the value
  }));
}

// Sample data for emissions over time (replace with your actual data)
const emissionsData = [
  { month: "Jan", emissions: 13000 },
  { month: "Feb", emissions: 16500 },
  { month: "Mar", emissions: 14800 },
  { month: "Apr", emissions: 19000 },
  { month: "May", emissions: 17000 },
  { month: "Jun", emissions: 15400 },
  { month: "Jul", emissions: 18000 },
  { month: "Aug", emissions: 16000 },
  { month: "Sep", emissions: 17500 },
  { month: "Oct", emissions: 14000 },
  { month: "Nov", emissions: 16500 },
  { month: "Dec", emissions: 15400 },
];

// #region Reusable EmissionsChart Component
const EmissionsChart = ({
  data = emissionsData,
  title = "Total Emissions",
  value = "0",
  change = "0.0%",
  unit = "tCO₂e",
  height = 100,
  width = "100%",
  borderColor = "",
  rotateIcon = "",
  bgColor = "",
  color = "",
}) => {
  return (
    <div
      className="emissions-card border-l-4 p-4 w-full"
      style={{
        fontFamily: "system-ui, -apple-system, sans-serif",
        borderColor: borderColor,
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        backgroundColor: "white",
        margin: "0 auto",
      }}
    >
      {/* Header Section */}
      <div style={{ marginBottom: "0px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "0px",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: "16px",
              fontWeight: 500,
              color: "#666",
            }}
          >
            {title}
          </h3>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: bgColor,
              padding: "4px 8px",
              borderRadius: "12px",
              fontSize: "14px",
              color: color,
            }}
          >
            <span className={`text-green-600`} style={{ marginRight: "4px", rotate: rotateIcon }}>
              {" "}
              <FaArrowDown />{" "}
            </span>
            {change}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "baseline" }}>
          <div
            style={{
              fontSize: "24px",
              fontWeight: 600,
              color: "#111",
              marginRight: "0px",
            }}
          >
            {formatNumberFigures(Number(value))}
          </div>
          <div
            style={{
              fontSize: "14px",
              color: "#666",
              fontWeight: 500,
            }}
          >
            {unit}
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div style={{ width, height }}>
        <ResponsiveContainer width="100%" height="50%">
          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: 0,
              left: 0,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="colorEmissions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              hide={true} // Hide X-axis labels
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              hide={true} // Hide Y-axis labels
              domain={["dataMin - 1000", "dataMax + 1000"]} // Add some padding
            />
            <Tooltip
              formatter={(value) => [`${value?.toLocaleString()} tCO₂e`, "Emissions"]}
              labelFormatter={(label) => `Month: ${label}`}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
              }}
            />
            <Area
              type="monotone"
              dataKey="emissions"
              stroke="#10b981"
              strokeWidth={1}
              fill="url(#colorEmissions)"
              activeDot={{ r: 4, fill: "#10b981" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EmissionsChart;
