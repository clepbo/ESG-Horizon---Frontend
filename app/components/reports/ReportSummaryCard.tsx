type ReportSummaryCardProps = {
  label: string;
  value: number;
  changeText: string;
  icon: React.ReactNode;
  iconBgColor?: string;
};

export function ReportSummaryCard({
  label,
  value,
  changeText,
  icon,
  iconBgColor = "bg-gray-100",
}: ReportSummaryCardProps) {
  return (
    <div className="flex h-40 w-full items-center justify-between rounded-xl border border-black/10 bg-white p-4 shadow-sm">
      {/* Left Content */}
      <div className="flex flex-col justify-between h-full py-1">
        <span className="text-sm text-gray-500">{label}</span>
        <span className="text-3xl font-bold text-gray-900">{value}</span>
        <span className="text-sm text-gray-500">{changeText}</span>
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
