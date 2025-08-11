"use client";

import { useState } from "react";

export default function SecurityAndPassword() {
  const [twoFactor, setTwoFactor] = useState(false);
  const [loginNotifications, setLoginNotifications] = useState(false);

  return (
    <div className="p-6  shadow rounded-lg bg-white">
      <h2 className="mb-4">Security and Password</h2>
      <div className="bg-white p-6 mb-6 shadow rounded-lg">
        <h2 className="text-lg font-semibold mb-1">Security Settings</h2>
        <p className="text-sm text-gray-500 mb-6">
          Manage your account security and access controls
        </p>

        <div className="flex justify-between items-center py-3 ">
          <div>
            <p className="font-medium">Two-Factor Authentication</p>
            <p className="text-sm text-gray-500">
              Add an extra layer of security to your account
            </p>
          </div>
          <ToggleSwitch
            checked={twoFactor}
            onChange={() => setTwoFactor(!twoFactor)}
          />
        </div>

        <div className="flex justify-between items-center py-3 ">
          <div>
            <p className="font-medium">Login Notifications</p>
            <p className="text-sm text-gray-500">
              Get notified of new login attempts
            </p>
          </div>
          <ToggleSwitch
            checked={loginNotifications}
            onChange={() => setLoginNotifications(!loginNotifications)}
          />
        </div>
      </div>

      {/* Password Update */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-1">Password</h2>
        <p className="text-sm text-gray-500 mb-6">Update your password</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Current Password" type="password" required />
          <div></div>
          <InputField label="New Password" type="password" required />
          <InputField label="Confirm Password" type="password" required />
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button className="border border-green-500 text-gray-700 px-6 py-2 rounded-md text-sm hover:bg-green-50">
            Close
          </button>
          <button className="bg-green-500 text-white px-6 py-2 rounded-md text-sm hover:bg-green-600">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={onChange}
      />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-green-500 relative transition-all">
        <span
          className={`absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
            checked ? "translate-x-5" : ""
          }`}
        ></span>
      </div>
    </label>
  );
}

function InputField({
  label,
  type = "text",
  required = false,
}: {
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-800 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        placeholder={`Enter your ${label.toLowerCase()}`}
        className="w-full rounded-md  bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-300"
      />
    </div>
  );
}
