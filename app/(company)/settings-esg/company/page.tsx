"use client";

import { useState, useEffect } from "react";
import Header from "@/app/components/layout/Header";
import EditCompanyModal from "@/app/components/ui/modals/EditCompany";
import CompanyInfoCard from "@/app/components/settings/company/CompanyInfoCard";
import ToggleSwitch from "@/app/components/settings/company/ToggleSwitch";
import Spinner from "@/app/components/ui/reusables/Spinner";
import { Company, companyService } from "@/services/company.service";

export default function CompanyPage() {
    const [companyData, setCompanyData] = useState<Company | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [ifrsS1, setIfrsS1] = useState(true);
    const [ifrsS2, setIfrsS2] = useState(true);
    const [gri, setGri] = useState(false);

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                const details = await companyService.getDetails();
                setCompanyData(details);
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
        <div className="min-h-screen bg-[#F2FBF3] p-6 space-y-6">
            <Header />

            <CompanyInfoCard
                company={companyData}
                onEdit={() => setIsModalOpen(true)}
            />

            {/* ESG Frameworks */}
            <div className="bg-white p-6 shadow rounded-lg">
                <h2 className="text-xl font-semibold mb-2">ESG Frameworks</h2>
                <p className="text-sm text-gray-500 mb-6">
                    Select the reporting frameworks and standards you follow
                </p>

                <div className="flex justify-between items-center py-3">
                    <div>
                        <p className="font-medium">IFRS S1</p>
                        <p className="text-sm text-gray-500">
                            International sustainability disclosure standards
                        </p>
                    </div>
                    <ToggleSwitch
                        checked={ifrsS1}
                        onChange={() => setIfrsS1(!ifrsS1)}
                    />
                </div>

                <div className="flex justify-between items-center py-3">
                    <div>
                        <p className="font-medium">IFRS S2</p>
                        <p className="text-sm text-gray-500">
                            International sustainability disclosure standards
                        </p>
                    </div>
                    <ToggleSwitch
                        checked={ifrsS2}
                        onChange={() => setIfrsS2(!ifrsS2)}
                    />
                </div>

                <div className="flex justify-between items-center py-3">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <p className="font-medium">GRI Standards</p>
                            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                                Upgrade Plan
                            </span>
                        </div>
                        <p className="text-sm text-gray-500">
                            Global Reporting Initiative
                        </p>
                    </div>
                    <ToggleSwitch checked={gri} onChange={() => setGri(!gri)} />
                </div>
            </div>

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
