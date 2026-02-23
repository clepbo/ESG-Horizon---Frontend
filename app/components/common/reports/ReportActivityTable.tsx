"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Eye, SquarePen, Search } from "lucide-react";

import Pagination from "@/app/components/ui/reusables/Pagination";
import Spinner from "../../ui/reusables/Spinner";
import { fetchReports } from "@/lib/api/reportsApi";
import { Report } from "@/lib/mockData/mockReports";

import { Input } from "@/app/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

// Status badge styles
const statusStyles: Record<string, string> = {
  Published: "bg-green-500 text-white",
  Rejected: "bg-red-500 text-white",
  "Under Review": "bg-yellow-400 text-white",
  Approved: "bg-blue-500 text-white",
  Draft: "bg-gray-400 text-white",
};

function StatusBadge({ status }: { status: string }) {
  const baseStyle = "inline-block px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap";
  return <span className={`${baseStyle} ${statusStyles[status] || "bg-gray-100"}`}>{status}</span>;
}

const statusOptions = ["Status", "Published", "Rejected", "Under Review", "Approved", "Draft"];

export default function ReportActivityTable() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Status");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const loadReports = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchReports();
      setReports(data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // const tabStatus = TABS.find((t) => t.id === activeTab)?.status ?? null;

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesSearch =
        (report.subsidiary ?? report.company).toLowerCase().includes(search.toLowerCase()) ||
        report.company.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "Status" || report.status === statusFilter;
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
    setLoading(true);
    setTimeout(() => setLoading(false), 300);
    setItemsPerPage(limit);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Tabs removed */}

      {/* Search only (no Type or Status filters) */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="relative w-full">
          <Input
            id="search-input"
            placeholder="Search by subsidiary or company"
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
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-60 z-10">
            <Spinner />
          </div>
        )}
        {!loading && (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-left text-xs font-semibold text-gray-700">
              <tr>
                <th className="px-4 py-3">Report Title</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Period</th>
                <th className="px-4 py-3">Submission Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{report.title}</td>
                  <td className="px-4 py-3">{report.company}</td>
                  <td className="px-4 py-3">{report.period}</td>
                  <td className="px-4 py-3">{report.submissionDate}</td>
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
                      <button
                        aria-label="Edit report"
                        className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <SquarePen className="w-4 h-4" />
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
