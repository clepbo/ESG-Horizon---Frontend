"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/app/components/ui/button";

type StatusVariant = "status-working" | "status-awaiting" | "status-progress";

interface StatusButtonProps {
  status: "Working on it" | "Awaiting Review" | "In Progress";
  progress?: number;
}

export function StatusButton({ status, progress = 0 }: StatusButtonProps) {
  const getStyles = (status: StatusButtonProps["status"]) => {
    switch (status) {
      case "Working on it":
        return {
          variant: "status-working" as StatusVariant,
          buttonClass: "bg-green-500 text-white hover:bg-green-600",
          barClass: "bg-green-500",
        };
      case "Awaiting Review":
        return {
          variant: "status-awaiting" as StatusVariant,
          buttonClass: "bg-blue-500 text-white hover:bg-blue-600",
          barClass: "bg-blue-500",
        };
      case "In Progress":
        return {
          variant: "status-progress" as StatusVariant,
          buttonClass: "bg-orange-500 text-white hover:bg-orange-600",
          barClass: "bg-orange-500",
        };
      default:
        return {
          variant: "secondary" as StatusVariant,
          buttonClass: "bg-gray-300 text-gray-800 hover:bg-gray-400",
          barClass: "bg-gray-400",
        };
    }
  };

  const { buttonClass, barClass } = getStyles(status);

  return (
    <div className="flex flex-col items-center gap-1 w-fit">
      <Button size="sm" className={cn("rounded-full px-3 py-1 text-xs font-medium", buttonClass)}>
        {status}
      </Button>
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn("h-1 transition-all duration-300 bg-green-400", barClass)}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
