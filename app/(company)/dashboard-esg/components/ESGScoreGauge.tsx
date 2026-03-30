"use client";

import { PieChart, Pie, Cell } from "recharts";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/app/components/ui/tooltip";

interface ESGScoreGaugeProps {
  score: number;
  maxScore?: number;
}

export default function ESGScoreGauge({ score, maxScore = 100 }: ESGScoreGaugeProps) {
  const percentage = Math.min((score / maxScore) * 100, 100);
  const data = [
    { name: "Score", value: percentage },
    { name: "Remaining", value: 100 - percentage },
  ];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="rounded-2xl bg-white p-6 flex flex-col items-center justify-center h-full min-h-[180px] shadow-sm cursor-default">
          <p className="text-sm font-semibold tracking-widest uppercase text-gray-900 self-start break-words">
            Overall ESG Score
          </p>

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
        Weighted score from the latest approved assessment across all ESG pillars.
      </TooltipContent>
    </Tooltip>
  );
}
