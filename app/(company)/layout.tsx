"use client";
import React from "react";
import Sidebar from "./components/Sidebar";
import LayoutContent from "./components/LayoutContent";
import { USER_TYPES } from "../constants/userTypes";
import { useAuth } from "@/context/AuthContext";

const companyEsgRoles = [
    USER_TYPES.COMPANY_ESG_ADMIN,
    USER_TYPES.COMPANY_ESG_SUBADMIN,
    USER_TYPES.COMPANY_ESG_DATA_OFFICER,
    USER_TYPES.COMPANY_ESG_VIEWER,
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user } = useAuth();

    const roleForLayout =
        user && companyEsgRoles.includes(user.role?.name || "")
            ? user.role?.name
            : USER_TYPES.COMPANY_ESG_ADMIN;
    return (
        <div className="flex h-screen overflow-hidden bg-grey-50">
            <Sidebar />
            <LayoutContent role={String(roleForLayout)}>
                {children}
            </LayoutContent>
        </div>
    );
}
