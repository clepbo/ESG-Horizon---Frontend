import type { SectionStatus } from "@/lib/assessmentStatusUtils";

interface StatusDotProps {
  status: SectionStatus;
  size?: "sm" | "md";
}

const dotColor: Record<SectionStatus, string> = {
  submitted: "bg-teal-500",
  "in-progress": "bg-amber-400",
  "not-started": "bg-gray-300",
};

export function StatusDot({ status, size = "md" }: StatusDotProps) {
  const sizeClass = size === "sm" ? "w-2 h-2" : "w-2.5 h-2.5";

  return <span className={`inline-block rounded-full shrink-0 ${sizeClass} ${dotColor[status]}`} />;
}
