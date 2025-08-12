"use client";

import Image from "next/image";
import { useState } from "react";
import { Edit } from "lucide-react";
import EditCompanyModal, { Company } from "@/app/components/modals/EditCompany";
import Header from "../../components/Header";

const INITIAL_COMPANY: Company = {
  name: "ClearWatts Energy",
  regNo: "555-0102",
  industry: "Oil and Gas",
  email: "name@companyname.net",
  phone: "(684) 555-0102",
  website: "www.zephyrsofttechnologies.com",
  address: "2972 Westheimer Rd. Santa Ana, Illinois 85486",
  staffStrength: 20,
  logo: "/image.png",
  permission: "Approved",
};

export default function CompanyPage() {
  const [company, setCompany] = useState<Company>(INITIAL_COMPANY);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [ifrsS1, setIfrsS1] = useState(true);
  const [ifrsS2, setIfrsS2] = useState(true);
  const [gri, setGri] = useState(false);

  const handleUpdateCompany = (updatedCompany: Company) => {
    setCompany(updatedCompany);
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F2FBF3] p-6 space-y-6">
      {/* Top Bar */}
      <Header />

      {/* Organization Information Card */}
      <div className="bg-white p-6 mb-6 shadow rounded-lg">
        {/* Header Row with Title & Edit Button */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Organization Information</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="cursor-pointer flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
        </div>

        {/* Logo + Info Fields */}
        <div className="flex items-start gap-4">
          <Image
            src={company.logo ?? "/image.png"}
            alt={company.name}
            width={50}
            height={50}
            className="rounded-full"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12 w-full">
            <InfoField label="Company Name" value={company.name} />
            <InfoField label="Industry Type" value={company.industry} />
            <InfoField label="Email Address" value={company.email} />
            <InfoField label="Contact Phone Number" value={company.phone} />
            <InfoField label="Website Address" value={company.website} />
            <InfoField
              label="Company Registration Number"
              value={company.regNo}
            />
            <InfoField
              label="Staff Strength"
              value={company.staffStrength.toString()}
            />
            <InfoField label="Company Address" value={company.address} />
          </div>
        </div>
      </div>

      {/* ESG Frameworks Card */}
      <div className="bg-white p-6 shadow rounded-lg">
        <h2 className="text-xl font-semibold mb-2">ESG Frameworks</h2>
        <p className="text-sm text-gray-500 mb-6">
          Select the reporting frameworks and standards you follow
        </p>

        {/* IFRS S1 */}
        <div className="flex justify-between items-center py-3 ">
          <div>
            <p className="font-medium">IFRS S1</p>
            <p className="text-sm text-gray-500">
              International sustainability disclosure standards
            </p>
          </div>
          <ToggleSwitch checked={ifrsS1} onChange={() => setIfrsS1(!ifrsS1)} />
        </div>

        {/* IFRS S2 */}
        <div className="flex justify-between items-center py-3 ">
          <div>
            <p className="font-medium">IFRS S2</p>
            <p className="text-sm text-gray-500">
              International sustainability disclosure standards
            </p>
          </div>
          <ToggleSwitch checked={ifrsS2} onChange={() => setIfrsS2(!ifrsS2)} />
        </div>

        {/* GRI Standards */}
        <div className="flex justify-between items-center py-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <p className="font-medium">GRI Standards</p>
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                Upgrade Plan
              </span>
            </div>
            <p className="text-sm text-gray-500">Global Reporting Initiative</p>
          </div>
          <ToggleSwitch checked={gri} onChange={() => setGri(!gri)} />
        </div>
      </div>

      {/* Edit Company Modal */}
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

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={onChange}
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
