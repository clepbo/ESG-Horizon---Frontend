"use client";

import {
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  TrendingUp,
  Settings,
  LogOut,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import clsx from "clsx";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

const navItems = [
  {
    name: "Reports",
    href: "/reports-and-analytics",
    icon: BarChart3,
  },
  { name: "Ranking", href: "/ranking", icon: TrendingUp },
];

const assessmentSubLinks = [
  { name: "New Assessment", href: "/assessments" },
  { name: "Tasks", href: "/assessments/tasks" },
  { name: "Target", href: "/assessments/target" },
];

const settingsSubLinks = [
  { name: "My Profile", href: "/settings-esg/account" },
  { name: "Company Info", href: "/settings-esg/company" },
  {
    name: "Subsidiaries",
    href: "/settings-esg/subsidiaries",
    // icon: Building2,
  },
  { name: "Departments", href: "/settings-esg/departments" },
  { name: "Teams", href: "/settings-esg/teams" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [assessmentsOpen, setAssessmentsOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && user) {
      localStorage.setItem("lastVisitedPage_name", user.email || "");
      localStorage.setItem("lastVisitedPage_role", user.role?.name || "");
      localStorage.setItem("lastVisitedPage_page", pathname);
    }
  }, [pathname, user]);

  useEffect(() => {
    const isSettingsPage = pathname.startsWith("/settings-esg");
    setSettingsOpen(isSettingsPage);

    const isAssessmentsPage = pathname.startsWith("/assessments");
    setAssessmentsOpen(isAssessmentsPage);
  }, [pathname]);

  const handleLogout = () => {
    try {
      logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <aside className="h-screen bg-white border-r border-gray-100 flex flex-col transition-all duration-300 w-[64px] md:w-[270px]">
      <div className="p-2 md:p-4 border-b border-gray-100">
        {/* Logo */}
        <Link href="/dashboard-esg">
          <div className="mb-4 flex justify-center md:justify-start">
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
        <div className="mb-1 hidden md:flex items-center space-x-2 bg-[#b4eddf] rounded-md px-3 py-2">
          <Image
            src={user?.company?.company_logo_url || "/image.png"}
            alt="Company Logo"
            width={28}
            height={20}
            className="object-contain rounded-2xl"
          />
          <span className="text-sm font-medium text-[#001D34]">
            {user?.company?.name || "Company Name"}
          </span>
        </div>
      </div>

      <div className="flex-grow p-2 md:p-4 overflow-y-auto mt-0">
        {/* Navigation */}
        <nav className="space-y-1">
          <Link
            href="/dashboard-esg"
            className={clsx(
              "flex items-center justify-center md:justify-start rounded-md transition-colors px-2 md:px-4 py-2",
              pathname.startsWith("/dashboard-esg")
                ? "bg-[#DFFAE5] text-[var(--color-primary)]"
                : "text-[#001D34] hover:bg-[#E8F5EE]"
            )}
          >
            <LayoutDashboard
              className={clsx(
                "h-5 w-5 flex-shrink-0",
                pathname.startsWith("/dashboard-esg") ? "text-[#007A4D]" : "text-[#001D34]"
              )}
            />
            <span className="hidden md:inline ml-3">Dashboard</span>
          </Link>
          {/* Assessments Dropdown */}
          <div>
            <button
              onClick={() => setAssessmentsOpen((prev) => !prev)}
              className={clsx(
                "w-full flex items-center justify-center md:justify-start rounded-md transition-colors px-2 md:px-4 py-2 cursor-pointer",
                pathname.startsWith("/assessments")
                  ? "bg-[#DFFAE5] text-[var(--color-primary)]"
                  : "text-[#001D34] hover:bg-[#E8F5EE]"
              )}
            >
              <ClipboardList
                className={clsx(
                  "h-5 w-5 flex-shrink-0",
                  pathname.startsWith("/assessments")
                    ? "text-[var(--color-primary)]"
                    : "text-[#001D34]"
                )}
              />
              <span className="hidden md:inline ml-3">Assessments</span>
              {assessmentsOpen ? (
                <ChevronUp className="ml-auto w-4 h-4 md:block hidden" />
              ) : (
                <ChevronDown className="ml-auto w-4 h-4 md:block hidden" />
              )}
            </button>

            {assessmentsOpen && (
              <div className="ml-6 mt-1 space-y-1">
                {assessmentSubLinks.map((sub) => {
                  const isSubActive = pathname === sub.href || pathname.startsWith(sub.href + "/");
                  return (
                    <Link
                      key={sub.name}
                      href={sub.href}
                      className={clsx(
                        "block text-sm rounded px-2 py-1 transition-all",
                        isSubActive
                          ? "bg-[#DFFAE5] text-[var(--color-primary)]"
                          : "text-[#001D34] hover:bg-[#E8F5EE]"
                      )}
                    >
                      {sub.name}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {navItems.map(({ name, href, icon: Icon }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={name}
                href={href}
                className={clsx(
                  "flex items-center justify-center md:justify-start rounded-md transition-colors px-2 md:px-4 py-2",
                  isActive
                    ? "bg-[#DFFAE5] text-[var(--color-primary)]"
                    : "text-[#001D34] hover:bg-[#E8F5EE]"
                )}
              >
                <Icon
                  className={clsx(
                    "h-5 w-5 flex-shrink-0",
                    isActive ? "text-[var(--color-primary)]" : "text-[#001D34]"
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
                "w-full flex items-center justify-center md:justify-start rounded-md transition-colors px-2 md:px-4 py-2 cursor-pointer",
                pathname.startsWith("/settings-esg")
                  ? "bg-[#DFFAE5] text-[var(--color-primary)]"
                  : "text-[#001D34] hover:bg-[#E8F5EE]"
              )}
            >
              <Settings
                className={clsx(
                  "h-5 w-5 flex-shrink-0",
                  pathname.startsWith("/settings-esg")
                    ? "text-[var(--color-primary)]"
                    : "text-[#001D34]"
                )}
              />
              <span className="hidden md:inline ml-3">Settings</span>
              {settingsOpen ? (
                <ChevronUp className="ml-auto w-4 h-4 md:block hidden" />
              ) : (
                <ChevronDown className="ml-auto w-4 h-4 md:block hidden" />
              )}
            </button>

            {settingsOpen && (
              <div className="ml-6 mt-1 space-y-1">
                {settingsSubLinks.map((sub) => {
                  const isSubActive = pathname === sub.href || pathname.startsWith(sub.href + "/");

                  return (
                    <Link
                      key={sub.name}
                      href={sub.href}
                      className={clsx(
                        "block text-sm rounded px-2 py-1 transition-all",
                        isSubActive
                          ? "bg-[#DFFAE5] text-[var(--color-primary)]"
                          : "text-[#001D34] hover:bg-[#E8F5EE]"
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

      <div className="px-2 md:px-4 pb-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center md:justify-start text-sm font-medium text-red-600 hover:underline cursor-pointer py-2"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <span className="hidden md:inline ml-2">Logout</span>
        </button>
      </div>
    </aside>
  );
}
