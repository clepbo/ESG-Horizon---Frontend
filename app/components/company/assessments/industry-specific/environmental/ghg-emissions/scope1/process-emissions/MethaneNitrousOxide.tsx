// "use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { CloudUpload, ArrowLeft, Save, CheckCircle2 } from "lucide-react";
import { useAssessment } from "@/hooks/useAssessment";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";
import type { AssessmentData } from "@/hooks/useAssessment";

interface MethaneNitrousOxideProps {
    onBack: () => void;
    onSubmit: () => void;
    stepIndex: number;
    totalSteps: number;
    percent: number;
}

interface FileMetadata {
    name: string;
    size: number;
    lastModified: number;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

const animalTypes = [
    "Cattle (Dairy)",
    "Cattle (Beef)",
    "Sheep",
    "Goats",
    "Pigs",
    "Poultry (Broilers)",
    "Poultry (Layers)",
    "Others",
];

const manureSystems = [
    {
        value: "Liquid/Slurry",
        description: "Stored as liquid in tanks or lagoons.",
    },
    {
        value: "Solid Storage",
        description: "Manure stored in piles or bins without liquid drainage.",
    },
    {
        value: "Pasture/Range/Paddock",
        description: "Manure left on pasture during grazing.",
    },
    {
        value: "Anaerobic Digester",
        description: "Processed in a digester to capture biogas.",
    },
    {
        value: "Composting",
        description: "Manure aerobically decomposed to create compost.",
    },
    {
        value: "Deep Litter",
        description:
            "Accumulated bedding and manure in housing, periodically removed.",
    },
];

const uploadFields = [
    "Livestock inventory records",
    "Farm records on feed and productivity",
    "Manure management system descriptions",
    "Fertilizer/manure application logs",
];

export function MethaneNitrousOxide({
    onBack,
    onSubmit,
    stepIndex,
    totalSteps,
    percent,
}: MethaneNitrousOxideProps) {
    const { state, dispatch } = useAssessment();

    const methaneNitrousOxide =
        state.assessmentData.processEmissions?.methaneNitrousOxide;

    const [animals, setAnimals] = useState<{ [type: string]: number }>(
        methaneNitrousOxide?.animals ?? {
            "Cattle (Dairy)": 0,
            "Cattle (Beef)": 0,
            Sheep: 0,
            Goats: 0,
            Pigs: 0,
            "Poultry (Broilers)": 0,
            "Poultry (Layers)": 0,
            Others: 0,
        }
    );

    const [selectedManureSystem, setSelectedManureSystem] = useState<string>(
        methaneNitrousOxide?.manureSystem ?? ""
    );

    const [otherManureSystem, setOtherManureSystem] = useState<string>(
        methaneNitrousOxide?.otherManureSystem ?? ""
    );

    const [files, setFiles] = useState<{ [key: string]: FileMetadata | null }>(
        methaneNitrousOxide?.files ??
            Object.fromEntries(uploadFields.map((field) => [field, null]))
    );

    const [isSaving, setIsSaving] = useState(false);
    const [showSaveSuccess, setShowSaveSuccess] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        const existingData = state.assessmentData.processEmissions
            ?.methaneNitrousOxide as NonNullable<
            AssessmentData["processEmissions"]
        >["methaneNitrousOxide"];

        if (existingData) {
            setAnimals(
                existingData.animals ?? {
                    "Cattle (Dairy)": 0,
                    "Cattle (Beef)": 0,
                    Sheep: 0,
                    Goats: 0,
                    Pigs: 0,
                    "Poultry (Broilers)": 0,
                    "Poultry (Layers)": 0,
                    Others: 0,
                }
            );
            setSelectedManureSystem(existingData.manureSystem ?? "");
            setOtherManureSystem(existingData.otherManureSystem ?? "");

            if (existingData.files) {
                setFiles(existingData.files);
            }
        }
    }, [state.assessmentData.processEmissions?.methaneNitrousOxide]);

    const handleAnimalChange = (type: string, value: string) => {
        const numValue = value === "" ? 0 : Number(value);
        if (!isNaN(numValue) && numValue >= 0) {
            setAnimals((prev) => ({
                ...prev,
                [type]: numValue,
            }));
        }
    };

    const handleManureSystemChange = (system: string) => {
        setSelectedManureSystem(system);
        if (errors.manureSystem) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors.manureSystem;
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        // Check if at least one animal has a value greater than 0
        const hasAnimals = Object.values(animals).some((val) => val > 0);
        if (!hasAnimals) {
            newErrors.animals =
                "Please enter the number of animals for at least one type";
        }

        if (!selectedManureSystem) {
            newErrors.manureSystem = "Please select a manure management system";
        }

        if (selectedManureSystem === "Others" && !otherManureSystem.trim()) {
            newErrors.otherManureSystem =
                "Please specify the manure management system";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFileChange = (
        field: string,
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > MAX_FILE_SIZE_BYTES) {
                setErrors((prev) => ({
                    ...prev,
                    files: `File "${field}" exceeds 10MB limit`,
                }));
                return;
            }
            setFiles((prev) => ({
                ...prev,
                [field]: {
                    name: file.name,
                    size: file.size,
                    lastModified: file.lastModified,
                },
            }));
            if (errors.files) {
                setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.files;
                    return newErrors;
                });
            }
        }
    };

    const handleSaveAndContinue = () => {
        if (!validateForm()) return;

        setIsSaving(true);
        const payload = {
            animals,
            manureSystem: selectedManureSystem,
            otherManureSystem:
                selectedManureSystem === "Others" ? otherManureSystem : "",
            files,
        };

        dispatch({
            type: "UPDATE_PROCESS_METHANE_NITROUS_OXIDE",
            payload,
        });
        dispatch({ type: "SAVE_PROGRESS" });

        setIsSaving(false);
        setShowSaveSuccess(true);
        setTimeout(() => setShowSaveSuccess(false), 2000);
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        dispatch({
            type: "UPDATE_PROCESS_METHANE_NITROUS_OXIDE",
            payload: {
                animals,
                manureSystem: selectedManureSystem,
                otherManureSystem:
                    selectedManureSystem === "Others" ? otherManureSystem : "",
                files,
            },
        });

        onSubmit();
    };

    const labelClass = "text-gray-700 text-sm font-medium";
    const inputClass =
        "border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent";

    return (
        <div className="min-h-screen bg-green-50 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-6 mb-4">
                    <Button
                        variant="outline"
                        onClick={onBack}
                        className="flex items-center gap-2 bg-white border-green-600 text-green-700 hover:bg-green-50"
                        aria-label="Go back to previous step"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                    <div>
                        <h3 className="text-2xl font-semibold text-foreground">
                            Process Emissions
                        </h3>
                        <p className="text-muted-foreground text-base">
                            Greenhouse gases released during industrial or
                            chemical processes, not from fuel combustion.
                        </p>
                    </div>
                </div>

                <Card className="animate-in slide-in-from-bottom-4 duration-500 bg-gray-50 mt-6 mb-8 pt-6">
                    <CardContent className="space-y-8">
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-500">
                                    Section {stepIndex} of {totalSteps}
                                </span>
                                <span className="text-sm font-medium text-gray-500">
                                    {percent}% complete
                                </span>
                            </div>
                            <div className="w-full h-3 bg-green-300 rounded-lg">
                                <div
                                    className="h-3 bg-green-800 rounded transition-all duration-300"
                                    style={{ width: `${percent}%` }}
                                />
                            </div>
                        </div>

                        <div>
                            <h4 className="text-xl font-medium text-foreground">
                                Methane and Nitrous Oxide from Manure Management
                            </h4>
                            <p className="text-muted-foreground text-base">
                                Emissions from manure management on large-scale
                                poultry or livestock farms.
                            </p>
                        </div>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSubmit();
                            }}
                            className="space-y-6"
                        >
                            {/* 1.1 Number and type of animals */}
                            <div>
                                <Label className="text-md font-medium mb-4 block">
                                    1.1 Number and type of animals
                                </Label>
                                {errors.animals && (
                                    <p className="text-sm text-red-500 mb-2">
                                        {errors.animals}
                                    </p>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                                    {animalTypes.map((type) => (
                                        <div
                                            key={type}
                                            className="flex flex-col"
                                        >
                                            <Label
                                                htmlFor={type.replace(
                                                    /\s+/g,
                                                    "-"
                                                )}
                                                className={labelClass}
                                            >
                                                {type}
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id={type.replace(
                                                        /\s+/g,
                                                        "-"
                                                    )}
                                                    type="number"
                                                    min={0}
                                                    value={animals[type]}
                                                    onChange={(e) =>
                                                        handleAnimalChange(
                                                            type,
                                                            e.target.value
                                                        )
                                                    }
                                                    className={`${inputClass} pr-16 ${
                                                        errors.animals
                                                            ? "border-red-500"
                                                            : ""
                                                    }`}
                                                />
                                                {(type === "Pigs" ||
                                                    type ===
                                                        "Poultry (Broilers)" ||
                                                    type ===
                                                        "Poultry (Layers)") && (
                                                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                                                        Tonnes
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Manure Management System */}
                            <div>
                                <Label className="text-md font-medium mb-4 block">
                                    Type of manure management system used (e.g.,
                                    liquid slurry, solid storage, pasture).
                                </Label>
                                {errors.manureSystem && (
                                    <p className="text-sm text-red-500 mb-2">
                                        {errors.manureSystem}
                                    </p>
                                )}
                                <div className="space-y-2 ml-6">
                                    {manureSystems.map((system) => (
                                        <label
                                            key={system.value}
                                            className="flex items-start space-x-3 py-2"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={
                                                    selectedManureSystem ===
                                                    system.value
                                                }
                                                onChange={() =>
                                                    handleManureSystemChange(
                                                        system.value
                                                    )
                                                }
                                                className="mt-1 w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                                            />
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-900">
                                                    {system.value}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {system.description}
                                                </span>
                                            </div>
                                        </label>
                                    ))}

                                    {/* Others option */}
                                    <label className="flex items-start space-x-3 py-2">
                                        <input
                                            type="checkbox"
                                            checked={
                                                selectedManureSystem ===
                                                "Others"
                                            }
                                            onChange={() =>
                                                handleManureSystemChange(
                                                    "Others"
                                                )
                                            }
                                            className="mt-1 w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                                        />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-gray-900">
                                                Others
                                            </span>
                                        </div>
                                    </label>

                                    {selectedManureSystem === "Others" && (
                                        <div className="ml-7 mt-2">
                                            <Input
                                                placeholder="Please specify"
                                                value={otherManureSystem}
                                                onChange={(e) =>
                                                    setOtherManureSystem(
                                                        e.target.value
                                                    )
                                                }
                                                className={`w-full max-w-md ${
                                                    errors.otherManureSystem
                                                        ? "border-red-500"
                                                        : ""
                                                }`}
                                            />
                                            {errors.otherManureSystem && (
                                                <p className="text-sm text-red-500 mt-1">
                                                    {errors.otherManureSystem}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 1.2 Document/Evidence Upload */}
                            <div>
                                <Label className="text-md font-medium mb-4 block">
                                    1.2 Documents/Evidence Upload
                                </Label>
                                <div className="ml-6">
                                    {errors.files && (
                                        <p className="text-sm text-red-500 mb-4">
                                            {errors.files}
                                        </p>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {uploadFields.map((field) => (
                                            <div
                                                key={field}
                                                className="flex flex-col gap-2"
                                            >
                                                <Label className="text-sm font-medium text-gray-700 mb-1">
                                                    {field}
                                                </Label>
                                                <Card className="p-4 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-green-500 transition-all h-full">
                                                    <Label
                                                        htmlFor={`upload-${field
                                                            .replace(/\s/g, "-")
                                                            .toLowerCase()}`}
                                                        className="cursor-pointer flex flex-col items-center gap-2"
                                                    >
                                                        <CloudUpload className="h-6 w-6 text-muted-foreground" />
                                                        <span className="text-xs text-gray-400 text-center">
                                                            Upload {field} (Max.
                                                            10MB)
                                                        </span>
                                                    </Label>
                                                    <Input
                                                        id={`upload-${field
                                                            .replace(/\s/g, "-")
                                                            .toLowerCase()}`}
                                                        type="file"
                                                        className="hidden"
                                                        onChange={(e) =>
                                                            handleFileChange(
                                                                field,
                                                                e
                                                            )
                                                        }
                                                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                                        aria-label={`Upload ${field}`}
                                                    />
                                                    {files[field] && (
                                                        <p className="text-sm text-green-600 mt-2 text-center">
                                                            Uploaded:{" "}
                                                            {files[field]!.name}
                                                        </p>
                                                    )}
                                                </Card>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 pt-8">
                                <Button
                                    variant="outline"
                                    onClick={onBack}
                                    className="justify-self-start hover:cursor-pointer border-green-600 text-green-700 bg-transparent hover:bg-green-50 flex items-center gap-2"
                                    aria-label="Previous step"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleSaveAndContinue}
                                    disabled={isSaving}
                                    className="justify-self-center bg-green-500 hover:cursor-pointer text-white hover:bg-green-300 transition-colors"
                                    aria-label="Save and continue later"
                                >
                                    {isSaving ? (
                                        <>
                                            <LoadingSpinner
                                                size="sm"
                                                className="mr-2"
                                            />
                                            Saving...
                                        </>
                                    ) : showSaveSuccess ? (
                                        <>
                                            <CheckCircle2 className="h-4 w-4 mr-2" />
                                            Saved!
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            Save & Continue Later
                                        </>
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleSubmit}
                                    disabled={isSaving}
                                    className="justify-self-end hover:cursor-pointer border-green-600 text-green-700 bg-transparent hover:bg-green-50 flex items-center gap-2"
                                    aria-label="Submit assessment"
                                >
                                    Submit
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
