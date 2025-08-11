"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

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
    <Card className="bg-white border-none rounded-xl h-[340px]">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-900">
            Your ESG Journey
          </CardTitle>

          {/* Shadcn UI Select */}
          <Select defaultValue="monthly">
            <SelectTrigger className="w-[80px] h-8 text-sm border-none shadow-none  p-0">
              <SelectValue placeholder="Monthly" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="flex-grow pt-8">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data} barCategoryGap={20}>
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#4B5563" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#4B5563" }}
              domain={[0, 100]}
              interval={0}
            />
            <Bar
              dataKey="score"
              fill="url(#colorGradient)"
              radius={[6, 6, 0, 0]}
              maxBarSize={32}
            />
            <defs>
              {/* Gradient for bars */}
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0F172A" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#0F172A" stopOpacity={0.8} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
