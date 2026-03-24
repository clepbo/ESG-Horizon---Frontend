"use client";

import { useState, useEffect } from "react";
import Header from "@/app/(company)/components/Header";
import EditCompanyModal from "@/app/components/ui/modals/EditCompany";
import CompanyInfoCard from "@/app/components/settings/company/CompanyInfoCard";
import ToggleSwitch from "@/app/components/settings/company/ToggleSwitch";
import { useAuth } from "@/context/AuthContext";
import { useRoles } from "@/lib/roles";
import PermissionTooltip from "@/app/components/ui/PermissionTooltip";
import { useCompanyDetails, useCompanyUsers } from "@/services/hooks/company.hooks";
import { companyService } from "@/services/company.service";
import { toast } from "react-toastify";
import { useIndustries } from "@/services/hooks/industries.hooks";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import PageSkeleton from "@/app/components/ui/reusables/PageSkeleton";

export default function CompanyPage() {
  const queryClient = useQueryClient();
  const { data: companyData, isLoading: isCompanyLoading } = useCompanyDetails();
  const { data: industryOptions, isLoading: isIndustriesLoading } = useIndustries();
  const { data: usersData, isLoading: isUsersLoading } = useCompanyUsers(companyData?.id || "");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();
  const { isCompanyAdmin, isSuperAdmin } = useRoles();
  const [ifrsIssb] = useState(true);

  const [requireAssessmentReview, setRequireAssessmentReview] = useState(true);
  const canEditProfile = isCompanyAdmin || isSuperAdmin;
  const canToggleReview = isCompanyAdmin || isSuperAdmin;

  const handleUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ["companyDetails"] });
    setIsModalOpen(false);
  };

  // Sync requireAssessmentReview state with company data
  useEffect(() => {
    if (companyData) {
      // setRequireAssessmentReview(companyData.requireAssessmentReview || false);
      setRequireAssessmentReview(companyData.requireAssessmentReview ?? true);
    }
  }, [companyData]);

  const handleAssessmentReviewToggle = async () => {
    if (!canToggleReview || !companyData?.id) return;

    const newValue = !requireAssessmentReview;
    setRequireAssessmentReview(newValue);

    try {
      await companyService.updateDetails(companyData.id, {
        requireAssessmentReview: newValue,
      });
      queryClient.invalidateQueries({ queryKey: ["companyDetails"] });
      toast.success(
        newValue
          ? "Assessment review enabled. Submitted assessments will require approval."
          : "Assessment review disabled. Submitted assessments will be automatically approved."
      );
    } catch (error) {
      setRequireAssessmentReview(!newValue); // Revert on error
      toast.error("Failed to update assessment review setting.");
      console.error(error);
    }
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

  // Calculate the user count here
  const companyUsersCount = usersData?.length || 0;

  return (
    <motion.div
      className="min-h-screen bg-[#F2FBF3] p-6 space-y-6"
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

      <CompanyInfoCard company={companyData} onEdit={canEditProfile ? () => setIsModalOpen(true) : undefined} />

      {/* ESG Frameworks */}
      <div className="bg-white p-6 shadow rounded-lg">
        <h2 className="text-xl font-semibold mb-2">ESG Frameworks</h2>
        <p className="text-sm text-gray-500 mb-6">
          Select the reporting frameworks and standards you follow
        </p>

        <div className="flex justify-between items-center py-3">
          <div>
            <p className="font-medium">IFRS ISSB</p>
            <p className="text-sm text-gray-500">
              International sustainability disclosure standards
            </p>
          </div>
          <div className="relative group">
            <div className="opacity-40 pointer-events-none">
              {/* {!isCompanyAdmin && (
              <div className="absolute right-0 bottom-full mb-2 w-40 p-2 bg-gray-700 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                Only Company Admin can switch this
              </div>
            )} */}
              <ToggleSwitch checked={ifrsIssb} onChange={() => {}} disabled={true} />
            </div>
            <div className="absolute right-0 bottom-full mb-2 w-40 p-2 bg-gray-700 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
              This feature is currently disabled
            </div>
          </div>
        </div>

        {/* <div className="flex justify-between items-center py-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <p className="font-medium">GRI Standards</p>
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                Upgrade Plan
              </span>
            </div>
            <p className="text-sm text-gray-500">Global Reporting Initiative</p>
          </div>
          <div className="relative group">
            <ToggleSwitch checked={gri} onChange={() => setGri(!gri)} disabled={!isCompanyAdmin} />
            {!isCompanyAdmin && (
              <div className="absolute right-0 bottom-full mb-2 w-40 p-2 bg-gray-700 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                Only Company Admin can switch this
              </div>
            )}
          </div>
        </div> */}
      </div>

      {/* Assessment Review Settings */}
      <div className="bg-white p-6 shadow rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Assessment Review</h2>
        <p className="text-sm text-gray-500 mb-6">
          Control whether submitted assessments require admin approval before being finalized
        </p>

        <div className="flex justify-between items-center py-3">
          <div>
            <p className="font-medium">Require Assessment Review</p>
            <p className="text-sm text-gray-500">
              When enabled, submitted assessments will await admin approval. When disabled,
              assessments are automatically approved upon submission.
            </p>
          </div>
          <div className="relative group">
            <ToggleSwitch
              checked={requireAssessmentReview}
              onChange={handleAssessmentReviewToggle}
              disabled={!canToggleReview}
            />
            {!canToggleReview && (
              <PermissionTooltip message="Only Admin can change this" align="right" />
            )}
          </div>
        </div>
      </div>

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
