type StatusProps = {
  status: string;
};

const statusStyles: Record<string, string> = {
  Pending: "bg-yellow-400 text-white",
  Approved: "bg-green-500 text-white",
  Suspended: "bg-red-500 text-white",
  "Under Review": "bg-blue-500 text-white",
  Active: "bg-green-500 text-white",
  Inactive: "bg-yellow-500 text-white",
};

export default function StatusBadge({ status }: StatusProps) {
  const badgeClass = statusStyles[status] || "bg-gray-300 text-gray-800";

  return (
    <span
      className={`px-3 py-1 text-xs rounded-full font-medium ${badgeClass}`}
    >
      {status}
    </span>
  );
}
