type StatusProps = {
  status: string;
};

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-400 text-white",
  approved: "bg-green-500 text-white",
  suspended: "bg-red-500 text-white",
  "Under Review": "bg-blue-500 text-white",
  active: "bg-green-500 text-white",
  inactive: "bg-yellow-500 text-white",
};

export default function StatusBadge({ status }: StatusProps) {
  const badgeClass = statusStyles[status] || "bg-gray-300 text-gray-800";

  return (
    <span
      className={`inline-flex w-fit px-1.5 py-0.5 text-[11px] rounded font-medium leading-tight ${badgeClass}`}
    >
      {status}
    </span>
  );
}
