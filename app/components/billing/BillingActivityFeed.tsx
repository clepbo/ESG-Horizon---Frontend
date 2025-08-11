"use client";

import React, { useState, useEffect } from "react";
import clsx from "clsx";
import {
  activities as mockActivities,
  ActivityType,
} from "@/mockData/billingActivities";
import Spinner from "@/app/components/Spinner"; // Ensure correct path
import Image from "next/image";

// Map each activity type to its icon image and background color
const imageMap: Record<ActivityType, { src: string; bg: string }> = {
  success: { src: "/icons/investor.svg", bg: "bg-green-200" },
  failed: { src: "/icons/Error.svg", bg: "bg-red-100" },
  upgrade: { src: "/icons/SubscriptionBilling.svg", bg: "bg-blue-100" },
  expired: { src: "/icons/Error.svg", bg: "bg-yellow-100" },
  cancelled: { src: "/icons/Cancel.svg", bg: "bg-gray-100" },
};

const badgeMap: Record<ActivityType, string> = {
  success: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  upgrade: "bg-blue-100 text-blue-700",
  expired: "bg-yellow-100 text-yellow-700",
  cancelled: "bg-gray-100 text-gray-700",
};

export default function BillingActivityFeed() {
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<typeof mockActivities>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setActivities(mockActivities);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow h-full overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Recent Activities
        </h2>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <ul className="divide-y divide-gray-100 overflow-y-auto pr-2 flex-1">
          {activities.map((activity) => (
            <li key={activity.id} className="flex items-start gap-4 py-4">
              {/* Icon with background */}
              <div
                className={clsx(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                  imageMap[activity.type].bg
                )}
              >
                <Image
                  src={imageMap[activity.type].src}
                  alt={activity.type}
                  width={20}
                  height={20}
                  className="object-contain"
                />
              </div>

              {/* Text content */}
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  {activity.title}
                </p>
                <p className="text-sm text-gray-500">{activity.description}</p>
              </div>

              {/* Date and badge */}
              <div className="flex flex-col items-end text-right whitespace-nowrap">
                <p className="text-xs text-gray-400">{activity.datetime}</p>
                <span
                  className={clsx(
                    "mt-1 text-xs font-medium px-3 py-0.5 rounded-full",
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
      )}
    </div>
  );
}
