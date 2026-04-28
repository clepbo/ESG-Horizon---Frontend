import type { LevelKey } from "../_fixtures/types";

const STYLES: Record<LevelKey, { bg: string; text: string; label: string }> = {
  sector: { bg: "bg-emerald-50", text: "text-emerald-700", label: "SEC" },
  industry: { bg: "bg-blue-50", text: "text-blue-700", label: "IND" },
  pillar: { bg: "bg-amber-50", text: "text-amber-700", label: "PIL" },
  topic: { bg: "bg-purple-50", text: "text-purple-700", label: "TOP" },
  submetric: { bg: "bg-gray-100", text: "text-gray-700", label: "SUB" },
};

export default function LevelBadge({ level }: { level: LevelKey }) {
  const s = STYLES[level];
  return (
    <span
      className={`inline-flex items-center justify-center px-1.5 h-[18px] rounded text-[10px] font-bold tracking-wider ${s.bg} ${s.text}`}
    >
      {s.label}
    </span>
  );
}
