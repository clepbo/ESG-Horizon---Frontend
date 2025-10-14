"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import api from "@/lib/api/axios";
import { toast } from "react-toastify";

export default function CallbackPage() {
    const router = useRouter();
    const { fetchUserProfile } = useAuth();

    useEffect(() => {
        const handleSocialLogin = async () => {
            const { data, error } = await supabase.auth.getUser();

            if (error || !data?.user) {
                toast.error("Authentication failed");
                router.push("/login");
                return;
            }

            const email = data.user.email;
            const name =
                data.user.user_metadata?.full_name ||
                data.user.user_metadata?.name ||
                "";

            try {
                // Send Supabase user info to backend
                await api.post(
                    "/auth/social",
                    {
                        email,
                        name,
                        provider: "google",
                    },
                    { withCredentials: true }
                );

                // Fetch and store user in AuthContext
                await fetchUserProfile();

                toast.success("Logged in successfully!");
                router.push("/dashboard-esg");
            } catch (err) {
                const message =
                    err?.response?.data?.message ||
                    err?.message ||
                    "Login failed. Please try again.";

                if (message.includes("awaiting approval")) {
                    toast.info(
                        "To ensure platform security, your account is pending a final review by an ESG Horizon administrator. This is typically completed within one business day. You will be notified via your corporate email as soon as it's approved.",
                        { autoClose: 15000 }
                    );
                } else {
                    toast.error(message);
                }

                router.push("/login");
            }
        };

        handleSocialLogin();
    }, [router, fetchUserProfile]);

    return (
        <div className="flex h-screen items-center justify-center">
            <p className="text-gray-600">Signing you in...</p>
        </div>
    );
}
