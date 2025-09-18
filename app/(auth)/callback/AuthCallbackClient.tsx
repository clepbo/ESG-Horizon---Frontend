"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import api from "@/lib/api/axios";
import { User } from "@/services/user.service";
import { toast } from "react-toastify";

export default function AuthCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // ⭐ Check for error parameters in the URL first
        const error = searchParams.get("error_description");
        if (error) {
            toast.error(`Login failed: ${decodeURIComponent(error)}`);
            router.push("/login");
            return;
        }

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === "SIGNED_IN" && session) {
                // ... rest of your logic
                try {
                    const userProfile = await api.get<User>("/users/me");
                    const platformRoles = [
                        "super_admin",
                        "platform_subadmin",
                        "platform_data_officer",
                        "platform_viewer",
                    ];
                    const companyRoles = [
                        "company_esg_admin",
                        "company_esg_subadmin",
                        "company_esg_data_officer",
                        "company_esg_viewer",
                    ];

                    let redirectTo = "/login";
                    const userRoleName = userProfile.role?.name || "";

                    if (platformRoles.includes(userRoleName)) {
                        redirectTo = "/dashboard";
                    } else if (companyRoles.includes(userRoleName)) {
                        redirectTo = "/dashboard-esg";
                    }

                    router.push(redirectTo);
                } catch (profileError) {
                    console.error("Error fetching user profile:", profileError);
                    router.push("/login?error=profile_fetch_failed");
                }
            } else if (event === "SIGNED_OUT") {
                router.push("/login");
            }
            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [router, searchParams]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Finalizing login...</p>
            </div>
        );
    }

    return null;
}
