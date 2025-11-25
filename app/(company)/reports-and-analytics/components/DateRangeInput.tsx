import React, { useState, useRef } from "react";
import { format } from "date-fns";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DateRangeInputProps {
  onDateRangeChange?: (startDate: Date | null, endDate: Date | null) => void;
}

const DateRangeInput: React.FC<DateRangeInputProps> = ({ onDateRangeChange }) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectingEndDate, setSelectingEndDate] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleStartDateClick = () => {
    setSelectingEndDate(false);
    setIsCalendarOpen(true);
  };

  const handleEndDateClick = () => {
    setSelectingEndDate(true);
    setIsCalendarOpen(true);
  };

  const handleDateSelect = (date: Date) => {
    if (!selectingEndDate) {
      setStartDate(date);
      setSelectingEndDate(true);
    } else {
      setEndDate(date);
      setIsCalendarOpen(false);
      setSelectingEndDate(false);
      onDateRangeChange?.(startDate, date);
    }
  };

  const formatDisplayDate = (date: Date | null) => {
    return date ? format(date, "MMM dd, yyyy") : "";
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      if (direction === "prev") {
        newMonth.setMonth(newMonth.getMonth() - 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDayOfWeek = firstDayOfMonth.getDay();

    const days = [];

    // Previous month's days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = 0; i < startingDayOfWeek; i++) {
      const day = prevMonthLastDay - startingDayOfWeek + i + 1;
      days.push({
        date: new Date(year, month - 1, day),
        isCurrentMonth: false,
        isDisabled: true,
      });
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isSelected =
        (startDate && date.toDateString() === startDate.toDateString()) ||
        (endDate && date.toDateString() === endDate.toDateString());
      const isInRange = startDate && endDate && date >= startDate && date <= endDate;

      days.push({
        date,
        isCurrentMonth: true,
        isSelected,
        isInRange,
        isDisabled: false,
      });
    }

    // Next month's days
    const totalCells = 42; // 6 weeks
    const remainingDays = totalCells - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false,
        isDisabled: true,
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center space-x-3">
        {/* Start Date */}
        <button
          type="button"
          onClick={handleStartDateClick}
          className={cn(
            "flex items-center space-x-2 border border-input bg-background rounded-md px-3 py-2 text-sm transition-colors",
            "hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            !startDate && "text-muted-foreground",
            selectingEndDate && "ring-2 ring-blue-500"
          )}
        >
          <CalendarIcon className="h-4 w-4 shrink-0" />
          <span className="min-w-[100px] text-left">
            {startDate ? formatDisplayDate(startDate) : "Start date"}
          </span>
        </button>

        {/* Separator */}
        <div className="text-muted-foreground">–</div>

        {/* End Date */}
        <button
          type="button"
          onClick={handleEndDateClick}
          className={cn(
            "flex items-center space-x-2 border border-input bg-background rounded-md px-3 py-2 text-sm transition-colors",
            "hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            !endDate && "text-muted-foreground",
            !selectingEndDate && isCalendarOpen && "ring-2 ring-blue-500"
          )}
        >
          <CalendarIcon className="h-4 w-4 shrink-0" />
          <span className="min-w-[100px] text-left">
            {endDate ? formatDisplayDate(endDate) : "End date"}
          </span>
        </button>
      </div>

      {/* Calendar Popover */}
      {isCalendarOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsCalendarOpen(false)} />

          {/* Calendar */}
          <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigateMonth("prev")}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>

              <span className="font-medium text-sm">{format(currentMonth, "MMMM yyyy")}</span>

              <button
                onClick={() => navigateMonth("next")}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                <div key={day} className="text-center text-xs text-gray-500 font-medium py-1">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => (
                <button
                  key={index}
                  onClick={() => !day.isDisabled && handleDateSelect(day.date)}
                  disabled={day.isDisabled}
                  className={cn(
                    "h-8 w-8 rounded-md text-sm transition-colors",
                    day.isDisabled && "text-gray-300 cursor-not-allowed",
                    !day.isDisabled && "hover:bg-gray-100",
                    day.isSelected && "bg-blue-500 text-white hover:bg-blue-600",
                    day.isInRange && !day.isSelected && "bg-blue-100",
                    day.isCurrentMonth && !day.isSelected && !day.isInRange && "text-gray-900",
                    !day.isCurrentMonth && !day.isSelected && "text-gray-400"
                  )}
                >
                  {day.date.getDate()}
                </button>
              ))}
            </div>

            {/* Instructions */}
            <div className="mt-3 text-xs text-gray-500 text-center">
              {selectingEndDate ? "Select end date" : "Select start date"}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DateRangeInput;
