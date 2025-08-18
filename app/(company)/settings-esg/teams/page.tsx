"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import Spinner from "@/app/components/ui/reusables/Spinner";
import TeamsTable from "@/app/components/company/teams/TeamsTable";
import InviteUserModal from "@/app/(company)/components/InviteUserModal";
import {
  teamUsers as initialUsers,
  TeamUserStatus,
} from "@/lib/mockData/teamUsers";
import { Input } from "@/app/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/app/components/ui/select";
import Header from "../../components/Header";

export default function TeamsPage() {
  const [users, setUsers] = useState(initialUsers);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Status");
  const [roleFilter, setRoleFilter] = useState("Roles");
  const [loading] = useState(false);

  const filteredData = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "Status" || user.status === statusFilter;
      const matchesRole = roleFilter === "Roles" || user.role === roleFilter;
      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [users, search, statusFilter, roleFilter]);

  const handleStatusUpdate = (id: string, newStatus: TeamUserStatus) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id ? { ...user, status: newStatus } : user
      )
    );
  };

  return (
    <div className="flex h-screen  overflow-hidden">
      <main className="flex-1 h-full overflow-y-auto p-6">
        <Header />

        {/* Title & Invite */}
        <div className="flex justify-between">
          <div className="mt-4">
            <h2 className="text-2xl font-semibold">Teams</h2>
            <p className="text-gray-600">
              Manage platform users and their access permissions
            </p>
          </div>

          <div className="flex justify-between items-center mb-6 mt-4">
            <button
              className="text-white bg-green-400 hover:bg-green-500 px-4 py-2 rounded-sm text-sm flex items-center cursor-pointer"
              onClick={() => setShowInviteModal(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Invite User
            </button>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white rounded-lg p-4 shadow-sm">
          {/* Search */}
          <div className="relative w-full">
            <Input
              id="search-input"
              placeholder="Search by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1 rounded-md bg-green-500 hover:bg-green-600 px-3 py-1.5 text-xs text-white">
              <Search className="h-3.5 w-3.5" />
              Search
            </button>
          </div>

          {/* Dropdowns */}
          <div className="flex gap-2">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Roles">Roles</SelectItem>
                <SelectItem value="Super Admin">Super Admin</SelectItem>
                <SelectItem value="Platform Admin">Platform Admin</SelectItem>
                <SelectItem value="Platform Manager">
                  Platform Manager
                </SelectItem>
                <SelectItem value="Platform Viewer">Platform Viewer</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Status">Status</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-60 z-10">
            <Spinner />
          </div>
        )}

        {/* Pass only filteredData — pagination happens in TeamsTable */}
        <TeamsTable users={filteredData} onStatusUpdate={handleStatusUpdate} />
      </main>

      {showInviteModal && (
        <InviteUserModal onClose={() => setShowInviteModal(false)} />
      )}
    </div>
  );
}
