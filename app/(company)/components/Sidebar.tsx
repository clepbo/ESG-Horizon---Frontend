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
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import clsx from "clsx";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const navItems = [
  { name: "Reports", href: "/reports-and-analytics", icon: BarChart3 },
  { name: "KPIs", href: "/ranking", icon: TrendingUp },
];

const assessmentSubLinks = [
  { name: "New Assessment", href: "/assessments/new-assessment" },
  { name: "Tasks", href: "/assessments/tasks" },
  // { name: "Target", href: "/assessments/target" },
];

const settingsSubLinks = [
  { name: "My Profile", href: "/settings-esg/account" },
  { name: "Company Info", href: "/settings-esg/company" },
  { name: "Subsidiaries", href: "/settings-esg/subsidiaries" },
  { name: "Departments", href: "/settings-esg/departments" },
  { name: "Teams", href: "/settings-esg/teams" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [assessmentsOpen, setAssessmentsOpen] = useState(false);

  useEffect(() => {
    const isSettingsPage = pathname.startsWith("/settings-esg");
    const isAssessmentsPage = pathname.startsWith("/assessments");
    setSettingsOpen(isSettingsPage);
    setAssessmentsOpen(isAssessmentsPage);
  }, [pathname]);

  // useEffect(() => {
  //   setSettingsOpen(false);
  //   setAssessmentsOpen(false);
  // }, [pathname]);

  const handleAssessmentsClick = () => {
    setAssessmentsOpen((prev) => !prev);
    setSettingsOpen(false);
  };

  const handleSettingsClick = () => {
    setSettingsOpen((prev) => !prev);
    setAssessmentsOpen(false);
  };
  const handleNavigation = (href: string) => {
    router.push(href);
    setSettingsOpen(false);
    setAssessmentsOpen(false);
  };

  const handleLogout = () => {
    try {
      logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const mobileNavLinks = [
    {
      name: "Dashboard",
      href: "/dashboard-esg",
      icon: LayoutDashboard,
      action: () => handleNavigation("/dashboard-esg"),
    },
    {
      name: "Assessments",
      href: "/assessments",
      icon: ClipboardList,
      action: handleAssessmentsClick,
    },
    {
      name: "Reports",
      href: "/reports-and-analytics",
      icon: BarChart3,
      action: () => handleNavigation("/reports-and-analytics"),
    },
    {
      name: "KPIs",
      href: "/ranking",
      icon: TrendingUp,
      action: () => handleNavigation("/ranking"),
    },
    { name: "Settings", href: "/settings-esg", icon: Settings, action: handleSettingsClick },
  ];

  return (
    <>
      <aside className="hidden lg:flex h-screen bg-white border-r border-gray-100 flex-col transition-all duration-300 w-[64px] md:w-[270px] flex-shrink-0 z-51">
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
                className="hidden md:block object-contain"
              />
              <Image
                src="/iconlogo.png"
                alt="Logo Icon"
                width={32}
                height={32}
                className="md:hidden object-contain"
              />
            </div>
          </Link>

          <div className="mb-1 hidden md:flex items-center space-x-2 bg-teal-600 rounded-md px-3 py-2">
            {user?.company?.company_logo_url ? (
              <Image
                src={user.company.company_logo_url}
                alt={`${user.company.name || "Company"} Logo`}
                width={40}
                height={20}
                className="object-contain rounded-2xl"
              />
            ) : (
              <span className="text-xs text-white/75">No logo</span>
            )}

            <span className="text-sm font-medium text-white">
              {user?.company?.name || "Company Name"}
            </span>
          </div>

          {/* <div className="mb-1 hidden md:flex items-center space-x-2 bg-teal-600 rounded-md px-3 py-2">
          {user?.company?.company_logo_url && (
            <Image
              src={user?.company?.company_logo_url || "/image.png"}
              alt="Company Logo"
              width={40}
              height={20}
              className="object-contain rounded-2xl"
            />
          )}
          <span className="text-sm font-medium text-white">
            {user?.company?.name || "Company Name"}
          </span>
          {!user?.company?.company_logo_url && (
            <span className="text-xs text-muted">No company logo uploaded.</span>
          )}
        </div> */}
        </div>

        {/* Nav section */}
        <div className="flex-grow p-2 md:p-4 overflow-y-auto mt-0">
          <nav className="space-y-1">
            {/* Dashboard */}
            <motion.div
              whileHover={{ opacity: 1, scale: 1.03 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <Link
                href="/dashboard-esg"
                className={clsx(
                  "flex items-center justify-center md:justify-start rounded-md transition-all duration-300 ease-in-out px-2 md:px-4 py-2",
                  pathname.startsWith("/dashboard-esg")
                    ? "bg-teal-600 text-white"
                    : "text-[var(--color-primary)] hover:bg-[#DFFAE5]"
                )}
              >
                <LayoutDashboard
                  className={clsx(
                    "h-5 w-5 flex-shrink-0 transition-colors duration-300 ease-in-out",
                    pathname.startsWith("/dashboard-esg") ? "text-white" : "text-teal-600"
                  )}
                />
                <motion.span
                  className="hidden md:inline ml-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  Dashboard
                </motion.span>
              </Link>
            </motion.div>

            {/* Assessments with dropdown */}
            <motion.div
              whileHover={{ opacity: 1, scale: 1.03 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <button
                onClick={() => setAssessmentsOpen((prev) => !prev)}
                className={clsx(
                  "w-full flex items-center justify-center md:justify-start rounded-md transition-all duration-300 ease-in-out px-2 md:px-4 py-2 cursor-pointer",
                  pathname.startsWith("/assessments")
                    ? "bg-teal-600 text-white"
                    : "text-[var(--color-primary)] hover:bg-[#DFFAE5]"
                )}
              >
                <ClipboardList
                  className={clsx(
                    "h-5 w-5 flex-shrink-0 transition-colors duration-300 ease-in-out",
                    pathname.startsWith("/assessments") ? "text-white" : "text-teal-600"
                  )}
                />
                <span className="hidden md:inline ml-3">Assessments</span>
                {assessmentsOpen ? (
                  <ChevronUp className="ml-auto w-4 h-4 md:block hidden" />
                ) : (
                  <ChevronDown className="ml-auto w-4 h-4 md:block hidden" />
                )}
              </button>

              <AnimatePresence initial={false}>
                {assessmentsOpen && (
                  <motion.div
                    key="assessments"
                    initial={{ opacity: 0, height: 0, y: -5 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -5 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="ml-6 mt-1 space-y-1 overflow-hidden"
                  >
                    {assessmentSubLinks.map((sub) => {
                      const isSubActive =
                        pathname === sub.href || pathname.startsWith(sub.href + "/");
                      return (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          className={clsx(
                            "block text-sm rounded px-2 py-1 transition-all duration-300 ease-in-out",
                            isSubActive
                              ? "bg-teal-600 text-white"
                              : "text-[var(--color-primary)] hover:bg-[#DFFAE5]"
                          )}
                        >
                          {sub.name}
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Other menu items */}
            {navItems.map(({ name, href, icon: Icon }) => {
              const isActive = pathname.startsWith(href);
              return (
                <motion.div
                  key={name}
                  whileHover={{ opacity: 1, scale: 1.03 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <Link
                    href={href}
                    className={clsx(
                      "flex items-center justify-center md:justify-start rounded-md transition-all duration-300 ease-in-out px-2 md:px-4 py-2",
                      isActive
                        ? "bg-teal-600 text-white"
                        : "text-[var(--color-primary)] hover:bg-[#DFFAE5]"
                    )}
                  >
                    <Icon
                      className={clsx(
                        "h-5 w-5 flex-shrink-0 transition-colors duration-300 ease-in-out",
                        isActive ? "text-white" : "text-teal-600"
                      )}
                    />
                    <motion.span
                      className="hidden md:inline ml-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {name}
                    </motion.span>
                  </Link>
                </motion.div>
              );
            })}

            {/* Settings with dropdown */}
            <motion.div
              whileHover={{ opacity: 1, scale: 1.03 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <button
                onClick={() => setSettingsOpen((prev) => !prev)}
                className={clsx(
                  "w-full flex items-center justify-center md:justify-start rounded-md transition-all duration-300 ease-in-out px-2 md:px-4 py-2 cursor-pointer",
                  pathname.startsWith("/settings-esg")
                    ? "bg-teal-600 text-white"
                    : "text-[var(--color-primary)] hover:bg-[#DFFAE5]"
                )}
              >
                <Settings
                  className={clsx(
                    "h-5 w-5 flex-shrink-0 transition-colors duration-300 ease-in-out",
                    pathname.startsWith("/settings-esg") ? "text-white" : "text-teal-600"
                  )}
                />
                <span className="hidden md:inline ml-3">Settings</span>
                {settingsOpen ? (
                  <ChevronUp className="ml-auto w-4 h-4 md:block hidden" />
                ) : (
                  <ChevronDown className="ml-auto w-4 h-4 md:block hidden" />
                )}
              </button>

              <AnimatePresence initial={false}>
                {settingsOpen && (
                  <motion.div
                    key="settings"
                    initial={{ opacity: 0, height: 0, y: -5 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -5 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="ml-6 mt-1 space-y-1 overflow-hidden"
                  >
                    {settingsSubLinks.map((sub) => {
                      const isSubActive =
                        pathname === sub.href || pathname.startsWith(sub.href + "/");
                      return (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          className={clsx(
                            "block text-sm rounded px-2 py-1 transition-all duration-300 ease-in-out",
                            isSubActive
                              ? "bg-teal-600 text-white"
                              : "text-[var(--color-primary)] hover:bg-[#DFFAE5]"
                          )}
                        >
                          {sub.name}
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </nav>
        </div>

        {/* Logout */}
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
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="flex items-center justify-around py-2 px-2">
          {mobileNavLinks.map(({ name, action, icon: Icon, href }) => {
            const isActive = pathname.startsWith(href);
            return (
              <button
                key={name}
                onClick={action}
                className={clsx(
                  "flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200",
                  isActive ? "bg-teal-600 text-white" : "text-teal-900"
                )}
              >
                <Icon className={clsx("h-6 w-6", isActive ? "text-white" : "text-teal-600")} />
                <span className="text-xs mt-1">{name}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <AnimatePresence>
        {assessmentsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-white/20 backdrop-blur-sm z-[100]" // Increased z-index
            onClick={() => setAssessmentsOpen(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl max-h-[70vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-teal-900">Assessments</h3>
                  <button
                    onClick={() => setAssessmentsOpen(false)}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <X className="h-6 w-6 text-gray-600" />
                  </button>
                </div>
                <div className="space-y-2">
                  {assessmentSubLinks.map((sub) => {
                    const isSubActive =
                      pathname === sub.href || pathname.startsWith(sub.href + "/");
                    return (
                      <button
                        key={sub.name}
                        onClick={() => handleNavigation(sub.href)}
                        className={clsx(
                          "w-full text-left px-4 py-3 rounded-lg transition-all duration-200",
                          isSubActive
                            ? "bg-teal-600 text-white"
                            : "bg-gray-50 text-teal-900 hover:bg-gray-100"
                        )}
                      >
                        {sub.name}
                      </button>
                    );
                  })}
                </div>
              </div>
              {/* Add padding to account for bottom navigation bar */}
              <div className="h-20 w-full"></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {settingsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-white/20 backdrop-blur-sm z-[100]" // Increased z-index
            onClick={() => setSettingsOpen(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl max-h-[70vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-teal-900">Settings</h3>
                  <button
                    onClick={() => setSettingsOpen(false)}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <X className="h-6 w-6 text-gray-600" />
                  </button>
                </div>
                <div className="space-y-2">
                  {settingsSubLinks.map((sub) => {
                    const isSubActive =
                      pathname === sub.href || pathname.startsWith(sub.href + "/");
                    return (
                      <button
                        key={sub.name}
                        onClick={() => handleNavigation(sub.href)}
                        className={clsx(
                          "w-full text-left px-4 py-3 rounded-lg transition-all duration-200",
                          isSubActive
                            ? "bg-teal-600 text-white"
                            : "bg-gray-50 text-teal-900 hover:bg-gray-100"
                        )}
                      >
                        {sub.name}
                      </button>
                    );
                  })}
                </div>

                {/* Mobile Logout Button (Added for completeness) */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-start text-base font-medium text-red-600 hover:bg-red-50 w-full px-4 py-3 rounded-lg transition-all duration-200"
                  >
                    <LogOut className="h-5 w-5 flex-shrink-0 mr-3" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
              {/* Add padding to account for bottom navigation bar */}
              <div className="h-20 w-full"></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
