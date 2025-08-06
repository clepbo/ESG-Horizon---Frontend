// "use client";

// import { Edit } from "lucide-react";
// import { useRouter } from "next/navigation";
// import StatusBadge from "@/app/components/ui/StatusBadge";
// import type { User } from "@/mockData/users";

// type UserTableProps = {
//   users: User[];
// };

// export default function UserTable({ users }: UserTableProps) {
//   const router = useRouter();

//   return (
//     <div className="overflow-x-auto">
//       <table className="min-w-full text-sm">
//         <thead className="bg-gray-100 text-left text-xs font-semibold text-gray-700">
//           <tr>
//             <th className="px-4 py-3">Name</th>
//             <th className="px-4 py-3">Company</th>
//             <th className="px-4 py-3">Category</th>
//             <th className="px-4 py-3">Role</th>
//             <th className="px-4 py-3">Status</th>
//             <th className="px-4 py-3 text-right">Actions</th>
//           </tr>
//         </thead>
//         <tbody className="divide-y divide-gray-200">
//           {users.map((user) => (
//             <tr key={user.id}>
//               <td className="px-4 py-3 font-medium text-gray-900">
//                 {user.name}
//               </td>
//               <td className="px-4 py-3">{user.company}</td>
//               <td className="px-4 py-3">{user.category}</td>
//               <td className="px-4 py-3">{user.role}</td>
//               <td className="px-4 py-3">
//                 <StatusBadge status={user.status} />
//               </td>
//               <td className="px-4 py-3 text-right">
//                 <button
//                   onClick={() => router.push(`/users/${user.id}`)}
//                   className="inline-flex items-center gap-2 rounded-md bg-[var(--color-green-500)] px-4 py-2 text-sm text-white hover:bg-opacity-90 cursor-pointer"
//                 >
//                   <Edit className="h-4 w-4" />
//                   View/Edit
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }
"use client";

import { Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import StatusBadge from "@/app/components/StatusBadge";
import type { User } from "@/mockData/users";

type UserTableProps = {
  users: User[];
};

export default function UserTable({ users }: UserTableProps) {
  const router = useRouter();

  return (
    <div className="overflow-x-auto">
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
    </div>
  );
}
