"use client";

import { useState } from "react";
import { CircleX, Camera, ArrowLeft, Ban, RotateCcw } from "lucide-react";
import Image from "next/image";
import { User } from "@/types/user";

export default function EditTeamUser({
  user,
  onClose,
  onUpdate,
}: {
  user: User;
  onClose: () => void;
  onUpdate: (updatedUser: User) => void;
}) {
  const [formData, setFormData] = useState<User>(user);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [status, setStatus] = useState<"approved" | "suspended">("approved"); // initial status

  const handleChange = (field: keyof User, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdate = () => {
    onUpdate({ ...formData, avatar: userImage || formData.avatar });
  };

  const toggleStatus = () => {
    setStatus((prev) => (prev === "approved" ? "suspended" : "approved"));
  };

  return (
    <div className="fixed inset-0 z-50 bg-white/60 backdrop-blur-md flex items-center justify-center px-4 overflow-y-auto">
      <div className="relative w-full bg-white rounded-2xl shadow-2xl p-6 md:p-10 max-h-[90vh] overflow-y-auto max-w-4xl">
        {/* Close Icon */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-red-500 hover:text-red-600 transition cursor-pointer"
        >
          <CircleX size={32} />
        </button>

        {/* Back Button */}
        <button
          onClick={onClose}
          className="flex items-center gap-2 mb-6 text-sm text-gray-700 hover:text-gray-900"
        >
          <ArrowLeft size={18} /> Back
        </button>

        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          User Information
        </h2>

        {/* Avatar + Status */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative w-20 h-20">
            <Image
              src={userImage || formData.avatar || "/images/image.png"}
              alt="User Avatar"
              width={80}
              height={80}
              className="rounded-full object-cover border border-gray-200"
            />
            <label className="absolute bottom-0 right-0 bg-white rounded-full p-1 border cursor-pointer hover:bg-gray-50">
              <Camera className="w-4 h-4 text-gray-600" />
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const imageUrl = URL.createObjectURL(file);
                    setUserImage(imageUrl);
                  }
                }}
              />
            </label>
          </div>

          {/* Status badge */}
          <span
            className={`text-sm px-3 py-1 rounded-full font-medium ${
              status === "approved"
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {status === "approved" ? "Approved" : "Suspended"}
          </span>
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="First Name *"
            value={formData.firstName}
            onChange={(v) => handleChange("firstName", v)}
          />
          <InputField
            label="Last Name *"
            value={formData.lastName}
            onChange={(v) => handleChange("lastName", v)}
          />
          <InputField
            label="Email *"
            value={formData.email}
            onChange={(v) => handleChange("email", v)}
          />
          <InputField
            label="Phone Number *"
            value={formData.phone}
            onChange={(v) => handleChange("phone", v)}
          />
          <SelectField
            label="Department *"
            value={formData.department}
            options={["Digital", "Operations", "HR", "Finance"]}
            onChange={(v) => handleChange("department", v)}
          />
          <SelectField
            label="Job Title *"
            value={formData.jobTitle}
            options={["Administration", "Manager", "Specialist"]}
            onChange={(v) => handleChange("jobTitle", v)}
          />
          <SelectField
            label="Permission *"
            value={formData.permission}
            options={["Editor", "Admin", "Viewer"]}
            onChange={(v) => handleChange("permission", v)}
          />

          {/* Suspend / Restore button */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-800 mb-1">
              Action *
            </label>
            <button
              type="button"
              onClick={toggleStatus}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm ${
                status === "approved"
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-yellow-500 hover:bg-yellow-600 text-white"
              }`}
            >
              {status === "approved" ? (
                <>
                  <Ban size={14} /> Suspend
                </>
              ) : (
                <>
                  <RotateCcw size={14} /> Restore
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-4 mt-10">
          <button
            onClick={onClose}
            className="border border-green-500 text-green-600 px-6 py-2 rounded-md text-sm hover:bg-green-50 cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={handleUpdate}
            className="bg-[var(--color-primary)]  hover:bg-teal-600 text-white px-6 py-2 rounded-md text-sm  cursor-pointer"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-800 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-800 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
