import { useEffect, useState, useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import Reportcard from "@/app/components/common/reports/Reportcard";
import SearchInput from "@/app/components/ui/reusables/SearchInput";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useReport } from "./service/useReport";

export default function ReportPage() {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [reportData, setReportData] = useState<any[]>([]);

  const report = useReport();

  useEffect(() => {
    if (report.data) {
      // Add random progress for demonstration
      const dataWithProgress = report.data.map((item: any) => ({
        ...item,
        progress: Math.floor(Math.random() * 101), // Random progress 0-100
      }));
      setReportData(dataWithProgress);
    }
  }, [report.data]);

  // Helper function to convert month names and years to Date objects
  const convertToDate = (monthName: string, year: string): Date | null => {
    if (!monthName || !year || monthName === "" || year === "") return null;

    const months: { [key: string]: number } = {
      January: 0,
      February: 1,
      March: 2,
      April: 3,
      May: 4,
      June: 5,
      July: 6,
      August: 7,
      September: 8,
      October: 9,
      November: 10,
      December: 11,
    };

    const monthIndex = months[monthName];
    if (monthIndex === undefined) return null;

    // Use the 15th of the month to avoid timezone issues with end of month
    return new Date(parseInt(year), monthIndex, 15);
  };

  // Filter and sort logic
  const filteredAndSortedReports = useMemo(() => {
    let filtered = [...reportData];

    // Search filter by subsidiary
    if (searchTerm) {
      filtered = filtered.filter((report) =>
        report.subsidiary?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Date range filter - filter by assessment period
    if (startDate || endDate) {
      filtered = filtered.filter((report) => {
        const reportStartDate = convertToDate(report.startMonth, report.startYear);
        const reportEndDate = convertToDate(report.endMonth, report.endYear);

        // If we can't parse the dates, don't filter them out
        if (!reportStartDate || !reportEndDate) return true;

        // Check if the assessment period overlaps with the selected date range
        const matchesStart = !startDate || reportEndDate >= startDate;
        const matchesEnd = !endDate || reportStartDate <= endDate;

        return matchesStart && matchesEnd;
      });
    }

    // Sort filter
    if (sortBy) {
      filtered.sort((a, b) => {
        switch (sortBy) {
          case "date-newest":
            const dateA = convertToDate(a.startMonth, a.startYear) || new Date(0);
            const dateB = convertToDate(b.startMonth, b.startYear) || new Date(0);
            return dateB.getTime() - dateA.getTime();

          case "date-oldest":
            const dateAOld = convertToDate(a.startMonth, a.startYear) || new Date(0);
            const dateBOld = convertToDate(b.startMonth, b.startYear) || new Date(0);
            return dateAOld.getTime() - dateBOld.getTime();

          case "progress-highest":
            return (b.progress || 0) - (a.progress || 0);

          case "progress-lowest":
            return (a.progress || 0) - (b.progress || 0);

          default:
            return 0;
        }
      });
    }

    return filtered;
  }, [reportData, searchTerm, startDate, endDate, sortBy]);

  // Helper function to format status for display
  const formatStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      submitted_approved: "Completed",
      unapproved_rejected: "Rejected",
      awaiting_review: "In Progress",
    };
    return statusMap[status] || status;
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setStartDate(null);
    setEndDate(null);
    setSortBy("");
  };

  // Debug function to check date conversion
  const debugDates = () => {
    console.log("Date conversion debug:");
    reportData.forEach((report) => {
      const start = convertToDate(report.startMonth, report.startYear);
      const end = convertToDate(report.endMonth, report.endYear);
      console.log(
        `${report.subsidiary}: ${report.startMonth} ${report.startYear} -> ${start}, ${report.endMonth} ${report.endYear} -> ${end}`
      );
    });
  };

  return (
    <section className="grid">
      {/* Debug button - remove in production */}
      <button onClick={debugDates} className="hidden">
        Debug Dates
      </button>

      <div className="grid w-full grid-cols-2 gap-2 md:grid-cols-4 my-4">
        <div className="col-span-2">
          <SearchInput
            placeholder="Search Reports by subsidiary"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        <Select value={sortBy} onValueChange={handleSortChange}>
          <SelectTrigger className="w-auto rounded p-3 border">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Sort by</SelectLabel>
              <SelectItem value="date-newest">Date (Newest first)</SelectItem>
              <SelectItem value="date-oldest">Date (Oldest first)</SelectItem>
              <SelectItem value="progress-highest">Progress (Highest first)</SelectItem>
              <SelectItem value="progress-lowest">Progress (Lowest first)</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <div className="rounded border border-gray-300 flex items-center col-span-1 w-auto">
          <DatePicker
            selected={startDate}
            onChange={setStartDate}
            placeholderText="Start Date"
            calendarIconClassName="text-gray-400"
            className={`${startDate ? "text-black" : "text-gray-400"} max-w-28 border-none focus:border-none focus:ring-0 focus:outline-none`}
            showIcon
          />
          <DatePicker
            selected={endDate}
            onChange={setEndDate}
            placeholderText="End Date"
            calendarIconClassName="text-gray-400"
            className={`${endDate ? "text-black" : "text-gray-400"} max-w-28 border-none focus:border-none focus:ring-0 focus:outline-none`}
            showIcon
          />
        </div>
      </div>

      {/* Filter summary and clear button */}
      {(searchTerm || startDate || endDate || sortBy) && (
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-600">
            Showing {filteredAndSortedReports.length} of {reportData.length} reports
            {searchTerm && ` for "${searchTerm}"`}
          </span>
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAndSortedReports.map((report) => (
          <Reportcard
            key={report.id}
            id={report.id}
            subsidiary={report.subsidiary}
            dateRange={`${report.startMonth} ${report.startYear} - ${report.endMonth} ${report.endYear}`}
            status={formatStatus(report.status)}
            progress={report.progress}
          />
        ))}

        {filteredAndSortedReports.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            <div className="text-lg font-medium mb-2">No reports found</div>
            <div className="text-sm">
              {reportData.length === 0
                ? "No reports available"
                : "Try adjusting your search or filters"}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
