"use client";

import PillarScoreCard from "./PillarScoreCard";
import type { PillarScore } from "./types";

interface PillarScoresRowProps {
  pillars: PillarScore[];
}

export default function PillarScoresRow({ pillars }: PillarScoresRowProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-3">ESG Score by Pillar</h2>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {pillars.map((pillar) => (
          <PillarScoreCard key={pillar.id} pillar={pillar} />
        ))}
      </div>
    </div>
  );
}
