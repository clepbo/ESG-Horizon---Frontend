"use client";

import { useState, useMemo } from "react";
import { Eye, Edit, Ban } from "lucide-react";
import { useRouter } from "next/navigation";
import Pagination from "@/app/components/ui/reusables/Pagination";
import Spinner from "@/app/components/ui/reusables/Spinner";
import StatusBadge from "@/app/components/ui/reusables/StatusBadge";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  recentActivity?: string;
  status: "Approved" | "Pending" | "Suspended" | string;
};

type UserTableProps = {
  users: User[];
};

export default function AdminUserTable({ users }: UserTableProps) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);

  const totalItems = users.length;

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return users.slice(start, end);
  }, [users, currentPage, itemsPerPage]);

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
    <div className="relative overflow-x-auto bg-white shadow rounded-xl">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-60 z-10">
          <Spinner />
        </div>
      )}

      <table className="min-w-full text-sm">
        <thead className="bg-[#FAFAFA] text-gray-700 text-xs font-semibold">
          <tr className="border-b">
            <th className="px-6 py-4 text-left">Name</th>
            <th className="px-6 py-4 text-left">Email</th>
            <th className="px-6 py-4 text-left">Role</th>
            <th className="px-6 py-4 text-left">Recent Activities</th>
            <th className="px-6 py-4 text-left">Status</th>
            <th className="px-6 py-4 text-left">Quick Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {paginatedUsers.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 font-medium text-gray-900 cursor-pointer">{user.name}</td>
              <td className="px-6 py-4">{user.email}</td>
              <td className="px-6 py-4">{user.role}</td>
              <td className="px-6 py-4">{user.recentActivity}</td>

              <td className="px-6 py-4">
                <StatusBadge status={user.status} />
              </td>

              <td className="px-6 py-4 space-x-2">
                <button
                  className="text-gray-600 hover:text-gray-900 cursor-pointer"
                  title="View"
                  onClick={() => router.push(`/users/${user.id}`)}
                >
                  <Eye size={16} />
                </button>
                <button
                  className="text-blue-600 hover:text-blue-900 cursor-pointer"
                  title="Edit"
                  onClick={() => router.push(`/users/${user.id}/edit`)}
                >
                  <Edit size={16} />
                </button>
                <button
                  className="text-red-600 hover:text-red-900 cursor-pointer"
                  title="Suspend"
                  onClick={() => console.log("Open suspend modal for", user)}
                >
                  <Ban size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
  );
}
