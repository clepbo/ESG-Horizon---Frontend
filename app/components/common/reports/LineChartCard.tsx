"use client";
import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import Spinner from "@/app/components/ui/reusables/Spinner";

import { Card, CardContent } from "@/app/components/ui/card";
import { formatNumberFull } from "@/lib/numberFormat";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/app/components/ui/select";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function ReportLineChart() {
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("daily");

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const data = {
    labels: ["Sun", "Sat", "Mon", "Tue", "Wed", "Thur", "Fri"],
    datasets: [
      {
        label: "GRI",
        data: [20, 30, 50, 20, 40, 25, 60],
        borderColor: "#FACC15",
        backgroundColor: "#FACC15",
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
        borderWidth: 2,
        fill: false,
      },
      {
        label: "IFRS (S1)",
        data: [5, 10, 60, 15, 35, 45, 10],
        borderColor: "#3B82F6",
        backgroundColor: "#3B82F6",
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
        borderWidth: 2,
        fill: false,
      },
      {
        label: "IFRSC (S2)",
        data: [100, 40, 35, 70, 90, 80, 45],
        borderColor: "#EF4444",
        backgroundColor: "#EF4444",
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
        borderWidth: 2,
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          usePointStyle: true,
          pointStyle: "rect",
          padding: 16,
          boxWidth: 10,
          font: {
            family: "Poppins",
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: { dataset: { label?: string }; raw: unknown }) => {
            const val = context.raw as number;
            return `${context.dataset.label}: ${formatNumberFull(val)}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          font: {
            family: "Poppins",
            size: 12,
          },
        },
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 20,
          font: {
            family: "Poppins",
            size: 12,
          },
        },
        grid: {
          drawTicks: false,
          color: "#E5E7EB",
        },
      },
    },
  };

  return (
    <Card className="bg-white border-none shadow rounded-xl h-[340px]">
      <div className="flex justify-between items-center mb-4 px-5 pt-4">
        <h3 className="text-lg font-semibold text-gray-800">Analytics</h3>
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
      <CardContent>
        <div className="h-64">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Spinner />
            </div>
          ) : (
            <Line data={data} options={options} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
