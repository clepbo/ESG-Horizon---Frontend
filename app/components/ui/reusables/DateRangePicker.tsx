import { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Button } from "../button";

interface DateRange {
  startMonth: string;
  endMonth: string;
}

interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange) => void;
  className?: string;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const FULL_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

type SelectionMode = "start" | "end";

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>("start");
  const [tempStartMonth, setTempStartMonth] = useState<number | null>(null);
  const [tempStartYear, setTempStartYear] = useState<number>(new Date().getFullYear());
  const [tempEndMonth, setTempEndMonth] = useState<number | null>(null);
  const [tempEndYear, setTempEndYear] = useState<number>(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState("month");

  const currentYear = new Date().getFullYear();

  const handleMonthSelect = (monthIndex: number) => {
    if (selectionMode === "start") {
      setTempStartMonth(monthIndex);
      // Auto-switch to end selection after selecting start
      setSelectionMode("end");
    } else {
      setTempEndMonth(monthIndex);
    }
  };

  const handleYearChange = (direction: "prev" | "next") => {
    if (selectionMode === "start") {
      setTempStartYear((prev) => (direction === "prev" ? prev - 1 : prev + 1));
    } else {
      setTempEndYear((prev) => (direction === "prev" ? prev - 1 : prev + 1));
    }
  };

  const handleApply = () => {
    if (tempStartMonth !== null && tempEndMonth !== null) {
      onChange?.({
        startMonth: `${FULL_MONTHS[tempStartMonth]}, ${tempStartYear}`,
        endMonth: `${FULL_MONTHS[tempEndMonth]}, ${tempEndYear}`,
      });
      setIsOpen(false);
      // Reset selection mode for next time
      setSelectionMode("start");
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    // Reset to current values or null
    setTempStartMonth(null);
    setTempEndMonth(null);
    setTempStartYear(currentYear);
    setTempEndYear(currentYear);
    setSelectionMode("start");
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      handleCancel();
    }
  };

  const displayYear = selectionMode === "start" ? tempStartYear : tempEndYear;
  const selectedMonth = selectionMode === "start" ? tempStartMonth : tempEndMonth;

  // Display text for the trigger button
  const displayText =
    value?.startMonth && value?.endMonth
      ? `${value.startMonth} → ${value.endMonth}`
      : "Start Date → End Date";

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(undefined as any);
    setTempStartMonth(null);
    setTempEndMonth(null);
    setTempStartYear(currentYear);
    setTempEndYear(currentYear);
    setSelectionMode("start");
  };

  return (
    <div className={cn("relative", className)}>
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full sm:w-auto min-w-[300px] justify-start text-left font-normal pr-10",
              !value?.startMonth && "text-muted-foreground"
            )}
          >
            <Calendar className="mr-2 h-4 w-4 text-primary" />
            {displayText}
          </Button>
        </PopoverTrigger>

        {/* Clear button */}
        {value?.startMonth && value?.endMonth && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-10 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <PopoverContent
          className="w-auto p-0 pointer-events-auto z-50 border-none shadow-sm"
          align="start"
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b">
              <TabsList className="w-full grid grid-cols-4 h-12 bg-transparent rounded-none">
                <TabsTrigger
                  value="day"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-b-primary data-[state=active]:text-primary rounded-none"
                >
                  Day
                </TabsTrigger>
                <TabsTrigger
                  value="week"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-b-primary data-[state=active]:text-primary rounded-none"
                >
                  Week
                </TabsTrigger>
                <TabsTrigger
                  value="month"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-b-primary data-[state=active]:text-primary rounded-none"
                >
                  Month
                </TabsTrigger>
                <TabsTrigger
                  value="year"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-b-primary data-[state=active]:text-primary rounded-none"
                >
                  Year
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="month" className="p-4 m-0">
              {/* Selection Mode Indicator */}
              <div className="mb-3 text-sm text-muted-foreground">
                Selecting:{" "}
                <span className="font-semibold text-primary">
                  {selectionMode === "start" ? "Start Month" : "End Month"}
                </span>
                {tempStartMonth !== null && (
                  <span className="ml-2">
                    ({FULL_MONTHS[tempStartMonth]}, {tempStartYear} →
                    {tempEndMonth !== null ? ` ${FULL_MONTHS[tempEndMonth]}, ${tempEndYear}` : " ?"}
                    )
                  </span>
                )}
              </div>

              {/* Year Navigation */}
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleYearChange("prev")}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="font-semibold text-lg">{displayYear}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleYearChange("next")}
                  className="h-8 w-8"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Month Grid */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {MONTHS.map((month, index) => (
                  <button
                    key={month}
                    onClick={() => handleMonthSelect(index)}
                    className={cn(
                      "px-4 py-2 text-sm rounded-md transition-colors hover:bg-muted",
                      selectedMonth === index
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-background border border-border"
                    )}
                  >
                    {month}
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  className="text-muted-foreground"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleApply}
                  disabled={tempStartMonth === null || tempEndMonth === null}
                  className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white"
                >
                  Apply
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="day" className="p-4 m-0">
              <div className="text-center text-muted-foreground py-8">Day view coming soon</div>
            </TabsContent>

            <TabsContent value="week" className="p-4 m-0">
              <div className="text-center text-muted-foreground py-8">Week view coming soon</div>
            </TabsContent>

            <TabsContent value="year" className="p-4 m-0">
              <div className="text-center text-muted-foreground py-8">Year view coming soon</div>
            </TabsContent>
          </Tabs>
        </PopoverContent>
      </Popover>
    </div>
  );
}
