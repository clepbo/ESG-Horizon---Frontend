"use client";

import { Lock } from "lucide-react";

interface PermissionTooltipProps {
  message: string;
  align?: "center" | "right" | "left";
}

export default function PermissionTooltip({ message, align = "center" }: PermissionTooltipProps) {
  const pos =
    align === "right"
      ? "right-0"
      : align === "left"
        ? "left-0"
        : "left-1/2 -translate-x-1/2";

  return (
    <div
      className={`absolute ${pos} bottom-full mb-2 w-48 p-2 bg-teal-600 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center pointer-events-none z-50`}
    >
      <Lock className="w-3 h-3 inline mr-1" />
      {message}
    </div>
  );
}
