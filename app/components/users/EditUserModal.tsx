"use client";
import { useState } from "react";
import { CircleX } from "lucide-react";
import Image from "next/image";
import clsx from "clsx";
import PhotoUploadButton from "./PhotoUploadButton";

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
      <div className="relative w-full  bg-white rounded-2xl shadow-2xl p-6 md:p-10 max-h-[90vh] overflow-y-auto max-w-5xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-red-500 hover:text-red-600 transition cursor-pointer"
        >
          <CircleX />
        </button>

        {/* Back Button */}
        <button
          onClick={onClose}
          className="inline-flex items-center gap-2 border border-gray-300 text-sm px-4 py-2 rounded-md hover:bg-gray-100 transition"
        >
          ← Back
        </button>

        {/* Personal Info Section */}
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Personal Information
        </h2>

        <div className="flex items-center gap-4 mb-8 relative w-max">
          <Image
            src={userImage || "/images/image.png"}
            alt="User Avatar"
            width={72}
            height={72}
            className="rounded-full object-cover border border-gray-200"
            unoptimized
          />

          {/* <button className="absolute bottom-0 left-14 transform translate-x-1/2 translate-y-1/2 bg-white rounded-full border border-gray-300 p-2 shadow-sm hover:bg-gray-100 transition">
            📷
          </button> */}
          <PhotoUploadButton
            onUpload={(file) => {
              const imageUrl = URL.createObjectURL(file);
              setUserImage(imageUrl); // ✅ preview image
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

        {/* Company Info Section */}
        <h2 className="text-xl font-semibold text-gray-900 mt-10 mb-6">
          Company Information
        </h2>

        <div className="flex items-center gap-4 mb-8 relative w-max">
          <Image
            src={companyImage || "/images/image.png"}
            alt="Company Logo"
            width={72}
            height={72}
            className="rounded object-cover border border-gray-200"
            unoptimized
          />

          <PhotoUploadButton
            onUpload={(file) => {
              const imageUrl = URL.createObjectURL(file);
              setCompanyImage(imageUrl); // ✅ preview company logo
            }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="Company Name" value={user.company} required />
          <InputField label="Industry Type" value="Consulting" required />
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
        className={clsx(
          "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm",
          "text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-esg-green"
        )}
      />
    </div>
  );
}
