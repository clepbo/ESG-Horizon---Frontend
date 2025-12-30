import { CheckCircle2 } from "lucide-react";
import {
  getCompletionBadgeVariant,
  shouldShowBadge,
  type CompletionStatus,
} from "@/lib/assessmentCompletionUtils";

interface CompletionIndicatorProps {
  status?: CompletionStatus;
  className?: string;
}

export function CompletionIndicator({ status, className = "" }: CompletionIndicatorProps) {
  if (!status || !shouldShowBadge(status)) return null;

  const badge = getCompletionBadgeVariant(status);

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {status.status === "completed" && <CheckCircle2 className="h-4 w-4 text-green-600" />}
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${badge.className}`}>
        {badge.text}
      </span>
    </div>
  );
}
