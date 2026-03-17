"use client";

import { ReactNode } from "react";
import { usePermissions, type Permission } from "@/lib/permissions";

interface PermissionGateProps {
  action: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Action-based access gate. Renders children when the current user
 * has permission for the given action, otherwise renders fallback (default: null).
 */
export default function PermissionGate({ action, children, fallback = null }: PermissionGateProps) {
  const { can } = usePermissions();

  if (!can(action)) return <>{fallback}</>;

  return <>{children}</>;
}
