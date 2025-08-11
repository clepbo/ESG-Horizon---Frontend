"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";
import Spinner from "@/app/components/Spinner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

const data = [
  { month: "Jan", value: 68 },
  { month: "Feb", value: 69 },
  { month: "Mar", value: 48 },
  { month: "Apr", value: 47 },
  { month: "May", value: 33 },
  { month: "Jun", value: 34 },
  { month: "Jul", value: 58 },
  { month: "Aug", value: 58 },
  { month: "Sep", value: 58 },
  { month: "Oct", value: 58 },
  { month: "Nov", value: 65 },
  { month: "Dec", value: 65 },
];

export function ReportSubmittedChart() {
  const [timeRange, setTimeRange] = useState("monthly");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Card className="bg-white border-none shadow rounded-xl h-[340px]">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-neutral-900">
            Report Submitted
          </CardTitle>

          {/* Shadcn Select */}
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
      </CardHeader>

      <CardContent className="pt-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-[250px]">
            <Spinner />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data} barCategoryGap={12}>
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#6B7280" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#6B7280" }}
                domain={[0, 100]}
                interval={0}
              />
              <Bar
                dataKey="value"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
                fill="url(#gradient)"
              />
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#111827" />
                  <stop offset="100%" stopColor="#4B5563" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
