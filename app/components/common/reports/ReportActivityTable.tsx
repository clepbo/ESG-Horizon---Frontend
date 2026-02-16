"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Eye, Pencil, Search } from "lucide-react";

import Pagination from "@/app/components/ui/reusables/Pagination";
import Spinner from "../../ui/reusables/Spinner";
import { fetchReports } from "@/lib/api/reportsApi";
import { Report, formatReportPeriod } from "@/lib/mockData/mockReports";

import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";

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

const TABS = [
  { id: "all", label: "All Reports", status: null },
  { id: "published", label: "Published", status: "Published" },
  { id: "approved", label: "Approved", status: "Approved" },
  { id: "under-review", label: "Under Review", status: "Under Review" },
  { id: "drafts", label: "Drafts", status: "Draft" },
] as const;

export default function ReportActivityTable() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
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

  const tabStatus = TABS.find((t) => t.id === activeTab)?.status ?? null;

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesSearch =
        (report.subsidiary ?? report.company).toLowerCase().includes(search.toLowerCase()) ||
        report.company.toLowerCase().includes(search.toLowerCase());
      const matchesTab = tabStatus === null || report.status === tabStatus;
      return matchesSearch && matchesTab;
    });
  }, [reports, search, tabStatus]);

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
      {/* Tabs – filter displayed reports */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 w-full">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setActiveTab(tab.id);
              setCurrentPage(1);
            }}
            className={`w-full px-4 py-2 text-sm rounded-md shadow text-center transition-colors ${
              activeTab === tab.id
                ? "bg-teal-600 text-white border border-teal-600"
                : "bg-white text-gray-800 border border-teal-600 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

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
                <th className="px-4 py-3">Subsidiary</th>
                <th className="px-4 py-3">Period</th>
                <th className="px-4 py-3">Submission Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{report.subsidiary ?? report.company}</td>
                  <td className="px-4 py-3">{formatReportPeriod(report)}</td>
                  <td className="px-4 py-3">{report.submissionDate}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={report.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 rounded-md border-gray-300"
                        disabled
                        aria-label="View report"
                      >
                        <Eye className="h-4 w-4 text-gray-600" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 rounded-md border-gray-300"
                        disabled
                        aria-label="Edit report"
                      >
                        <Pencil className="h-4 w-4 text-gray-600" />
                      </Button>
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
