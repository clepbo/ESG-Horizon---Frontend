"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";

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

export type Company = {
  id: number;
  name: string;
  industry: string;
  company_logo_url: string;
  address: string;
  country: string;
  website?: string;
  contact_email: string;
  contact_phone: string;
  description?: string;
  registration_number: string;
  staff: string;
};

type SignupData = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  company_name: string;
  registration_number: string;
  industry_type: string;
  address: string;
  contact_email: string;
  contact_phone: string;
  company_website: string;
};

type InviteUserData = {
  password: string;
  first_name: string;
  last_name: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (formData: SignupData) => Promise<void>;
  inviteUser: (formData: InviteUserData & { token: string }) => Promise<void>;
  validateInviteToken: (token: string) => Promise<boolean>;
  logout: () => void;
};

const API_BASE = "https://esghorizon-engine.up.railway.app";
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  /** Get tokens from storage */
  const getAccessToken = () => localStorage.getItem("accessToken");
  const getRefreshToken = () => localStorage.getItem("refreshToken");

  /** Decode JWT */
  const decodeToken = (token: string) => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch {
      return null;
    }
  };

  /** Check if token is expired */
  const isTokenExpired = (token: string) => {
    const decoded = decodeToken(token);
    return !decoded || Date.now() >= decoded.exp * 1000;
  };

  /** Refresh access token */
  const refreshAccessToken = useCallback(async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return logout();

    try {
      const { accessToken } = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      }).then((r) => r.json());

      localStorage.setItem("accessToken", accessToken);
      document.cookie = `token=${accessToken}; path=/; max-age=86400`;
      return accessToken;
    } catch {
      logout();
    }
  }, []);

  /** API request helper with token refresh */
  const apiRequest = async (endpoint: string, options?: RequestInit) => {
    let token = getAccessToken();
    if (token && isTokenExpired(token)) {
      token = await refreshAccessToken();
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options?.headers || {}),
      },
      ...options,
    });

    if (!res.ok) {
      let errorMessage = `Request failed: ${res.status}`;

      try {
        // Try to parse JSON
        const errorData = await res.json();
        if (errorData?.message) {
          errorMessage = errorData.message;
        }
        console.error("API Error:", errorData); // Debug log
      } catch {
        // Fallback if response is not JSON
        const text = await res.text();
        if (text) errorMessage = text;
      }

      throw new Error(errorMessage);
    }

    return res.json();
  };

  /** Fetch logged-in user profile */
  const fetchUserProfile = useCallback(async () => {
    try {
      const token = getAccessToken();
      if (!token) return;
      if (isTokenExpired(token)) await refreshAccessToken();

      const profile = await apiRequest("/user/me");
      setUser(profile);
    } catch (err) {
      console.error("Error fetching profile:", err);
      logout();
    } finally {
      setLoading(false);
    }
  }, [refreshAccessToken]);

  /** Handle successful auth (login/signup/invite) */
  const handleAuthSuccess = async (
    accessToken: string,
    refreshToken: string
  ) => {
    // Save tokens
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    document.cookie = `token=${accessToken}; path=/; max-age=86400`;

    const lastVisited = localStorage.getItem("lastVisited");

    try {
      // Make sure we have a fresh token if needed
      const token = getAccessToken();
      if (isTokenExpired(token!)) {
        await refreshAccessToken();
      }

      // Get profile and set user
      const profile = await apiRequest("/user/me");
      setUser(profile);

      // Role-based redirect
      const roleName = profile?.role?.name;
      if (roleName === "super_admin") {
        router.push(lastVisited || "/dashboard");
      } else {
        router.push(lastVisited || "/dashboard-esg");
      }
    } catch (err) {
      console.error("Error fetching profile after auth:", err);

      // Fallback to decoding token if profile fails
      const decoded = decodeToken(accessToken);
      const roleName = decoded?.role?.name || decoded?.role || "UNKNOWN_ROLE";

      if (roleName === "SUPER_ADMIN") {
        router.push(lastVisited || "/dashboard");
      } else {
        router.push(lastVisited || "/dashboard-esg");
      }
    }
  };

  /** Login */
  const login = async (email: string, password: string) => {
    const { accessToken, refreshToken } = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    handleAuthSuccess(accessToken, refreshToken);
  };

  /** Signup */
  const signup = async (formData: SignupData) => {
    const { accessToken, refreshToken } = await apiRequest("/esg/auth/signup", {
      method: "POST",
      body: JSON.stringify(formData),
    });
    handleAuthSuccess(accessToken, refreshToken);
  };

  /** Invite user signup */
  const inviteUser = async (formData: InviteUserData & { token: string }) => {
    const { accessToken, refreshToken } = await apiRequest(
      "/esg/auth/invite-user",
      {
        method: "POST",
        body: JSON.stringify(formData),
      }
    );
    handleAuthSuccess(accessToken, refreshToken);
  };

  /** Validate invite token */
  const validateInviteToken = async (token: string): Promise<boolean> => {
    try {
      const { valid } = await apiRequest(
        `/esg/auth/validate-invite?token=${token}`
      );
      return valid;
    } catch {
      return false;
    }
  };

  /** Logout */
  const logout = () => {
    setUser(null);
    setLoading(false);

    // Remove only auth-related items
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    // Optionally clear lastVisited if you don't want it saved
    localStorage.removeItem("lastVisited");

    // Clear auth cookie
    document.cookie = "token=; Max-Age=0; path=/";

    router.push("/login");
  };

  /** On mount, fetch profile */
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
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
