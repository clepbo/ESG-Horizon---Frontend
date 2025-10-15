"use client";

import { useState, useMemo, useEffect, ReactNode } from "react";
import { RotateCw, Ban, CircleCheckBig } from "lucide-react";

import StatusBadge from "@/app/components/ui/reusables/StatusBadge";
import Pagination from "@/app/components/ui/reusables/Pagination";
import ConfirmModal from "@/app/components/ui/modals/ConfirmModal";
import { User } from "@/services/user.service";
import { formatRoleName } from "@/lib/utils";
import CardSkeleton from "../ui/reusables/CardSkeleton";

type UserTableProps = {
  users: User[];
};

export default function UserTable({ users }: UserTableProps) {
  const [userList, setUserList] = useState(users);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [targetStatus, setTargetStatus] = useState<User["status"] | null>(null);

  useEffect(() => {
    setUserList(users);
  }, [users]);

  const totalItems = userList.length;

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return userList.slice(start, end);
  }, [userList, currentPage, itemsPerPage]);

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

  const updateStatus = (id: number, newStatus: User["status"]) => {
    setUserList((prev) =>
      prev.map((user) =>
        user.id === Number(id) ? { ...user, status: newStatus } : user
      )
    );
    setModalOpen(false);
  };

  const openModal = (id: number, newStatus: User["status"]) => {
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
    pending: {
      icon: <CircleCheckBig className="w-4 h-4" />,
      color: "border-green-500 text-green-500 hover:bg-green-50",
      newStatus: "approved",
      title: "approve",
    },
    suspended: {
      icon: <RotateCw className="w-4 h-4" />,
      color: "border-yellow-500 text-yellow-500 hover:bg-yellow-50",
      newStatus: "pending",
      title: "Restore",
    },
    active: {
      icon: <Ban className="w-4 h-4" />,
      color: "border-red-500 text-red-500 hover:bg-red-50",
      newStatus: "suspended",
      title: "Suspend",
    },
    approved: {
      icon: <Ban className="w-4 h-4" />,
      color: "border-red-500 text-red-500 hover:bg-red-50",
      newStatus: "suspended",
      title: "Suspend",
    },
    disabled: {
      icon: <CircleCheckBig className="w-4 h-4" />,
      color: "border-green-500 text-green-500 hover:bg-green-50",
      newStatus: "approved",
      title: "Approve",
    },
  };

  return (
    <div className="relative overflow-x-auto bg-white shadow rounded-xl">
      {loading && <CardSkeleton />}

      {paginatedUsers.length > 0 ? (
        <>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr className="text-gray-700">
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>

                <th className="p-4">Status</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-t border-gray-200 hover:bg-gray-50"
                >
                  <td className="p-4">
                    {user.first_name + " " + user.last_name}
                  </td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4">
                    {formatRoleName(user.role?.name || "")}
                  </td>
                  {/* <td className="p-4">
                {user.recentActivities?.[0]?.action || "N/A"}
              </td> */}
                  <td className="p-4">
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="p-4">
                    {statusActions[user.status] && (
                      <button
                        className={`inline-flex items-center gap-1 border rounded px-3 py-1 cursor-pointer ${
                          statusActions[user.status].color
                        }`}
                        onClick={() =>
                          openModal(
                            user.id,
                            statusActions[user.status].newStatus
                          )
                        }
                        title={statusActions[user.status].title}
                      >
                        {statusActions[user.status].icon}
                        {statusActions[user.status].title}
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
        </>
      ) : (
        <div className="p-5 text-center">
          <p>No users found</p>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        open={modalOpen}
        title="Confirm Status Change"
        message={
          <>
            Are you sure you want to change this user&apos;s status to{" "}
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
