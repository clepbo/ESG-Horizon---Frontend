"use client";

import {
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  TrendingUp,
  Users,
  Settings,
  LogOut,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import clsx from "clsx";
import { useAuth } from "@/context/AuthContext"; // 👈 adjust path as needed
import { useState } from "react";

const navItems = [
  { name: "Dashboard", href: "/dashboard-esg", icon: LayoutDashboard },
  { name: "Assessments", href: "/assessments", icon: ClipboardList },
  {
    name: "Reports & Analytics",
    href: "/reports-and-analytics",
    icon: BarChart3,
  },
  { name: "Ranking", href: "/ranking", icon: TrendingUp },
  { name: "Teams", href: "/teams-esg", icon: Users },
];

const settingsSubLinks = [
  { name: "Account", href: "/settings/account" },
  { name: "Company", href: "/settings/company" },
  { name: "Teams", href: "/settings/teams" },
  { name: "Departments", href: "/settings/departments" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleLogout = () => {
    try {
      logout(); // clears auth state
      router.push("/login"); // redirect
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <aside className="h-screen bg-white border-r border-gray-100 flex flex-col justify-between transition-all duration-300 w-[64px] md:w-[270px]">
      <div className="p-2 md:p-4">
        {/* Logo */}
        <Link href="/dashboard-esg">
          <div className="mb-6 flex justify-center md:justify-start">
            <Image
              src="/logo-new.png"
              alt="ESG Horizon Logo"
              width={140}
              height={60}
              priority
              style={{ width: "auto", height: "auto" }}
              className="hidden md:block object-contain"
            />
            <Image
              src="/iconlogo.png"
              alt="Logo Icon"
              width={32}
              height={32}
              style={{ width: "auto", height: "auto" }}
              className="md:hidden object-contain"
            />
          </div>
        </Link>

        {/* Company Info */}
        <div className="mb-4 hidden md:flex items-center space-x-2 bg-[#B4EDBC] rounded-md px-3 py-2">
          <Image
            src="/total.png"
            alt="Total Energies"
            width={28}
            height={20}
            className="object-contain rounded-2xl"
          />
          <span className="text-sm font-medium text-[#001D34]">
            Total Energies
          </span>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {navItems.map(({ name, href, icon: Icon }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={name}
                href={href}
                className={clsx(
                  "flex items-center justify-center md:justify-start rounded-md transition-colors px-2 md:px-4 py-2",
                  isActive
                    ? "bg-[#DFFAE5] text-[#007A4D]"
                    : "text-[#001D34] hover:bg-[#E8F5EE]"
                )}
              >
                <Icon
                  className={clsx(
                    "h-5 w-5 flex-shrink-0",
                    isActive ? "text-[#007A4D]" : "text-[#001D34]"
                  )}
                />
                <span className="hidden md:inline ml-3">{name}</span>
              </Link>
            );
          })}
          {/* Settings Dropdown */}
          <div>
            <button
              onClick={() => setSettingsOpen((prev) => !prev)}
              className={clsx(
                "w-full flex items-center gap-3 text-sm rounded p-2 transition-all cursor-pointer",
                pathname.startsWith("/settings")
                  ? "bg-emerald-100 text-emerald-700 font-semibold"
                  : "text-gray-700 hover:bg-emerald-50"
              )}
            >
              <Settings className="w-5 h-5" />
              <span className="hidden md:inline">Settings</span>
              {settingsOpen ? (
                <ChevronUp className="ml-auto w-4 h-4 md:block hidden" />
              ) : (
                <ChevronDown className="ml-auto w-4 h-4 md:block hidden" />
              )}
            </button>

            {settingsOpen && (
              <div className="ml-6 mt-1 space-y-1">
                {settingsSubLinks.map((sub) => {
                  const isSubActive =
                    pathname === sub.href ||
                    pathname.startsWith(sub.href + "/");

                  return (
                    <Link
                      key={sub.name}
                      href={sub.href}
                      className={clsx(
                        "block text-sm rounded px-2 py-1 transition-all",
                        isSubActive
                          ? "bg-emerald-100 text-emerald-700 font-medium"
                          : "text-gray-700 hover:bg-emerald-50"
                      )}
                    >
                      {sub.name}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Logout Button */}
      <div className="px-2 md:px-4 pb-4">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center md:justify-start text-sm font-medium text-red-600 hover:underline cursor-pointer"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <span className="hidden md:inline ml-2">Logout</span>
        </button>
      </div>
    </aside>
  );
}
