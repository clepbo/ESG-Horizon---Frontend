import { type SectionStatus } from "@/lib/assessmentStatusUtils";

const STATUS_CONFIG: Record<SectionStatus, { label: string; bg: string; text: string }> = {
  submitted: { label: "Completed", bg: "bg-teal-100", text: "text-teal-700" },
  "in-progress": { label: "In Progress", bg: "bg-yellow-100", text: "text-yellow-700" },
  "not-started": { label: "Not Started", bg: "bg-gray-100", text: "text-gray-500" },
};

export function StatusPill({ status }: { status: SectionStatus }) {
  const { label, bg, text } = STATUS_CONFIG[status] || STATUS_CONFIG["not-started"];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 ${bg} ${text}`}
    >
      {label}
    </span>
  );
}
