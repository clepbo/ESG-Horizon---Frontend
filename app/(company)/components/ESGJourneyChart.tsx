"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { LineChart as ChartIcon } from "lucide-react";

interface ESGJoruneyProps {
  esgJourney: { month: string; score: number }[];
}

export function ESGJourneyChart({ esgJourney = [] }: ESGJoruneyProps) {
  const [timeRange, setTimeRange] = useState("monthly");

  const hasData = esgJourney && esgJourney.length > 0;

  return (
    <Card className="bg-white border-none rounded-xl h-auto">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-900">Your ESG Journey</CardTitle>

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[100px] h-8 text-sm border-none shadow-none p-0">
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
        {hasData ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={esgJourney} barCategoryGap={10}>
              {/* <--- 2. Add CartesianGrid for horizontal lines (and customize appearance) */}
              <CartesianGrid
                strokeDasharray="3 3" // Optional: makes the lines dashed
                vertical={false} // This hides the vertical lines
                stroke="#E5E7EB" // Set the color for the grid lines
                opacity={0.7} // Set opacity (like the visual)
              />

              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#4B5563" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#4B5563" }}
                domain={[0, 100]}
              />
              <Tooltip
                cursor={{ fill: "rgba(0,0,0,0.05)" }}
                formatter={(v: number) => [`${v}%`, "Score"]}
              />
              <Bar
                dataKey="score"
                fill="url(#colorGradient)"
                radius={[15, 15, 0, 0]} // <--- 3. Increase the first two values for a more pronounced rounded top
                maxBarSize={60}
              />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0F172A" stopOpacity={4} />
                  <stop offset="100%" stopColor="#0F172A" stopOpacity={0.6} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500">
            <div className="p-4 rounded-full bg-gray-100 mb-3">
              <ChartIcon className="w-10 h-10 text-gray-400" />
            </div>
            <p className="font-medium text-gray-700">No ESG journey data yet</p>
            <p className="text-sm text-gray-500 max-w-xs mt-1">
              Once your assessments are completed, your ESG progress over time will appear here.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
