// components/ui/custom-progress.tsx
import * as React from "react";
import { cn } from "@/lib/utils";
import { Progress } from "@/app/components/ui/progress";

interface CustomProgressProps {
  value: number;
  className?: string;
  title: string;
  total: number;
  percent: number;
}

export function CustomProgress({ value, className, title, total, percent }: CustomProgressProps) {
  return (
    <div className="grid gap-0">
      <span className="flex justify-between w-full">
        <small> {title} </small>
        <small>
          {" "}
          {total} tCO<sub>2</sub>e{`(${percent}%)`}{" "}
        </small>
      </span>
      <div className={cn("w-full rounded-full bg-green-200 h-2", className)}>
        <Progress value={value} className="h-2 rounded-full bg-green-200 [&>div]:bg-green-700" />
      </div>
    </div>
  );
}
