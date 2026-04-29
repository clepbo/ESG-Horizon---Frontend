"use client";

import { useState, useMemo } from "react";
import { Eye, Search } from "lucide-react";

import Pagination from "@/app/components/ui/reusables/Pagination";
import Spinner from "../../ui/reusables/Spinner";
import { useReport } from "@/app/(company)/reports-and-analytics/components/service/useReport";

import { Input } from "@/app/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

const STATUS_DISPLAY: Record<string, string> = {
  in_progress: "Draft",
  awaiting_review: "Under Review",
  submitted_approved: "Approved",
  approved: "Approved",
  declined: "Rejected",
};

// Status badge styles
const statusStyles: Record<string, string> = {
  Draft: "bg-gray-400 text-white",
  "Under Review": "bg-yellow-400 text-white",
  Approved: "bg-blue-500 text-white",
  Rejected: "bg-red-500 text-white",
};

function StatusBadge({ status }: { status: string }) {
  const display = STATUS_DISPLAY[status] || status;
  const baseStyle = "inline-block px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap";
  return (
    <span className={`${baseStyle} ${statusStyles[display] || "bg-gray-100"}`}>{display}</span>
  );
}

function formatPeriod(r: {
  startMonth?: string;
  startYear?: string;
  endMonth?: string;
  endYear?: string;
}) {
  if (!r.startMonth || !r.startYear || !r.endMonth || !r.endYear) return "—";
  const abbr = (m: string) => m.slice(0, 3);
  const shortYr = (y: string) => y.slice(-2);
  return `${abbr(r.startMonth)} ${shortYr(r.startYear)} – ${abbr(r.endMonth)} ${shortYr(r.endYear)}`;
}

const statusOptions = ["All Statuses", "Draft", "Under Review", "Approved", "Rejected"];

export default function ReportActivityTable() {
  const { data: reports, isLoading } = useReport();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filteredReports = useMemo(() => {
    const reportList = Array.isArray(reports) ? reports : [];
    return reportList.filter((report: any) => {
      const subsidiary = (report.subsidiary || "").toLowerCase();
      const matchesSearch = subsidiary.includes(search.toLowerCase());
      const displayStatus = STATUS_DISPLAY[report.status] || report.status;
      const matchesStatus = statusFilter === "All Statuses" || displayStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [reports, search, statusFilter]);

  const totalItems = filteredReports.length;
  const paginatedReports = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredReports.slice(start, start + itemsPerPage);
  }, [filteredReports, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handleItemsPerPageChange = (limit: number) => {
    setItemsPerPage(limit);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="relative w-full">
          <Input
            id="search-input"
            placeholder="Search by subsidiary"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            type="button"
            className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1 rounded-md bg-primary hover:bg-teal-700 px-3 py-1.5 text-xs text-white"
          >
            <Search className="h-3.5 w-3.5" />
            Search
          </button>
        </div>

        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="relative overflow-x-auto bg-white shadow rounded-xl">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-60 z-10">
            <Spinner />
          </div>
        )}
        {!isLoading && (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-left text-xs font-semibold text-gray-700">
              <tr>
                <th className="px-4 py-3">Subsidiary</th>
                <th className="px-4 py-3">Period</th>
                <th className="px-4 py-3">Progress</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedReports.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                    No reports found.
                  </td>
                </tr>
              )}
              {paginatedReports.map((report: any) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{report.subsidiary || "—"}</td>
                  <td className="px-4 py-3">{formatPeriod(report)}</td>
                  <td className="px-4 py-3">{report.progress ?? 0}%</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={report.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        aria-label="View report"
                        className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />
    </div>
  );
}
