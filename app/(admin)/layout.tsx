"use client";
import Sidebar from "@/app/components/layout/Sidebar";
import LayoutContent from "../(company)/components/LayoutContent";
import { USER_TYPES } from "../constants/userTypes";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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
            <div className="flex flex-col justify-center items-center h-screen space-y-6 bg-gray-50">
                <style jsx>{`
                    .dots {
                        display: flex;
                        gap: 10px;
                    }
                    .dot {
                        width: 16px;
                        height: 16px;
                        background-color: #3498db;
                        border-radius: 50%;
                        animation: pulse 1.2s infinite ease-in-out;
                    }
                    .dot:nth-child(2) {
                        animation-delay: 0.2s;
                    }
                    .dot:nth-child(3) {
                        animation-delay: 0.4s;
                    }
                    @keyframes pulse {
                        0%,
                        80%,
                        100% {
                            opacity: 0.3;
                            transform: scale(0.8);
                        }
                        40% {
                            opacity: 1;
                            transform: scale(1);
                        }
                    }
                    .loading-text {
                        color: #374151;
                        font-size: 1.25rem;
                        font-weight: 500;
                        animation: fadeIn 1.5s ease forwards;
                        opacity: 0;
                    }
                    @keyframes fadeIn {
                        to {
                            opacity: 1;
                        }
                    }
                `}</style>

                <div
                    className="dots"
                    aria-label="Loading animation"
                    role="status"
                >
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                </div>

                <div className="loading-text">Loading, please wait...</div>
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
