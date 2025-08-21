"use client";

import { useState, useEffect } from "react";
import { userService } from "@/services/user.service";

export default function RoleDefinitions() {
    // const colors = {
    //     super_admin: "green",
    //     platform_admin: "yellow",
    //     platform_data_officer: "blue",
    //     platform_viewer: "orange",
    // };

    const [roles, setRoles] = useState<
        { description: string; id?: string | number; name: string }[]
    >([]);

    useEffect(() => {
        const fetchRoles = async () => {
            const allRoles = await userService.getAllUserRoles();
            setRoles(allRoles);
        };

        fetchRoles();
    }, []);

    // const oldroles = [
    //     {
    //         name: "Super Admin",
    //         color: "green",
    //         description: "Full control of the entire SaaS platform",
    //         permissions: [
    //             {
    //                 label: "Can manage:",
    //                 items: ["Companies", "Super Admin sub-users"],
    //             },
    //             {
    //                 label: "Cannot:",
    //                 items: [
    //                     "Delete the Super Admin account",
    //                     "Modify the Super Admin account",
    //                 ],
    //             },
    //         ],
    //     },
    // ];

    return (
        <section className="mt-6 bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-1">Role Definitions</h3>
            <p className="text-gray-600 mb-6">
                Understanding user permissions and access levels
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {roles.length > 0 &&
                    roles.map((role) => (
                        <div
                            key={role.name}
                            className="border border-gray-200 rounded-lg p-5 bg-white"
                        >
                            {/* Role Title Pill */}
                            <div
                                className={`inline-block px-3 py-1 rounded-full text-white text-sm font-medium bg-blue-400`}
                            >
                                {role.name}
                            </div>

                            <div className="mt-3">
                              <p>{role.description}</p>
                            </div>

                            {/* Permissions List */}
                            {/* <ul className="mt-3 space-y-2 text-sm text-gray-700">
                            {role.permissions.map((perm, i) =>
                                typeof perm === "string" ? (
                                    <li key={i} className="list-disc ml-5">
                                        {perm}
                                    </li>
                                ) : (
                                    <li key={i} className="ml-5">
                                        <span className="font-medium">
                                            {perm.label}
                                        </span>
                                        <ul className="list-disc ml-5 mt-1 space-y-1">
                                            {perm.items.map((item, idx) => (
                                                <li key={idx}>{item}</li>
                                            ))}
                                        </ul>
                                    </li>
                                )
                            )}
                        </ul> */}
                        </div>
                    ))}
            </div>
        </section>
    );
}
