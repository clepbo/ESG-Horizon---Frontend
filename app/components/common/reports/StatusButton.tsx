"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/app/components/ui/button";
import { formatLabel } from "@/app/(company)/reports-and-analytics/components/utils/dataTransfomer";

export type StatusVariant =
  | "awaiting-review"
  | "approved"
  | "submitted-approved"
  | "unapproved"
  | string;

export interface StatusButtonProps {
  status: StatusVariant;
  progress?: number;
}

export function StatusButton({ status, progress = 0 }: StatusButtonProps) {
  const normalizedStatus = status
    ?.toString()
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-");

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getStyles = (status: StatusButtonProps["status"]) => {
    switch (normalizedStatus) {
      case "approved":
        return {
          variant: "approved" as StatusVariant,
          buttonClass: "bg-primary text-white hover:bg-green-600",
          barClass: "bg-green-500",
        };
      case "submitted-approved":
        return {
          variant: "submitted-approved" as StatusVariant,
          buttonClass: "bg-primary text-white hover:bg-green-600",
          barClass: "bg-green-500",
        };

      case "unapproved":
        return {
          variant: "unapproved" as StatusVariant,
          buttonClass: "bg-orange-500 text-white hover:bg-orange-600",
          barClass: "bg-orange-500",
        };
      default:
        return {
          variant: "secondary" as StatusVariant,
          buttonClass: "bg-blue-600 text-white hover:bg-green-400",
          barClass: "bg-gray-400",
        };
    }
  };

  const { buttonClass, barClass } = getStyles(status);

  return (
    <div className="flex flex-col items-center gap-1 w-fit">
      <Button size="sm" className={cn("rounded-full px-3 py-1 text-xs font-medium", buttonClass)}>
        {formatLabel(status)}
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
