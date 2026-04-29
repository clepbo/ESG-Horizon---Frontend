"use client";

import { RefreshCw, X } from "lucide-react";
import { useVersionCheck } from "@/hooks/useVersionCheck";

export default function UpdateBanner() {
  const { updateAvailable, hardRefresh, dismiss } = useVersionCheck();

  if (!updateAvailable) return null;

  return (
    <div className="bg-teal-600 text-white px-4 py-2.5 flex items-center justify-between gap-3 text-sm z-50 shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        <RefreshCw className="h-4 w-4 shrink-0 animate-spin" style={{ animationDuration: "3s" }} />
        <span className="truncate">
          New updates are available. Refresh to apply them.
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={hardRefresh}
          className="bg-white text-teal-700 font-medium px-3 py-1 rounded-md text-sm hover:bg-teal-50 transition-colors"
        >
          Refresh Now
        </button>
        <button
          onClick={dismiss}
          className="text-white/80 hover:text-white transition-colors p-0.5"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
