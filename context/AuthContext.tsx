"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  company: string;
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
  const router = useRouter();

  /** 🔹 Load user from localStorage on mount */
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("currentUser");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error loading user from localStorage:", error);
      localStorage.removeItem("currentUser");
    }
  }, []);

  /** 🔹 Unified API request helper */
  const apiRequest = async (endpoint: string, options?: RequestInit) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
      ...options,
    });

    if (!res.ok) {
      const errorMsg = await res.text();
      throw new Error(errorMsg || `Request failed: ${res.status}`);
    }

    return res.json();
  };

  /** 🔹 Token expiration check */
  const isTokenExpired = (token: string) => {
    try {
      const { exp } = JSON.parse(atob(token.split(".")[1]));
      return Date.now() >= exp * 1000;
    } catch {
      return true;
    }
  };

  /** 🔹 Refresh token logic */
  const refreshAccessToken = useCallback(async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return logout();

    try {
      const { accessToken } = await apiRequest("/auth/refresh", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      });
      localStorage.setItem("accessToken", accessToken);
      document.cookie = `token=${accessToken}; path=/; max-age=86400`;
      return accessToken;
    } catch {
      logout();
    }
  }, []);

  /** 🔹 Handle successful login/signup */
  const handleAuthSuccess = (
    accessToken: string,
    refreshToken: string,
    user: User
  ) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("currentUser", JSON.stringify(user));
    document.cookie = `token=${accessToken}; path=/; max-age=86400`;

    setUser(user);

    const lastVisited = localStorage.getItem("lastVisited");
    if (lastVisited) {
      router.push(lastVisited);
    } else {
      router.push(
        user.role === "SUPER_ADMIN" ? "/dashboard" : "/dashboard-esg"
      );
    }
  };

  /** 🔹 Login */
  const login = async (email: string, password: string) => {
    const { accessToken, refreshToken, user } = await apiRequest(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }
    );
    handleAuthSuccess(accessToken, refreshToken, user);
  };

  /** 🔹 Signup */
  const signup = async (formData: SignupData) => {
    const { accessToken, refreshToken, user } = await apiRequest(
      "/esg/auth/signup",
      {
        method: "POST",
        body: JSON.stringify(formData),
      }
    );
    handleAuthSuccess(accessToken, refreshToken, user);
  };

  /** 🔹 Invite user */
  const inviteUser = async (formData: InviteUserData & { token: string }) => {
    const { accessToken, refreshToken, user } = await apiRequest(
      "/esg/auth/invite-user",
      {
        method: "POST",
        body: JSON.stringify(formData),
      }
    );
    handleAuthSuccess(accessToken, refreshToken, user);
  };

  /** 🔹 Validate invite token */
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

  /** 🔹 Logout */
  const logout = () => {
    setUser(null);
    localStorage.clear();
    document.cookie = "token=; Max-Age=0; path=/";
    router.push("/login");
  };

  /** 🔹 Auto-refresh token if expired before requests */
  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem("accessToken");
      if (token && isTokenExpired(token)) {
        await refreshAccessToken();
      }
    };
    checkToken();
  }, [refreshAccessToken]);

  return (
    <AuthContext.Provider
      value={{ user, login, signup, inviteUser, validateInviteToken, logout }}
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
