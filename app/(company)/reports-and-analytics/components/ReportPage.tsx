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
  // const [_sortBy, setSortBy] = useState("");
  const [reportData, setReportData] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("");

  const report = useReport();

  useEffect(() => {
    if (report.data) {
      setReportData(report.data);
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
  const filteredReports = useMemo(() => {
    let filtered = [...reportData];

    if (searchTerm) {
      filtered = filtered.filter((report) =>
        report.subsidiary?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (startDate || endDate) {
      filtered = filtered.filter((report) => {
        const reportStartDate = convertToDate(report.startMonth, report.startYear);
        const reportEndDate = convertToDate(report.endMonth, report.endYear);

        if (!reportStartDate || !reportEndDate) return true;

        return (
          (!startDate || reportEndDate >= startDate) && (!endDate || reportStartDate <= endDate)
        );
      });
    }

    if (statusFilter) {
      filtered = filtered.filter((report) => report.status === statusFilter);
    }

    return filtered;
  }, [reportData, searchTerm, startDate, endDate, statusFilter]);

  // Helper function to format status for display
  const formatStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      submitted_approved: "Submitted Approved",
      unapproved_rejected: "Rejected",
      awaiting_review: "Awaiting Review",
      in_progress: "In Progress",
      approved: "Approved",
      declined: "Declined",
    };
    return statusMap[status] || status;
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // const handleSortChange = (value: string) => {
  //   setSortBy(value);
  // };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setStartDate(null);
    setEndDate(null);
    setStatusFilter("");
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
  console.log("Report Data:", reportData);
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

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-auto rounded p-3 border">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Status</SelectLabel>
              <SelectItem value="submitted_approved">Submitted Approved</SelectItem>
              <SelectItem value="awaiting_review">Awaiting Review</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="declined">Declined</SelectItem>
              <SelectItem value="unapproved_rejected">Rejected</SelectItem>
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
      {(searchTerm || startDate || endDate || statusFilter) && (
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-600">
            Showing {filteredReports.length} of {reportData.length} reports
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
        {filteredReports.map((report) => (
          <Reportcard
            key={report.id}
            id={report.id}
            subsidiary={report.subsidiary}
            dateRange={`${report.startMonth} ${report.startYear} - ${report.endMonth} ${report.endYear}`}
            status={formatStatus(report.status)}
            progress={report.progress}
            done={report.completed_sections}
            overall={report.total_sections}
          />
        ))}

        {filteredReports.length === 0 && (
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
