"use client";

import { useState } from "react";
import Toggle from "../../components/Toggle";
import SettingsCard from "./SettingsCard";

export default function SecuritySection() {
  const [twoFactor, setTwoFactor] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });

  return (
    <SettingsCard title="Security">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">Two-Factor Authentication</p>
            <p className="text-xs text-gray-700 mt-0.5">Add extra login security</p>
          </div>
          <Toggle checked={twoFactor} onChange={setTwoFactor} ariaLabel="Two-factor authentication" />
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">Login Notifications</p>
            <p className="text-xs text-gray-700 mt-0.5">Alert on new login attempts</p>
          </div>
          <Toggle checked={loginAlerts} onChange={setLoginAlerts} ariaLabel="Login notifications" />
        </div>
      </div>

      <div className="border-t border-gray-100 mt-6 pt-6">
        <p className="text-sm font-semibold text-gray-900 mb-4">Change Password</p>
        <div className="space-y-4">
          <PasswordField
            label="Current Password"
            value={passwords.current}
            onChange={(v) => setPasswords({ ...passwords, current: v })}
          />
          <PasswordField
            label="New Password"
            value={passwords.next}
            onChange={(v) => setPasswords({ ...passwords, next: v })}
          />
          <PasswordField
            label="Confirm Password"
            value={passwords.confirm}
            onChange={(v) => setPasswords({ ...passwords, confirm: v })}
          />
        </div>
        <div className="flex justify-end mt-5">
          <button
            type="button"
            className="h-10 px-5 rounded-lg bg-[#119B95] hover:bg-[#0f877f] text-white text-sm font-medium"
          >
            Update Password
          </button>
        </div>
      </div>
    </SettingsCard>
  );
}

function PasswordField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm text-gray-800 mb-1.5">{label}</label>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="••••••••••"
        className="w-full h-10 px-3 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#119B95]/20 focus:border-[#119B95]/40 text-gray-900 placeholder:text-gray-500"
      />
    </div>
  );
}
