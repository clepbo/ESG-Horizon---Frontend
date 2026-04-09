"use client";

import { useEffect, useState } from "react";
import { userService } from "@/services/user.service";
import { useAuth } from "@/context/AuthContext";
import { formatRoleName } from "@/lib/utils";
import CardSkeleton from "../ui/reusables/CardSkeleton";

type Role = {
  description: string;
  id?: string | number;
  name: string;
};

export default function RoleDefinitions() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRoles = async () => {
      if (!user) return;
      setLoading(true);

      try {
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

        let filteredRoles: Role[] = [];

        if (platformRoles.includes(user.role?.name || "")) {
          filteredRoles = allRoles.filter((r: Role) => platformRoles.includes(r.name));
        } else if (companyRoles.includes(user.role?.name || "")) {
          filteredRoles = allRoles.filter((r: Role) => companyRoles.includes(r.name));
        }

        setRoles(filteredRoles);
      } catch (error) {
        console.error("Failed to fetch roles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, [user]);
  const roleOrder = [
    "super_admin",
    "platform_subadmin",
    "platform_data_officer",
    "platform_viewer",
    "company_esg_admin",
    "company_esg_subadmin",
    "company_esg_data_officer",
    "company_esg_viewer",
  ];

  const roleColors: Record<string, string> = {
    super_admin: "#0d9488",
    platform_subadmin: "#3b82f6",
    platform_data_officer: "#f59e0b",
    platform_viewer: "#6b7280",
    company_esg_admin: "#0d9488",
    company_esg_subadmin: "#3b82f6",
    company_esg_data_officer: "#f59e0b",
    company_esg_viewer: "#6b7280",
  };

  const sortedRoles = [...roles].sort(
    (a, b) => roleOrder.indexOf(a.name) - roleOrder.indexOf(b.name)
  );

  return (
    <section className="mt-6 bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-semibold mb-1">Role Definitions</h3>
      <p className="text-gray-600 mb-6">Understanding user permissions and access levels</p>

      {loading ? (
        <CardSkeleton />
      ) : (
        <div className="divide-y divide-gray-300 border border-gray-200 rounded-lg overflow-hidden">
          {sortedRoles.map((role, index) => (
            <div
              key={role.name}
              className="flex gap-4 p-4 bg-white"
              style={{ borderLeft: `4px solid ${roleColors[role.name] || "#0d9488"}` }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="inline-block px-3 py-0.5 rounded-full text-white text-xs font-semibold"
                    style={{ backgroundColor: roleColors[role.name] || "#0d9488" }}
                  >
                    {formatRoleName(role.name)}
                  </span>
                  {index === 0 && (
                    <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                      Highest access
                    </span>
                  )}
                  {index === sortedRoles.length - 1 && (
                    <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                      View only
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{role.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
