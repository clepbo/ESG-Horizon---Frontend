"use client";

import { useState, useMemo } from "react";
import { Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import StatusBadge from "@/app/components/ui/StatusBadge";
import Pagination from "@/app/components/Pagination";
import Spinner from "@/app/components/ui/Spinner";

type User = {
  id: string;
  name: string;
  company: string;
  category: string;
  role: string;
  status: string;
};

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
        <thead className="bg-gray-100 text-left text-xs font-semibold text-gray-700">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Company</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
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
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => router.push(`/users/${user.id}`)}
                  className="inline-flex items-center gap-2 rounded-md bg-[var(--color-green-500)] px-4 py-2 text-sm text-white hover:bg-opacity-90 cursor-pointer"
                >
                  <Edit className="h-4 w-4" />
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

// import { Eye, Edit, Ban } from "lucide-react";

// export default function UserTable({ users, onEdit }: any) {
//   return (
//     <div className="overflow-x-auto">
//       <table className="min-w-full table-auto text-sm">
//         <thead className="bg-gray-100">
//           <tr>
//             <th className="px-4 py-2 text-left">Name</th>
//             <th className="px-4 py-2 text-left">Email</th>
//             <th className="px-4 py-2 text-left">Role</th>
//             <th className="px-4 py-2 text-left">Recent Activities</th>
//             <th className="px-4 py-2 text-left">Status</th>
//             <th className="px-4 py-2 text-left">Quick Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {users.map((user: any, index: number) => (
//             <tr key={index} className="border-b">
//               <td className="px-4 py-2">{user.name}</td>
//               <td className="px-4 py-2">{user.email}</td>
//               <td className="px-4 py-2">{user.role}</td>
//               <td className="px-4 py-2">{user.activity || "N/A"}</td>
//               <td className="px-4 py-2">
//                 <span className={`px-2 py-1 rounded text-white text-xs
//                   ${user.status === "Approved" ? "bg-green-500"
//                     : user.status === "Pending" ? "bg-yellow-500"
//                     : "bg-red-500"}`}>
//                   {user.status}
//                 </span>
//               </td>
//               <td className="px-4 py-2 space-x-2">
//                 <button className="text-gray-600 hover:text-gray-900">
//                   <Eye size={16} />
//                 </button>
//                 <button onClick={() => onEdit(user)} className="text-blue-600 hover:text-blue-900">
//                   <Edit size={16} />
//                 </button>
//                 <button className="text-red-600 hover:text-red-900">
//                   <Ban size={16} />
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }
