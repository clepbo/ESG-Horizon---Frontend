"use client";

import { Bell, Menu, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useAdminMobileNav } from "./AdminMobileNavContext";

interface AdminNavbarProps {
  title: string;
  subtitle?: string;
}

function getInitials(first?: string, last?: string, email?: string) {
  const a = (first || "").trim();
  const b = (last || "").trim();
  if (a || b) return `${a.charAt(0)}${b.charAt(0)}`.toUpperCase() || "?";
  return (email || "?").charAt(0).toUpperCase();
}

export default function AdminNavbar({ title, subtitle }: AdminNavbarProps) {
  const { user } = useAuth();
  const { setOpen } = useAdminMobileNav();

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between gap-3 sm:gap-6 px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="lg:hidden w-10 h-10 rounded-lg border border-gray-200 bg-white text-gray-700 hover:text-gray-900 hover:bg-gray-50 flex items-center justify-center shrink-0"
            aria-label="Open navigation"
          >
            <Menu className="w-[18px] h-[18px]" />
          </button>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{title}</h1>
            {subtitle && <p className="text-xs sm:text-sm text-gray-700 truncate">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            <input
              type="search"
              placeholder="Search anything..."
              className="w-48 lg:w-80 h-10 pl-10 pr-4 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#119B95]/20 focus:border-[#119B95]/40 placeholder:text-gray-500 text-gray-900"
            />
          </div>

          <button
            type="button"
            className="md:hidden w-10 h-10 rounded-lg border border-gray-200 bg-white text-gray-700 hover:text-gray-900 hover:bg-gray-50 flex items-center justify-center transition-colors"
            aria-label="Search"
          >
            <Search className="w-[18px] h-[18px]" />
          </button>

          <button
            type="button"
            className="w-10 h-10 rounded-lg border border-gray-200 bg-white text-gray-700 hover:text-gray-900 hover:bg-gray-50 flex items-center justify-center transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-[18px] h-[18px]" />
          </button>

          <div
            className="w-10 h-10 rounded-full bg-[#119B95]/10 text-[#119B95] flex items-center justify-center text-sm font-semibold"
            aria-label="Account"
          >
            {getInitials(user?.first_name, user?.last_name, user?.email)}
          </div>
        </div>
      </div>
    </header>
  );
}
