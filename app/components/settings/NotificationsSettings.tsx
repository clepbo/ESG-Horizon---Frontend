"use client";

import { useState } from "react";

interface NotificationItem {
  title: string;
  desc: string;
  enabled: boolean;
}

export default function NotificationsSettings() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      title: "Data Collection Reminders",
      desc: "Get notified when data entry deadlines approach",
      enabled: true,
    },
    {
      title: "Report Generation",
      desc: "Notifications when reports are ready for review",
      enabled: false,
    },
    {
      title: "Compliance Updates",
      desc: "Stay informed about regulatory changes",
      enabled: true,
    },
    {
      title: "Team Activity",
      desc: "Updates when team members complete tasks",
      enabled: true,
    },
    {
      title: "Weekly Summary",
      desc: "Weekly progress reports and insights",
      enabled: false,
    },
  ]);

  const toggleNotification = (index: number) => {
    setNotifications((prev) =>
      prev.map((n, i) => (i === index ? { ...n, enabled: !n.enabled } : n))
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      <h2 className="text-2xl font-semibold">Notifications</h2>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Email Notifications</h3>
          <p className="text-gray-600">Choose what notifications you want to receive</p>
        </div>

        <div className="space-y-4">
          {notifications.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between border-b border-gray-100 pb-3"
            >
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
              <ToggleSwitch checked={item.enabled} onChange={() => toggleNotification(index)} />
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button className="px-5 py-2 border border-green-500 text-green-500 rounded hover:bg-green-50">
            Close
          </button>
          <button className="px-5 py-2 bg-[var(--color-primary)]  hover:bg-teal-600 text-white rounded ">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <label className="inline-flex items-center cursor-pointer">
      <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer-checked:bg-green-500 relative transition-all">
        <span
          className={`absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
            checked ? "translate-x-5" : ""
          }`}
        ></span>
      </div>
    </label>
  );
}
