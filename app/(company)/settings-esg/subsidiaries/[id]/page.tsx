"use client";

import { useState } from "react";
import { notFound, useRouter, useParams } from "next/navigation";
import { FiPlus } from "react-icons/fi";
import { ArrowLeft } from "lucide-react";
import {
  useSubsidiary,
  useSubsidiaryUsers,
  useSubsidiaryDepartments,
} from "@/services/hooks/subsidiaries.hooks";
import { Button } from "@/app/components/ui/button";
import CompanySetupModal from "@/app/components/company/CompanySetupModal";
import { toast } from "react-toastify";
import MainContentCard from "@/app/components/company/subsidiaries/MainContentCard";
import { TeamMembersTable } from "@/app/components/company/subsidiaries/TeamMembersTable";
import { DepartmentsTable } from "@/app/components/company/subsidiaries/DepartmentTable";
import PageSkeleton from "@/app/components/ui/reusables/PageSkeleton";
import Header from "@/app/(company)/components/Header";
import { CustomBreadcrumb } from "@/app/components/ui/CustomBreadcrumb";

interface Params {
  id: string;
  [key: string]: string | string[] | undefined;
}

export default function SubsidiaryDetailsPage() {
  const router = useRouter();
  const params = useParams<Params>();
  const id = params.id;

  const subsidiaryId = Number(id);

  const isIdValid = !isNaN(subsidiaryId) && subsidiaryId > 0;
  const [activeTab, setActiveTab] = useState("team");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"subsidiary" | "department" | "user">("user");

  const {
    data: subsidiaryData,
    isLoading: isSubsidiaryLoading,
    refetch: refetchSubsidiary,
  } = useSubsidiary(subsidiaryId);
  const {
    data: usersData,
    isLoading: isUsersLoading,
    refetch: refetchUsers,
  } = useSubsidiaryUsers(subsidiaryId);
  const {
    data: departmentsData,
    // isLoading: isDepartmentLoading,
    // refetch: refetchDepartments,
  } = useSubsidiaryDepartments(subsidiaryId);

  const openModalWithTab = (tab: "subsidiary" | "department" | "user") => {
    setModalTab(tab);
    setIsModalOpen(true);
  };

  const handleModalSubmit = () => {
    toast.success("User(s) invited successfully!");
    setIsModalOpen(false);
    refetchUsers();
  };

  const handleSubsidiaryEdit = () => {
    refetchSubsidiary();

    toast.success("Subsidiary updated successfully!");
  };

  if (isSubsidiaryLoading || isUsersLoading) {
    return <PageSkeleton />;
  }

  if (!subsidiaryData || !isIdValid) {
    return notFound();
  }

  console.log("Subsidiary Data:", subsidiaryData);

  return (
    <div className="min-h-screen bg-[#F2FBF3] p-6 space-y-6">
      <Header
        customBreadcrumb={
          <CustomBreadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Settings", href: "/settings-esg" },
              { label: "Subsidiaries", href: "/settings-esg/subsidiaries" },
              { label: subsidiaryData.name },
            ]}
          />
        }
      />
      <Button
        variant="outline"
        onClick={() => router.back()}
        className="flex items-center gap-2 bg-white mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>
      <div className="p-6 bg-white rounded-lg space-y-8">
        <MainContentCard
          subsidiary={subsidiaryData}
          teamMemberCount={usersData?.length || 0}
          onEdit={handleSubsidiaryEdit}
        />
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            {/* buttons */}
            <div className="flex space-x-4 p-2 rounded-lg shadow-md border border-gray-200 cursor-pointer">
              <button
                className={`py-2 px-4 font-medium text-sm rounded-md transition-colors cursor-pointer ${
                  activeTab === "team"
                    ? "bg-[#EBF7EB] text-[var(--color-primary)] "
                    : "bg-transparent text-gray-500 hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab("team")}
              >
                Team Members
              </button>
              <button
                className={`py-2 px-4 font-medium text-sm rounded-md transition-colors cursor-pointer ${
                  activeTab === "departments"
                    ? "bg-[#EBF7EB] text-[var(--color-primary)] "
                    : "bg-transparent text-gray-500 hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab("departments")}
              >
                Departments
              </button>
            </div>
            {/* Invite User Button */}
            <button
              className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-md flex items-center text-sm cursor-pointer"
              onClick={() => openModalWithTab("user")}
            >
              <FiPlus className="h-4 w-4 mr-1" />
              Invite New User
            </button>
          </div>

          <div className="mt-4">
            {activeTab === "team" && <TeamMembersTable initialUsers={usersData || []} />}
            {activeTab === "departments" && (
              <DepartmentsTable departments={departmentsData || []} />
            )}
          </div>
        </div>
      </div>
      <CompanySetupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialTab={modalTab}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
}
