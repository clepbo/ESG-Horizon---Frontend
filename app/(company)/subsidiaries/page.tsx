"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { useDebounce } from "use-debounce";

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

export default function SubsidiariesPage() {
    const [subsidiaries, setSubsidiaries] = useState<Subsidiary[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [debouncedSearch] = useDebounce(search, 300);
    const [industryOptions, setIndustryOptions] = useState<
        { value: number; label: string }[]
    >([]);
    const [industryFilter, setIndustryFilter] = useState("All");
    const { user } = useAuth();

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

    useEffect(() => {
        const fetchIndustries = async () => {
            try {
                const data = await industriesService.getIndustries();
                setIndustryOptions(
                    data.map((i) => ({
                        value: i.id,
                        label: `${i.industry} (${i.sector})`,
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
    /** Add new subsidiary */
    const handleAddSubsidiary = (newSub: Subsidiary) => {
        setSubsidiaries((prev) => [{ ...newSub }, ...prev]);
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
                                    onClick={() => setShowAddModal(true)}
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
                        {/* Spinner */}
                        <div className="w-8 h-8 border-4 border-gray-300 border-t-green-600 rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* Search + Filters */}
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

                        {/* Table */}
                        <div className="rounded-lg bg-white shadow">
                            <SubsidiaryTable
                                subsidiaries={filteredSubsidiaries}
                                onDelete={(id) => {
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
        </div>
    );
}
