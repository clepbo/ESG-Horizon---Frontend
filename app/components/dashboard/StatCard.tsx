import { ArrowUp, ArrowDown } from "lucide-react";

type StatCardProps = {
  icon: React.ReactNode;
  label: string;
  value: number;
  change?: number;
};

export default function StatCard({
  icon,
  label,
  value,
  change,
}: StatCardProps) {
  const isPositive = change === undefined || change >= 0;

  return (
    <div className="h-40 rounded-lg border border-black/10 bg-white px-4 py-3 shadow-sm flex flex-col justify-between">
      {/* Icon */}
      <div className="flex items-start">
        <div className="rounded-full bg-gray-100 p-3 text-primary">{icon}</div>
      </div>

      {/* Label + Value */}
      <div className="flex flex-col items-start">
        <span className="text-sm text-gray-500 font-medium">{label}</span>
        <p className="text-3xl font-extrabold text-gray-900 leading-tight">
          {value}
        </p>
      </div>

      {/* Bottom-right Change Badge */}
      {change !== undefined && (
        <div className="flex justify-end">
          <div
            className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
              isPositive
                ? "bg-success-200 text-green-600"
                : "bg-danger-100 text-danger-600"
            }`}
          >
            {isPositive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
            {Math.abs(change)}%
          </div>
        </div>
      )}
    </div>
  );
}
