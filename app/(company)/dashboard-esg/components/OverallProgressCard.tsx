"use client";

interface HubStats {
  environment?: { progress: number; completed: string; status: string };
  social?: { progress: number; completed: string; status: string };
  governance?: { progress: number; completed: string; status: string };
}

interface OverallProgressCardProps {
  hubStats?: HubStats | null;
  totalSections: number;
}

export default function OverallProgressCard({
  hubStats,
  totalSections,
}: OverallProgressCardProps) {
  const pillars = [
    hubStats?.environment,
    hubStats?.social,
    hubStats?.governance,
  ];

  const completedCount = pillars.filter((p) => p?.status === "completed").length;
  const inProgressCount = pillars.filter((p) => p?.status === "in-progress").length;
  const notStartedCount = pillars.filter((p) => p?.status === "not-started" || !p).length;

  // Calculate total completed sections from the "X of Y" strings
  const completedSections = pillars.reduce((sum, p) => {
    if (!p?.completed) return sum;
    const match = p.completed.match(/(\d+)/);
    return sum + (match ? parseInt(match[1], 10) : 0);
  }, 0);

  const progressPercent = totalSections > 0
    ? Math.round((completedSections / totalSections) * 100)
    : 0;

  return (
    <div className="rounded-2xl bg-white p-6 flex flex-col justify-between h-full min-h-[180px] shadow-sm">
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

      {/* Status counters */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        <StatusCounter label="Complete" count={completedCount} color="text-[#119B95]" />
        <StatusCounter label="In Progress" count={inProgressCount} color="text-amber-500" />
        <StatusCounter label="Not Started" count={notStartedCount} color="text-gray-700" />
      </div>
    </div>
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
