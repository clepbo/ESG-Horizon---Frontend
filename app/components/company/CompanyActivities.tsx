"use client";

import { useState, useMemo } from "react";
import { useDebounce } from "use-debounce";
import { Search } from "lucide-react";

import { Input } from "@/app/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { cn } from "@/lib/utils";
import { activityData } from "@/mockData/companyActivities";

import CompanyActivitiesTable from "@/app/components/company/CompanyActivitiesTable";
import Pagination from "@/app/components/Pagination";
import Spinner from "../Spinner";

export default function CompanyActivities() {
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);

  // Filtered data
  const filteredActivities = useMemo(() => {
    return activityData.filter((item) => {
      const matchesSearch =
        !debouncedSearchTerm.trim() ||
        item.details
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase()) ||
        item.activity
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase()) ||
        item.performedBy
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ||
        item.status.toLowerCase() === statusFilter.toLowerCase();

      const matchesDate = !dateFilter || item.dateValue === dateFilter;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [debouncedSearchTerm, statusFilter, dateFilter]);

  // Pagination logic
  const totalItems = filteredActivities.length;
  const paginatedActivities = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredActivities.slice(start, end);
  }, [filteredActivities, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setLoading(true);
    setTimeout(() => {
      setCurrentPage(page);
      setLoading(false);
    }, 300);
  };

  const handleItemsPerPageChange = (limit: number) => {
    setItemsPerPage(limit);
    setCurrentPage(1);
  };

  // Status badge renderer
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      Pending: "bg-yellow-100 text-yellow-700",
      Declined: "bg-red-200 text-red-700",
      Approved: "bg-green-200 text-green-700",
      "In Review": "bg-blue-100 text-blue-700",
    };
    return (
      <span
        className={cn(
          "px-3 py-1 rounded-full text-sm font-medium",
          styles[status] || "bg-gray-100 text-gray-700"
        )}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="mt-6 space-y-6">
      <h2 className="text-lg font-semibold mb-4">Activity Log</h2>
      <div className="rounded-md border border-black/10 bg-white p-6 shadow">
        {/* Search & Filters */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Search */}
          <div className="relative w-full">
            <Input
              id="search-input"
              placeholder="Search by activity, details, or performer"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1 rounded-md bg-[var(--color-green-500)] hover:bg-[var(--color-green-600)] px-3 py-1.5 text-xs text-white cursor-pointer">
              <Search className="h-3.5 w-3.5" />
              Search
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-2 w-full md:w-auto">
            {/* Status Filter */}
            <Select
              value={statusFilter}
              onValueChange={(val) => setStatusFilter(val)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Declined">Declined</SelectItem>
                <SelectItem value="In Review">In Review</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Filter */}
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Spinner />
          </div>
        ) : (
          <CompanyActivitiesTable
            activities={paginatedActivities}
            getStatusBadge={getStatusBadge}
          />
        )}

        {/* Pagination */}
        <div className="mt-4 px-4 pb-4">
          <Pagination
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </div>
      </div>
    </div>
  );
}
