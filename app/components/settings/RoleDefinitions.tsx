"use client";

import { useEffect, useState } from "react";
import { userService } from "@/services/user.service";
import { useAuth } from "@/context/AuthContext";
import { formatRoleName } from "@/lib/utils";

type Role = {
  description: string;
  id?: string | number;
  name: string;
};

export default function RoleDefinitions() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    const fetchRoles = async () => {
      if (!user) return;

      const allRoles: Role[] = await userService.getAllUserRoles();

      const platformRoles = [
        "super_admin",
        "platform_subadmin",
        "platform_data_officer",
        "platform_viewer",
      ];
      const companyRoles = [
        "company_esg_admin",
        "company_esg_subadmin",
        "company_esg_data_officer",
        "company_esg_viewer",
      ];

      if (platformRoles.includes(user.role?.name || "")) {
        setRoles(allRoles.filter((r: Role) => platformRoles.includes(r.name)));
      } else if (companyRoles.includes(user.role?.name || "")) {
        setRoles(allRoles.filter((r: Role) => companyRoles.includes(r.name)));
      }
    };

    fetchRoles();
  }, [user]);

  return (
    <section className="mt-6 bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-semibold mb-1">Role Definitions</h3>
      <p className="text-gray-600 mb-6">
        Understanding user permissions and access levels
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roles.map((role) => (
          <div
            key={role.name}
            className="border border-gray-200 rounded-lg p-5 bg-white"
          >
            <div className="inline-block px-3 py-1 rounded-full text-white text-sm font-medium bg-blue-400">
              {formatRoleName(role.name)}
            </div>
            <div className="mt-3">
              <p>{role.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// "use client";

// import { useState, useEffect } from "react";
// import { userService } from "@/services/user.service";

// export default function RoleDefinitions() {
//   // const colors = {
//   //     super_admin: "green",
//   //     platform_admin: "yellow",
//   //     platform_data_officer: "blue",
//   //     platform_viewer: "orange",
//   // };

//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   const [roles, setRoles] = useState<
//     { description: string; id?: string | number; name: string }[]
//   >([]);

//   useEffect(() => {
//     const fetchRoles = async () => {
//       const allRoles = await userService.getAllUserRoles();
//       setRoles(allRoles);
//     };

//     fetchRoles();
//   }, []);

//   // const oldroles = [
//   //     {
//   //         name: "Super Admin",
//   //         color: "green",
//   //         description: "Full control of the entire SaaS platform",
//   //         permissions: [
//   //             {
//   //                 label: "Can manage:",
//   //                 items: ["Companies", "Super Admin sub-users"],
//   //             },
//   //             {
//   //                 label: "Cannot:",
//   //                 items: [
//   //                     "Delete the Super Admin account",
//   //                     "Modify the Super Admin account",
//   //                 ],
//   //             },
//   //         ],
//   //     },
//   // ];

//   return (
//     <section className="mt-6 bg-white rounded-lg shadow p-6">
//       <h3 className="text-xl font-semibold mb-1">Role Definitions</h3>
//       <p className="text-gray-600 mb-6">
//         Understanding user permissions and access levels
//       </p>

//       <div className="border border-gray-200 rounded-lg p-5 bg-white">
//         <ul>
//           <li>Company Admin</li>
//           <li>Company SubAdmin</li>
//           <li>Company Data Officer (Contributor)</li>
//           <li>Company Viewer</li>
//         </ul>
//       </div>

//       {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {roles.length > 0 &&
//                     roles.map((role) => (
//                         <div
//                             key={role.name}
//                             className="border border-gray-200 rounded-lg p-5 bg-white"
//                         >
//                             <div
//                                 className={`inline-block px-3 py-1 rounded-full text-white text-sm font-medium bg-blue-400`}
//                             >
//                                 {role.name}
//                             </div>

//                             <div className="mt-3">
//                               <p>{role.description}</p>
//                             </div>
//                         </div>
//                     ))}
//             </div> */}
//     </section>
//   );
// }
