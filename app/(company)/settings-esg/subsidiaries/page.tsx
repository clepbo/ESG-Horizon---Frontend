"use client";

import { useState, useMemo, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/app/(company)/components/Header";
import SubsidiaryTable from "@/app/components/company/subsidiaries/SubsidiaryTable";
import AddSubsidiaryModal from "@/app/components/company/subsidiaries/AddSubsidiaryModal";
import { Subsidiary } from "@/services/subsidiaries.service";
import { industriesService } from "@/services/industries.services";
import { useDeleteSubsidiary } from "@/hooks/UseSubsidiary";
import { useCompanySubsidiaries } from "@/services/hooks/subsidiaries.hooks";
import CompanySetupModal from "@/app/components/company/CompanySetupModal";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import CardSkeleton from "@/app/components/ui/reusables/CardSkeleton";
import TableManagementControls from "@/app/components/company/TableManagementControls";

interface IndustryOptionsProps {
  value: number;
  label: string;
  industry: string;
  sector: string;
}

export default function SubsidiariesPage() {
  const { data: subsidiariesData, isLoading: subsidiariesLoading } = useCompanySubsidiaries();
  // Restore local state to support legacy manual updates while syncing with the hook
  const [subsidiaries, setSubsidiaries] = useState<Subsidiary[]>([]);
  const loading = subsidiariesLoading;

  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 300);
  const [industryOptions, setIndustryOptions] = useState<IndustryOptionsProps[]>([]);
  const [industryFilter, setIndustryFilter] = useState("All Industries");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"subsidiary" | "department" | "user">("subsidiary");
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (subsidiariesData) {
      setSubsidiaries(subsidiariesData);
    }
  }, [subsidiariesData]);

  useEffect(() => {
    const shouldOpenModal = searchParams.get("setup");
    if (shouldOpenModal === "true") {
      setIsModalOpen(true);
    }
  }, [searchParams]);

  const deleteSubsidiary = useDeleteSubsidiary((id: number) => {
    setSubsidiaries((prev: any[]) => prev.filter((s) => s.id !== id));
  });

  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        const data = await industriesService.getIndustries();
        setIndustryOptions(
          data.map((i) => ({
            value: i.id,
            label: `${i.industry} (${i.sector})`,
            sector: i.sector,
            industry: i.industry,
          }))
        );
      } catch (error) {
        console.error("Failed to load industries:", error);
      }
    };
    fetchIndustries();
  }, []);

  const filteredSubsidiaries = useMemo(() => {
    return subsidiaries.filter((sub) => {
      const matchesSearch = sub.name.toLowerCase().includes(debouncedSearch.toLowerCase());

      const matchesIndustry =
        industryFilter === "All Industries" ||
        (sub.industry && `${sub.industry.industry} (${sub.industry.sector})` === industryFilter);

      return matchesSearch && matchesIndustry;
    });
  }, [subsidiaries, debouncedSearch, industryFilter]);

  const handleAddSubsidiary = (newSub: Subsidiary) => {
    setSubsidiaries((prev) => [{ ...newSub }, ...prev]);
  };

  const openModalWithTab = (tab: "subsidiary" | "department" | "user") => {
    setModalTab(tab);
    setIsModalOpen(true);
  };

  // interface SubmissionData {
  //   subsidiaries: Subsidiary[];
  // }

  const handleModalSubmit = (submissionData: any) => {
    const updatedSubsidiaries = submissionData.subsidiaries || [];
    const updatedDepartments = submissionData.departments || [];

    if (updatedSubsidiaries.length > 0) {
      // Manual state update removed to prevent duplicate rows.
      // TanStack Query's useCompanySubsidiaries will automatically sync after mutation invalidation.
    }

    toast.success("Submitted Successfully");
    setIsModalOpen(false);

    if (updatedDepartments.length > 0 && updatedSubsidiaries.length === 0) {
      router.push("/settings-esg/departments");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <motion.main
        className="flex-1 h-full overflow-y-auto p-6"
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

        <TableManagementControls
          title="Subsidiaries"
          description="Add and manage company subsidiaries to keep your records up to date."
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by Subsidiary"
          addButtonLabel="Add Subsidiary"
          onAdd={() => openModalWithTab("subsidiary")}
          filters={[
            {
              label: "Industry",
              value: industryFilter,
              onChange: setIndustryFilter,
              options: [
                "All Industries",
                ...industryOptions.map((opt) => `${opt.industry} (${opt.sector})`),
              ],
            },
          ]}
        />

        {loading ? (
          <div className="">
            <CardSkeleton />
          </div>
        ) : (
          <div>
            <SubsidiaryTable
              subsidiaries={filteredSubsidiaries}
              onDelete={(id) => {
                deleteSubsidiary.mutate(+id);
                setSubsidiaries((prev) => prev.filter((s) => s.id !== id));
              }}
              onEdit={(updated) => {
                setSubsidiaries((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
              }}
            />
          </div>
        )}
      </motion.main>

      {/* Modal */}
      {showAddModal && (
        <AddSubsidiaryModal
          onClose={() => setShowAddModal(false)}
          onAddSubsidiary={handleAddSubsidiary}
        />
      )}

      <CompanySetupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialTab={modalTab}
        onSubmit={(data) => {
          handleModalSubmit(data);
        }}
      />
    </div>
  );
}
