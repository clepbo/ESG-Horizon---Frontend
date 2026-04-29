"use client";

import { useState } from "react";
import UserAvatar from "../../users/_components/UserAvatar";
import SettingsCard from "./SettingsCard";
import { profileFixture } from "../_fixtures/profile";

export default function ProfileSection() {
  const [form, setForm] = useState({
    firstName: profileFixture.firstName,
    lastName: profileFixture.lastName,
    email: profileFixture.email,
    phone: profileFixture.phone,
  });

  return (
    <SettingsCard title="Profile">
      <div className="flex items-center gap-3 mb-6">
        <div className="scale-110 origin-left">
          <UserAvatar
            firstName={profileFixture.firstName}
            lastName={profileFixture.lastName}
            color={profileFixture.avatarColor}
          />
        </div>
        <div className="ml-2">
          <p className="text-sm font-semibold text-gray-900">
            {profileFixture.firstName} {profileFixture.lastName}
          </p>
          <p className="text-xs text-gray-700">{profileFixture.roleLabel}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField
          label="First Name"
          value={form.firstName}
          onChange={(v) => setForm({ ...form, firstName: v })}
        />
        <TextField
          label="Last Name"
          value={form.lastName}
          onChange={(v) => setForm({ ...form, lastName: v })}
        />
        <TextField
          label="Email"
          value={form.email}
          type="email"
          onChange={(v) => setForm({ ...form, email: v })}
        />
        <TextField
          label="Phone"
          value={form.phone}
          type="tel"
          onChange={(v) => setForm({ ...form, phone: v })}
        />
      </div>

      <div className="flex justify-end mt-5">
        <button
          type="button"
          className="h-10 px-5 rounded-lg bg-[#119B95] hover:bg-[#0f877f] text-white text-sm font-medium"
        >
          Save Changes
        </button>
      </div>
    </SettingsCard>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm text-gray-800 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 px-3 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#119B95]/20 focus:border-[#119B95]/40 text-gray-900"
      />
    </div>
  );
}
