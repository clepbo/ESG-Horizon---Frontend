"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "use-debounce";

import SearchInput from "@/app/components/ui/SearchInput";
import SelectFilter from "@/app/components/ui/SelectFilter";

import { useUsers } from "@/hooks/useUsers";
import UserTable from "@/app/components/users/UserTable";
import Spinner from "@/app/components/Spinner";

export default function UsersTable() {
  const router = useRouter();
  const { data: users = [], isLoading, error } = useUsers();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [personaFilter, setPersonaFilter] = useState("All Persona");

  const filteredUsers = users.filter((user) => {
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

  if (isLoading)
    return (
      <div className="flex items-center justify-center ">
        <Spinner />
      </div>
    );
  if (error)
    return <p className="text-center text-red-500">Failed to load users.</p>;

  return (
    <section className="mt-6">
      <div className="py-2">
        <SelectFilter
          value={personaFilter}
          onChange={(e) => setPersonaFilter(e.target.value)}
          options={["All Users", "Investor", "ESG Company", "Regulator"]}
        />
      </div>

      <div className="rounded-md border border-black/10 bg-white p-6 shadow">
        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <SearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <SelectFilter
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={["All Status", "Pending", "Suspended", "Under Review"]}
            />
            <SelectFilter
              value={personaFilter}
              onChange={(e) => setPersonaFilter(e.target.value)}
              options={["All Persona", "Investor", "ESG Company", "Regulator"]}
            />
          </div>
        </div>

        {/* Table */}
        {/* <UserTable
          users={filteredUsers}
          onEdit={(user) => router.push(`/users/${user.name.toLowerCase()}`)}
        /> */}
        <UserTable users={filteredUsers} />
      </div>
    </section>
  );
}
