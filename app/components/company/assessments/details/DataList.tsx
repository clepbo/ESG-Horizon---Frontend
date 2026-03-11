import { allFuels } from "@/lib/fuelDataFile";
import { formatNumberShort } from "@/lib/numberFormat";

interface DataListProps {
  data: any[];
  label: string;
}

export function DataList({ data, label }: DataListProps) {
  if (!data || data.length === 0) return null;

  return (
    <div className="space-y-3 mt-4 first:mt-0">
      <h5 className="text-[10px] font-bold text-teal-600 uppercase tracking-widest mb-2 border-b border-teal-50 pb-1">
        {label}
      </h5>
      <div className="space-y-2">
        {data.map((item, idx) => {
          const fuelLabel = allFuels.find((f) => f.value === item.fuelType)?.label || item.fuelType;
          return (
            <div
              key={`${item.id ?? "item"}-${idx}`}
              className="p-3 bg-gray-50/50 rounded-md border border-gray-100 space-y-2"
            >
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
                {Object.entries(item).map(([key, val]) => {
                  if (["id"].includes(key)) return null;
                  if (val === undefined || val === null || val === "") return null;

                  let displayValue = String(val);
                  const displayLabel = key.replace(/([A-Z])/g, " $1").trim();

                  if (key === "fuelType") {
                    displayValue = fuelLabel;
                  }

                  const isNumericValue = !isNaN(Number(displayValue)) && key !== "fuelType";

                  return (
                    <div key={key} className="flex flex-col gap-0.5">
                      <span className="text-[9px] text-gray-700 font-bold uppercase tracking-tighter">
                        {displayLabel}
                      </span>
                      <span className="text-xs font-semibold text-gray-700 truncate">
                        {isNumericValue ? formatNumberShort(displayValue) : displayValue}
                        {key === "volume" && item.unit ? ` ${item.unit}` : ""}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
