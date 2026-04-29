"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft, ShieldOff } from "lucide-react";

interface ForbiddenContextValue {
  /** Call this to show the 403 Access Denied screen */
  setForbidden: (message?: string) => void;
  /** Call this to clear the 403 state (e.g. on navigation) */
  clearForbidden: () => void;
  isForbidden: boolean;
}

const ForbiddenContext = createContext<ForbiddenContextValue>({
  setForbidden: () => {},
  clearForbidden: () => {},
  isForbidden: false,
});

export const useForbidden = () => useContext(ForbiddenContext);

function AccessDeniedScreen() {
  const router = useRouter();

  return (
    <div className="flex h-screen bg-[#F2FBF3] overflow-hidden">
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
          <ShieldOff className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Access Denied</h2>
        <p className="text-sm text-gray-900 text-center max-w-md">
          You do not have enough permission to view this resource. If you think this is a mistake,
          contact your company or platform admin.
        </p>
        <button
          onClick={() => router.back()}
          className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#119B95] text-white text-sm font-medium hover:bg-[#0e8680] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
      </div>
    </div>
  );
}

export function ForbiddenProvider({ children }: { children: ReactNode }) {
  const [isForbidden, setIsForbidden] = useState(false);
  const [message, setMessage] = useState<string | undefined>();
  const pathname = usePathname();

  const setForbidden = useCallback((msg?: string) => {
    setMessage(msg);
    setIsForbidden(true);
  }, []);

  const clearForbidden = useCallback(() => {
    setIsForbidden(false);
    setMessage(undefined);
  }, []);

  // Reset forbidden state on route change
  useEffect(() => {
    setIsForbidden(false);
    setMessage(undefined);
  }, [pathname]);

  // Listen for 403 events dispatched by the axios interceptor
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setForbidden(typeof detail === "string" ? detail : undefined);
    };
    window.addEventListener("api:forbidden", handler);
    return () => window.removeEventListener("api:forbidden", handler);
  }, [setForbidden]);

  return (
    <ForbiddenContext.Provider value={{ setForbidden, clearForbidden, isForbidden }}>
      {isForbidden ? <AccessDeniedScreen /> : children}
    </ForbiddenContext.Provider>
  );
}
