"use client";

import { useState } from "react";
import { CircleX } from "lucide-react";
import Image from "next/image";
import clsx from "clsx";
import PhotoUploadButton from "./PhotoUploadButton";
import BackButton from "../BackButton";

export default function EditUserModal({
  user,
  onClose,
}: {
  user: any;
  onClose: () => void;
}) {
  const [firstName, lastName] = user.name.split(" ");
  const [userImage, setUserImage] = useState<string | null>(null);
  const [companyImage, setCompanyImage] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-50 bg-white/60 backdrop-blur-md flex items-center justify-center px-4 overflow-y-auto">
      <div className="relative w-full bg-white rounded-2xl shadow-2xl p-6 md:p-10 max-h-[90vh] overflow-y-auto max-w-5xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-red-500 hover:text-red-600 transition"
        >
          <CircleX size={28} />
        </button>

        {/* Back Button */}
        <BackButton />

        {/* === Personal Info === */}
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Personal Information
        </h2>

        {/* User Image */}
        <div className="flex items-center gap-4 mb-8 relative w-max">
          <Image
            src={userImage || user.avatar || "/images/image.png"}
            alt="User Avatar"
            width={72}
            height={72}
            className="rounded-full object-cover border border-gray-200"
            unoptimized
          />
          <PhotoUploadButton
            onUpload={(file) => {
              const imageUrl = URL.createObjectURL(file);
              setUserImage(imageUrl);
            }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="First Name" value={firstName} required />
          <InputField label="Last Name" value={lastName} required />
          <InputField label="Email" value={user.email} required />
          <InputField label="Phone Number" value={user.phone} required />
          <InputField label="Role" value="Sustainability Officer" required />
          <InputField label="Permission" value={user.permission} required />
        </div>

        {/* === Company Info === */}
        <h2 className="text-xl font-semibold text-gray-900 mt-10 mb-6">
          Company Information
        </h2>

        {/* Company Logo */}
        <div className="flex items-center gap-4 mb-8 relative w-max">
          <Image
            src={companyImage || user.companyLogo || "/images/image2.png"}
            alt="Company Logo"
            width={72}
            height={72}
            className="rounded object-cover border border-gray-200"
            unoptimized
          />
          <PhotoUploadButton
            onUpload={(file) => {
              const imageUrl = URL.createObjectURL(file);
              setCompanyImage(imageUrl);
            }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="Company Name" value={user.company} required />
          <InputField label="Industry Type" value="Consulting" required />
          <InputField
            label="Email"
            value={user.companyEmail || "info@teasooconsulting.com"}
            required
          />
          <InputField
            label="Contact Phone Number"
            value={user.companyPhone || user.phone}
            required
          />
          <InputField
            label="Website Address"
            value={user.website || "www.teasooconsulting.com"}
            required
          />
          <InputField
            label="Registration Number"
            value={user.registrationNumber || "555-0102"}
            info="CAC issued company registration number"
          />
          <InputField
            label="Staff Strength"
            value={user.staffStrength || "20"}
            required
          />
          <TextAreaField
            label="Company Address"
            value={
              user.address || "4, Oghosa Crescent, Off Ihama, GRA Benin City"
            }
            required
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-10">
          <button
            onClick={onClose}
            className="border border-green-300 text-gray-700 px-6 py-2 rounded-md text-sm hover:bg-green-50"
          >
            Close
          </button>
          <button className="bg-green-500 text-white px-6 py-2 rounded-md text-sm hover:bg-green-600">
            Update
          </button>
        </div>
      </div>
    </div>
  );
}

// InputField component
import { Info } from "lucide-react";

function InputField({
  label,
  value,
  required = false,
  info,
}: {
  label: string;
  value: string;
  required?: boolean;
  info?: string;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-1">
        <label className="flex items-center text-sm font-medium text-gray-800 mb-1">
          <span>{label}</span>
          {info ? (
            <div className="group relative ml-1 cursor-pointer">
              <Info className="w-4 h-4 text-gray-500" />
              <div className="absolute left-5 top-1 z-10 hidden w-max rounded bg-black px-2 py-1 text-xs text-white group-hover:block">
                {info}
              </div>
            </div>
          ) : required ? (
            <span className="ml-1 text-red-500">*</span>
          ) : null}
        </label>
      </div>

      <input
        type="text"
        defaultValue={value}
        className={clsx(
          "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm transition",
          "text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-esg-green",
          "hover:shadow-sm"
        )}
      />
    </div>
  );
}

// TextAreaField component
function TextAreaField({
  label,
  value,
  required = false,
}: {
  label: string;
  value: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col ">
      <label className="text-sm font-medium text-gray-800 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        defaultValue={value}
        rows={3}
        className={clsx(
          "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm resize-none",
          "text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-esg-green"
        )}
      />
    </div>
  );
}
