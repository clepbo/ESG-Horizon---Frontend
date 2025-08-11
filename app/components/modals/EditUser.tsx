"use client";

import { useState } from "react";
import { CircleX, Camera } from "lucide-react";
import Image from "next/image";
import BackButton from "../BackButton";
import { User } from "@/types/user"; //

export default function EditUserModal({
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

  const handleChange = (field: keyof User, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdate = () => {
    onUpdate({ ...formData, avatar: userImage || formData.avatar });
  };

  return (
    <div className="fixed inset-0 z-50 bg-white/60 backdrop-blur-md flex items-center justify-center px-4 overflow-y-auto">
      <div className="relative w-full bg-white rounded-2xl shadow-2xl p-6 md:p-10 max-h-[90vh] overflow-y-auto max-w-4xl">
        {/* Close Icon */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-red-500 hover:text-red-600 transition cursor-pointer"
        >
          <CircleX size={28} />
        </button>

        <BackButton />

        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Personal Information
        </h2>

        {/* Avatar */}
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
          <span className="text-sm bg-blue-100 text-blue-600 px-3 py-1 rounded-full">
            {formData.permission}
          </span>
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="First Name"
            value={formData.firstName}
            onChange={(v) => handleChange("firstName", v)}
          />
          <InputField
            label="Last Name"
            value={formData.lastName}
            onChange={(v) => handleChange("lastName", v)}
          />
          <InputField
            label="Email"
            value={formData.email}
            onChange={(v) => handleChange("email", v)}
          />
          <InputField
            label="Phone Number"
            value={formData.phone}
            onChange={(v) => handleChange("phone", v)}
          />
          <SelectField
            label="Department"
            value={formData.department}
            options={["Digital", "Operations", "HR", "Finance"]}
            onChange={(v) => handleChange("department", v)}
          />
          <InputField
            label="Job Title"
            value={formData.jobTitle}
            onChange={(v) => handleChange("jobTitle", v)}
          />
          <SelectField
            label="Permission"
            value={formData.permission}
            options={["Super Admin", "Admin", "User"]}
            onChange={(v) => handleChange("permission", v)}
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-4 mt-10">
          <button
            onClick={onClose}
            className="border border-green-500 text-gray-700 px-6 py-2 rounded-md text-sm hover:bg-green-50 cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={handleUpdate}
            className="bg-green-500 text-white px-6 py-2 rounded-md text-sm hover:bg-green-600 cursor-pointer"
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
