"use client";

import { Eye, CircleCheckBig, RotateCcw, Ban } from "lucide-react";
import { useRouter } from "next/navigation";
import StatusBadge from "@/app/components/StatusBadge";
import Spinner from "@/app/components/Spinner";
import ConfirmModal from "@/app/components/modals/ConfirmModal";
import { User } from "@/mockData/users";
import { ReactNode, useState } from "react";

type UserTableProps = {
  users: User[];
  loading?: boolean;
};

export default function CompanyTable({
  users,
  loading = false,
}: UserTableProps) {
  const router = useRouter();
  const [tableUsers, setTableUsers] = useState(users);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [targetStatus, setTargetStatus] = useState<User["status"] | null>(null);

  const updateStatus = (id: string, newStatus: User["status"]) => {
    setTableUsers((prev) =>
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
    {
      icon: ReactNode;
      color: string;
      newStatus: User["status"];
      title: string;
    }
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
    <div className="relative overflow-x-auto rounded-xl bg-white scrollbar-hide">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60">
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
          {tableUsers.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-900">
                {user.company}
              </td>
              <td className="px-4 py-3">{user.category}</td>
              <td className="px-4 py-3">{user.industry || user.category}</td>
              <td className="px-4 py-3">
                <StatusBadge status={user.status} />
              </td>
              <td className="px-4 py-3 space-x-2">
                {/* View */}
                <button
                  className="rounded-md border p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => router.push(`/company/${user.id}`)}
                  title="View"
                >
                  <Eye className="w-4 h-4 text-gray-600" />
                </button>

                {/* Status change */}
                {statusActions[user.status] && (
                  <button
                    className={`rounded-md border p-2 cursor-pointer ${
                      statusActions[user.status].color
                    }`}
                    onClick={() =>
                      openModal(user.id, statusActions[user.status].newStatus)
                    }
                    title={statusActions[user.status].title}
                  >
                    {statusActions[user.status].icon}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Confirmation Modal */}
      <ConfirmModal
        open={modalOpen}
        title="Confirm Status Change"
        message={
          <>
            Are you sure you want to change this company&apos;s status to{" "}
            <span className="font-bold">{targetStatus}</span>?
          </>
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
