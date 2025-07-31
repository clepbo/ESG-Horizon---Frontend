"use client";

import { useState } from "react";
import { useDebounce } from "use-debounce";
import { useUsers } from "@/hooks/useUsers";
import SearchInput from "@/app/components/ui/SearchInput";
import SelectFilter from "@/app/components/ui/SearchFilter";
import Spinner from "@/app/components/ui/Spinner";
import UserTable from "@/app/components/dashboard/UserTable";
import type { User } from "@/mockData/users";

export default function UsersTable() {
  const { data: users = [], isLoading, error } = useUsers();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [personaFilter, setPersonaFilter] = useState("All Persona");

  const filteredUsers = users.filter((user: User) => {
    const matchesSearch =
      debouncedSearchTerm === "" ||
      user.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      user.company.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All Status" || user.status === statusFilter;

    const matchesPersona =
      personaFilter === "All Persona" || user.category === personaFilter;

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
      </div>
    </section>
  );
}
