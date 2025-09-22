"use client";

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import api, { setLoginState } from "../lib/api/axios";
import { registerLogout } from "@/lib/utils";
import { toast } from "react-toastify";
import { User } from "@/services/user.service";
import { AxiosError } from "axios";
import Cookies from "js-cookie";
import { supabase } from "@/lib/supabase";

export type SignupData = {
    id?: number;
    name: string;
    industryId: number;
    full_name: string;
    email: string;
    password: string;
};
type InviteUserData = {
    first_name: string;
    last_name: string;
    phone_number?: string;
    password: string;
};

type AuthContextType = {
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (formData: SignupData) => Promise<void>;
    inviteUser: (formData: InviteUserData & { token: string }) => Promise<void>;
    validateInviteToken: (
        token: string
    ) => Promise<{ responseToken: string; status: string } | null>;
    logout: () => Promise<void>;
    fetchUserProfile: () => Promise<User | null>;
    socialLogin: (provider: "google") => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(
    undefined
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    const fetchUserProfile = useCallback(async () => {
        try {
            const profile = await api.get<User>("/users/me");
            setLoginState(true);
            setUser(profile);
            return profile;
        } catch {
            setUser(null);
            setLoginState(false);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const res = await api.post("/auth/login", { email, password });

            if (res && res.user?.email && res.user.email === email) {
                setLoginState(true);
                await fetchUserProfile();
            } else {
                throw new Error("Invalid login response");
            }
        } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            console.log(
                "Login error caught in AuthContext:",
                axiosError?.response?.data
            );
            const message =
                axiosError?.response?.data?.message || "Login failed";

            setLoginState(false);
            throw new Error(message);
        }
    };

    const signup = async (formData: SignupData) => {
        try {
            await api.post("/company/esg/signup", formData);
        } catch (err) {
            throw err;
        }
    };

    const inviteUser = async (formData: InviteUserData & { token: string }) => {
        await api.post("/esg/auth/invite-user", formData);
        await fetchUserProfile();
    };

    const validateInviteToken = async (
        token: string
    ): Promise<{ responseToken: string; status: string } | null> => {
        try {
            const data = await api.get(`company/esg/invitations/${token}`);
            return {
                responseToken: data.token,
                status: data.status,
            };
        } catch (error) {
            console.error("Failed to validate token:", error);
            return null;
        }
    };

    const logout = useCallback(async () => {
        await supabase.auth.signOut();
        await api.post("/auth/logout");
        setUser(null);

        setLoginState(false);

        if (typeof window !== "undefined") {
            localStorage.removeItem("lastVisitedPage_name");
            localStorage.removeItem("lastVisitedPage_role");
            localStorage.removeItem("lastVisitedPage_page");
            localStorage.setItem("esg-tour-completed", "false");
        }

        toast.dark("Logged out", { autoClose: 1000});
    }, []);

    const socialLogin = async (provider: "google") => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: provider,
            options: {
                redirectTo: `${window.location.origin}/callback`,
            },
        });

        if (error) {
            toast.error(error.message);
            console.error("Social login error:", error);
        }
    };

    useEffect(() => {
        registerLogout(logout);
    }, [logout]);

    useEffect(() => {
        const accessToken = Cookies.get("accessToken");
        const storedLoginState =
            typeof window !== "undefined"
                ? localStorage.getItem("isLoggedIn") === "true"
                : false;

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                Cookies.set("supabase-access-token", session.access_token);
            }
        });

        if (loading && (accessToken || storedLoginState)) {
            fetchUserProfile();
        } else if (loading) {
            setLoading(false);
        }

        if (!loading) {
            const isPublicPage = [
                "/login",
                "/signup",
                "/esg/auth/signup",
                "/forgot-password",
                "/verify-email",
                "/reset-password",
                "/callback"
            ].some((p) => pathname.startsWith(p));

            if (!user) {
                // Not authenticated, redirect to login page if not already on a public page
                if (!isPublicPage) {
                    router.push("/login");
                }
            } else {
                // Authenticated, determine the correct dashboard and redirect if not already there
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

                let redirectTo = "";
                if (platformRoles.includes(user.role?.name || "")) {
                    redirectTo = "/dashboard";
                } else if (companyRoles.includes(user.role?.name || "")) {
                    redirectTo = "/dashboard-esg";
                } else {
                    redirectTo = "/login";
                }

                // Only redirect if the user is on a public page or on an invalid page for their role
                if (
                    isPublicPage ||
                    !isPageValidForRole(pathname, String(user.role?.name))
                ) {
                    router.push(redirectTo);
                }
            }
        }
        return () => subscription.unsubscribe();
    }, [user, loading, router, pathname, fetchUserProfile]);

    const isPageValidForRole = (page: string, role: string): boolean => {
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
        const platformPagePrefixes = [
            "/dashboard",
            "/billing",
            "/company",
            "/reports",
            "/settings",
        ];
        const companyPagePrefixes = [
            "/dashboard-esg",
            "/assessments",
            "/ranking",
            "/settings-esg",
            "/reports-and-analytics",
            "/teams-esg",
        ];
        if (platformRoles.includes(role)) {
            return platformPagePrefixes.some((prefix) =>
                page.startsWith(prefix)
            );
        }
        if (companyRoles.includes(role)) {
            return companyPagePrefixes.some((prefix) =>
                page.startsWith(prefix)
            );
        }
        return false;
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                loading,
                login,
                signup,
                inviteUser,
                validateInviteToken,
                logout,
                fetchUserProfile,
                socialLogin,
            }}
        >
            {/* {loading ? <div className="p-8">Loading...</div> : children} */}
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context)
        throw new Error("useAuth must be used inside an AuthProvider");
    return context;
};
