"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/components/ui/avatar";
import { SquarePen, Trash2 } from "lucide-react";
import StatusBadge from "@/app/components/StatusBadge";
import EditUserModal from "../../users/EditUserModal";
import { useState } from "react";
import type { TeamUser } from "@/mockData/mockDepartment";

type Member = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  department: string;
  role: string;
  status: string;
};

type Props = {
  members: Member[];
  users: TeamUser[];
  onUserUpdate?: (user: TeamUser) => void;
};

export default function TeamMembersTable({ members, users }: Props) {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<TeamUser | null>(null);

  const handleEditClick = (id: string) => {
    const user = users.find((u) => u.id === id);
    if (user) {
      setSelectedUser(user);
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
          {members.map((member) => (
            <tr key={member.id} className="last:border-0 hover:bg-gray-50">
              <td className="px-4 py-3 flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  {member.avatar ? (
                    <AvatarImage src={member.avatar} alt={member.name} />
                  ) : (
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-xs text-gray-500">{member.email}</p>
                </div>
              </td>
              <td className="px-4 py-3">{member.department}</td>
              <td className="px-4 py-3">{member.role}</td>
              <td className="px-4 py-3">
                <StatusBadge status={member.status} />
              </td>
              <td className="px-4 py-3 flex space-x-2 justify-center">
                <button
                  className="rounded-md border p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleEditClick(member.id)}
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
      {editModalOpen && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
}
