import { formatNumberShort } from "@/lib/numberFormat";
import { CheckSquare2, Square } from "lucide-react";

interface DataFieldProps {
  label: string;
  value: any;
  unit?: string;
  highlight?: boolean;
  isBoolean?: boolean;
  /** Render the value as natural-flow paragraph text (not bold), spanning
   *  the full grid width. For narrative description / discussion fields. */
  paragraph?: boolean;
}

export function DataField({ label, value, unit, highlight, isBoolean, paragraph }: DataFieldProps) {
  const isEmpty = value === undefined || value === null || value === "";
  const isNumeric = !isEmpty && !isBoolean && !paragraph && !isNaN(Number(value));

  const isTrue =
    isBoolean &&
    !isEmpty &&
    (value === true || value === "yes" || value === "Yes" || value === "true");

  // Paragraph variant — full-width, normal weight, preserves user line breaks.
  if (paragraph) {
    return (
      <div className="col-span-full flex flex-col gap-2 p-4 rounded-lg border bg-gray-50/50 border-gray-100">
        <span className="text-xs font-semibold text-gray-600">{label}</span>
        {isEmpty ? (
          <span className="text-sm text-gray-400 italic">—</span>
        ) : (
          <p className="text-sm font-normal text-gray-800 leading-relaxed whitespace-pre-wrap">
            {String(value)}
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col gap-1 p-3 rounded-lg border ${
        highlight ? "bg-teal-50 border-teal-200" : "bg-gray-50/50 border-gray-100"
      }`}
    >
      <span className={`text-xs font-medium ${highlight ? "text-teal-800" : "text-gray-900"}`}>
        {label}
      </span>
      <div className="flex items-center gap-1.5">
        {isEmpty ? (
          <span className="text-gray-700 text-xs italic">—</span>
        ) : isBoolean ? (
          <>
            {isTrue ? (
              <CheckSquare2 className="w-4 h-4 text-green-600 shrink-0" />
            ) : (
              <Square className="w-4 h-4 text-gray-700 shrink-0" />
            )}
            <span className="text-sm font-bold text-gray-800">{isTrue ? "Yes" : "No"}</span>
          </>
        ) : (
          <>
            <span className={`text-sm font-bold ${highlight ? "text-teal-900" : "text-gray-800"}`}>
              {isNumeric ? formatNumberShort(value) : value}
            </span>
            {unit && (
              <span
                className={`text-[10px] font-normal ${
                  highlight ? "text-teal-700" : "text-gray-700"
                }`}
              >
                {unit}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
