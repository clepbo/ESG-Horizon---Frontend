"use client";
import Sidebar from "@/app/components/layout/Sidebar";
import LayoutContent from "../(company)/components/LayoutContent";
import { USER_TYPES } from "../constants/userTypes";
import { useAuth } from "@/context/AuthContext";

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
    const { user } = useAuth();

    const roleForLayout =
        user && companyAdminRoles.includes(user.role?.name || "")
            ? user.role?.name
            : USER_TYPES.SUPER_ADMIN;
    return (
        <div className="flex h-screen overflow-hidden bg-grey-50">
            <Sidebar />
            <LayoutContent role={String(roleForLayout)}>
                {children}
            </LayoutContent>
        </div>
    );
}
