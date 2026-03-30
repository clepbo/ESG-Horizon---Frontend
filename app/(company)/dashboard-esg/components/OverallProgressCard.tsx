"use client";

import { Tooltip, TooltipTrigger, TooltipContent } from "@/app/components/ui/tooltip";

interface HubStats {
  environment?: { progress: number; completed: string; status: string };
  social?: { progress: number; completed: string; status: string };
  governance?: { progress: number; completed: string; status: string };
}

interface OverallProgressCardProps {
  hubStats?: HubStats | null;
}

/** Parse "X of Y sections completed" → { done: X, total: Y } */
function parseSections(str?: string): { done: number; total: number } {
  if (!str) return { done: 0, total: 0 };
  const match = str.match(/(\d+)\s+of\s+(\d+)/);
  return match ? { done: parseInt(match[1], 10), total: parseInt(match[2], 10) } : { done: 0, total: 0 };
}

export default function OverallProgressCard({
  hubStats,
}: OverallProgressCardProps) {
  const pillars = [
    hubStats?.environment,
    hubStats?.social,
    hubStats?.governance,
  ];

  const completedCount = pillars.filter((p) => p?.status === "completed").length;
  const inProgressCount = pillars.filter((p) => p?.status === "in-progress").length;
  const notStartedCount = pillars.filter((p) => p?.status === "not-started" || !p).length;

  // Sum both numerator and denominator from the backend's "X of Y" strings
  const { completedSections, totalSections } = pillars.reduce(
    (acc, p) => {
      const { done, total } = parseSections(p?.completed);
      return { completedSections: acc.completedSections + done, totalSections: acc.totalSections + total };
    },
    { completedSections: 0, totalSections: 0 }
  );

  const progressPercent = totalSections > 0
    ? Math.round((completedSections / totalSections) * 100)
    : 0;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="rounded-2xl bg-white p-6 flex flex-col justify-between h-full min-h-[180px] shadow-sm cursor-default">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold tracking-widest uppercase text-gray-900">
                Overall Progress
              </p>
              <span className="text-sm font-bold text-gray-900">{progressPercent}%</span>
            </div>

            {/* Progress bar */}
            <div className="mt-2 h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#119B95] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <p className="mt-2 text-xs text-gray-900">
              {completedSections} of {totalSections} sections completed
            </p>
          </div>

          {/* Status counters — tracks 3 ESG hubs (E, S, G) */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <StatusCounter label="Complete" count={completedCount} color="text-[#119B95]" />
            <StatusCounter label="In Progress" count={inProgressCount} color="text-amber-500" />
            <StatusCounter label="Not Started" count={notStartedCount} color="text-gray-700" />
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={8} className="max-w-xs">
        <p>Tracks {totalSections} form groups across 3 ESG hubs.</p>
        <p className="mt-1">Each form you submit counts as one completed section.</p>
      </TooltipContent>
    </Tooltip>
  );
}

function StatusCounter({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: string;
}) {
  return (
    <div className="text-center">
      <p className={`text-xl font-bold ${color}`}>{count}</p>
      <p className="text-[10px] text-gray-900">{label}</p>
    </div>
  );
}
