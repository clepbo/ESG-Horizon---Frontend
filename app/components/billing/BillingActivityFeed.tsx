"use client";

import React from "react";
import { CheckCircle, XCircle, ArrowUpCircle, Clock, Ban } from "lucide-react";
import clsx from "clsx";

import { activities, ActivityType } from "@/mockData/billingActivities";

const iconMap: Record<ActivityType, React.ReactElement> = {
  success: <CheckCircle className="text-green-500 w-5 h-5" />,
  failed: <XCircle className="text-red-500 w-5 h-5" />,
  upgrade: <ArrowUpCircle className="text-blue-500 w-5 h-5" />,
  expired: <Clock className="text-yellow-500 w-5 h-5" />,
  cancelled: <Ban className="text-gray-500 w-5 h-5" />,
};

const badgeMap: Record<ActivityType, string> = {
  success: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  upgrade: "bg-blue-100 text-blue-700",
  expired: "bg-yellow-100 text-yellow-700",
  cancelled: "bg-gray-100 text-gray-700",
};

export default function BillingActivityFeed() {
  return (
    <div className="bg-white p-6 rounded-xl shadow h-full overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Recent Activities
        </h2>
      </div>
      <ul className="space-y-5 overflow-y-auto pr-2 flex-1">
        {activities.map((activity) => (
          <li key={activity.id} className="flex items-start gap-4">
            <div className="mt-1 shrink-0">{iconMap[activity.type]}</div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {activity.title}
              </p>
              <p className="text-sm text-gray-500">{activity.description}</p>
            </div>
            <div className="flex flex-col items-end text-right whitespace-nowrap">
              <p className="text-xs text-gray-400">{activity.datetime}</p>
              <span
                className={clsx(
                  "mt-1 text-xs font-medium px-2 py-0.5 rounded-full",
                  badgeMap[activity.type]
                )}
              >
                {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
