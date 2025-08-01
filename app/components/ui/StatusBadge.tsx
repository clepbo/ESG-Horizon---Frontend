"use client";

type StatusType =
  | "Pending"
  | "Suspended"
  | "Under Review"
  | "Approved"
  | string;

const STATUS_STYLES: Record<string, string> = {
  Pending: "bg-[var(--color-warning)] text-white",
  Suspended: "bg-[var(--color-danger)] text-white",
  "Under Review": "bg-[var(--color-info)] text-white",

  Approved: "bg-[var(--color-success)] text-white",
};

interface StatusBadgeProps {
  status: StatusType;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const badgeStyle = STATUS_STYLES[status] || "bg-gray-200 text-gray-800";

  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${badgeStyle}`}
    >
      {status}
    </span>
  );
}
