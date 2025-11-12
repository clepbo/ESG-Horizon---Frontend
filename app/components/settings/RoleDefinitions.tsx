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
  return (
    <section className="mt-6 bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-semibold mb-1">Role Definitions</h3>
      <p className="text-gray-600 mb-6">Understanding user permissions and access levels</p>

      {loading ? (
        <CardSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roles.map((role) => (
            <div key={role.name} className="border border-gray-200 rounded-lg p-5 bg-white">
              <div className="inline-block px-3 py-1 rounded-full text-white text-sm font-medium bg-teal-400">
                {formatRoleName(role.name)}
              </div>
              <div className="mt-3">
                <p>{role.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
