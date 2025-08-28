"use client";

import { useEffect, useState, ReactNode } from "react";
import { getRole } from "./utils";

type RoleGuardProps = {
  allowedRoles: string[];
  children: ReactNode;
  fallback?: ReactNode;
};

export default function RoleGuard({ allowedRoles, children, fallback = null }: RoleGuardProps) {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRole() {
      try {
        const r = await getRole();
        setRole(r ?? null);
      } finally {
        setLoading(false);
      }
    }
    fetchRole();
  }, []);

  if (loading) {
    return null; 
  }

  if (!role || !allowedRoles.includes(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
