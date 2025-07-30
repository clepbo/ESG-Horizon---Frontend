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
    <aside className="h-screen bg-white shadow-sm flex flex-col p-4 rounded-r-2xl w-16 md:w-64 transition-all duration-300">
      {/* Top section: Logo + Navigation */}
      <div>
        {/* Logo */}
        <Link href="/dashboard">
          <div className="mb-6 flex justify-center ">
            <Image
              src="/logo-new.png"
              alt="ESG Horizon Logo"
              width={120}
              height={60}
              priority
              className="object-contain hidden md:block"
              style={{ width: "auto", height: "auto" }}
            />

            <Image
              src="/favicon.ico"
              alt="Logo Icon"
              width={28}
              height={28}
              className="md:hidden object-contain"
              style={{ width: "auto", height: "auto" }}
            />
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex flex-col gap-1">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href || pathname.startsWith(link.href + "/");

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
      </div>

      {/* Bottom section: Logout button */}
      <div className="mt-auto">
        <button className="flex items-center gap-2 text-sm text-red-500">
          <LogOut className="w-5 h-5" />
          <span className="hidden md:inline">Logout</span>
        </button>
      </div>
    </aside>
  );
}
