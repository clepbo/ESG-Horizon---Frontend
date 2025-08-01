"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/(dashboard-esg)/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { ChevronDown } from "lucide-react";

const data = [
  { month: "Jan", score: 68 },
  { month: "Feb", score: 45 },
  { month: "Mar", score: 30 },
  { month: "Apr", score: 58 },
  { month: "May", score: 57 },
  { month: "Jun", score: 65 },
  { month: "Jul", score: 53 },
];

export function ESGJourneyChart() {
  return (
    <Card className="bg-[#f0fdf4] border-none rounded-xl h-[340px]">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-800">
            Your ESG Journey
          </CardTitle>
          <button className="flex items-center text-sm text-gray-800 font-medium space-x-1">
            <span>Monthly</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </CardHeader>

      <CardContent className="flex-grow pt-8">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data} barCategoryGap={20}>
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#4b5563" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#4b5563" }}
              domain={[0, 100]}
              interval={0}
            />
            <Bar
              dataKey="score"
              fill="#16a34a"
              radius={[8, 8, 0, 0]}
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
