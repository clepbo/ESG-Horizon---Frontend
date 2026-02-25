import { formatNumberFigures } from "@/app/(company)/components/ranking/FormatNumberFigures";
import { formatNumberFull } from "@/lib/numberFormat";

interface FreshWaterWithdrawalSourceProps {
  surfaceWater?: number;
  groundwater?: number;
  municipal?: number;
}

const SOURCES = [
  { key: "surfaceWater", label: "Surface Water", color: "#3b82f6", bg: "#EFF6FF" },
  { key: "groundwater", label: "Groundwater", color: "#06b6d4", bg: "#ECFEFF" },
  { key: "municipal", label: "Municipal Supply", color: "#6366f1", bg: "#EEF2FF" },
] as const;

export function FreshWaterWithdrawalSource({
  surfaceWater = 0,
  groundwater = 0,
  municipal = 0,
}: FreshWaterWithdrawalSourceProps) {
  const values: Record<string, number> = { surfaceWater, groundwater, municipal };
  const total = surfaceWater + groundwater + municipal;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between border-b pb-3 border-gray-200 mb-4">
        <h6 className="font-semibold text-gray-900 text-sm">Freshwater Withdrawal by Source</h6>
        <div className="text-right shrink-0 ml-3">
          <p className="text-xl font-bold text-blue-600 leading-tight">
            {formatNumberFigures(total)}
          </p>
          <p className="text-xs text-gray-500 font-medium">Total m³</p>
        </div>
      </div>

      {/* Source rows */}
      <div className="flex flex-col gap-4 flex-1 justify-center">
        {SOURCES.map(({ key, label, color, bg }) => {
          const value = values[key];
          const pct = total > 0 ? (value / total) * 100 : 0;

          return (
            <div key={key}>
              {/* Label row */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm font-semibold text-gray-900">{label}</span>
                </div>
                <span className="text-sm font-bold text-gray-900">
                  {formatNumberFigures(value)}
                  <span className="text-xs font-normal text-gray-500 ml-0.5">m³</span>
                </span>
              </div>

              {/* Progress bar + percentage */}
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: color,
                      minWidth: value > 0 ? "4px" : "0",
                    }}
                  />
                </div>
                <span
                  className="text-xs font-semibold px-1.5 py-0.5 rounded-full shrink-0"
                  style={{ backgroundColor: bg, color }}
                >
                  {formatNumberFull(pct, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {total === 0 && (
        <p className="text-center text-sm text-gray-400 mt-4">No withdrawal data recorded</p>
      )}
    </div>
  );
}
