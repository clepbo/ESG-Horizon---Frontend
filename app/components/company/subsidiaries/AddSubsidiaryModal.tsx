"use client";

import { useEffect, useState } from "react";
import { CircleX } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import Select from "react-select";
import {
    subsidiariesService,
    Subsidiary,
} from "@/services/subsidiaries.service";
import { industriesService } from "@/services/industries.services";

type FormValues = {
    name: string;
    sector: string;
    industry: string;
    address: string;
};

export default function AddSubsidiaryModal({
    onClose,
    onAddSubsidiary,
}: {
    onClose: () => void;
    onAddSubsidiary: (sub: Subsidiary) => void;
}) {
    const [industryOptions, setIndustryOptions] = useState<
        { value: number; label: string }[]
    >([]);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        reset,
    } = useForm<FormValues>();

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

    const onSubmit = async (formData: FormValues) => {
        const payload = {
            name: formData.name,
            industryId: Number(formData.industry),
            address: formData.address,
            status: "active",
        };

        try {
            const response = await subsidiariesService.createSubsidiary(payload);
            console.log(response);
            // onAddSubsidiary(payload);
            toast.success(`Subsidiary "${formData.name}" added successfully`);
            reset();
            // onClose();
        } catch (error) {
            console.error("Failed to add subsidiary:", error);
            toast.error("Failed to add subsidiary. Please try again.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-white/60 backdrop-blur-sm flex justify-center items-center px-4">
            <div className="relative w-full bg-white rounded-2xl shadow-lg p-6 md:p-8 max-h-[90vh] overflow-y-auto max-w-lg">
                <div className="flex justify-end mb-6">
                    <button
                        onClick={onClose}
                        className="text-red-500 hover:text-red-700 transition cursor-pointer"
                    >
                        <CircleX size={24} />
                    </button>
                </div>

                <h2 className="text-2xl font-semibold mb-6">Add Subsidiary</h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block mb-1 text-sm font-medium">
                            Subsidiary Name{" "}
                            <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Subsidiary Name"
                            {...register("name", {
                                required: "Name is required",
                            })}
                            className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        {errors.name && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.name.message}
                            </p>
                        )}
                    </div>

                    {/* Industry */}
                    <div>
                        <label className="block mb-1 text-sm font-medium">
                            Industry
                        </label>
                        <Controller
                            name="industry"
                            control={control}
                            rules={{ required: "Industry is required" }}
                            render={({ field }) => {
                                const selectedOption =
                                    industryOptions.find(
                                        (opt) =>
                                            opt.value === Number(field.value)
                                    ) || null;

                                return (
                                    <Select
                                        placeholder="Select an industry"
                                        options={industryOptions}
                                        value={selectedOption}
                                        onChange={(option) =>
                                            field.onChange(
                                                option?.value.toString() ?? ""
                                            )
                                        }
                                        isClearable
                                        styles={{
                                            control: (provided) => ({
                                                ...provided,
                                                borderColor: "#d1d5db",
                                                boxShadow: "none",
                                                "&:hover": {
                                                    borderColor: "#9ca3af",
                                                },
                                                borderRadius: "0.375rem",
                                                minHeight: "3rem",
                                            }),
                                            menu: (provided) => ({
                                                ...provided,
                                                zIndex: 9999,
                                            }),
                                            placeholder: (provided) => ({
                                                ...provided,
                                                color: "#6b7280",
                                            }),
                                            singleValue: (provided) => ({
                                                ...provided,
                                                color: "#111827",
                                            }),
                                        }}
                                    />
                                );
                            }}
                        />
                        {errors.industry && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.industry.message}
                            </p>
                        )}
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block mb-1 text-sm font-medium">
                            Address
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. 123 Main Street, Lagos"
                            {...register("address")}
                            className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-100 cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm rounded-md bg-green-500 text-white hover:bg-green-600 cursor-pointer"
                        >
                            Add Subsidiary
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
