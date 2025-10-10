"use client";
import Sidebar from "@/app/components/layout/Sidebar";
import LayoutContent from "../(company)/components/LayoutContent";
import { USER_TYPES } from "../constants/userTypes";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LayoutContentSkeleton from "../components/ui/reusables/LayoutContentSkeleton";

const companyAdminRoles = [
  USER_TYPES.SUPER_ADMIN,
  USER_TYPES.PLATFORM_SUBADMIN,
  USER_TYPES.PLATFORM_DATA_OFFICER,
  USER_TYPES.PLATFORM_VIEWER,
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user || !companyAdminRoles.includes(user.role?.name || "")) {
        router.push("/login");
      }
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar />
        <LayoutContentSkeleton />
      </div>
    );
  }

  if (!user || !companyAdminRoles.includes(user.role?.name || "")) {
    return null;
  }

  if (!user.role?.name) {
    return null;
  }

  const roleName = user.role.name;

  return (
    <div className="flex h-screen overflow-hidden bg-grey-50">
      <Sidebar />
      <LayoutContent role={roleName}>{children}</LayoutContent>
    </div>
  );
}
