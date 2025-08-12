"use client";

import { useState } from "react";
import { CircleX, Camera } from "lucide-react";
import Image from "next/image";
import BackButton from "../BackButton";

export interface Company {
  name: string;
  regNo: string;
  industry: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  staffStrength: number;
  logo?: string;
  permission: string;
}

export default function EditCompanyModal({
  company,
  onClose,
  onUpdate,
}: {
  company: Company;
  onClose: () => void;
  onUpdate: (updatedCompany: Company) => void;
}) {
  const [formData, setFormData] = useState<Company>(company);
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);

  const handleChange = (field: keyof Company, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdate = () => {
    onUpdate({ ...formData, logo: companyLogo || formData.logo });
  };

  return (
    <div className="fixed inset-0 z-50 bg-white/60 backdrop-blur-md flex items-center justify-center px-4 overflow-y-auto">
      <div className="relative w-full bg-white rounded-2xl shadow-2xl p-6 md:p-10 max-h-[90vh] overflow-y-auto max-w-4xl">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-red-500 hover:text-red-600 transition cursor-pointer"
        >
          <CircleX size={28} />
        </button>

        <BackButton />

        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Edit Company Information
        </h2>

        {/* Logo Upload with Permission Badge */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative w-20 h-20">
            <Image
              src={companyLogo || formData.logo || "/image.png"}
              alt="Company Logo"
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
                    setCompanyLogo(imageUrl);
                  }
                }}
              />
            </label>
          </div>

          {/* Dynamic Permission Badge */}
          <span
            className={`text-xs font-medium px-3 py-1 rounded-full ${
              formData.permission === "Approved"
                ? "bg-green-200 text-green-700"
                : formData.permission === "Pending"
                ? "bg-yellow-400 text-white"
                : "bg-red-400 text-white"
            }`}
          >
            {formData.permission}
          </span>
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="Company Name"
            value={formData.name}
            onChange={(v) => handleChange("name", v)}
          />
          <InputField
            label="Industry Type"
            value={formData.industry}
            onChange={(v) => handleChange("industry", v)}
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
          <InputField
            label="Website"
            value={formData.website}
            onChange={(v) => handleChange("website", v)}
          />
          <InputField
            label="Company Address"
            value={formData.address}
            onChange={(v) => handleChange("address", v)}
          />
          <InputField
            label="Registration Number"
            value={formData.regNo}
            onChange={(v) => handleChange("regNo", v)}
          />
          <InputField
            label="Staff Strength"
            value={formData.staffStrength.toString()}
            onChange={(v) => handleChange("staffStrength", Number(v))}
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
