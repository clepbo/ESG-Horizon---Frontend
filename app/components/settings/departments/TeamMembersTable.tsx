/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/app/components/ui/avatar";
import { SquarePen, Trash2 } from "lucide-react";
import StatusBadge from "@/app/components/ui/reusables/StatusBadge";
import EditDepartmentTeam from "@/app/components/ui/modals/EditDepartmentTeam";
import { useState } from "react";
import { User } from "@/services/user.service";

type Props = {
    users: Partial<User>[]; // Accept partial users directly
    onUserUpdate?: (user: User) => void;
};

export default function TeamMembersTable({ users }: Props) {
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const handleEditClick = (id?: string) => {
        if (!id) return;
        const user = users.find((u) => u.id === id);
        if (user) {
            setSelectedUser(user as User); // cast since edit expects full User
            setEditModalOpen(true);
        }
    };

    return (
        <div>
            <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-700">
                    <tr>
                        <th className="px-4 py-3">User</th>
                        <th className="px-4 py-3">Department</th>
                        <th className="px-4 py-3">Role</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-center">Quick Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr
                            key={user.id}
                            className="last:border-0 hover:bg-gray-50"
                        >
                            <td className="px-4 py-3 flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                    {user.profile_photo_url ? (
                                        <AvatarImage
                                            src={user.profile_photo_url}
                                            alt={`${user.first_name ?? ""} ${
                                                user.last_name ?? ""
                                            }`}
                                        />
                                    ) : (
                                        <AvatarFallback>
                                            {(user.first_name ?? "").charAt(0)}
                                        </AvatarFallback>
                                    )}
                                </Avatar>
                                <div>
                                    <p className="font-medium">
                                        {`${user.first_name ?? ""} ${
                                            user.last_name ?? ""
                                        }`.trim()}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {user.email ?? ""}
                                    </p>
                                </div>
                            </td>
                            <td className="px-4 py-3">
                                {user.department?.name ?? "-"}
                            </td>
                            <td className="px-4 py-3">
                                {user.role?.name ?? "-"}
                            </td>
                            <td className="px-4 py-3">
                                <StatusBadge status={user.status ?? ""} />
                            </td>
                            <td className="px-4 py-3 flex space-x-2 justify-center">
                                <button
                                    className="rounded-md border p-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => handleEditClick(user.id)}
                                    title="Edit User"
                                >
                                    <SquarePen className="w-4 h-4 text-gray-600" />
                                </button>
                                <button
                                    className="rounded-md border border-red-500 p-2 hover:bg-gray-100 cursor-pointer"
                                    title="Delete User"
                                >
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Edit User Modal */}
            {/* {editModalOpen && selectedUser && (
                <EditDepartmentTeam
                    user={selectedUser}
                    onClose={() => {
                        setEditModalOpen(false);
                        setSelectedUser(null);
                    }}
                />
            )} */}
        </div>
    );
}
