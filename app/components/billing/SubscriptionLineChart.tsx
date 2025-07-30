"use client";

import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Legend,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Legend,
  Tooltip
);

const chartData = {
  labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri"],
  datasets: [
    {
      label: "Free",
      data: [20, 10, 40, 30, 15, 25],
      borderColor: "#22C55E",
      backgroundColor: "#22C55E",
      tension: 0.3,
    },
    {
      label: "Basic",
      data: [10, 30, 15, 20, 10, 30],
      borderColor: "#FACC15",
      backgroundColor: "#FACC15",
      tension: 0.3,
    },
    {
      label: "Premium",
      data: [50, 30, 60, 40, 35, 20],
      borderColor: "#3B82F6",
      backgroundColor: "#3B82F6",
      tension: 0.3,
    },
    {
      label: "Enterprise",
      data: [5, 15, 10, 20, 5, 10],
      borderColor: "#EF4444", // red
      backgroundColor: "#EF4444",
      tension: 0.3,
    },
  ],
};

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: "bottom" as const,
      labels: {
        boxWidth: 12,
        boxHeight: 12,
        font: {
          size: 12,
        },
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 10,
      },
    },
  },
};

export default function SubscriptionLineChart() {
  return (
    <div className="bg-white rounded-lg shadow p-4 h-full">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium text-gray-800">Analytics</h3>
        <span className="text-sm text-gray-500">This Week ⌄</span>
      </div>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
}
