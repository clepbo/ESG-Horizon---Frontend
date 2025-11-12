"use client";

import { useState } from "react";
import CodeInputModal from "../ui/modals/CodeInputModal";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import { handleAxiosError } from "@/lib/utils";
import { toast } from "react-toastify";
import { authService } from "@/services/auth.service";

export default function SecurityAndPassword() {
  const { user } = useAuth();
  // const [twoFactor, setTwoFactor] = useState(false);
  // const [loginNotifications, setLoginNotifications] = useState(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [passwordMatchError, setPasswordMatchError] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleSavePassword = async () => {
    if (!user || !user.email) {
      return;
    }
    if (!newPassword || !confirmPassword) {
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMatchError(true);
      return;
    }
    try {
      setSaving(true);
      setPasswordMatchError(false);
      setIsModalOpen(true);
      await authService.forgotPassword({ email: user.email });
    } catch (error) {
      const errorMessage = handleAxiosError(error);
      toast.error(errorMessage);
      setSaving(false);
      setIsModalOpen(false);
    }
  };

  const handleVerifySuccess = () => {
    toast.success("Password changed successfully");
    setIsModalOpen(false);
    setSaving(false);
  };

  return (
    <div className="p-6  shadow rounded-lg bg-white">
      <h2 className="mb-4">Security and Password</h2>
      <div className="bg-white p-6 mb-6 shadow rounded-lg">
        <h2 className="text-lg font-semibold mb-1">Security Settings</h2>
        <p className="text-sm text-gray-500 mb-6">
          Manage your account security and access controls
        </p>

        <div className="flex justify-between items-center py-3">
          <div>
            <p className="font-medium">Two-Factor Authentication</p>
            <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
          </div>

          <div
            className="relative group cursor-not-allowed"
            title="Subscribe to unlock this feature"
          >
            <ToggleSwitch checked={false} onChange={() => {}} disabled />
            <span className="absolute right-0 -top-8 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-sm whitespace-nowrap">
              Subscribe to access this feature
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center py-3">
          <div>
            <p className="font-medium">Login Notifications</p>
            <p className="text-sm text-gray-500">Get notified of new login attempts</p>
          </div>

          <div
            className="relative group cursor-not-allowed"
            title="Your plan doesn’t include this feature"
          >
            <ToggleSwitch checked={false} onChange={() => {}} disabled />
            <span className="absolute right-0 -top-8 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-sm whitespace-nowrap">
              Upgrade your plan to enable this
            </span>
          </div>
        </div>
      </div>

      {/* Password Update */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-1">Password</h2>
        <p className="text-sm text-gray-500 mb-6">Update your password</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Current Password" type="password" required />
          <br />
          <InputField
            label="New Password"
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <InputField
            label="Confirm Password"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        {passwordMatchError && (
          <p className="text-sm text-red-500 mt-2">New passwords do not match.</p>
        )}

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button className="border bg-[var(--color-primary)]   text-white px-6 py-2 rounded-md text-sm hover:bg-green-50">
            Close
          </button>
          <button
            onClick={handleSavePassword}
            className="bg-[var(--color-primary)]  hover:bg-teal-600 text-white px-6 py-2 rounded-md text-sm  hover:cursor-pointer"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
      <CodeInputModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSaving(false);
        }}
        email={user?.email || ""}
        newPassword={newPassword}
        onVerifySuccess={handleVerifySuccess}
      />
    </div>
  );
}

function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <label className="inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
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
  value,
  onChange,
}: {
  label: string;
  type?: string;
  required?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = type === "password" && showPassword ? "text" : type;

  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-800 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          type={inputType}
          placeholder={`Enter your ${label.toLowerCase()}`}
          value={value}
          onChange={onChange}
          className="w-full rounded-md bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-300 pr-10"
        />
        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 hover:cursor-pointer"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
    </div>
  );
}
