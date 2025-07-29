"use client";

import {
  LayoutDashboard,
  Users,
  BarChart,
  CreditCard,
  Settings,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import Image from "next/image";

const navLinks = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Users", icon: Users, href: "/users" },
  { name: "Reports & Analytics", icon: BarChart, href: "/reports" },
  { name: "Subscription & Billing", icon: CreditCard, href: "/billing" },
  { name: "Settings", icon: Settings, href: "/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-screen bg-white shadow-sm p-4 rounded-xl w-16 md:w-64">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="mb-6 flex items-center justify-center">
          <Image
            src="/Logo.svg"
            alt="ESG Horizon Logo"
            width={120}
            height={60}
            className="object-contain hidden md:block"
          />
          <Image
            src="/logo.PNG"
            alt="Logo Icon"
            width={28}
            height={28}
            className="md:hidden"
            style={{ width: "auto" }}
          />
        </div>

        {/* Nav Links */}
        <nav className="flex flex-col gap-1">
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            const Icon = link.icon;

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
                <Icon className="w-5 h-5" />
                <span className="hidden md:inline">{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Spacer pushes logout to bottom */}
        <div className="flex-1" />

        {/* Logout */}
        <button className="cursor-pointer flex items-center gap-2 text-sm text-red-500 justify-start cursor pointer hover:bg-danger-200 p-2">
          <LogOut className="w-5 h-5" />
          <span className="hidden md:inline">Logout</span>
        </button>
      </div>
    </aside>
  );
}
