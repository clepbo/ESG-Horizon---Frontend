"use client";

import { useEffect, useState } from "react";
import BackButton from "../../ui/reusables/BackButton";
import {
    subsidiariesService,
    Subsidiary,
} from "@/services/subsidiaries.service";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from "../../ui/select";
import { SelectValue } from "@radix-ui/react-select";
import { Button } from "../../ui/button";
import { industriesService, Industry } from "@/services/industries.services";

export default function EditSubsidiaryModal({
    subsidiary,
    onClose,
    onUpdate,
}: {
    subsidiary: Subsidiary;
    onClose: () => void;
    onUpdate?: (updated: Subsidiary) => void;
}) {
    const [formData, setFormData] = useState<Subsidiary>(subsidiary);
    const [allIndustries, setAllIndustries] = useState<Industry[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState<boolean>(false);

    useEffect(() => {
        const fetchIndustries = async () => {
            try {
                const industries = await industriesService.getIndustries();
                setAllIndustries(industries);
            } catch (err) {
                console.error(err);
                setError("Failed to load industries. Please try again later.");
            }
        };
        fetchIndustries();
    }, []);

    const handleChange = (field: keyof Subsidiary, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            const formattedData = {
                ...formData,
                industryId: formData.industry?.id,
            };
            await subsidiariesService.editSubsidiaries(formattedData);
            onUpdate?.(formData);
            onClose();
        } catch (err) {
            console.error("Failed to update subsidiary:", err);
            setError("Failed to update subsidiary. Please try again.");
            setSaving(false);
        }
    };

    const sectors = Array.from(new Set(allIndustries.map((i) => i.sector)));
    const industriesInSelectedSector = allIndustries.filter(
        (i) => i.sector === formData.industry?.sector
    );

    return (
        <div className="fixed inset-0 z-50 bg-white/60 backdrop-blur-md flex items-center justify-center px-4 overflow-y-auto">
            <div className="relative w-full bg-white rounded-2xl shadow-2xl p-6 md:p-10 max-h-[90vh] overflow-y-auto max-w-lg">
                <BackButton />

                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Edit Subsidiary
                </h2>

                {error && (
                    <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Form */}
                <div className="space-y-4">
                    <div>
                        <Label>Subsidiary Name *</Label>
                        <Input
                            value={formData.name}
                            onChange={(e) =>
                                handleChange("name", e.target.value)
                            }
                            placeholder="Subsidiary Name"
                        />
                    </div>

                    <div>
                        <Label>Sector *</Label>
                        <Select
                            value={formData.industry?.sector || ""}
                            onValueChange={(v) =>
                                setFormData((prev) => {
                                    // Find the new industry based on the selected sector
                                    const newIndustry = allIndustries.find(
                                        (ind) => ind.sector === v
                                    );
                                    return {
                                        ...prev,
                                        industry: newIndustry,
                                    };
                                })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select sector" />
                            </SelectTrigger>
                            <SelectContent>
                                {sectors.map((sector) => (
                                    <SelectItem key={sector} value={sector}>
                                        {sector}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>Industry *</Label>
                        <Select
                            value={formData.industry?.industry || ""}
                            onValueChange={(v) =>
                                setFormData((prev) => {
                                    const selectedIndustry = allIndustries.find(
                                        (ind) => ind.industry === v
                                    );
                                    return {
                                        ...prev,
                                        industry: selectedIndustry,
                                    };
                                })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select industry" />
                            </SelectTrigger>
                            <SelectContent>
                                {industriesInSelectedSector.map((industry) => (
                                    <SelectItem
                                        key={industry.id}
                                        value={industry.industry}
                                    >
                                        {industry.industry}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>Address *</Label>
                        <Input
                            value={formData.address}
                            onChange={(e) =>
                                handleChange("address", e.target.value)
                            }
                            placeholder="123 Main Street"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-4 mt-8">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        className="bg-green-500 hover:bg-green-600"
                        disabled={saving}
                    >
                        {saving ? "Saving..." : "Save"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
