"use client";

import { useState } from "react";
import { useDebounce } from "use-debounce";
import { useUsers } from "@/hooks/useUsers";
import SearchInput from "@/app/components/SearchInput";
import SelectFilter from "@/app/components/SearchFilter";
import Spinner from "@/app/components/Spinner";
import UserTable from "@/app/components/dashboard/UserTable";
import type { User } from "@/mockData/users";

export default function UsersTable() {
  const { data: users = [], isLoading, error } = useUsers();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [personaFilter, setPersonaFilter] = useState("All Persona");

  const filteredUsers = users.filter((user: User) => {
    // Safe search matching with null/undefined checks
    const matchesSearch = (() => {
      if (!debouncedSearchTerm || debouncedSearchTerm.trim() === "") {
        return true;
      }

      const searchLower = debouncedSearchTerm.toLowerCase();

      // Check user name (with fallback)
      const userName = user?.name || "";
      const nameMatches = userName.toLowerCase().includes(searchLower);

      // Check company (with fallback)
      const userCompany = user?.company || "";
      const companyMatches = userCompany.toLowerCase().includes(searchLower);

      // Check email as additional search field (with fallback)
      const userEmail = user?.email || "";
      const emailMatches = userEmail.toLowerCase().includes(searchLower);

      return nameMatches || companyMatches || emailMatches;
    })();

    // Safe status matching
    const matchesStatus = (() => {
      if (statusFilter === "All Status") {
        return true;
      }
      return user?.status === statusFilter;
    })();

    // Safe persona/category matching
    const matchesPersona = (() => {
      if (personaFilter === "All Persona") {
        return true;
      }
      return user?.category === personaFilter;
    })();

    return matchesSearch && matchesStatus && matchesPersona;
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
          <SearchInput
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
          />
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center ">
            <SelectFilter
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                "All Status",
                "Pending",
                "Approved",
                "Suspended",
                "Under Review",
              ]}
            />
            <SelectFilter
              value={personaFilter}
              onChange={setPersonaFilter}
              options={["All Persona", "Investor", "ESG Company", "Regulator"]}
            />
          </div>
        </div>

        {/* Table */}
        <UserTable users={filteredUsers} loading={isLoading} />

        {/* No results message */}
        {!isLoading && filteredUsers.length === 0 && users.length > 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No users found matching your search criteria.</p>
            <p className="text-sm mt-2">
              Try adjusting your filters or search term.
            </p>
          </div>
        )}

        {/* Empty state when no users at all */}
        {!isLoading && users.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No users available.</p>
          </div>
        )}
      </div>
    </section>
  );
}
