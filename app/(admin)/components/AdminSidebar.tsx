"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import {
  LayoutDashboard,
  Home,
  UserRound,
  Activity,
  FileText,
  CreditCard,
  Star,
  Clock,
  SlidersHorizontal,
  LogOut,
  MoreVertical,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useAdminMobileNav } from "./AdminMobileNavContext";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const groups: NavGroup[] = [
  {
    label: "Main",
    items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Companies",
    items: [
      { label: "Companies", href: "/company", icon: Home },
      { label: "Users", href: "/users", icon: UserRound },
    ],
  },
  {
    label: "Assessment",
    items: [
      { label: "Algorithm Config", href: "/algorithm-config", icon: Activity },
      { label: "Assessments", href: "/assessments-config", icon: FileText },
    ],
  },
  {
    label: "Billing",
    items: [{ label: "Billing", href: "/billing", icon: CreditCard }],
  },
  {
    label: "Governance",
    items: [
      { label: "Roles & Permissions", href: "/roles-permissions", icon: Star },
      { label: "Audit Trail", href: "/audit-trail", icon: Clock },
      { label: "Settings", href: "/settings", icon: SlidersHorizontal },
    ],
  },
];

function getInitials(first?: string, last?: string, email?: string) {
  const a = (first || "").trim();
  const b = (last || "").trim();
  if (a || b) return `${a.charAt(0)}${b.charAt(0)}`.toUpperCase() || "?";
  return (email || "?").charAt(0).toUpperCase();
}

function formatRole(role?: string) {
  if (!role) return "";
  return role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { open: mobileOpen, setOpen: setMobileOpen } = useAdminMobileNav();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  // Close the mobile drawer whenever the user navigates
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, setMobileOpen]);

  const isItemActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={clsx(
          "bg-white border-r border-gray-200 flex flex-col",
          // Mobile: off-canvas drawer
          "fixed top-0 left-0 h-screen w-64 z-50 transform transition-transform duration-200 ease-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop: in-flow sidebar, always visible
          "lg:static lg:translate-x-0 lg:h-screen lg:w-64 lg:z-auto"
        )}
      >
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <Link href="/dashboard" className="inline-flex" onClick={() => setMobileOpen(false)}>
          <Image
            src="/logo-new.png"
            alt="ESG Horizon"
            width={280}
            height={96}
            priority
            className="object-contain h-24 w-auto"
          />
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1 rounded text-gray-700 hover:text-gray-900 hover:bg-gray-100"
          aria-label="Close navigation"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {groups.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="px-3 mb-1 text-[13px] font-semibold tracking-[0.12em] text-gray-600 uppercase">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isItemActive(item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href} className="relative">
                    {active && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-[#119B95]" />
                    )}
                    <Link
                      href={item.href}
                      className={clsx(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                        active
                          ? "bg-[#119B95]/5 text-[#119B95] font-semibold"
                          : "text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      <Icon className="w-[18px] h-[18px] shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-gray-100 px-3 py-3">
        <div className="flex items-center gap-3 px-2 py-1.5 rounded-md relative" ref={menuRef}>
          <div className="w-9 h-9 rounded-full bg-[#119B95]/10 text-[#119B95] flex items-center justify-center text-sm font-semibold shrink-0">
            {getInitials(user?.first_name, user?.last_name, user?.email)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user?.first_name || user?.last_name
                ? `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim()
                : user?.email || "User"}
            </p>
            <p className="text-xs text-gray-700 truncate">{formatRole(user?.role?.name)}</p>
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="p-1 rounded text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            aria-label="Account menu"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div className="absolute bottom-full right-0 mb-2 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
    </>
  );
}
