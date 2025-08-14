"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { verifyToken } from "./utils/verifyToken";
import { CurrentUserDto } from "./types/CurrentUser.types";
import { USER_TYPES } from "@/app/constants/userTypes";

export default function LayoutContent({ children, role }: { children: React.ReactNode , role: string}) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function checkAuth() {
            const token = localStorage.getItem("accessToken");
            if (!token) {
                router.push("/login");
                return;
            }

            // 2️⃣ Verify token
            const payload = await verifyToken(token, process.env.NEXT_PUBLIC_JWT_SECRET!);
            if (!payload) {
                router.push("/login");
                return;
            }

            // 3️⃣ Check role from token or localStorage
            const storedUser = localStorage.getItem("currentUser");
            const user: CurrentUserDto | null = storedUser ? JSON.parse(storedUser) : null;
             console.log("USER...", user)

            if (!user || user.role === "investor") {
                router.push("/login");
                return;
            }
            if(role === USER_TYPES.SUPER_ADMIN){
                if(user.role !== USER_TYPES.SUPER_ADMIN){
                    
                    router.push("/login")
                }
            }

            setLoading(false);
        }

        checkAuth();
    }, []);

   
    if (loading) return <div>Loading...</div>;

    return <main className={`${
        role === USER_TYPES.ESG_ADMIN || 
        role === USER_TYPES.ESG_EDITOR || 
        role === USER_TYPES.ESG_SUB_ADMIN || 
        role === USER_TYPES.ESG_VIEWER
         ? "flex-1 overflow-y-auto bg-gray-50" : "flex-1 overflow-y-auto bg-gray-50"}`}>{children}</main>;
}
