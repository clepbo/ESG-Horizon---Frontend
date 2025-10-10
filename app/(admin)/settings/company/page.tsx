"use client";
import { useState } from "react";
import Image from "next/image";
import Header from "@/app/components/layout/Header";
import EditCompanyModal from "@/app/components/ui/modals/EditCompany";
import CompanyInfoCard from "@/app/components/settings/company/CompanyInfoCard";
import {
  useCompanyDetails,
  useCompanyUsers,
} from "@/services/hooks/company.hooks";
import { useIndustries } from "@/services/hooks/industries.hooks";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import PageSkeleton from "@/app/components/ui/reusables/PageSkeleton";

export default function CompanyPage() {
  const queryClient = useQueryClient();
  const { data: companyData, isLoading: isCompanyLoading } =
    useCompanyDetails();
  const { data: industryOptions, isLoading: isIndustriesLoading } =
    useIndustries();
  const { data: usersData, isLoading: isUsersLoading } = useCompanyUsers(
    companyData?.id || ""
  );

  const [isModalOpen, setIsModalOpen] = useState(false);

  //   const isCompanyAdmin = user?.role?.name === "company_esg_admin";

  const handleUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ["companyDetails"] });
    setIsModalOpen(false);
  };

  if (isCompanyLoading || isIndustriesLoading || isUsersLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <PageSkeleton />
      </div>
    );
  }

  if (!companyData || !industryOptions) {
    return <div>Company data not found.</div>;
  }

  const companyUsersCount = usersData?.length || 0;

  return (
    <motion.div
      className="p-6 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 25,
        duration: 0.5,
      }}
    >
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
          industryOptions={industryOptions}
          companyUsersCount={companyUsersCount}
          onClose={() => setIsModalOpen(false)}
          onUpdate={handleUpdate}
        />
      )}
    </motion.div>
  );
}
