"use client";

import { CheckCircle, XCircle, ArrowUpCircle, Clock, Ban } from "lucide-react";

const activities = [
  {
    id: 1,
    title: "New Subscription Activated",
    description: "GreenTech Solutions subscribed to the Premium Plan.",
    datetime: "2025-07-17 11:45 AM",
    type: "Published",
    icon: <CheckCircle className="text-green-500 w-5 h-5" />,
  },
  {
    id: 2,
    title: "Payment Failed",
    description:
      "EcoBuild Ltd.’s monthly payment attempt failed due to insufficient funds.",
    datetime: "2025-07-17 10:10 AM",
    type: "Failed",
    icon: <XCircle className="text-red-500 w-5 h-5" />,
  },
  {
    id: 3,
    title: "Subscription Upgraded",
    description: "NexaGreen Technologies upgraded from Basic to Standard Plan.",
    datetime: "2025-07-16 06:30 PM",
    type: "Upgrade",
    icon: <ArrowUpCircle className="text-blue-500 w-5 h-5" />,
  },
  {
    id: 4,
    title: "Trial Expired",
    description: "UrbanRenewal Group’s free trial expired.",
    datetime: "2025-07-14 09:30 AM",
    type: "Expired",
    icon: <Clock className="text-yellow-500 w-5 h-5" />,
  },
  {
    id: 5,
    title: "Subscription Cancelled",
    description:
      "SafeGrid Alliance cancelled their Standard subscription plan.",
    datetime: "2025-07-13 08:45 PM",
    type: "Cancelled",
    icon: <Ban className="text-rose-500 w-5 h-5" />,
  },
];

const typeColorMap: Record<string, string> = {
  Published: "text-green-500 bg-green-100",
  Failed: "text-red-500 bg-red-100",
  Upgrade: "text-blue-500 bg-blue-100",
  Expired: "text-yellow-500 bg-yellow-100",
  Cancelled: "text-rose-500 bg-rose-100",
};

export default function BillingActivityFeed() {
  return (
    <div className="bg-white rounded-xl shadow p-4 md:p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">
        Recent Activities
      </h3>
      <ul className="space-y-4 relative">
        {/* Vertical timeline line */}
        <div className="absolute top-8 left-[14px] bottom-4 w-px bg-gray-200 z-0" />
        {activities.map((activity, index) => (
          <li
            key={activity.id}
            className="flex items-start gap-3 relative z-10"
          >
            {/* Icon */}
            <div className="mt-1 shrink-0">{activity.icon}</div>

            {/* Content and date */}
            <div className="flex justify-between items-start w-full border-b pb-4">
              {/* Middle text */}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {activity.title}
                </p>
                <p className="text-sm text-gray-500">{activity.description}</p>
              </div>

              {/* Right datetime and badge */}
              <div className="flex flex-col items-end gap-1 whitespace-nowrap">
                <span className="text-xs text-gray-400">
                  {activity.datetime}
                </span>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    typeColorMap[activity.type]
                  }`}
                >
                  {activity.type}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
