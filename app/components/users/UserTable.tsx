"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Edit } from "lucide-react";

import StatusBadge from "@/app/components/ui/StatusBadge";
import Pagination from "@/app/components/Pagination";
import Spinner from "@/app/components/ui/Spinner";
import { User } from "@/mockData/users";

type UserTableProps = {
  users: User[];
};

export default function UserTable({ users }: UserTableProps) {
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
    }, 300);
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
        <thead className="bg-gray-100 text-left text-xs font-semibold text-gray-700">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Company</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 ">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {paginatedUsers.map((user) => (
            <tr key={user.id}>
              <td className="px-4 py-3 font-medium text-gray-900">
                {user.name}
              </td>
              <td className="px-4 py-3">{user.company}</td>
              <td className="px-4 py-3">{user.category}</td>
              <td className="px-4 py-3">{user.role}</td>
              <td className="px-4 py-3">
                <StatusBadge status={user.status} />
              </td>
              <td className="px-4 py-3 ">
                <button
                  onClick={() => router.push(`/users/${user.id}`)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-green-500 text-white text-sm hover:bg-green-600 transition-colors cursor-pointer"
                >
                  <Edit className="w-4 h-4" />
                  View/Edit
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
