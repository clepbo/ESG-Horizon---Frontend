"use client";

import { useState } from "react";
import { useDebounce } from "use-debounce";
import { Input } from "@/app/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import UserTable from "@/app/components/company/UserTable";
import { Search } from "lucide-react";
import { User } from "@/services/user.service";
import CardSkeleton from "../ui/reusables/CardSkeleton";

export default function UsersTable({
  isLoading,
  error,
  usersData,
}: {
  isLoading?: boolean;
  error?: boolean;
  usersData: User[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  const [statusFilter, setStatusFilter] = useState("Status");
  const [roleFilter, setRoleFilter] = useState("Role");

  const filteredUsers = usersData.filter((user) => {
    const matchesSearch = (() => {
      if (!debouncedSearchTerm.trim()) return true;

      const searchLower = debouncedSearchTerm.toLowerCase();
      return (
        (user?.first_name || "").toLowerCase().includes(searchLower) ||
        (user?.last_name || "").toLowerCase().includes(searchLower) ||
        (user?.company?.name || "").toLowerCase().includes(searchLower) ||
        (user?.email || "").toLowerCase().includes(searchLower)
      );
    })();

    const matchesStatus =
      statusFilter === "Status" ||
      (user?.status || "").trim().toLowerCase() === statusFilter.trim().toLowerCase();

    const matchesRole =
      roleFilter === "Role" ||
      (user?.role?.name || "").trim().toLowerCase() === roleFilter.trim().toLowerCase();

    return matchesSearch && matchesStatus && matchesRole;
  });

  if (isLoading) {
    return <CardSkeleton />;
  }

  if (error) {
    return <p className="text-center text-red-500">Failed to load users.</p>;
  }

  return (
    <section className="mt-6 space-y-4">
      <div className="rounded-md border border-black/10 bg-white p-6 shadow">
        {/* Search + Filters */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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

          {/* Filters */}
          <div className="flex gap-2 w-full md:w-auto">
            {/* Role Filter */}
            <Select value={roleFilter} onValueChange={(val) => setRoleFilter(val)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Role">Roles</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Editor">Editor</SelectItem>
                <SelectItem value="Viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Status">Status</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Suspended">Suspended</SelectItem>
                <SelectItem value="Under Review">Under Review</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <UserTable users={filteredUsers} />
      </div>
    </section>
  );
}
