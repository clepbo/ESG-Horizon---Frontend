"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Edit } from "lucide-react";
import EditCompanyModal from "@/app/components/modals/EditCompany";
import Header from "@/app/components/layout/Header";
import { Company } from "@/context/AuthContext";
import CompanyInfoCard from "@/app/components/settings/company/CompanyInfoCard";
import Spinner from "@/app/components/Spinner";
import { getCompanyProfile } from "@/lib/api/auth";

export default function CompanyPage() {
  const [companyData, setCompanyData] = useState<Company | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const companies = await getCompanyProfile();
        if (Array.isArray(companies) && companies.length > 0) {
          setCompanyData(companies[0]); // ✅ first company
        }
      } catch (err) {
        console.error("Error fetching company:", err);
      }
    };

    fetchCompany();
  }, []);

  const handleUpdateCompany = (updatedCompany: Company) => {
    setCompanyData(updatedCompany);
    setIsModalOpen(false);
  };

  if (!companyData) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <Header />

      {/* Company Header Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Image
            src={companyData.company_logo_url ?? "/image.png"}
            alt={companyData.name}
            width={50}
            height={50}
            className="rounded-full"
          />
          <div>
            <h2 className="text-xl font-semibold">{companyData.name}</h2>
            <p className="text-sm text-gray-500">
              Reg. No.: {companyData.registration_number}
            </p>
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

      {/* Info Card */}
      <CompanyInfoCard
        company={companyData}
        onEdit={() => setIsModalOpen(true)}
      />

      {/* Modal */}
      {isModalOpen && companyData && (
        <EditCompanyModal
          company={companyData}
          onClose={() => setIsModalOpen(false)}
          onUpdate={handleUpdateCompany}
        />
      )}
    </div>
  );
}
