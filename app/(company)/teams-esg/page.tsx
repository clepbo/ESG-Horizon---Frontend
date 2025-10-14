/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useMemo, useState } from "react";
import { Eye, Edit, Ban, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import SearchInput from "@/app/components/ui/reusables/SearchInput";
import SelectFilter from "@/app/components/ui/reusables/SearchFilter";
import Pagination from "@/app/components/ui/reusables/Pagination";
import Spinner from "@/app/components/ui/reusables/Spinner";
import StatusBadge from "@/app/components/ui/reusables/StatusBadge";
import Header from "../components/Header";
import InviteUserModal from "../components/InviteUserModal";

// Mock data import
import { teamUsers } from "@/lib/mockData/teamUsers";

export default function TeamsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Filtered Data
  const filteredData = useMemo(() => {
    return teamUsers.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "All Status" || user.status === statusFilter;
      const matchesRole =
        roleFilter === "All Roles" || user.role === roleFilter;
      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [search, statusFilter, roleFilter]);

  const totalItems = filteredData.length;

  // Paginated Data
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredData.slice(start, end);
  }, [filteredData, currentPage, itemsPerPage]);

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setLoading(true);
    setTimeout(() => {
      setCurrentPage(page);
      setLoading(false);
    }, 400);
  };

  const handleItemsPerPageChange = (limit: number) => {
    setItemsPerPage(limit);
    setCurrentPage(1);
  };

  return (
    <div className="flex h-screen bg-[#F2FBF3] overflow-hidden">
      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto p-6">
        {/* Header */}
        <Header />

        {/* Page Heading */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-semibold">Users</h2>
            <p className="text-gray-600">
              Manage platform users and their access permissions
            </p>
          </div>
          <button
            className="cursor-pointer bg-[var(--color-primary)]  hover:bg-teal-700 text-white px-4 py-2 rounded-xl  transition text-sm"
            onClick={() => setShowInviteModal(true)}
          >
            <span className="flex items-center">
              <Plus className="h-5 w-4 mr-1" />
              Invite User
            </span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white rounded-lg p-4 shadow-sm">
          <SearchInput
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearch(e.target.value)
            }
          />
          <div className="flex gap-2 w-full md:w-auto">
            <SelectFilter
              value={statusFilter}
              onChange={(val: string) => setStatusFilter(val)}
              options={["All Status", "Pending", "Approved", "Suspended"]}
            />
            <SelectFilter
              value={roleFilter}
              onChange={(val: string) => setRoleFilter(val)}
              options={["All Roles", "Admin", "Editor", "Viewer"]}
            />
          </div>
        </div>

        {/* Table */}
        <div className="relative overflow-x-auto bg-white rounded-lg mt-4 shadow">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-60 z-10">
              <Spinner />
            </div>
          )}
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-left text-xs font-semibold text-gray-700">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Recent Activities</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{user.name}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">{user.role}</td>
                  <td className="px-4 py-3">{user.activity || "N/A"}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="px-4 py-3 space-x-2">
                    <button
                      className="text-gray-600 hover:text-gray-900"
                      title="View"
                      onClick={() => router.push(`/users/${user.id}`)}
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit"
                      onClick={() => router.push(`/users/${user.id}/edit`)}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900"
                      title="Suspend"
                      onClick={() =>
                        console.log("Open suspend modal for", user)
                      }
                    >
                      <Ban size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

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
      </main>

      {/* {showInviteModal && (
        <InviteUserModal onClose={() => setShowInviteModal(false)} />
      )} */}
    </div>
  );
}
