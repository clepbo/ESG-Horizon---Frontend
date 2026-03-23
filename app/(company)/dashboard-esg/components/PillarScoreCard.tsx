"use client";

import Image from "next/image";
import type { PillarScore } from "./types";

interface PillarScoreCardProps {
  pillar: PillarScore;
}

export default function PillarScoreCard({ pillar }: PillarScoreCardProps) {
  return (
    <div
      className="rounded-2xl bg-white p-5 shadow-sm flex items-center gap-4"
      style={{ borderLeft: `4px solid ${pillar.color}` }}
    >
      <div
        className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: `${pillar.color}15` }}
      >
        <Image src={pillar.iconSrc} alt={pillar.name} width={36} height={36} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{pillar.name}</p>
        <div className="mt-1">
          <span className="text-3xl font-bold text-gray-900">{pillar.score}</span>
          <span className="text-base text-gray-700">/{pillar.maxScore}</span>
        </div>
      </div>
    </div>
  );
}
