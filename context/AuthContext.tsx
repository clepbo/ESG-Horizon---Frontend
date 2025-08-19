"use client";

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
} from "react";
import { useRouter } from "next/navigation";
import api from "../lib/api/axios";
import { registerLogout } from "@/lib/utils";

export type User = {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role?: { name: string };
    company?: string;
    profile_photo_url: string | null;
    phone_number: string;
    department: string;
    job_title: string;
};
type SignupData = {
    id: number;
    name: string;
    industry: string;
    company_logo_url: string;
    address: string;
    isoCountryCode: string;
    website?: string;
    contact_email: string;
    contact_phone: string;
    description?: string;
    registration_number: string;
    staff: string;
};
type InviteUserData = {
    first_name: string;
    last_name: string;
    phone_number?: string;
    password: string;
};

type AuthContextType = {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (formData: SignupData) => Promise<void>;
    inviteUser: (formData: InviteUserData & { token: string }) => Promise<void>;
    validateInviteToken: (token: string) => Promise<boolean>;
    logout: () => Promise<void>;
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

    const fetchUserProfile = useCallback(async () => {
        try {
            const profile = await api.get<User>("/users/me");
            setUser(profile);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleAuthSuccess = async () => {
        try {
            const profile = await api.get<User>("/users/me");
            setUser(profile);

            let redirectTo = localStorage.getItem("lastVisitedPage") || "";

            localStorage.removeItem("lastVisitedPage");

            if (!redirectTo) {
                redirectTo =
                    profile.role?.name === "super_admin"
                        ? "/dashboard"
                        : "/dashboard-esg";
            }

            router.push(redirectTo);
        } catch {
            setUser(null);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            await api.post("/auth/login", { email, password });
            await handleAuthSuccess();
        } catch (error) {
            throw error;
        }
    };

    const signup = async (formData: SignupData) => {
        await api.post("/company/esg/signup", formData);
        await handleAuthSuccess();
    };

    const inviteUser = async (formData: InviteUserData & { token: string }) => {
        await api.post("/esg/auth/invite-user", formData);
        await handleAuthSuccess();
    };

    const validateInviteToken = async (token: string): Promise<boolean> => {
        try {
            const { valid } = await api.get<{ valid: boolean }>(
                `/esg/auth/validate-invite?token=${token}`
            );
            return valid;
        } catch {
            return false;
        }
    };

    const logout = useCallback(async () => {
        await api.post("/auth/logout");
        setUser(null);
        router.push("/login");
    }, [router]);

    useEffect(() => {
        registerLogout(logout);
    }, [logout]);

    useEffect(() => {
        fetchUserProfile();
    }, [fetchUserProfile]);

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                signup,
                inviteUser,
                validateInviteToken,
                logout,
            }}
        >
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
