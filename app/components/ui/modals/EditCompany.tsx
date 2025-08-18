"use client";

import { useState } from "react";
import { CircleX, Camera } from "lucide-react";
import Image from "next/image";
import BackButton from "../reusables/BackButton";
import { Company } from "@/context/AuthContext";
import { InputField } from "@/app/components/common/forms/FormField";
import { updateCompanyProfile } from "@/lib/api/auth";

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
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof Company, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const payload: Partial<Company> = {
        ...formData,
        company_logo_url: companyLogo || formData.company_logo_url,
      };

      // ✅ Pass id and payload
      const updated = await updateCompanyProfile(company.id, payload);

      onUpdate(updated);
    } catch (error) {
      console.error("Error updating company profile:", error);
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
          Edit Company Information
        </h2>

        {/* Logo Upload */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative w-20 h-20">
            <Image
              src={companyLogo || formData.company_logo_url || "/image.png"}
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
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="Company Name"
            value={formData.name}
            onChange={(v) => handleChange("name", v)}
          />
          <InputField
            label="Industry"
            value={formData.industry}
            onChange={(v) => handleChange("industry", v)}
          />
          <InputField
            label="Email"
            value={formData.contact_email}
            onChange={(v) => handleChange("contact_email", v)}
          />
          <InputField
            label="Phone Number"
            value={formData.contact_phone}
            onChange={(v) => handleChange("contact_phone", v)}
          />
          <InputField
            label="Website"
            value={formData.website || ""}
            onChange={(v) => handleChange("website", v)}
          />
          <InputField
            label="Company Address"
            value={formData.address}
            onChange={(v) => handleChange("address", v)}
          />
          <InputField
            label="Country"
            value={formData.isoCountryCode}
            onChange={(v) => handleChange("isoCountryCode", v)}
          />
          <InputField
            label="Description"
            value={formData.description || ""}
            onChange={(v) => handleChange("description", v)}
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
