"use client";

import { useState } from "react";
import Toggle from "../../components/Toggle";
import SettingsCard from "./SettingsCard";
import { notificationsFixture } from "../_fixtures/notifications";

export default function NotificationsSection() {
  const [prefs, setPrefs] = useState(notificationsFixture);

  const toggle = (key: string) => {
    setPrefs((prev) => prev.map((p) => (p.key === key ? { ...p, enabled: !p.enabled } : p)));
  };

  return (
    <SettingsCard title="Notifications">
      <ul className="space-y-4">
        {prefs.map((p) => (
          <li key={p.key} className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">{p.title}</p>
              <p className="text-xs text-gray-700 mt-0.5">{p.subtitle}</p>
            </div>
            <Toggle checked={p.enabled} onChange={() => toggle(p.key)} ariaLabel={p.title} />
          </li>
        ))}
      </ul>
    </SettingsCard>
  );
}
