"use client";

import { useState } from "react";
import { useDebounce } from "use-debounce";
import { useUsers } from "@/hooks/useUsers";

import { Input } from "@/app/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import Spinner from "@/app/components/Spinner";
import UserTable from "@/app/components/users/UserTable";
import { Search } from "lucide-react";
import ESGCompanyTable from "../company/ESGCompanyTable";

const PERSONA_TABS = [
  { label: "All", value: "all" },
  { label: "ESG Company", value: "esg company" },
  { label: "Investor", value: "investor" },
  { label: "Regulator", value: "regulator" },
];

export default function Users() {
  const { data: users = [], isLoading, error } = useUsers();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  const [statusFilter, setStatusFilter] = useState("All Status");
  const [industryFilter, setIndustryFilter] = useState("Industry");
  const [activePersona, setActivePersona] = useState("all");

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      debouncedSearchTerm === "" ||
      user.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      user.company?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All Status" ||
      user.status?.trim().toLowerCase() === statusFilter.trim().toLowerCase();

    const matchesIndustry =
      industryFilter === "Industry" ||
      user.industry?.trim().toLowerCase() ===
        industryFilter.trim().toLowerCase();

    const matchesPersona =
      activePersona === "all" || user.category?.toLowerCase() === activePersona;

    return matchesSearch && matchesStatus && matchesIndustry && matchesPersona;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-500">Failed to load users.</p>;
  }

  return (
    <section className="mt-6 space-y-4">
      {/* Persona Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 w-full">
        {PERSONA_TABS.map((tab) => {
          const isActive = activePersona === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setActivePersona(tab.value)}
              className={`w-full px-4 py-2 text-sm font-medium rounded-md border transition-colors duration-150 ${
                isActive
                  ? "bg-green-500 text-white border-green-500"
                  : "bg-white text-green-600 border-green-500 hover:bg-green-50"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="rounded-md border border-black/10 bg-white p-6 shadow">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Search */}
          <div className="relative w-full">
            <Input
              id="search-input"
              placeholder="Search by name, company, or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1 rounded-md bg-[var(--color-green-500)] hover:bg-[var(--color-green-600)] px-3 py-1.5 text-xs text-white">
              <Search className="h-3.5 w-3.5" />
              Search
            </button>
          </div>

          {/* Dropdowns */}
          <div className="flex gap-2">
            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Industry">Industry</SelectItem>
                <SelectItem value="Renewable Energy">
                  Renewable Energy
                </SelectItem>
                <SelectItem value="Environmental Consulting">
                  Environmental Consulting
                </SelectItem>
                <SelectItem value="Healthcare">Healthcare</SelectItem>
                <SelectItem value="Agriculture">Agriculture</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                <SelectItem value="Retail">Retail</SelectItem>
                <SelectItem value="Oil & Gas">Oil & Gas</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Status">All Status</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Suspended">Suspended</SelectItem>
                <SelectItem value="Under Review">Under Review</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table Rendering */}
        {activePersona === "all" && <UserTable users={filteredUsers} />}
        {activePersona === "esg company" && (
          <ESGCompanyTable users={filteredUsers} />
        )}
        {activePersona === "investor" && <div>Coming Soon...</div>}
        {activePersona === "regulator" && <div>Coming Soon...</div>}
      </div>
    </section>
  );
}
