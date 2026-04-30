"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Activity {
  id: string | number;
  title: string;
  description?: string;
  date?: string;
  type?: string;
  status?: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface DashboardRecentActivityProps {
  activities: Activity[];
}

const AVATAR_COLORS = [
  "bg-[#119B95]",
  "bg-amber-500",
  "bg-blue-500",
  "bg-purple-500",
  "bg-rose-500",
];

function getInitials(firstName?: string, lastName?: string): string {
  const f = firstName?.charAt(0)?.toUpperCase() ?? "";
  const l = lastName?.charAt(0)?.toUpperCase() ?? "";
  return f + l || "?";
}

function formatTimeAgo(dateStr?: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-GB", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DashboardRecentActivity({ activities }: DashboardRecentActivityProps) {
  const items = activities.slice(0, 5);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-900">Recent Activity</h3>
        <Link
          href="/audit-logs"
          className="text-sm font-medium text-[#119B95] hover:underline inline-flex items-center gap-1"
        >
          View All <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="flex-1 space-y-4 overflow-hidden">
        {items.length === 0 && (
          <p className="text-sm text-gray-700 text-center py-8">No recent activity</p>
        )}

        {items.map((activity, idx) => {
          const initials = getInitials(activity.user?.firstName, activity.user?.lastName);
          const colorClass = AVATAR_COLORS[idx % AVATAR_COLORS.length];
          const userName = activity.user
            ? `${activity.user.firstName} ${activity.user.lastName?.charAt(0)}.`
            : "User";

          return (
            <div key={activity.id} className="flex items-start gap-3">
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full ${colorClass} flex items-center justify-center`}
              >
                <span className="text-xs font-bold text-white">{initials}</span>
              </div>

              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-sm text-gray-700 truncate">
                  <span className="font-semibold">{userName}</span>{" "}
                  {activity.description || activity.title}
                </p>
                <p className="text-xs text-gray-700 mt-0.5">{formatTimeAgo(activity.date)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
