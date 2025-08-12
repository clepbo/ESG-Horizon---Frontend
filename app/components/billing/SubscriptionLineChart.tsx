"use client";

import { useState, useEffect } from "react";
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
import Spinner from "@/app/components/Spinner";

// ✅ shadcn/ui Select components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

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
      data: [60, 55, 40, 100, 70, 90],
      borderColor: "#22C55E",
      pointBackgroundColor: "#22C55E",
      borderWidth: 1.5,
      tension: 0,
      pointRadius: 3,
    },
    {
      label: "Basic",
      data: [10, 30, 60, 20, 15, 40],
      borderColor: "#FACC15",
      pointBackgroundColor: "#FACC15",
      borderWidth: 1.5,
      tension: 0,
      pointRadius: 3,
    },
    {
      label: "Premium",
      data: [5, 60, 10, 10, 50, 5],
      borderColor: "#3B82F6",
      pointBackgroundColor: "#3B82F6",
      borderWidth: 1.5,
      tension: 0,
      pointRadius: 3,
    },
    {
      label: "Enterprise",
      data: [100, 20, 30, 60, 70, 10],
      borderColor: "#EF4444",
      pointBackgroundColor: "#EF4444",
      borderWidth: 1.5,
      tension: 0,
      pointRadius: 3,
    },
  ],
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom" as const,
      labels: {
        usePointStyle: true,
        pointStyle: "circle",
        font: {
          size: 12,
        },
        color: "#6B7280",
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: {
        font: { size: 12 },
        color: "#9CA3AF",
      },
    },
    y: {
      beginAtZero: true,
      grid: { color: "#E5E7EB" },
      ticks: {
        stepSize: 20,
        font: { size: 12 },
        color: "#9CA3AF",
      },
    },
  },
};

export default function SubscriptionLineChart() {
  const [timeRange, setTimeRange] = useState("monthly");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-white rounded-xl shadow p-4 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-gray-800 font-semibold text-base">Analytics</h3>
          <p className="text-xs text-gray-500 mt-0.5">Subscription Tier</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Spinner />
          </div>
        ) : (
          <Line data={chartData} options={chartOptions} />
        )}
      </div>
    </div>
  );
}
