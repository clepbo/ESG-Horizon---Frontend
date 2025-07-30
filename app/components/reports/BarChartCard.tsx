"use client";
import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import Spinner from "@/app/components/ui/Spinner";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function ProfitBarChart() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // simulate async load
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const data = {
    labels: ["Sun", "Sat", "Mon", "Tue", "Wed", "Thur", "Fri"],
    datasets: [
      {
        label: "Revenue",
        data: [220000, 110000, 70000, 130000, 125000, 200000, 130000],
        backgroundColor: "#2563EB",
        barThickness: 18,
        borderRadius: 6,
      },
      {
        label: "Expense",
        data: [120000, 90000, 110000, 110000, 105000, 40000, 95000],
        backgroundColor: "#E5E7EB",
        barThickness: 18,
        borderRadius: 6,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        align: "end",
        labels: {
          boxWidth: 12,
          boxHeight: 12,
          usePointStyle: true,
          pointStyle: "rectRounded",
          font: {
            family: "Poppins",
            size: 12,
            weight: 500,
          },
          color: "#6B7280",
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const val = context.raw as number;
            return `₦${(val / 1000).toFixed(0)}k`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: "#9CA3AF",
          stepSize: 50000,
          callback: (value) => `₦${Number(value) / 1000}k`,
          font: {
            family: "Poppins",
            size: 10,
          },
        },
        grid: {
          color: "#F3F4F6",
        },
      },
      x: {
        ticks: {
          color: "#6B7280",
          font: {
            family: "Poppins",
            size: 11,
          },
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow p-4 w-full h-[330px]">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-xs text-gray-500">Profitability</p>
          <p className="text-sm font-semibold text-gray-800">Sept, 2023</p>
        </div>
        <select className="text-xs font-medium text-gray-600 border border-gray-200 rounded-md px-2 py-1">
          <option>This Week</option>
          <option>This Month</option>
        </select>
      </div>

      <div className="relative h-[260px]">
        {isLoading ? (
          <div className="flex justify-center items-center">
            <Spinner />
          </div>
        ) : (
          <Bar data={data} options={options} />
        )}
      </div>
    </div>
  );
}
