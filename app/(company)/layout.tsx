"use client";
import React from "react";
import Sidebar from "./components/Sidebar";
import LayoutContent from "./components/LayoutContent";
import TaskNotificationProvider from "./components/TaskNotificationProvider";
import { USER_TYPES } from "../constants/userTypes";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LayoutContentSkeleton from "../components/ui/reusables/LayoutContentSkeleton";

const companyEsgRoles = [
  USER_TYPES.COMPANY_ESG_ADMIN,
  USER_TYPES.COMPANY_ESG_SUBADMIN,
  USER_TYPES.COMPANY_ESG_DATA_OFFICER,
  USER_TYPES.COMPANY_ESG_VIEWER,
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user || !companyEsgRoles.includes(user.role?.name || "")) {
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

  if (!user || !companyEsgRoles.includes(user.role?.name || "")) {
    return null;
  }
  if (!user.role?.name) {
    return null;
  }

  const roleName = user.role.name;

  return (
    <div className="flex h-screen overflow-hidden bg-grey-50">
      <Sidebar />
      <TaskNotificationProvider>
        <LayoutContent role={roleName}>{children}</LayoutContent>
      </TaskNotificationProvider>
    </div>
  );
}
