"use client";

import { Tooltip, TooltipTrigger, TooltipContent } from "@/app/components/ui/tooltip";
import type { PillarScore } from "./types";

interface PillarScoreCardProps {
  pillar: PillarScore;
}

export default function PillarScoreCard({ pillar }: PillarScoreCardProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className="rounded-2xl bg-white p-5 shadow-sm flex items-center gap-4 cursor-default overflow-hidden"
          style={{ borderLeft: `4px solid ${pillar.color}` }}
        >
          <div
            className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: pillar.iconBg, color: pillar.color }}
          >
            {pillar.icon}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 break-keep hyphens-auto">{pillar.name}</p>
            <div className="mt-1">
              <span className="text-3xl font-bold text-gray-900">{pillar.score}</span>
              <span className="text-base text-gray-700">/{pillar.maxScore}</span>
            </div>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={8} className="max-w-xs">
        {pillar.name} pillar score from the latest ESG assessment evaluation.
      </TooltipContent>
    </Tooltip>
  );
}
