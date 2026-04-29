"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Header from "../components/Header";
import { useActivities } from "@/services/hooks/activity.hooks";
import type { ActivityItem } from "@/services/activity.service";
import PageSkeleton from "@/app/components/ui/reusables/PageSkeleton";
import Pagination from "@/app/components/ui/reusables/Pagination";

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  success: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Success" },
  failed: { bg: "bg-red-50", text: "text-red-700", label: "Failed" },
  updated: { bg: "bg-blue-50", text: "text-blue-700", label: "Updated" },
  submitted: { bg: "bg-teal-50", text: "text-teal-700", label: "Submitted" },
};

const TYPE_FILTERS = [
  { label: "All", value: "all" },
  { label: "Assessment", value: "assessment" },
  { label: "Login", value: "auth" },
  { label: "General", value: "general" },
] as const;

const AVATAR_COLORS = [
  "bg-[#119B95]",
  "bg-amber-500",
  "bg-blue-500",
  "bg-purple-500",
  "bg-rose-500",
  "bg-indigo-500",
];

function getInitials(firstName?: string, lastName?: string): string {
  return (
    (firstName?.charAt(0)?.toUpperCase() ?? "") + (lastName?.charAt(0)?.toUpperCase() ?? "") || "?"
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const DEFAULT_PER_PAGE = 10;

export default function AuditLogsPage() {
  const { data: activities, isLoading, isError } = useActivities();
  const [search, setSearch] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_PER_PAGE);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!activities) return [];
    let items = [...activities];

    if (typeFilter !== "all") {
      items = items.filter((a) => a.type?.toLowerCase() === typeFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.description?.toLowerCase().includes(q) ||
          a.user?.firstName?.toLowerCase().includes(q) ||
          a.user?.lastName?.toLowerCase().includes(q) ||
          a.user?.email?.toLowerCase().includes(q)
      );
    }

    return items;
  }, [activities, typeFilter, search]);

  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  if (isLoading) return <PageSkeleton />;

  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-900">
        Failed to load activity logs.
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F2FBF3] overflow-hidden">
      <motion.main
        className="flex-1 h-full overflow-y-auto p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <Header showSearchBar={false} />

        <div className="flex items-center justify-between mb-6 mt-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
            <p className="text-sm text-gray-500 mt-1">
              Track all user activity across your organization
            </p>
          </div>
          <Link
            href="/dashboard-esg"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#119B95] hover:bg-[#119B95]/5 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-900" />
            <input
              type="text"
              placeholder="Search by user, title, or description..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#119B95]/30 focus:border-[#119B95]"
            />
          </div>

          <div className="flex gap-1 rounded-lg bg-white border border-gray-200 p-1">
            {TYPE_FILTERS.map((t) => (
              <button
                key={t.value}
                onClick={() => {
                  setTypeFilter(t.value);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  typeFilter === t.value
                    ? "bg-[#119B95] text-white"
                    : "text-gray-900 hover:bg-gray-100"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Activity List */}
        <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="hidden sm:grid grid-cols-[2fr_3fr_1fr_auto] gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100">
            <span className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
              User
            </span>
            <span className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
              Activity
            </span>
            <span className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
              Status
            </span>
            <span className="text-xs font-semibold text-gray-900 uppercase tracking-wider text-right w-28">
              Date & Time
            </span>
          </div>

          {paginated.length === 0 && (
            <p className="text-sm text-gray-700 text-center py-12">No activity logs found.</p>
          )}

          {paginated.map((activity, idx) => (
            <ActivityRow
              key={activity.id}
              activity={activity}
              colorIdx={(page - 1) * itemsPerPage + idx}
            />
          ))}
        </div>

        {/* Pagination */}
        <Pagination
          totalItems={filtered.length}
          itemsPerPage={itemsPerPage}
          currentPage={page}
          onPageChange={setPage}
          onItemsPerPageChange={(n) => {
            setItemsPerPage(n);
            setPage(1);
          }}
        />
      </motion.main>
    </div>
  );
}

function ActivityRow({ activity, colorIdx }: { activity: ActivityItem; colorIdx: number }) {
  const initials = getInitials(activity.user?.firstName, activity.user?.lastName);
  const colorClass = AVATAR_COLORS[colorIdx % AVATAR_COLORS.length];
  const userName = activity.user
    ? `${activity.user.firstName} ${activity.user.lastName}`
    : "Unknown";
  const style = STATUS_STYLES[activity.status ?? ""] ?? {
    bg: "bg-gray-100",
    text: "text-gray-900",
    label: activity.status ?? "—",
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[2fr_3fr_1fr_auto] gap-2 sm:gap-4 px-6 py-4 border-b border-gray-50 hover:bg-gray-50/50 transition-colors items-center">
      {/* User */}
      <div className="flex items-center gap-3">
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full ${colorClass} flex items-center justify-center`}
        >
          <span className="text-xs font-bold text-white">{initials}</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
          <p className="text-xs text-gray-700 truncate">{activity.user?.email}</p>
        </div>
      </div>

      {/* Activity */}
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
        <p className="text-xs text-gray-700 truncate">{activity.description}</p>
      </div>

      {/* Status */}
      <div>
        <span
          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}
        >
          {style.label}
        </span>
      </div>

      {/* Date */}
      <div className="text-right w-28 flex-shrink-0">
        <p className="text-sm text-gray-900">{formatDate(activity.date)}</p>
        <p className="text-xs text-gray-700">{formatTime(activity.date)}</p>
      </div>
    </div>
  );
}
