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

export type SignupData = {
    id?: number;
    name: string;
    industryId: number;
    company_logo_url: string;
    address: string;
    isoCountryCode: string;
    website?: string;
    contact_email: string;
    contact_phone: string;
    description?: string;
    registration_number: string;
    staff_strength: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
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
        await api.post("/auth/logout");
        setUser(null);

        setLoginState(false);

        if (typeof window !== "undefined") {
            localStorage.removeItem("lastVisitedPage_name");
            localStorage.removeItem("lastVisitedPage_role");
            localStorage.removeItem("lastVisitedPage_page");
        }

        toast.dark("Logged out");
    }, []);

    useEffect(() => {
        registerLogout(logout);
    }, [logout]);

    useEffect(() => {
        const accessToken = Cookies.get("accessToken");
        const storedLoginState =
            typeof window !== "undefined"
                ? localStorage.getItem("isLoggedIn") === "true"
                : false;

        // On initial load, try to fetch the user profile if a token exists
        if (loading && (accessToken || storedLoginState)) {
            fetchUserProfile();
        } else if (loading) {
            // No token or stored state, so we're done loading.
            setLoading(false);
        }

        // After loading is complete, handle redirection based on user state
        if (!loading) {
            const isPublicPage = ["/login", "/signup", "/invite"].some((p) =>
                pathname.startsWith(p)
            );

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
    }, [user, loading, router, pathname, fetchUserProfile]);

    // Helper function to check if a page is valid for the user's role
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
            }}
        >
            {loading ? <div>Loading...</div> : children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context)
        throw new Error("useAuth must be used inside an AuthProvider");
    return context;
};

// "use client";

// import React, {
//     createContext,
//     useContext,
//     useState,
//     useEffect,
//     useCallback,
// } from "react";
// import { useRouter } from "next/navigation";
// import api, { setLoginState } from "../lib/api/axios";
// import { registerLogout } from "@/lib/utils";
// import { toast } from "react-toastify";
// import { User } from "@/services/user.service";
// import { AxiosError } from "axios";
// import Cookies from "js-cookie";

// export type SignupData = {
//     id?: number;
//     name: string;
//     industryId: number;
//     company_logo_url: string;
//     address: string;
//     isoCountryCode: string;
//     website?: string;
//     contact_email: string;
//     contact_phone: string;
//     description?: string;
//     registration_number: string;
//     staff_strength: string;
//     first_name: string;
//     last_name: string;
//     email: string;
//     phone_number: string;
//     password: string;
// };
// type InviteUserData = {
//     first_name: string;
//     last_name: string;
//     phone_number?: string;
//     password: string;
// };

// type AuthContextType = {
//     user: User | null;
//     setUser: React.Dispatch<React.SetStateAction<User | null>>;
//     loading: boolean;
//     login: (email: string, password: string) => Promise<void>;
//     signup: (formData: SignupData) => Promise<void>;
//     inviteUser: (formData: InviteUserData & { token: string }) => Promise<void>;
//     validateInviteToken: (
//         token: string
//     ) => Promise<{ responseToken: string; status: string } | null>;
//     logout: () => Promise<void>;
//     fetchUserProfile: () => Promise<User | null>;
// };

// export const AuthContext = createContext<AuthContextType | undefined>(
//     undefined
// );

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
//     children,
// }) => {
//     const [user, setUser] = useState<User | null>(null);
//     const [loading, setLoading] = useState(true);
//     const router = useRouter();

//     const fetchUserProfile = useCallback(async () => {
//         try {
//             const profile = await api.get<User>("/users/me");
//             setLoginState(true);
//             setUser(profile);
//             return profile;
//         } catch {
//             setUser(null);
//             setLoginState(false);
//             return null;
//         } finally {
//             setLoading(false);
//         }
//     }, []);

//     const handleAuthSuccess = async () => {
//         try {
//             const profile = await fetchUserProfile();

//             let storedName = "",
//                 storedRole = "",
//                 storedPage = "";
//             if (typeof window !== "undefined") {
//                 storedName = localStorage.getItem("lastVisitedPage_name") || "";
//                 storedRole = localStorage.getItem("lastVisitedPage_role") || "";
//                 storedPage = localStorage.getItem("lastVisitedPage_page") || "";
//             }

//             const platformRoles = [
//                 "super_admin",
//                 "platform_subadmin",
//                 "platform_data_officer",
//                 "platform_viewer",
//             ];
//             const companyRoles = [
//                 "company_esg_admin",
//                 "company_esg_subadmin",
//                 "company_esg_data_officer",
//                 "company_esg_viewer",
//             ];

//             const platformPagePrefixes = [
//                 "/dashboard",
//                 "/billing",
//                 "/company",
//                 "/reports",
//                 "/settings",
//             ];

