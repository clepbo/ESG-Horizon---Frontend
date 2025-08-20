"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface LayoutContentProps {
    children: React.ReactNode;
    role: string;
}

export default function LayoutContent({ children, role }: LayoutContentProps) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push("/login");
                return;
            }
            if (user.role?.name !== role) {
                router.push("/login");
                return;
            }
        }
    }, [loading, user, role, router]);

    if (loading || !user)
        return (
            <div className="flex items-center p-10 space-x-4">
                <style jsx>{`
                    .spinner {
                        border: 8px solid #f3f3f3;
                        border-top: 8px solid #3498db;
                        border-radius: 50%;
                        width: 40px;
                        height: 40px;
                        animation: spin 1.5s linear infinite;
                    }
                    @keyframes spin {
                        0% {
                            transform: rotate(0deg);
                        }
                        100% {
                            transform: rotate(360deg);
                        }
                    }
                `}</style>
                <div className="spinner"></div>
                <div className="text-gray-700 text-lg font-medium">
                    Loading.. Please wait
                </div>
            </div>
        );

    return (
        <main className="flex-1 overflow-y-auto bg-gray-50">{children}</main>
    );
}
