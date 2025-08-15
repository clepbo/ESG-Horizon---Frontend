"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { verifyToken } from "./utils/verifyToken";
import { USER_TYPES } from "@/app/constants/userTypes";

export default function LayoutContent({ children, role }: { children: React.ReactNode , role: string}) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function checkAuth() {
            const token = localStorage.getItem("accessToken");
            if (!token) {
                console.log("No token")
                router.push("/login");
                return;
            }

            const payload = await verifyToken(token, process.env.NEXT_PUBLIC_JWT_SECRET!);
            // console.log("PAYLOAD", payload)
            if (!payload) {
                console.log("No payload")
                router.push("/login");
                return;
            }

            // 3️⃣ Check role from token or localStorage
            
            if(role === USER_TYPES.SUPER_ADMIN){
                if(payload.role !== USER_TYPES.SUPER_ADMIN){
                    
                    router.push("/login")
                }
            }

            setLoading(false);
        }

        checkAuth();
    }, [role]);

   
    if (loading) return <div>Loading...</div>;

    return <main className={`${
        role === USER_TYPES.ESG_ADMIN || 
        role === USER_TYPES.ESG_EDITOR || 
        role === USER_TYPES.ESG_SUB_ADMIN || 
        role === USER_TYPES.ESG_VIEWER
         ? "flex-1 overflow-y-auto bg-gray-50" : "flex-1 overflow-y-auto bg-gray-50"}`}>{children}</main>;
}