//             const companyPagePrefixes = [
//                 "/dashboard-esg",
//                 "/assessments",
//                 "/ranking",
//                 "/settings-esg",
//                 "/reports-and-analytics",
//                 "/teams-esg",
//             ];

//             const isPageValidForRole = (
//                 page: string,
//                 role: string
//             ): boolean => {
//                 if (platformRoles.includes(role)) {
//                     return platformPagePrefixes.some((prefix) =>
//                         page.startsWith(prefix)
//                     );
//                 }
//                 if (companyRoles.includes(role)) {
//                     return companyPagePrefixes.some((prefix) =>
//                         page.startsWith(prefix)
//                     );
//                 }
//                 return false;
//             };

//             let redirectTo = "";

//             if (
//                 storedName === profile?.email &&
//                 storedRole === profile?.role?.name &&
//                 storedPage &&
//                 isPageValidForRole(storedPage, storedRole)
//             ) {
//                 redirectTo = storedPage;
//             } else {
//                 if (typeof window !== "undefined") {
//                     localStorage.removeItem("lastVisitedPage_name");
//                     localStorage.removeItem("lastVisitedPage_role");
//                     localStorage.removeItem("lastVisitedPage_page");
//                 }
//             }

//             if (!redirectTo) {
//                 if (platformRoles.includes(profile?.role?.name || "")) {
//                     redirectTo = "/dashboard";
//                 } else if (companyRoles.includes(profile?.role?.name || "")) {
//                     redirectTo = "/dashboard-esg";
//                 } else {
//                     redirectTo = "/login";
//                 }
//             }

//             router.push(redirectTo);
//         } catch (error) {
//             console.error("handleAuthSuccess error:", error);
//             setUser(null);
//         }
//     };

//     const login = async (email: string, password: string) => {
//         try {
//             const res = await api.post("/auth/login", { email, password });

//             if (res && res.user?.email && res.user.email === email) {
//                 setLoginState(true);
//                 await handleAuthSuccess();
//             } else {
//                 throw new Error("Invalid login response");
//             }
//         } catch (error) {
//             const axiosError = error as AxiosError<{ message: string }>;
//             console.log(
//                 "Login error caught in AuthContext:",
//                 axiosError?.response?.data
//             );
//             const message =
//                 axiosError?.response?.data?.message || "Login failed";

//             setLoginState(false);
//             throw new Error(message);
//         }
//     };

//     const signup = async (formData: SignupData) => {
//         try {
//             await api.post("/company/esg/signup", formData);
//         } catch (err) {
//             throw err;
//         }
//     };

//     const inviteUser = async (formData: InviteUserData & { token: string }) => {
//         await api.post("/esg/auth/invite-user", formData);
//         await handleAuthSuccess();
//     };

//     const validateInviteToken = async (
//         token: string
//     ): Promise<{ responseToken: string; status: string } | null> => {
//         try {
//             const data = await api.get(`company/esg/invitations/${token}`);
//             return {
//                 responseToken: data.token,
//                 status: data.status,
//             };
//         } catch (error) {
//             console.error("Failed to validate token:", error);
//             return null;
//         }
//     };

//     const logout = useCallback(async () => {
//         await api.post("/auth/logout");
//         setUser(null);

//         setLoginState(false);

//         if (typeof window !== "undefined") {
//             localStorage.removeItem("lastVisitedPage_name");
//             localStorage.removeItem("lastVisitedPage_role");
//             localStorage.removeItem("lastVisitedPage_page");
//         }

//         toast.dark("Logged out");
//         router.push("/login");
//     }, [router]);

//     useEffect(() => {
//         registerLogout(logout);
//     }, [logout]);

//     useEffect(() => {
//         const accessToken = Cookies.get("accessToken");
//         const storedLoginState =
//             typeof window !== "undefined"
//                 ? localStorage.getItem("isLoggedIn") === "true"
//                 : false;

//         if (accessToken && storedLoginState) {
//             fetchUserProfile();
//         } else {
//             setUser(null);
//             setLoading(false);
//             setLoginState(false);
//             Cookies.remove("accessToken");
//         }
//     }, [fetchUserProfile]);

//     return (
//         <AuthContext.Provider
//             value={{
//                 user,
//                 setUser,
//                 loading,
//                 login,
//                 signup,
//                 inviteUser,
//                 validateInviteToken,
//                 logout,
//                 fetchUserProfile,
//             }}
//         >
//             {children}
//         </AuthContext.Provider>
//     );
// };

// export const useAuth = (): AuthContextType => {
//     const context = useContext(AuthContext);
//     if (!context)
//         throw new Error("useAuth must be used inside an AuthProvider");
//     return context;
// };
