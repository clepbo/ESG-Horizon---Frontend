"use client";

import { useState, useMemo, ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, CircleCheckBig, RotateCcw, Ban } from "lucide-react";
import StatusBadge from "@/app/components/ui/reusables/StatusBadge";
import Pagination from "@/app/components/ui/reusables/Pagination";
import Spinner from "@/app/components/ui/reusables/Spinner";
import ConfirmModal from "@/app/components/ui/modals/ConfirmModal";
import { User } from "@/lib/mockData/users";

type UserTableProps = { users: User[] };

export default function UserTable({ users }: UserTableProps) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);

  // Make status updates reflect directly on the passed `users` list
  const [updatedUsers, setUpdatedUsers] = useState(users);

  // Sync if prop changes (important when parent filters)
  useEffect(() => {
    setUpdatedUsers(users);
    setCurrentPage(1);
  }, [users]);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [targetStatus, setTargetStatus] = useState<User["status"] | null>(null);

  const totalItems = updatedUsers.length;

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return updatedUsers.slice(start, start + itemsPerPage);
  }, [updatedUsers, currentPage, itemsPerPage]);

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

  const handleView = (id: string) => router.push(`/company/${id}`);

  const updateStatus = (id: string, newStatus: User["status"]) => {
    setUpdatedUsers((prev) =>
      prev.map((user) => (user.id === id ? { ...user, status: newStatus } : user))
    );
    setModalOpen(false);
  };

  const openModal = (id: string, newStatus: User["status"]) => {
    setSelectedUserId(id);
    setTargetStatus(newStatus);
    setModalOpen(true);
  };

  const statusActions: Record<
    User["status"],
    { icon: ReactNode; color: string; newStatus: User["status"]; title: string }
  > = {
    Pending: {
      icon: <CircleCheckBig className="w-4 h-4 text-green-600" />,
      color: "border-green-500 hover:bg-green-200",
      newStatus: "Approved",
      title: "Approve",
    },
    Suspended: {
      icon: <RotateCcw className="w-4 h-4 text-yellow-600" />,
      color: "border-yellow-500 hover:bg-yellow-100",
      newStatus: "Approved",
      title: "Restart",
    },
    Approved: {
      icon: <Ban className="w-4 h-4 text-red-600" />,
      color: "border-red-500 hover:bg-red-100",
      newStatus: "Suspended",
      title: "Suspend",
    },
    "Under Review": {
      icon: <CircleCheckBig className="w-4 h-4 text-green-600" />,
      color: "border-green-500 hover:bg-green-200",
      newStatus: "Approved",
      title: "Approve",
    },
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
            <th className="px-4 py-3">Company</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Industry/Sector</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Quick Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {paginatedUsers.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium">{user.company}</td>
              <td className="px-4 py-3">{user.category}</td>
              <td className="px-4 py-3">{user.industry || user.category}</td>
              <td className="px-4 py-3">
                <StatusBadge status={user.status} />
              </td>
              <td className="px-4 py-3 flex space-x-2">
                <button
                  className="rounded-md border p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleView(user.id)}
                >
                  <Eye className="w-4 h-4 text-gray-600" />
                </button>
                {statusActions[user.status] && (
                  <button
                    className={`rounded-md border p-2 cursor-pointer ${
                      statusActions[user.status].color
                    }`}
                    onClick={() => openModal(user.id, statusActions[user.status].newStatus)}
                  >
                    {statusActions[user.status].icon}
                  </button>
                )}
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

      <ConfirmModal
        open={modalOpen}
        title="Confirm Status Change"
        message={
          <span>
            Are you sure you want to change this company&apos;s status to{" "}
            <strong>{targetStatus}</strong>?
          </span>
        }
        onCancel={() => setModalOpen(false)}
        onConfirm={() =>
          selectedUserId && targetStatus && updateStatus(selectedUserId, targetStatus)
        }
      />
    </div>
  );
}
