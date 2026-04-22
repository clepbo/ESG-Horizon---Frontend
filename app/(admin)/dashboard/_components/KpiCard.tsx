import { ArrowDown, ArrowUp, Minus, AlertCircle } from "lucide-react";
import type { AdminKpi, KpiValueTone } from "../_fixtures/kpis";

const TREND_STYLES: Record<
  AdminKpi["trend"]["direction"],
  { icon: React.ComponentType<{ className?: string }> | null; color: string }
> = {
  up: { icon: ArrowUp, color: "text-emerald-600" },
  down: { icon: ArrowDown, color: "text-red-600" },
  neutral: { icon: Minus, color: "text-gray-700" },
  warning: { icon: AlertCircle, color: "text-amber-600" },
  none: { icon: null, color: "text-gray-700" },
};

const VALUE_TONE: Record<KpiValueTone, string> = {
  default: "text-gray-900",
  success: "text-emerald-600",
  warning: "text-amber-600",
  danger: "text-red-600",
};

export default function KpiCard({ kpi }: { kpi: AdminKpi }) {
  const { icon: Icon, color } = TREND_STYLES[kpi.trend.direction];
  const valueClass = VALUE_TONE[kpi.valueTone ?? "default"];
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <p className="text-xs text-gray-700 mb-1.5">{kpi.label}</p>
      <p className={`text-3xl font-bold leading-none ${valueClass}`}>{kpi.value}</p>
      <div className={`mt-3 flex items-center gap-1 text-xs font-medium ${color}`}>
        {Icon && <Icon className="w-3.5 h-3.5" />}
        <span>{kpi.trend.text}</span>
      </div>
    </div>
  );
}
