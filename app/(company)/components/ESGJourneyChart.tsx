"use client";

import React, { useState, useMemo } from "react";
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
  esgJourney: { period: string; score: number }[];
}

export function ESGJourneyChart({ esgJourney = [] }: ESGJoruneyProps) {
  const [timeRange, setTimeRange] = useState("monthly");

  const processed = useMemo(() => {
    const parsePeriodStart = (period: string | undefined) => {
      if (!period) return null;
      const match = period.match(/(\d{1,2})\/(\d{2,4})/);
      if (!match) return null;
      const month = Number(match[1]) - 1;
      const yearPart = match[2].length === 2 ? 2000 + Number(match[2]) : Number(match[2]);
      return new Date(yearPart, month, 1);
    };

    const rawData = (esgJourney || []).map((d) => ({
      _parsedStart: parsePeriodStart(d.period),
      _score: typeof d.score === "number" ? d.score : Number(d.score) || 0,
      _label: d.period,
    }));

    rawData.sort((a, b) => {
      const aDate = a._parsedStart ? a._parsedStart.getTime() : 0;
      const bDate = b._parsedStart ? b._parsedStart.getTime() : 0;
      return aDate - bDate;
    });

    const groupAndAverage = (getKey: (d: Date) => string, getSortDate: (d: Date) => Date) => {
      const groups = new Map<string, { scores: number[]; sortDate: Date }>();
      rawData.forEach(({ _parsedStart, _score }) => {
        if (!_parsedStart) return;
        const key = getKey(_parsedStart);
        if (!groups.has(key)) groups.set(key, { scores: [], sortDate: getSortDate(_parsedStart) });
        groups.get(key)!.scores.push(_score);
      });
      return Array.from(groups.entries())
        .sort((a, b) => a[1].sortDate.getTime() - b[1].sortDate.getTime())
        .map(([label, { scores, sortDate }]) => ({
          _label: label,
          _score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
          _parsedStart: sortDate,
        }));
    };

    const data =
      timeRange === "quarterly"
        ? groupAndAverage(
            (d) => `Q${Math.floor(d.getMonth() / 3) + 1} ${d.getFullYear()}`,
            (d) => new Date(d.getFullYear(), Math.floor(d.getMonth() / 3) * 3, 1),
          )
        : timeRange === "yearly"
          ? groupAndAverage(
              (d) => String(d.getFullYear()),
              (d) => new Date(d.getFullYear(), 0, 1),
            )
          : rawData;

    return { data, yMax: 100 };
  }, [esgJourney, timeRange]);

  const hasData = processed.data && processed.data.length > 0;

  return (
    <Card className="bg-white border-none rounded-xl h-auto overflow-visible">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-900">Your ESG Journey</CardTitle>

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-25 h-8 text-sm border-none shadow-none p-0">
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

      <CardContent className="grow pt-8">
        {hasData ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={processed.data} barCategoryGap={10}>
              <CartesianGrid vertical={false} stroke="#E5E7EB" opacity={0.7} />

              <XAxis
                dataKey="_label"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#4B5563" }}
                tickFormatter={(label: string) => {
                  if (!label) return "";
                  if (label.length > 15) {
                    return `${label.slice(0, 15)}…`;
                  }
                  return label;
                }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#4B5563" }}
                domain={[0, processed.yMax || 100]}
              />
              <Tooltip
                cursor={{ fill: "rgba(0,0,0,0.05)" }}
                formatter={(v) => [`${Math.round(Number(v ?? 0))}%`, "ESG Score"]}
              />
              <Bar
                dataKey="_score"
                fill="url(#colorGradient)"
                radius={[15, 15, 0, 0]}
                maxBarSize={60}
              />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0F172A" stopOpacity={0.9} />
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
