"use client";

import { useState, useMemo, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { useSearchParams } from "next/navigation";
import Header from "@/app/(company)/components/Header";
import SubsidiaryTable from "@/app/components/company/subsidiaries/SubsidiaryTable";
import AddSubsidiaryModal from "@/app/components/company/subsidiaries/AddSubsidiaryModal";
import { Subsidiary, subsidiariesService } from "@/services/subsidiaries.service";
import { industriesService } from "@/services/industries.services";
import { useAuth } from "@/context/AuthContext";
import { useDeleteSubsidiary } from "@/hooks/UseSubsidiary";
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
  const [subsidiaries, setSubsidiaries] = useState<Subsidiary[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 300);
  const [industryOptions, setIndustryOptions] = useState<IndustryOptionsProps[]>([]);
  const [industryFilter, setIndustryFilter] = useState("All Industries");
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"subsidiary" | "department" | "user">("subsidiary");
  const searchParams = useSearchParams();

  useEffect(() => {
    const shouldOpenModal = searchParams.get("setup");
    if (shouldOpenModal === "true") {
      setIsModalOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchSubsidiaries = async () => {
      if (!user || !user.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await subsidiariesService.getCompanySubsidiaries();
        setSubsidiaries(response);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubsidiaries();
  }, [user]);

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

  interface SubmissionData {
    subsidiaries: Subsidiary[];
  }

  const handleModalSubmit = (submissionData: SubmissionData) => {
    const updatedSubsidiaries = submissionData.subsidiaries;

    setSubsidiaries((prevSubs) => {
      const hydratedSubs = updatedSubsidiaries.map((newSub) => {
        const fullIndustry = industryOptions.find(
          (opt) => opt.industry === newSub?.industry?.industry
        );

        const completeIndustry = fullIndustry
          ? {
              id: Number(crypto.randomUUID()),
              industry: fullIndustry.industry,
              sector: fullIndustry.sector,
            }
          : newSub.industry;

        return {
          ...newSub,
          industry: completeIndustry,
        };
      });

      return [...hydratedSubs, ...prevSubs];
    });

    toast.success("Submitted Successfully");
    setIsModalOpen(false);
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
