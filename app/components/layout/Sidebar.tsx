"use client";

import { Settings, LogOut, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

const navLinks = [
  { name: "Dashboard", icon: "/icons/Dashboard.svg", href: "/dashboard" },
  { name: "Company", icon: "/icons/Company.svg", href: "/company" },
  {
    name: "Reports",
    icon: "/icons/Analytics.svg",
    href: "/reports",
  },
  {
    name: "Subscription & Billing",
    icon: "/icons/SubscriptionBilling.svg",
    href: "/billing",
  },
];

const settingsSubLinks = [
  { name: "My Profile", href: "/settings/account" },
  { name: "Company Info", href: "/settings/company" },
  { name: "Teams", href: "/settings/teams" },
  { name: "Departments", href: "/settings/departments" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    setSettingsOpen(pathname.startsWith("/settings"));
  }, [pathname]);

  useEffect(() => {
    if (typeof window !== "undefined" && user) {
      localStorage.setItem("lastVisitedPage_name", user.email || "");
      localStorage.setItem("lastVisitedPage_role", user.role?.name || "");
      localStorage.setItem("lastVisitedPage_page", pathname);
    }
  }, [pathname, user]);

  const handleLogout = () => {
    try {
      logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <aside className="h-screen bg-white shadow-sm flex flex-col p-4 rounded-r-2xl w-16 md:w-64 transition-all duration-300">
      {/* Logo */}
      <Link href="/dashboard">
        <div className=" flex justify-center md:justify-start ">
          <Image
            src="/logo-new.png"
            alt="ESG Horizon Logo"
            width={150}
            height={60}
            priority
            className="object-contain hidden md:block"
            style={{ width: "auto", height: 110 }}
          />
          <Image
            src="/iconlogo.png"
            alt="Logo Icon"
            width={28}
            height={28}
            className="md:hidden object-contain"
            style={{ width: "auto", height: "auto" }}
          />
        </div>
      </Link>

      {/* Main Links */}
      <nav className="flex flex-col gap-1">
        {navLinks.map((link) => {
          const isActive =
            pathname === link.href || pathname.startsWith(link.href + "/");

          return (
            <Link
              key={link.name}
              href={link.href}
              className={clsx(
                "flex items-center gap-3 text-sm rounded p-2 transition-all group",
                isActive
                  ? "bg-emerald-100 text-emerald-700 font-semibold"
                  : "text-gray-700 hover:bg-emerald-50"
              )}
            >
              <Image
                src={link.icon}
                alt={`${link.name} icon`}
                width={20}
                height={20}
                className={clsx(
                  "w-5 h-5",
                  isActive
                    ? "bg-emerald-100 text-emerald-700 font-semibold"
                    : "text-gray-700 hover:bg-emerald-50"
                )}
              />
              <span className="hidden md:inline">{link.name}</span>
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
                  pathname === sub.href || pathname.startsWith(sub.href + "/");

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

      {/* Logout */}
      <div className="mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-red-500 cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          <span className="hidden md:inline">Logout</span>
        </button>
      </div>
    </aside>
  );
}
