"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useMobileNav } from "./Sidebar";

interface LayoutContentProps {
  children: React.ReactNode;
  role: string;
}

export default function LayoutContent({ children, role }: LayoutContentProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { setShowMobileNav } = useMobileNav();
  const [lastScrollY, setLastScrollY] = useState(0);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
        return;
      }
      if (user.role?.name !== role) {
        router.push("/login");
        return;
      }
    }
  }, [loading, user, role, router]);

  // Handle scroll for mobile nav auto-hide
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      if (!mainRef.current) return;

      // Clear any pending timeout
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      // Use a small delay to debounce rapid scroll events
      scrollTimeout = setTimeout(() => {
        if (!mainRef.current) return;

        const currentScrollY = mainRef.current.scrollTop;

        // Show nav when scrolling up or at the top
        if (currentScrollY < lastScrollY || currentScrollY < 10) {
          setShowMobileNav(true);
        }
        // Hide nav when scrolling down (and not near the top)
        else if (currentScrollY > lastScrollY && currentScrollY > 50) {
          setShowMobileNav(false);
        }

        setLastScrollY(currentScrollY);
      }, 10);
    };

    const mainElement = mainRef.current;
    if (mainElement) {
      mainElement.addEventListener("scroll", handleScroll, { passive: true });

      return () => {
        if (scrollTimeout) {
          clearTimeout(scrollTimeout);
        }
        if (mainElement) {
          mainElement.removeEventListener("scroll", handleScroll);
        }
      };
    }
  }, [lastScrollY, setShowMobileNav]);

  if (loading || !user)
    return (
      <div className="flex items-center p-10 space-x-4">
        <style jsx>{`
          .spinner {
            border: 8px solid #f3f3f3;
            border-top: 8px solid #3498db;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1.5s linear infinite;
          }
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
        <div className="spinner"></div>
        <div className="text-gray-700 text-lg font-medium">Loading.. Please wait</div>
      </div>
    );

  return (
    <main ref={mainRef} className="flex-1 overflow-y-auto bg-gray-50">
      {children}
    </main>
  );
}
