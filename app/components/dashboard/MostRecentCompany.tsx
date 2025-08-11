"use client";

import { useState } from "react";
import { useDebounce } from "use-debounce";
import { useUsers } from "@/hooks/useUsers";
import Spinner from "@/app/components/Spinner";
import CompanyTable from "@/app/components/dashboard/CompanyTable";
import type { User } from "@/mockData/users";
import { Input } from "@/app/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Search } from "lucide-react";

export default function UsersTable() {
  const { data: users = [], isLoading, error } = useUsers();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [categoryFilter, setCategoryFilter] = useState("All Category");

  const filteredUsers = users.filter((user: User) => {
    const matchesSearch = (() => {
      if (!debouncedSearchTerm.trim()) return true;

      const searchLower = debouncedSearchTerm.toLowerCase();
      const nameMatches = (user?.name || "")
        .toLowerCase()
        .includes(searchLower);
      const companyMatches = (user?.company || "")
        .toLowerCase()
        .includes(searchLower);
      const emailMatches = (user?.email || "")
        .toLowerCase()
        .includes(searchLower);

      return nameMatches || companyMatches || emailMatches;
    })();

    const matchesStatus =
      statusFilter === "All Status" || user?.status === statusFilter;

    const matchesCategory =
      categoryFilter === "All Category" || user?.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-500">Failed to load users.</p>;
  }

  return (
    <section className="mt-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Most Recent</h2>

      <div className="rounded-md border border-black/10 bg-white p-4 md:p-6 shadow">
        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Input */}
          <div className="relative w-full">
            <Input
              id="search-input"
              placeholder="Search by name, company, or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1 rounded-md bg-[var(--color-green-500)] hover:bg-[var(--color-green-600)] px-3 py-1.5 text-xs text-white hover:bg-opacity-90 cursor-pointer">
              <Search className="h-3.5 w-3.5" />
              Search
            </button>
          </div>
          {/* Select Dropdowns */}
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Category">All Category</SelectItem>
                <SelectItem value="Investor">Investor</SelectItem>
                <SelectItem value="ESG Company">ESG Company</SelectItem>
                <SelectItem value="Regulator">Regulator</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Status">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Suspended">Suspended</SelectItem>
                <SelectItem value="Under Review">Under Review</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <CompanyTable users={filteredUsers} loading={isLoading} />

        {/* No results message */}
        {!isLoading && filteredUsers.length === 0 && users.length > 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No companies found matching your search criteria.</p>
            <p className="text-sm mt-2">
              Try adjusting your filters or search term.
            </p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && users.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No companies available.</p>
          </div>
        )}
      </div>
    </section>
  );
}
