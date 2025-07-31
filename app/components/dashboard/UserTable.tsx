"use client";

import { Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import StatusBadge from "@/app/components/ui/StatusBadge";
import Spinner from "@/app/components/ui/Spinner";
import { User } from "@/mockData/users";

type UserTableProps = {
  users: User[];
  loading?: boolean;
};

export default function UserTable({ users, loading = false }: UserTableProps) {
  const router = useRouter();

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
            <th className="px-4 py-3 whitespace-nowrap">Name</th>
            <th className="px-4 py-3 whitespace-nowrap">Company</th>
            <th className="px-4 py-3 whitespace-nowrap">Category</th>
            <th className="px-4 py-3 whitespace-nowrap">Role</th>
            <th className="px-4 py-3 whitespace-nowrap">Status</th>
            <th className="px-4 py-3 whitespace-nowrap">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {users.map((user) => (
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
                  className="cursor-pointer inline-flex items-center gap-2 rounded-md bg-[var(--color-green-500)] hover:bg-[var(--color-green-600)] px-4 py-2 text-sm text-white hover:bg-opacity-90"
                >
                  <Edit className="h-4 w-4" />
                  <span className="hidden sm:inline cursor-pointer">
                    View/Edit
                  </span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
