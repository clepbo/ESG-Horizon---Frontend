"use client";

import { useState } from "react";
import { CircleX, Camera } from "lucide-react";
import Image from "next/image";
import clsx from "clsx";
import BackButton from "../reusables/BackButton";

type User = {
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  permission: string;
  department?: string;
  jobTitle?: string;
};

export default function EditUserModal({ user, onClose }: { user: User; onClose: () => void }) {
  const [firstName, lastName] = user.name.split(" ");
  const [userImage, setUserImage] = useState<string | null>(null);
  const [isApproved, setIsApproved] = useState(true);

  const toggleApproval = () => {
    setIsApproved((prev) => !prev);
  };

  return (
    <div className="fixed inset-0 z-50 bg-white/60 backdrop-blur-md flex items-center justify-center px-4 overflow-y-auto">
      <div className="relative w-full bg-[#F6FFF6] rounded-2xl shadow-2xl p-6 md:p-10 max-h-[90vh] overflow-y-auto max-w-4xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-red-500 hover:text-red-600 transition"
        >
          <CircleX size={28} />
        </button>

        <BackButton />

        {/* Title */}
        <h2 className="text-xl font-semibold text-gray-900 mb-6">User Information</h2>

        {/* Avatar + Status Badge */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative">
            <Image
              src={userImage || user.avatar || "/images/image.png"}
              alt="User Avatar"
              width={80}
              height={80}
              className="rounded-full object-cover border border-gray-200"
              unoptimized
            />
            <button
              className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow"
              onClick={() => document.getElementById("photo-upload")?.click()}
            >
              <Camera className="w-5 h-5 text-gray-600" />
            </button>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  const imageUrl = URL.createObjectURL(e.target.files[0]);
                  setUserImage(imageUrl);
                }
              }}
            />
          </div>

          {/* Approval Badge */}
          <span
            className={clsx(
              "px-4 py-1 rounded-full text-sm font-medium",
              isApproved
                ? "bg-[var(--color-primary)]  hover:bg-teal-600 text-white"
                : "bg-red-500 text-white"
            )}
          >
            {isApproved ? "Approved" : "Suspended"}
          </span>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="First Name" value={firstName} required />
          <InputField label="Last Name" value={lastName} required />
          <InputField label="Email" value={user.email} required />
          <InputField label="Phone Number" value={user.phone} required />
          <SelectField
            label="Department"
            value={user.department || "Digital"}
            options={["Digital", "Finance", "Marketing"]}
          />
          <SelectField
            label="Job Title"
            value={user.jobTitle || "Administration"}
            options={["Administration", "Manager", "Analyst"]}
          />
          <SelectField
            label="Permission"
            value={user.permission}
            options={["Editor", "Viewer", "Admin"]}
          />
          {/* Action Button */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-800 mb-1">
              Action <span className="text-red-500">*</span>
            </label>
            <button
              onClick={toggleApproval}
              className={clsx(
                "px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2",
                isApproved
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-yellow-500 text-white hover:bg-yellow-600"
              )}
            >
              {isApproved ? "Suspend" : "Restore"}
            </button>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-4 mt-10">
          <button
            onClick={onClose}
            className="border border-teal-300 text-gray-700 px-6 py-2 rounded-md text-sm hover:bg-green-50"
          >
            Close
          </button>
          <button className="bg-[var(--color-primary)]  hover:bg-teal-600 text-white px-6 py-2 rounded-md text-sm ">
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
  required = false,
}: {
  label: string;
  value: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-800 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="text"
        defaultValue={value}
        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
}: {
  label: string;
  value: string;
  options: string[];
}) {
  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-800 mb-1">
        {label} <span className="text-red-500">*</span>
      </label>
      <select
        defaultValue={value}
        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
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
