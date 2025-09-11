"use client";

import { useAuth } from "@/context/AuthContext";
import { ReactNode } from "react";


type RoleGuardProps = {
  allowedRoles: string[];
  children: ReactNode;
  fallback?: ReactNode;
};

export default function RoleGuard({ allowedRoles, children, fallback = null }: RoleGuardProps) {
  const { user, loading } = useAuth();

  if (loading) return null;

  const role = user?.role?.name;

  if (!role || !allowedRoles.includes(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
