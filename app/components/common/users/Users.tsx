"use client";

import { useState } from "react";
import { useDebounce } from "use-debounce";
import Spinner from "@/app/components/ui/reusables/Spinner";
import CompanyTable from "@/app/components/common/dashboard/CompanyTable";
import ESGCompanyTable from "../../company/ESGCompanyTable";
import { Company } from "@/services/company.service";
import { useCompanies } from "@/hooks/useCompanies";
import { Input } from "@/app/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/app/components/ui/select";
import { Search } from "lucide-react";

const PERSONA_TABS = [
    { label: "All", value: "all" },
    { label: "ESG Company", value: "esg company" },
    { label: "Investor", value: "investor" },
    { label: "Regulator", value: "regulator" },
];

export default function Companies() {
    const { data: companies = [], isLoading, error } = useCompanies();

    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

    const [statusFilter, setStatusFilter] = useState("All Status");
    const [industryFilter, setIndustryFilter] = useState("All Industry");
    const [activePersona, setActivePersona] = useState("all");

    const filteredCompanies = companies.filter((company: Company) => {
        const matchesSearch = (() => {
            if (!debouncedSearchTerm.trim()) return true;

            const searchLower = debouncedSearchTerm.toLowerCase();
            const nameMatches = company.name
                ?.toLowerCase()
                .includes(searchLower);
            const industryMatches = company.industry?.industry
                ?.toLowerCase()
                .includes(searchLower);
            const emailMatches = company.contact_email
                ?.toLowerCase()
                .includes(searchLower);

            return nameMatches || industryMatches || emailMatches;
        })();

        const matchesStatus =
            statusFilter === "All Status" || company.status === statusFilter;

        const matchesIndustry =
            industryFilter === "All Industry" ||
            (company?.industry?.industry?.trim()?.toLowerCase() ?? "") ===
                industryFilter.trim().toLowerCase();

        const matchesPersona =
            activePersona === "all" ||
            company.category?.trim().toLowerCase() === activePersona;

        return (
            matchesSearch && matchesStatus && matchesIndustry && matchesPersona
        );
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-10">
                <Spinner />
            </div>
        );
    }

    if (error) {
        return (
            <p className="text-center text-red-500">
                Failed to load companies.
            </p>
        );
    }

    return (
        <section className="mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Companies
            </h2>

            <div className="rounded-md border border-black/10 bg-white p-4 md:p-6 shadow">
                {/* Persona Tabs */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-6">
                    {PERSONA_TABS.map((tab) => {
                        const isActive = activePersona === tab.value;
                        return (
                            <button
                                key={tab.value}
                                onClick={() => setActivePersona(tab.value)}
                                className={`w-full px-4 py-2 text-sm font-medium rounded-md border transition-colors duration-150 ${
                                    isActive
                                        ? "bg-green-500 text-white border-green-500"
                                        : "bg-white text-green-600 border-green-500 hover:bg-green-50"
                                }`}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Filters */}
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    {/* Search Input */}
                    <div className="relative w-full">
                        <Input
                            id="search-input"
                            placeholder="Search by company name, industry, or email"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1 rounded-md bg-[var(--color-green-500)] hover:bg-[var(--color-green-600)] px-3 py-1.5 text-xs text-white hover:bg-opacity-90 cursor-pointer">
                            <Search className="h-3.5 w-3.5" />
                            Search
                        </button>
                    </div>

                    {/* Dropdowns */}
                    <div className="flex gap-2">
                        <Select
                            value={industryFilter}
                            onValueChange={setIndustryFilter}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="All Industry" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All Industry">
                                    All Industry
                                </SelectItem>
                                <SelectItem value="Renewable Energy">
                                    Renewable Energy
                                </SelectItem>
                                <SelectItem value="Environmental Consulting">
                                    Environmental Consulting
                                </SelectItem>
                                <SelectItem value="Healthcare">
                                    Healthcare
                                </SelectItem>
                                <SelectItem value="Agriculture">
                                    Agriculture
                                </SelectItem>
                                <SelectItem value="Finance">Finance</SelectItem>
                                <SelectItem value="Manufacturing">
                                    Manufacturing
                                </SelectItem>
                                <SelectItem value="Retail">Retail</SelectItem>
                                <SelectItem value="Oil & Gas">
                                    Oil & Gas
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={statusFilter}
                            onValueChange={setStatusFilter}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All Status">
                                    All Status
                                </SelectItem>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Approved">
                                    Approved
                                </SelectItem>
                                <SelectItem value="Suspended">
                                    Suspended
                                </SelectItem>
                                <SelectItem value="Under Review">
                                    Under Review
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Table Rendering */}
                {activePersona === "all" && (
                    <CompanyTable companies={filteredCompanies} />
                )}
                {activePersona === "esg company" && (
                    <ESGCompanyTable users={filteredCompanies} />
                )}
                {activePersona === "investor" && (
                    <div className="text-center py-8 text-gray-500">
                        <p>No investor companies yet.</p>
                    </div>
                )}
                {activePersona === "regulator" && (
                    <div className="text-center py-8 text-gray-500">
                        <p>No regulator companies yet.</p>
                    </div>
                )}

                {/* No results message */}
                {!isLoading &&
                    filteredCompanies.length === 0 &&
                    companies.length > 0 && (
                        <div className="text-center py-8 text-gray-500">
                            <p>
                                No companies found matching your search
                                criteria.
                            </p>
                            <p className="text-sm mt-2">
                                Try adjusting your filters or search term.
                            </p>
                        </div>
                    )}

                {/* Empty state */}
                {!isLoading && companies.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <p>No companies available.</p>
                    </div>
                )}
            </div>
        </section>
    );
}
