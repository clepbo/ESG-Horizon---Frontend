export default function StatusBadge({ status }: { status: string }) {
  const base = "px-2 py-1 rounded text-xs font-medium";
  if (status === "Pending")
    return <span className={`${base} bg-yellow-100 text-yellow-800`}>{status}</span>;
  if (status === "Suspended")
    return <span className={`${base} bg-red-100 text-red-800`}>{status}</span>;
  if (status === "Under Review")
    return <span className={`${base} bg-blue-100 text-blue-800`}>{status}</span>;
  return <span className={`${base} bg-gray-100 text-gray-700`}>{status}</span>;
}
