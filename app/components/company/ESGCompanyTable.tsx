"use client";

import { useState, useMemo, ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, CircleCheckBig, RotateCcw, Ban } from "lucide-react";
import StatusBadge from "@/app/components/ui/reusables/StatusBadge";
import Spinner from "@/app/components/ui/reusables/Spinner";
import ConfirmModal from "@/app/components/ui/modals/ConfirmModal";
import { User } from "@/lib/mockData/users";

type UserTableProps = { users: User[] };

export default function ESGCompanyTable({ users }: UserTableProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [updatedUsers, setUpdatedUsers] = useState(users);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [targetStatus, setTargetStatus] = useState<User["status"] | null>(null);

  // Sync data when prop changes
  useEffect(() => {
    setUpdatedUsers(users);
  }, [users]);

  const handleView = (id: string) => router.push(`/company/${id}`);

  const updateStatus = (id: string, newStatus: User["status"]) => {
    setUpdatedUsers((prev) =>
      prev.map((user) =>
        user.id === id ? { ...user, status: newStatus } : user
      )
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
            <th className="px-4 py-3">Industry/Sector</th>
            <th className="px-4 py-3">Contact Person</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {updatedUsers.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium">{user.company}</td>
              <td className="px-4 py-3">{user.industry}</td>
              <td className="px-4 py-3">{user.contactPersonName}</td>
              <td className="px-4 py-3">{user.email}</td>
              <td className="px-4 py-3">
                <StatusBadge status={user.status} />
              </td>
              <td className="px-4 py-3 flex space-x-2">
                <button
                  className="rounded-md border p-2 hover:bg-gray-100 cursor-pointer"
                  title="View"
                  onClick={() => handleView(user.id)}
                >
                  <Eye className="w-4 h-4 text-gray-600" />
                </button>
                {statusActions[user.status] && (
                  <button
                    className={`rounded-md border p-2 cursor-pointer ${
                      statusActions[user.status].color
                    }`}
                    title={statusActions[user.status].title}
                    onClick={() =>
                      openModal(user.id, statusActions[user.status].newStatus)
                    }
                  >
                    {statusActions[user.status].icon}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
          selectedUserId &&
          targetStatus &&
          updateStatus(selectedUserId, targetStatus)
        }
      />
    </div>
  );
}
