import { useState, ReactNode, useMemo } from "react";
import { Ban, CircleCheckBig, RotateCcw, SquarePen, Trash2 } from "lucide-react";
import StatusBadge from "@/app/components/ui/reusables/StatusBadge";
import Image from "next/image";
import RoleDefinitionsModal from "../../settings/RoleDefinitionsModal";
import Pagination from "@/app/components/ui/reusables/Pagination";
import EditUserModal from "../../common/users/EditUserModal";
import { TeamUserStatus, User } from "@/services/user.service";
import { formatRoleName, formattedDate } from "@/lib/utils";
import { Card } from "../../ui/card";
import { useDeleteInvitation, useDeleteUser } from "@/services/hooks/company.hooks";
import { toast } from "react-toastify";
import ActionDropdown from "../../ui/reusables/ActionDropdown";
import ConfirmModal from "../../ui/modals/ConfirmModal";
import ParentCompanyBadge from "../../ui/reusables/ParentCompanyBadge";
import { usePermissions } from "@/lib/permissions";

type Props = {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  onStatusUpdate: (id: number, newStatus: TeamUserStatus) => void;
  onUserUpdate?: (user: User) => void;
  companyName?: string;
};

export default function TeamsTable({ users, setUsers, onStatusUpdate, companyName }: Props) {
  const { can } = usePermissions();
  const canEditUser = can("editUser");
  const canDeactivateUser = can("deactivateUser");
  const canInviteUser = can("inviteUser");
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [targetStatus, setTargetStatus] = useState<TeamUserStatus | null>(null);

  const [deleteInviteModalOpen, setDeleteInviteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: number; isInvitation: boolean } | null>(
    null
  );

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { mutateAsync: deleteInvitation, isPending: isDeletingInvite } = useDeleteInvitation();
  const { mutateAsync: deleteUser, isPending: isDeletingUser } = useDeleteUser();

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return users.slice(start, start + itemsPerPage);
  }, [users, currentPage, itemsPerPage]);

  const handleView = (id: number) => {
    const user = users.find((u) => Number(u.id) === Number(id));
    if (user) {
      // Prevent editing if user is pending (invited)
      if (user.status === "pending") {
        return;
      }
      setSelectedUser(user);
      setEditModalOpen(true);
    }
  };

  const openStatusModal = (id: number, newStatus: TeamUserStatus) => {
    setSelectedUserId(id);
    setTargetStatus(newStatus);
    setStatusModalOpen(true);
  };

  const handleDeleteInvitation = (id: number, isInvitation: boolean) => {
    setItemToDelete({ id, isInvitation });
    setDeleteInviteModalOpen(true);
  };

  const confirmDeleteInvitation = async () => {
    if (!itemToDelete) return;
    try {
      if (itemToDelete.isInvitation) {
        await deleteInvitation(itemToDelete.id);
        toast.success("Invitation deleted successfully");
      } else {
        await deleteUser(itemToDelete.id);
        toast.success("User deleted successfully");
      }
      setUsers((prev) => prev.filter((u) => u.id !== itemToDelete.id));
    } catch (error: any) {
      console.error(error);
      const message =
        error.response?.data?.message ||
        (itemToDelete.isInvitation ? "Failed to delete invitation" : "Failed to delete user");
      toast.error(message);
    } finally {
      setDeleteInviteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const statusActions: Record<
    TeamUserStatus,
    {
      icon: ReactNode;
      color: string;
      newStatus: TeamUserStatus;
      title: string;
    }
  > = {
    pending: {
      icon: <CircleCheckBig className="w-4 h-4 text-green-600" />,
      color: "border-green-500 hover:bg-green-200",
      newStatus: "approved",
      title: "Approve",
    },
    suspended: {
      icon: <RotateCcw className="w-4 h-4 text-yellow-600" />,
      color: "border-yellow-500 hover:bg-yellow-100",
      newStatus: "approved",
      title: "Restart",
    },
    active: {
      icon: <Ban className="w-4 h-4 text-red-600" />,
      color: "border-red-500 hover:bg-red-100",
      newStatus: "suspended",
      title: "Suspend",
    },
    approved: {
      icon: <Ban className="w-4 h-4 text-red-600" />,
      color: "border-red-500 hover:bg-red-100",
      newStatus: "suspended",
      title: "Suspend",
    },
    disabled: {
      icon: <CircleCheckBig className="w-4 h-4 text-green-600" />,
      color: "border-green-500 hover:bg-green-200",
      newStatus: "approved",
      title: "Approve",
    },
  };

  // function TeamActionDropdown({ user, statusActions, onEdit, onStatusChange }: any) {
  //   const [isOpen, setIsOpen] = useState(false);
  //   const currentAction = statusActions[user.status];

  //   return (
  //     <DropdownMenu onOpenChange={(open) => setIsOpen(open)}>
  //       <DropdownMenuTrigger asChild>
  //         <Button
  //           variant="outline"
  //           size="sm"
  //           className="w-[110px] justify-between rounded-sm border-teal-600"
  //         >
  //           Actions
  //           {isOpen ? (
  //             <ChevronUp className="ml-1 h-4 w-4 transition-transform duration-200" />
  //           ) : (
  //             <ChevronDown className="ml-1 h-4 w-4 transition-transform duration-200" />
  //           )}
  //         </Button>
  //       </DropdownMenuTrigger>

  //       <DropdownMenuContent align="end" className="w-44 shadow-md border-teal-600">
  //         <RoleGuard allowedRoles={["company_esg_admin", "company_esg_subadmin"]}>
  //           <DropdownMenuItem onClick={onEdit}>
  //             <SquarePen className="mr-2 h-4 w-4" />
  //             Edit User
  //           </DropdownMenuItem>
  //         </RoleGuard>

  //         {currentAction && (
  //           <RoleGuard
  //             allowedRoles={[
  //               "company_esg_admin",
  //               "company_esg_subadmin",
  //               "super_admin",
  //               "platform_subadmin",
  //               "platform_data_officer",
  //             ]}
  //           >
  //             <DropdownMenuItem
  //               onClick={onStatusChange}
  //               className={currentAction.color
  //                 .replace("border-", "text-")
  //                 .replace("hover:bg-", "hover:text-")}
  //             >
  //               <span className="flex gap-2">
  //                 {currentAction.icon}
  //                 {currentAction.title}
  //               </span>
  //             </DropdownMenuItem>
  //           </RoleGuard>
  //         )}
  //       </DropdownMenuContent>
  //     </DropdownMenu>
  //   );
  // }

  return (
    <div>
      <div className="flex justify-end mb-2">
        {/* <Link href="#" className="text-teal-600 text-sm hover:underline" onClick={(e) => {
          e.preventDefault();
          const modalTrigger = document.getElementById("role-definitions-trigger");
          if (modalTrigger) modalTrigger.click();
        }}>
          View Role Definitions
        </Link> */}
      </div>
      <RoleDefinitionsModal />

      <div className="relative overflow-x-auto bg-white rounded-lg mt-2 shadow clear-both">
        {paginatedUsers.length === 0 ? (
          <Card>
            <div className="px-4 py-6 text-center text-gray-500 text-sm">No users found.</div>
          </Card>
        ) : (
          <section>
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-700">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Subsidiary</th>
                  <th className="px-4 py-3">Role/Status</th>
                  <th className="px-4 py-3">Last Active</th>
                  <th className="px-4 py-3">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedUsers.map((user, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 flex items-center gap-3">
                      <Image
                        src={user.profile_photo_url?.trim() || "/image.png"}
                        alt={user.first_name || user.email}
                        width={32}
                        height={32}
                        className="rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium">
                          {user.first_name
                            ? `${user.first_name} ${user.last_name || ""}`.trim()
                            : user.status === "pending"
                              ? "(Invited)"
                              : ""}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {user.department?.name ? (
                        user.department?.name
                      ) : (
                        <span className="text-gray-400 text-sm italic">Unassigned</span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {user.subsidiary?.name ? (
                        user.subsidiary?.name
                      ) : (
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium text-gray-900">{companyName || "—"}</span>
                          <ParentCompanyBadge />
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        {formatRoleName(user.role?.name || "")}
                        <span className="mt-1 text-xs">
                          <StatusBadge status={user.status} />
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      {user.last_login ? (
                        <div className="flex flex-col">
                          <span>{formattedDate(String(user.last_login), false)}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(user.last_login).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs italic">Not logged in</span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {user.role?.name !== "company_esg_admin" ? (
                        <ActionDropdown
                          actions={[
                            ...(canEditUser && user.status !== "pending"
                              ? [
                                  {
                                    label: "Edit User",
                                    icon: <SquarePen className="w-4 h-4" />,
                                    onClick: () => handleView(user.id),
                                  },
                                ]
                              : []),
                            ...(canInviteUser && user.status === "pending"
                              ? [
                                  {
                                    label: "Delete Invitation",
                                    icon: <Trash2 className="w-4 h-4" />,
                                    colorClass: "text-red-500 hover:text-red-600",
                                    onClick: () =>
                                      handleDeleteInvitation(user.id, user.is_invitation ?? false),
                                  },
                                ]
                              : []),
                            ...(canDeactivateUser && user.status !== "pending" && statusActions[user.status]
                              ? [
                                  {
                                    label: statusActions[user.status]?.title || "Update Status",
                                    icon: statusActions[user.status]?.icon,
                                    colorClass: statusActions[user.status]?.color
                                      .replace("border-", "text-")
                                      .replace("hover:bg-", "hover:text-"),
                                    onClick: () =>
                                      openStatusModal(
                                        user.id,
                                        statusActions[user.status].newStatus
                                      ),
                                  },
                                ]
                              : []),
                          ]}
                        />
                      ) : (
                        <span className="text-gray-400 italic text-xs">System Admin</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 px-4 pb-4">
              <Pagination
                totalItems={users.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
              />
            </div>
          </section>
        )}

        {/* Status Modal */}
        <ConfirmModal
          open={statusModalOpen}
          title="Confirm Status Change"
          message={
            <span>
              Are you sure you want to change this user&apos;s status to{" "}
              <strong>{targetStatus}</strong>?
            </span>
          }
          onCancel={() => setStatusModalOpen(false)}
          onConfirm={() => {
            if (selectedUserId && targetStatus) {
              onStatusUpdate(selectedUserId, targetStatus);
            }
            setStatusModalOpen(false);
          }}
        />

        {editModalOpen && selectedUser && (
          <EditUserModal
            user={selectedUser}
            onClose={() => setEditModalOpen(false)}
            onSave={(updatedUser) => {
              setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
            }}
          />
        )}
      </div>
      <ConfirmModal
        open={deleteInviteModalOpen}
        title="Delete Invitation"
        message={
          <span>
            Are you sure you want to delete this invitation? This action cannot be undone.
          </span>
        }
        onCancel={() => setDeleteInviteModalOpen(false)}
        onConfirm={confirmDeleteInvitation}
        loading={isDeletingInvite || isDeletingUser}
      />
    </div>
  );
}
