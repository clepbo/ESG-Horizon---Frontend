"use client";
import { useState, useEffect } from "react";
import { CircleX, Camera } from "lucide-react";
import Image from "next/image";
import { InputField } from "@/app/components/common/forms/FormField";
import { Company, companyService } from "@/services/company.service";
import { toast } from "react-toastify";
import { uploadService } from "@/services/upload.service";
import { industriesService } from "@/services/industries.services";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/app/components/ui/select";
import { useAuth } from "@/context/AuthContext";
export default function EditCompanyModal({
    company,
    onClose,
    onUpdate,
}: {
    company: Company;
    onClose: () => void;
    onUpdate: (updatedCompany: Company) => void;
}) {
    const [formData, setFormData] = useState<Company>(company);
    const [companyLogo, setCompanyLogo] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [industryOptions, setIndustryOptions] = useState<
        { id: number; sector: string; industry: string }[]
    >([]);
    const { fetchUserProfile, setUser } = useAuth();
    const [companyUsersCount, setCompanyUsersCount] = useState<number>(0);

    useEffect(() => {
        const fetchIndustries = async () => {
            try {
                const data = await industriesService.getIndustries();
                setIndustryOptions(data);
            } catch (err) {
                console.error("Failed to load industries:", err);
                toast.error("Failed to load industry options.");
            }
        };
        fetchIndustries();
    }, []);

    useEffect(() => {
        const fetchCompanyUsers = async () => {
            if (!company || !company.id) {
                return;
            }
            const company_users = await companyService.getUsers(company.id);
            setCompanyUsersCount(company_users.length);
        };
        fetchCompanyUsers();
    }, [company]);

    const handleIndustryChange = (id: string) => {
        const selectedIndustry = industryOptions.find(
            (opt) => String(opt.id) === id
        );
        if (selectedIndustry) {
            setFormData((prev) => ({
                ...prev,
                industry: selectedIndustry,
            }));
        }
    };

    const handleChange = (field: keyof Company, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleUpdate = async () => {
        try {
            setLoading(true);
            const payload = {
                ...formData,
                company_logo_url: companyLogo || formData.company_logo_url,
                industryId: formData.industry?.id,
            };

            await companyService.updateDetails(company.id, payload);
            const freshUser = await fetchUserProfile();
            if (freshUser) {
                setUser(freshUser);
                onUpdate(freshUser.company as Company);
            }
            toast.info("Company profile updated successfully!");
        } catch (error) {
            console.error("Error updating company profile:", error);
            toast.error("Error updating company profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-white/60 backdrop-blur-md flex items-center justify-center px-4 overflow-y-auto">
            <div className="relative w-full bg-white rounded-2xl shadow-2xl p-6 md:p-10 max-h-[90vh] overflow-y-auto max-w-4xl">
                {/* Close Icon */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-red-500 hover:text-red-600 transition cursor-pointer"
                >
                    <CircleX size={28} />
                </button>

                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Edit Company Information
                </h2>

                {/* Logo Upload */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="relative w-20 h-20">
                        <Image
                            src={
                                companyLogo ||
                                formData.company_logo_url ||
                                "/iconlogo.png"
                            }
                            alt="Company Logo"
                            width={80}
                            height={80}
                            className={
                                companyLogo || formData.company_logo_url
                                    ? "rounded-full object-cover border border-gray-200"
                                    : "rounded-full object-cover border border-gray-200 opacity-50 blur-[2px]"
                            }
                        />
                        <label className="absolute bottom-0 right-0 bg-white rounded-full p-1 border cursor-pointer hover:bg-gray-50">
                            <Camera className="w-4 h-4 text-gray-600" />
                            <input
                                type="file"
                                className="hidden"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        try {
                                            setLoading(true); // Upload to backend → Cloudinary

                                            const uploaded =
                                                await uploadService.uploadImage(
                                                    file
                                                ); // Check if uploaded is defined before proceeding

                                            if (uploaded) {
                                                // Save the Cloudinary URL into state
                                                setCompanyLogo(uploaded.url); // Also update formData so payload has it

                                                setFormData((prev) => ({
                                                    ...prev,
                                                    company_logo_url:
                                                        uploaded.url,
                                                }));

                                                toast.success(
                                                    "Logo uploaded successfully!"
                                                );
                                            } else {
                                                // Handle the case where the upload failed but no exception was thrown
                                                toast.error(
                                                    "Failed to upload logo: Upload returned no data."
                                                );
                                            }
                                        } catch (err) {
                                            toast.error(
                                                "Failed to upload logo"
                                            );
                                            console.error(err);
                                        } finally {
                                            setLoading(false);
                                        }
                                    }
                                }}
                            />
                        </label>
                    </div>
                </div>

                {/* Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                        label="Company Name"
                        value={formData.name}
                        onChange={(v) => handleChange("name", v)}
                    />
                    <div>
                        <label
                            htmlFor="industry-select"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Industry
                        </label>
                        <Select
                            value={String(formData.industry?.id)}
                            onValueChange={handleIndustryChange}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Industry" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px] overflow-y-auto">
                                {industryOptions.map((opt) => (
                                    <SelectItem
                                        key={opt.id}
                                        value={String(opt.id)}
                                    >
                                        {opt.industry} ({opt.sector})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {/* <InputField
                        label="Industry"
                        value={String(formData.industry)}
                        onChange={(v) => handleChange("industry", v)}
                    /> */}
                    <InputField
                        label="Email"
                        value={formData.contact_email}
                        onChange={(v) => handleChange("contact_email", v)}
                    />
                    <InputField
                        label="Phone Number"
                        value={formData.contact_phone}
                        onChange={(v) => handleChange("contact_phone", v)}
                    />
                    <InputField
                        label="Website"
                        value={formData.website || ""}
                        onChange={(v) => handleChange("website", v)}
                    />
                    <InputField
                        label="Country"
                        value={formData.isoCountryCode}
                        onChange={(v) => handleChange("isoCountryCode", v)}
                    />
                    <InputField
                        label="Staff Strength"
                        value={
                            formData.staff_strength ||
                            companyUsersCount.toString() ||
                            ""
                        }
                        onChange={(v) => handleChange("staff_strength", v)}
                    />
                    <InputField
                        label="Company Address"
                        value={formData.address}
                        onChange={(v) => handleChange("address", v)}
                    />
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-4 mt-10">
                    <button
                        onClick={onClose}
                        className="border border-green-500 text-gray-700 px-6 py-2 rounded-md text-sm hover:bg-green-50 cursor-pointer"
                    >
                        Close
                    </button>
                    <button
                        onClick={handleUpdate}
                        disabled={loading}
                        className="bg-green-500 text-white px-6 py-2 rounded-md text-sm hover:bg-green-600 cursor-pointer disabled:opacity-50"
                    >
                        {loading ? "Please wait..." : "Update"}
                    </button>
                </div>
            </div>
        </div>
    );
}
