type ReportSummaryCardProps = {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconBgColor?: string;
  change?: number; // ← changed from changeText
};

export function ReportSummaryCard({
  label,
  value,
  change,
  icon,
  iconBgColor = "bg-gray-100",
}: ReportSummaryCardProps) {
  const getChangeText = () => {
    if (change === undefined) return null;
    const isPositive = change >= 0;
    const textColor = isPositive ? "text-green-600" : "text-red-600";
    const sign = isPositive ? "+" : "";
    return (
      <span className={`text-sm ${textColor}`}>
        {sign}
        {typeof change === "number" ? `${change}%` : change}
      </span>
    );
  };

  return (
    <div className="flex h-40 w-full items-center justify-between rounded-xl border border-black/10 bg-white p-4 shadow-sm">
      {/* Left Content */}
      <div className="flex flex-col justify-between h-full py-1">
        <span className="text-sm text-gray-500">{label}</span>
        <span className="text-3xl font-bold text-gray-900">{value}</span>
        {getChangeText()}
      </div>

      {/* Icon */}
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-md p-2 ${iconBgColor} text-gray-700`}
      >
        {icon}
      </div>
    </div>
  );
}
