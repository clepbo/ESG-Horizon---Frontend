"use client";

import { useState, useEffect } from "react";
import { userService } from "@/services/user.service";

export default function RoleDefinitions() {
  const [roles, setRoles] = useState<
    {
      id?: string | number;
      name: string;
      description: string;
      permissions?: { label?: string; items: string[] }[];
      color: string;
    }[]
  >([]);

  useEffect(() => {
    // Example: Replace with API fetch
    const fetchRoles = async () => {
      //   const allRoles = await userService.getAllUserRoles();
      // For now, hardcode mapping colors and permissions
      const mappedRoles = [
        {
          name: "Super Administrator",
          color: "bg-green-500",
          description:
            "Grants the highest level of authority over the ESG-Horizon platform. Intended for key personnel responsible for the system’s integrity, this role provides unrestricted access and should be assigned with extreme caution.",
          permissions: [
            {
              items: [
                "System Configuration: Manage all platform-wide settings, security, and integrations.",
                "User & Access Management: Create and manage all user accounts, roles, and permissions.",
                "Organizational Structure: Administer the hierarchy of all companies and departments.",
                "Data Oversight: Access and manage all data across the entire platform.",
              ],
            },
          ],
        },
        {
          name: "Platform Data Officer",
          color: "bg-yellow-500",
          description:
            "Responsible for submitting timely and accurate ESG data and monitoring performance through reports. Data officers have the necessary reporting access to understand the impact of their contributions.",
          permissions: [
            {
              items: [
                "Data Contribution: Enter, upload, and manage the ESG data points that power the platform’s analytics.",
                "Performance Monitoring: View platform reports to ensure data accuracy and track ESG performance over time.",
              ],
            },
          ],
        },
        {
          name: "Platform Sub-Administrator",
          color: "bg-blue-500",
          description:
            "Manages the day-to-day administrative and content oversight tasks within the platform. This role has powerful permissions to manage organizational data and the ESG submission lifecycle.",
          permissions: [
            {
              items: [
                "Content Validation: Review, approve, and manage all ESG data submissions.",
                "User & Group Management: Edit company, department, and user account information (excluding Super Administrator).",
                "Reporting Access: View and generate all system-wide reports.",
              ],
            },
          ],
        },
        {
          name: "Platform Viewer",
          color: "bg-red-500",
          description:
            "Provides read-only access to all dashboards and reports across the platform. This role is ideal for stakeholders who require visibility into ESG performance without needing to edit data.",
          permissions: [
            {
              items: [
                "Full Platform Visibility: Access all dashboards, analytics, and performance metrics.",
                "Reporting on Demand: Generate and export any report available on the platform for review, presentation, or further analysis.",
                "Strictly Read-Only: This is a non-editing role. Users cannot contribute, modify, or approve any data, ensuring the integrity of the information they are viewing.",
              ],
            },
          ],
        },
      ];

      setRoles(mappedRoles);
    };

    fetchRoles();
  }, []);

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
            className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm"
          >
            <div
              className={`inline-block px-3 py-1 rounded-full text-white text-sm font-medium ${role.color}`}
            >
              {role.name}
            </div>

            <p className="mt-3 text-gray-700">{role.description}</p>

            <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600">
              {role.permissions?.map((section, idx) =>
                section.items.map((item, i) => (
                  <li key={`${idx}-${i}`}>
                    <span className="font-medium">{item.split(":")[0]}:</span>{" "}
                    {item.split(":").slice(1).join(":")}
                  </li>
                ))
              )}
            </ul>
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
//     // const colors = {
//     //     super_admin: "green",
//     //     platform_admin: "yellow",
//     //     platform_data_officer: "blue",
//     //     platform_viewer: "orange",
//     // };

//     // eslint-disable-next-line @typescript-eslint/no-unused-vars
//     const [roles, setRoles] = useState<
//         { description: string; id?: string | number; name: string }[]
//     >([]);

//     useEffect(() => {
//         const fetchRoles = async () => {
//             const allRoles = await userService.getAllUserRoles();
//             setRoles(allRoles);
//         };

//         fetchRoles();
//     }, []);

//     // const oldroles = [
//     //     {
//     //         name: "Super Admin",
//     //         color: "green",
//     //         description: "Full control of the entire SaaS platform",
//     //         permissions: [
//     //             {
//     //                 label: "Can manage:",
//     //                 items: ["Companies", "Super Admin sub-users"],
//     //             },
//     //             {
//     //                 label: "Cannot:",
//     //                 items: [
//     //                     "Delete the Super Admin account",
//     //                     "Modify the Super Admin account",
//     //                 ],
//     //             },
//     //         ],
//     //     },
//     // ];

//     return (
//         <section className="mt-6 bg-white rounded-lg shadow p-6">
//             <h3 className="text-xl font-semibold mb-1">Role Definitions</h3>
//             <p className="text-gray-600 mb-6">
//                 Understanding user permissions and access levels
//             </p>

//             <div
//                 className="border border-gray-200 rounded-lg p-5 bg-white"
//             >
//                 <ul>
//                     <li>Company Admin</li>
//                     <li>Company SubAdmin</li>
//                     <li>Company Data Officer (Contributor)</li>
//                     <li>Company Viewer</li>
//                 </ul>
//             </div>

//             {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
//         </section>
//     );
// }
