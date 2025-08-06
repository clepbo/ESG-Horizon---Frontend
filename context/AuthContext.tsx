// "use client";

// import { createContext, useContext, useState, useEffect } from "react";
// import { useRouter } from "next/navigation";

// type User = {
//   id: number;
//   email: string;
//   first_name: string;
//   last_name: string;
//   role: string;
//   company: string;
// };

// type AuthContextType = {
//   user: User | null;
//   login: (email: string, password: string) => Promise<void>;
//   logout: () => void;
// };

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export function AuthProvider({ children }: { children: React.ReactNode }) {
//   const [user, setUser] = useState<User | null>(null);
//   const router = useRouter();

//   useEffect(() => {
//     const storedUser = localStorage.getItem("currentUser");
//     if (storedUser) {
//       setUser(JSON.parse(storedUser));
//     }
//   }, []);

//   const login = async (email: string, password: string) => {
//     try {
//       const res = await fetch(
//         "https://esghorizon-engine.up.railway.app/auth/login",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ email, password }),
//         }
//       );

//       if (!res.ok) {
//         throw new Error("Invalid credentials");
//       }

//       const data = await res.json();

//       const { accessToken, refreshToken, user } = data;

//       // Save tokens and user info
//       localStorage.setItem("accessToken", accessToken);
//       localStorage.setItem("refreshToken", refreshToken);
//       localStorage.setItem("currentUser", JSON.stringify(user));

//       // Set cookie for middleware auth check
//       document.cookie = `token=${accessToken}; path=/; max-age=86400`; // 1 day

//       setUser(user);

//       // Route by role
//       const lastVisited = localStorage.getItem("lastVisited");
//       if (lastVisited) {
//         router.push(lastVisited);
//       } else {
//         if (user.role === "SUPER_ADMIN") {
//           router.push("/dashboard");
//         } else if (user.role === "ESG_Manager") {
//           router.push("/dashboard-esg");
//         } else {
//           router.push("/login");
//         }
//       }
//     } catch (error: any) {
//       throw new Error(error?.message || "Login failed");
//     }
//   };

//   const logout = () => {
//     setUser(null);
//     localStorage.removeItem("currentUser");
//     localStorage.removeItem("accessToken");
//     localStorage.removeItem("refreshToken");

//     // Clear cookie
//     document.cookie = "token=; Max-Age=0; path=/";

//     router.push("/login");
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
//   return ctx;
// }
"use client";

import { createContext, useContext, useState, useEffect } from "react";
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

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (formData: SignupData) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  // useEffect(() => {
  //   const storedUser = localStorage.getItem("currentUser");
  //   if (storedUser) {
  //     setUser(JSON.parse(storedUser));
  //   }
  // }, []);
  // useEffect(() => {
  //   try {
  //     const storedUser = localStorage.getItem("currentUser");
  //     if (storedUser) {
  //       setUser(JSON.parse(storedUser));
  //     }
  //   } catch (error) {
  //     console.error("Error parsing currentUser from localStorage:", error);
  //     localStorage.removeItem("currentUser"); // clear corrupted data
  //   }
  // }, []);
  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        const storedUser = localStorage.getItem("currentUser");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser); // Optionally cast: setUser(parsedUser as UserType);
        }
      } catch (error) {
        console.error("Error parsing currentUser from localStorage:", error);
        localStorage.removeItem("currentUser");
      }
    };

    loadUserFromStorage();
  }, []);

  const handleAuthSuccess = (
    accessToken: string,
    refreshToken: string,
    user: User
  ) => {
    // Save tokens and user info
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("currentUser", JSON.stringify(user));

    // Set cookie for middleware auth check
    document.cookie = `token=${accessToken}; path=/; max-age=86400`; // 1 day

    setUser(user);

    // Route by role
    const lastVisited = localStorage.getItem("lastVisited");
    if (lastVisited) {
      router.push(lastVisited);
    } else {
      if (user.role === "SUPER_ADMIN") {
        router.push("/dashboard");
      } else {
        router.push("/dashboard-esg");
      }
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(
        "https://esghorizon-engine.up.railway.app/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!res.ok) throw new Error("Invalid credentials");

      const { accessToken, refreshToken, user } = await res.json();
      handleAuthSuccess(accessToken, refreshToken, user);
    } catch (error: any) {
      throw new Error(error?.message || "Login failed");
    }
  };

  const signup = async (formData: SignupData) => {
    try {
      const res = await fetch(
        "https://esghorizon-engine.up.railway.app/esg/auth/signup",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (!res.ok) throw new Error("Signup failed");

      const { accessToken, refreshToken, user } = await res.json();
      handleAuthSuccess(accessToken, refreshToken, user);
    } catch (error: any) {
      throw new Error(error?.message || "Signup failed");
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("currentUser");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    // Clear cookie
    document.cookie = "token=; Max-Age=0; path=/";

    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
