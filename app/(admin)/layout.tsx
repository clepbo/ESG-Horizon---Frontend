"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "./components/AdminSidebar";
import { AdminMobileNavProvider } from "./components/AdminMobileNavContext";
import { USER_TYPES } from "../constants/userTypes";
import { useAuth } from "@/context/AuthContext";
import UpdateBanner from "@/app/components/ui/UpdateBanner";
import LayoutContentSkeleton from "../components/ui/reusables/LayoutContentSkeleton";

const adminRoles: string[] = [
  USER_TYPES.SUPER_ADMIN,
  USER_TYPES.PLATFORM_SUBADMIN,
  USER_TYPES.PLATFORM_DATA_OFFICER,
  USER_TYPES.PLATFORM_VIEWER,
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !adminRoles.includes(user.role?.name || ""))) {
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <AdminSidebar />
        <LayoutContentSkeleton />
      </div>
    );
  }

  if (!user || !adminRoles.includes(user.role?.name || "")) {
    return null;
  }

  return (
    <AdminMobileNavProvider>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <UpdateBanner />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </AdminMobileNavProvider>
  );
}
