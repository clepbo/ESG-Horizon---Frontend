"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { useDebounce } from "use-debounce";
import { useSearchParams } from "next/navigation";
import Header from "@/app/components/layout/Header";
import { Input } from "@/app/components/ui/input";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/app/components/ui/select";
import SubsidiaryTable from "@/app/components/company/subsidiaries/SubsidiaryTable";
import AddSubsidiaryModal from "@/app/components/company/subsidiaries/AddSubsidiaryModal";
import {
    Subsidiary,
    subsidiariesService,
} from "@/services/subsidiaries.service";
import { industriesService } from "@/services/industries.services";
import { useAuth } from "@/context/AuthContext";
import { useDeleteSubsidiary } from "@/hooks/UseSubsidiary";
import CompanySetupModal from "@/app/components/company/CompanySetupModal";
import { toast } from "react-toastify";

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
    const [industryOptions, setIndustryOptions] = useState<
        IndustryOptionsProps[]
    >([]);
    const [industryFilter, setIndustryFilter] = useState("All");
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalTab, setModalTab] = useState<
        "subsidiary" | "department" | "user"
    >("subsidiary");
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
                const response =
                    await subsidiariesService.getCompanySubsidiaries();
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    /** Filtered subsidiaries */
    const filteredSubsidiaries = useMemo(() => {
        return subsidiaries.filter((sub) => {
            const matchesSearch = sub.name
                .toLowerCase()
                .includes(debouncedSearch.toLowerCase());

            const matchesIndustry =
                industryFilter === "All" ||
                sub.industry?.toString() === industryFilter;

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
            // Hydrate the new subsidiaries with full industry data
            const hydratedSubs = updatedSubsidiaries.map((newSub) => {
                // Find the full industry object by matching the industry name
                const fullIndustry = industryOptions.find(
                    (opt) => opt.industry === newSub?.industry?.industry
                );

                // If the full industry is found, use it. Otherwise, use the existing incomplete data.
                const completeIndustry = fullIndustry
                    ? {
                          id: Number(crypto.randomUUID()),
                          industry: fullIndustry.industry,
                          sector: fullIndustry.sector,
                      }
                    : newSub.industry;

                // Return a new object that includes the complete industry data
                return {
                    ...newSub,
                    industry: completeIndustry,
                };
            });

            // Combine the newly hydrated subsidiaries with the previous list
            return [...hydratedSubs, ...prevSubs];
        });

        toast.success("Submitted Successfully");
        setIsModalOpen(false);
    };

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <main className="flex-1 h-full overflow-y-auto p-6">
                <Header />

                {/* Title & Add Button */}
                <div className=" mt-4">
                    <div>
                        <h2 className="text-2xl font-semibold">Subsidiaries</h2>
                        <div className="flex justify-between mb-6">
                            <p className="text-gray-600 ">
                                Add new Subsidiaries , review existing ones, and
                                edit details to <br />
                                keep your records up to date.
                            </p>
                            <div>
                                <button
                                    className="flex items-center rounded-sm border bg-green-500 px-4 py-2 text-sm text-white hover:bg-green-600 cursor-pointer"
                                    // onClick={() => setShowAddModal(true)}
                                    onClick={() =>
                                        openModalWithTab("subsidiary")
                                    }
                                >
                                    <Plus className="mr-1 h-4 w-4" />
                                    Add New Subsidiary
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="w-8 h-8 border-4 border-gray-300 border-t-green-600 rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        <div className="mb-6 flex flex-col gap-4 rounded-lg bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
                            <div className="relative w-full">
                                <Input
                                    id="search-input"
                                    placeholder="Search by Subsidiary"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                <button className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1 rounded-md bg-green-500 hover:bg-green-600 px-3 py-1.5 text-xs text-white">
                                    <Search className="h-3.5 w-3.5" />
                                    Search
                                </button>
                            </div>

                            <div className="flex">
                                <Select
                                    value={industryFilter}
                                    onValueChange={setIndustryFilter}
                                >
                                    <SelectTrigger className="w-[250px]">
                                        <SelectValue placeholder="Industry" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-[200px] max-w-[250px] overflow-y-auto">
                                        <SelectItem value="All">
                                            All Industries
                                        </SelectItem>
                                        {industryOptions.map((opt) => (
                                            <SelectItem
                                                key={opt.value}
                                                value={opt.value.toString()}
                                            >
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="rounded-lg bg-white shadow">
                            <SubsidiaryTable
                                subsidiaries={filteredSubsidiaries}
                                onDelete={(id) => {
                                    deleteSubsidiary.mutate(+id);
                                    setSubsidiaries((prev) =>
                                        prev.filter((s) => s.id !== id)
                                    );
                                }}
                                onEdit={(updated) => {
                                    setSubsidiaries((prev) =>
                                        prev.map((s) =>
                                            s.id === updated.id ? updated : s
                                        )
                                    );
                                }}
                            />
                        </div>
                    </>
                )}
            </main>

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
