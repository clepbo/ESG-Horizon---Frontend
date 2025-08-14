"use client";

import { useState } from "react";
import { CircleX, Camera } from "lucide-react";
import Image from "next/image";
import BackButton from "../BackButton";
import { User } from "@/context/AuthContext";
import { updateUserProfile } from "@/lib/api/auth";
import { InputField, SelectField } from "@/app/components/forms/FormField";

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
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof User, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const payload = {
        ...formData,
        avatar: userImage || formData.avatar,
      };
      const updated = await updateUserProfile(payload);
      onUpdate(updated);
    } catch (error) {
      console.error("Error updating user profile:", error);
    } finally {
      setLoading(false);
    }
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
          <span className="text-sm bg-blue-500 text-white px-3 py-1 rounded-full">
            {formData.role?.name}
          </span>
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="First Name"
            value={formData.first_name}
            onChange={(v) => handleChange("first_name", v)}
          />
          <InputField
            label="Last Name"
            value={formData.last_name}
            onChange={(v) => handleChange("last_name", v)}
          />
          <InputField
            label="Email"
            value={formData.email}
            onChange={(v) => handleChange("email", v)}
          />
          <InputField
            label="Phone Number"
            value={formData.phone_number}
            onChange={(v) => handleChange("phone_number", v)}
          />
          <SelectField
            label="Department"
            value={formData.department}
            options={["Digital", "Operations", "HR", "Finance"]}
            onChange={(v) => handleChange("department", v)}
          />
          <InputField
            label="Job Title"
            value={formData.job_title}
            onChange={(v) => handleChange("job_title", v)}
          />
          <SelectField
            label="Permission"
            value={formData.role?.name || ""}
            options={["Super Admin", "Admin", "User"]}
            onChange={(v) =>
              setFormData((prev) => ({
                ...prev,
                role: { name: v }, // ✅ update nested role
              }))
            }
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
            disabled={loading}
            className="bg-green-500 text-white px-6 py-2 rounded-md text-sm hover:bg-green-600 cursor-pointer disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
}
