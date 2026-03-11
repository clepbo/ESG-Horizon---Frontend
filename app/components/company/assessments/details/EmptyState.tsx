import { ClipboardList } from "lucide-react";

interface EmptyStateProps {
  message?: string;
  hint?: string;
}

export function EmptyState({
  message = "No data entered yet",
  hint = "Click Edit Data below to begin filling in this metric.",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="p-4 bg-gray-50 rounded-xl mb-4">
        <ClipboardList className="w-10 h-10 text-gray-300" />
      </div>
      <p className="text-sm font-semibold text-gray-700">{message}</p>
      <p className="text-xs text-gray-400 mt-1">{hint}</p>
    </div>
  );
}
