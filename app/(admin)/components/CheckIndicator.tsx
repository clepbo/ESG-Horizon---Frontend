import { Check, X } from "lucide-react";

interface CheckIndicatorProps {
  granted: boolean;
  label: string;
}

/**
 * Read-only permission indicator used on role cards. Green check for granted,
 * red X for denied. Not interactive — pair with a label to the right.
 */
export default function CheckIndicator({ granted, label }: CheckIndicatorProps) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {granted ? (
        <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[3]" />
      ) : (
        <X className="w-4 h-4 text-red-500 shrink-0 stroke-[3]" />
      )}
      <span className="text-gray-800">{label}</span>
    </div>
  );
}
