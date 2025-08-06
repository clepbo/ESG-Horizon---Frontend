"use client";

import clsx from "clsx";
import { CheckCircle, XCircle, ArrowUpCircle, Clock, Ban } from "lucide-react";

import { useActivities } from "@/hooks/useActivities";
import type { ActivityType } from "@/mockData/recentActivities";
import Spinner from "@/app/components/Spinner";

// Icon map
const iconMap: Record<ActivityType, React.ReactNode> = {
  published: <CheckCircle className="w-5 h-5 text-green-500" />,
  failed: <XCircle className="w-5 h-5 text-red-500" />,
  upgrade: <ArrowUpCircle className="w-5 h-5 text-blue-500" />,
  expired: <Clock className="w-5 h-5 text-yellow-500" />,
  cancelled: <Ban className="w-5 h-5 text-gray-500" />,
};

// Badge styles
const badgeMap: Record<ActivityType, string> = {
  published: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  upgrade: "bg-blue-100 text-blue-700",
  expired: "bg-yellow-100 text-yellow-700",
  cancelled: "bg-gray-100 text-gray-700",
};

export default function RecentActivities() {
  const { data: activities = [], isLoading, error } = useActivities();

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Recent Activities
        </h2>
      </div>

      {/* Activity List */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <ul className="flex-1 overflow-y-auto pr-1">
          {activities.map((activity) => (
            <li
              key={activity.id}
              className="flex items-center justify-between rounded-lg hover:bg-gray-50 transition-colors p-2"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{iconMap[activity.type]}</div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {activity.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {activity.description}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 text-right">
                <span className="text-xs text-gray-400">
                  {activity.datetime}
                </span>
                <span
                  className={clsx(
                    "px-2 py-0.5 text-xs font-medium rounded-full",
                    badgeMap[activity.type]
                  )}
                >
                  {activity.type.charAt(0).toUpperCase() +
                    activity.type.slice(1)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Empty state */}
      {!isLoading && activities.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          No recent activities available.
        </div>
      )}
    </div>
  );
}
