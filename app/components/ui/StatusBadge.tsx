"use client";

export default function StatusBadge({ status }: { status: string }) {
  const statusClasses: Record<string, string> = {
    Pending: "bg-[var(--color-warning-600)] text-white",
    Suspended: "bg-[var(--color-danger-600)] text-white",
    UnderReview: "bg-[var(--color-Info-600)] text-white",
    Approved: "bg-[var(--color-success-600)] text-white",
  };

  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap ${
        statusClasses[status] || "bg-gray-200 text-gray-800"
      }`}
    >
      {status}
    </span>
  );
}
