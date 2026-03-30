"use client";

import { PieChart, Pie, Cell } from "recharts";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/app/components/ui/tooltip";

interface ESGScoreGaugeProps {
  score: number;
  maxScore?: number;
  grade?: string | null;
}

const GRADE_STYLES: Record<string, { bg: string; text: string }> = {
  AAA: { bg: "bg-emerald-100", text: "text-emerald-800" },
  AA:  { bg: "bg-emerald-50",  text: "text-emerald-700" },
  A:   { bg: "bg-teal-50",     text: "text-teal-700" },
  BBB: { bg: "bg-blue-50",     text: "text-blue-700" },
  BB:  { bg: "bg-amber-50",    text: "text-amber-700" },
  B:   { bg: "bg-orange-50",   text: "text-orange-700" },
  CCC: { bg: "bg-red-50",      text: "text-red-700" },
};

export default function ESGScoreGauge({ score, maxScore = 100, grade }: ESGScoreGaugeProps) {
  const percentage = Math.min((score / maxScore) * 100, 100);
  const data = [
    { name: "Score", value: percentage },
    { name: "Remaining", value: 100 - percentage },
  ];

  const gradeStyle = grade && grade !== "N/A" ? GRADE_STYLES[grade] ?? { bg: "bg-gray-100", text: "text-gray-700" } : null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="rounded-2xl bg-white p-6 flex flex-col items-center justify-center h-full min-h-[180px] shadow-sm cursor-default">
          <div className="flex items-center gap-2 self-start">
            <p className="text-sm font-semibold tracking-widest uppercase text-gray-900 break-words">
              Overall ESG Score
            </p>
            {gradeStyle && grade && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${gradeStyle.bg} ${gradeStyle.text}`}>
                {grade}
              </span>
            )}
          </div>

          <div className="relative mt-2">
            <PieChart width={180} height={110}>
              <Pie
                data={data}
                cx="50%"
                cy="100%"
                startAngle={180}
                endAngle={0}
                innerRadius={65}
                outerRadius={85}
                dataKey="value"
                stroke="none"
                cornerRadius={4}
              >
                <Cell fill="#119B95" />
                <Cell fill="#E5E7EB" />
              </Pie>
            </PieChart>

            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-center">
              <span className="text-3xl font-bold text-gray-900">{score}</span>
              <span className="text-base text-gray-700">/{maxScore}</span>
            </div>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={8} className="max-w-xs">
        <p>Weighted score from the latest approved assessment across all ESG pillars.</p>
        {grade && grade !== "N/A" && (
          <p className="mt-1 font-semibold">Grade: {grade} (AAA = best, CCC = needs improvement)</p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
