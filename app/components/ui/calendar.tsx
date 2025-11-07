"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarProps {
  selected?: Date;
  onSelect?: (date: Date) => void;
  className?: string;
}

export function Calendar({ selected, onSelect, className }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState<Date>(selected || new Date());

  const daysInMonth = React.useMemo(() => {
    const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const days = [];
    for (let i = start.getDate(); i <= end.getDate(); i++) {
      days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
    }
    return days;
  }, [currentMonth]);

  const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const goToPrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  return (
    <div
      className={cn("w-[280px] rounded-lg border bg-white shadow-md p-4 select-none", className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <button onClick={goToPrevMonth} className="text-gray-500 hover:text-gray-800 px-2 py-1">
          ‹
        </button>
        <div className="font-semibold text-sm">{format(currentMonth, "MMMM yyyy")}</div>
        <button onClick={goToNextMonth} className="text-gray-500 hover:text-gray-800 px-2 py-1">
          ›
        </button>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 text-center text-xs text-gray-500 mb-1">
        {weekdays.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 text-center text-sm">
        {Array(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay())
          .fill(null)
          .map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
        {daysInMonth.map((day) => {
          const isSelected = selected && day.toDateString() === selected.toDateString();
          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelect?.(day)}
              className={cn(
                "h-8 w-8 mx-auto flex items-center justify-center rounded-full",
                isSelected ? "bg-blue-600 text-white" : "hover:bg-gray-100 text-gray-800"
              )}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
