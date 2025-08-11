"use client";

import Image from "next/image";
import { useState } from "react";
import { Edit } from "lucide-react";
import EditCompanyModal, { Company } from "@/app/components/modals/EditCompany";

const INITIAL_COMPANY: Company = {
  name: "Teasoo Consulting",
  regNo: "555-0102",
  industry: "Consulting",
  email: "info@teasooconsulting.com",
  phone: "(684) 555-0102",
  website: "www.teasooconsulting.com",
  address: "4, Oghosa Crescent, Off Ihama, GRA Benin City",
  staffStrength: 20,
  logo: "/image.png",
};

export default function CompanyPage() {
  const [company, setCompany] = useState<Company>(INITIAL_COMPANY);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleUpdateCompany = (updatedCompany: Company) => {
    setCompany(updatedCompany);
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Image
            src={company.logo ?? "/default-avatar.png"}
            alt={company.name}
            width={50}
            height={50}
            className="rounded-full"
          />
          <div>
            <h2 className="text-xl font-semibold">{company.name}</h2>
            <p className="text-sm text-gray-500">Reg. No.: {company.regNo}</p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded hover:bg-gray-50 cursor-pointer"
        >
          <Edit className="w-4 h-4" />
          Edit
        </button>
      </div>

      {/* Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Image
            src={company.logo ?? "/default-avatar.png"}
            alt={company.name}
            width={24}
            height={24}
            className="rounded-full"
          />
          Company Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
          <InfoField label="Company Name" value={company.name} />
          <InfoField label="Industry Type" value={company.industry} />
          <InfoField label="Email Address" value={company.email} />
          <InfoField label="Contact Phone Number" value={company.phone} />
          <InfoField label="Website Address" value={company.website} />
          <InfoField label="Company Address" value={company.address} />
          <InfoField label="Registration Number" value={company.regNo} />
          <InfoField
            label="Staff Strength"
            value={company.staffStrength.toString()}
          />
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <EditCompanyModal
          company={company}
          onClose={() => setIsModalOpen(false)}
          onUpdate={handleUpdateCompany}
        />
      )}
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
