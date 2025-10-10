"use client";

import clsx from "clsx";
import {
    CheckCircle,
    XCircle,
    ArrowUpCircle,
    Clock,
    Ban,
    ActivitySquare,
} from "lucide-react";
import { JSX } from "react";

interface Activity {
    id: string | number;
    title: string;
    description?: string;
    date?: string;
    type?: string;
    status?: string;
}

interface RecentActivitiesProps {
    activities?: Activity[];
}

export default function RecentActivities({
    activities = [],
}: RecentActivitiesProps) {
    const iconMap: Record<string, JSX.Element> = {
        published: <CheckCircle className="w-5 h-5 text-green-500" />,
        failed: <XCircle className="w-5 h-5 text-red-500" />,
        upgrade: <ArrowUpCircle className="w-5 h-5 text-blue-500" />,
        expired: <Clock className="w-5 h-5 text-yellow-500" />,
        cancelled: <Ban className="w-5 h-5 text-gray-500" />,
    };

    const badgeMap: Record<string, string> = {
        published: "bg-green-100 text-green-700",
        failed: "bg-red-100 text-red-700",
        upgrade: "bg-blue-100 text-blue-700",
        expired: "bg-yellow-100 text-yellow-700",
        cancelled: "bg-gray-100 text-gray-700",
    };

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Recent Activities
            </h2>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex-1">
                {activities.length > 0 ? (
                    <ul className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                        {activities.map((activity, i) => (
                            <li
                                key={activity.id ?? i}
                                className={clsx(
                                    "flex items-center justify-between p-3 rounded-lg transition-colors",
                                    "hover:bg-gray-50 border border-transparent hover:border-gray-100"
                                )}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5">
                                        {iconMap[activity.type || ""] ?? (
                                            <ActivitySquare className="w-5 h-5 text-gray-400" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {activity.title}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {activity.description ||
                                                "No description available."}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1 text-right">
                                    <span className="text-xs text-gray-400">
                                        {activity.date
                                            ? new Date(
                                                  activity.date
                                              ).toLocaleDateString()
                                            : ""}
                                    </span>
                                    <span
                                        className={clsx(
                                            "px-2 py-0.5 text-xs font-medium rounded-full",
                                            badgeMap[activity.type || ""] ||
                                                "bg-gray-100 text-gray-600"
                                        )}
                                    >
                                        {activity.status
                                            ? activity.status
                                                  .charAt(0)
                                                  .toUpperCase() +
                                              activity.status.slice(1)
                                            : "Activity"}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500">
                        <div className="p-4 rounded-full bg-gray-100 mb-3">
                            <ActivitySquare className="w-10 h-10 text-gray-400" />
                        </div>
                        <p className="font-medium text-gray-700">
                            No recent activities yet
                        </p>
                        <p className="text-sm text-gray-500 max-w-xs mt-1">
                            Your latest actions — like logins, approvals, or
                            submissions — will appear here.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
