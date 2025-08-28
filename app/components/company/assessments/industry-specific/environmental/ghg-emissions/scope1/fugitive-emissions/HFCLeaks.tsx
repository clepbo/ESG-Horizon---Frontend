"use client";

import { useState } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { CloudUpload, ArrowLeft, Save, CheckCircle2 } from "lucide-react";
import { useAssessment } from "@/hooks/useAssessment";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";

interface UploadFile {
    file: File | null;
    error: string | null;
}

interface HFCLeaksProps {
    onBack: () => void;
    onSubmit: () => void;
    stepIndex: number;
    totalSteps: number;
    percent: number;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

const uploadFields = [
    "Asset register of cooling units",
    "Refrigerant purchase invoices",
    "Maintenance/service logs showing recharge volumes",
    "Certification of refrigerant type",
];

export function HFCLeaks({
    onBack,
    onSubmit,
    stepIndex,
    totalSteps,
    percent,
}: HFCLeaksProps) {
    const {
        state: { assessmentData },
        dispatch,
    } = useAssessment();

    const hfcLeaks = assessmentData.fugitiveEmissions?.hfcLeaks;

    const [formState, setFormState] = useState({
        manureSystem: hfcLeaks?.manureSystem ?? "",
        R134a: Boolean(hfcLeaks?.R134a),
        R410A: Boolean(hfcLeaks?.R410A),
        R404A: Boolean(hfcLeaks?.R404A),
        R407C: Boolean(hfcLeaks?.R407C),
        R507A: Boolean(hfcLeaks?.R507A),
        others: hfcLeaks?.others ?? 0,
        refrigerantAdded: hfcLeaks?.refrigerantAdded ?? 0,
    });

    const [assetRegister, setAssetRegister] = useState<UploadFile>({
        file: null,
        error: null,
    });
    const [purchaseInvoices, setPurchaseInvoices] = useState<UploadFile>({
        file: null,
        error: null,
    });
    const [serviceLogs, setServiceLogs] = useState<UploadFile>({
        file: null,
        error: null,
    });
    const [certification, setCertification] = useState<UploadFile>({
        file: null,
        error: null,
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isSaving, setIsSaving] = useState(false);
    const [showSaveSuccess, setShowSaveSuccess] = useState(false);

    const labelClass = "text-gray-700 text-sm font-medium";

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormState((prev) => ({
            ...prev,
            [name]: checked,
        }));
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormState((prev) => ({
            ...prev,
            [name]: name === "manureSystem" ? value : Number(value),
        }));
    };

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        setFileState: React.Dispatch<React.SetStateAction<UploadFile>>
    ) => {
        const files = e.target.files;
        if (!files || files.length === 0) {
            setFileState({ file: null, error: null });
            return;
        }
        const file = files[0];
        if (file.size > MAX_FILE_SIZE_BYTES) {
            setFileState({ file: null, error: "File size must be under 10MB" });
        } else {
            setFileState({ file, error: null });
        }
    };

    const validate = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formState.manureSystem.trim()) {
            newErrors.manureSystem = "Please specify manure management system";
        }
        if (formState.refrigerantAdded < 0) {
            newErrors.refrigerantAdded = "Quantity cannot be negative";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSaveAndContinue = () => {
        if (!validate()) return;

        setIsSaving(true);

        dispatch({
            type: "UPDATE_FUGITIVE_HFC_LEAKS",
            payload: {
                manureSystem: formState.manureSystem,
                R134a: formState.R134a,
                R410A: formState.R410A,
                R404A: formState.R404A,
                R407C: formState.R407C,
                R507A: formState.R507A,
                others: formState.others,
                refrigerantAdded: formState.refrigerantAdded,
                files: {},
            },
        });
        dispatch({ type: "SAVE_PROGRESS" });

        setIsSaving(false);
        setShowSaveSuccess(true);
        setTimeout(() => setShowSaveSuccess(false), 2000);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        dispatch({
            type: "UPDATE_FUGITIVE_HFC_LEAKS",
            payload: {
                manureSystem: formState.manureSystem,
                R134a: formState.R134a,
                R410A: formState.R410A,
                R404A: formState.R404A,
                R407C: formState.R407C,
                R507A: formState.R507A,
                others: formState.others,
                refrigerantAdded: formState.refrigerantAdded,
                files: {},
            },
        });

        onSubmit();
    };

    const renderCheckbox = (name: keyof typeof formState, label: string) => (
        <label
            key={name}
            className="flex items-center cursor-pointer space-x-2 py-2"
        >
            <div className="relative">
                <input
                    type="checkbox"
                    name={name}
                    checked={Boolean(formState[name])}
                    onChange={handleCheckboxChange}
                    className="appearance-none w-5 h-5 rounded border-2 border-green-300 checked:border-green-700 focus:ring-0"
                />
                {formState[name] && (
                    <svg
                        className="absolute top-0 left-0 w-5 h-5 pointer-events-none text-green-700"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={3}
                        viewBox="0 0 24 24"
                    >
                        <path d="M5 13l4 4L19 7" />
                    </svg>
                )}
            </div>
            <span className="text-gray-700 text-sm font-medium">{label}</span>
        </label>
    );

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
                            Fugitive Emissions
                        </h3>
                        <p className="text-muted-foreground text-base">
                            Unplanned releases of gases from equipment,
                            pipelines, storage tanks, or processes, including
                            methane leaks, gas venting, flaring inefficiencies,
                            and refrigerant losses.
                        </p>
                    </div>
                </div>

                <Card className="animate-in slide-in-from-bottom duration-500 bg-gray-50 pt-6 pb-8">
                    <CardContent className="space-y-8">
                        <div className="mb-6 flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-500">
                                Section {stepIndex} of {totalSteps}
                            </span>
                            <span className="text-sm font-medium text-gray-500">
                                {percent}% complete
                            </span>
                        </div>

                        <h2 className="text-lg font-semibold text-gray-800">
                            1.1 Leaks of HFCs from Cooling and Air Conditioning
                            Units
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label className={labelClass}>
                                    Type of manure management system used (e.g.,
                                    liquid slurry, solid storage, pasture).
                                </Label>
                                <div className="space-y-1 ml-2">
                                    {renderCheckbox("R134a", "R-134a")}
                                    {renderCheckbox("R410A", "R-410A")}
                                    {renderCheckbox("R404A", "R-404A")}
                                    {renderCheckbox("R407C", "R-407C")}
                                    {renderCheckbox("R507A", "R-507A")}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex flex-col w-full max-w-md">
                                    <Label
                                        htmlFor="others"
                                        className={labelClass}
                                    >
                                        Others
                                    </Label>
                                    <Input
                                        id="others"
                                        name="others"
                                        type="number"
                                        min={0}
                                        step="any"
                                        value={formState.others}
                                        onChange={handleChange}
                                        className="w-full max-w-lg"
                                    />
                                </div>

                                <div className="flex flex-col w-full">
                                    <Label
                                        htmlFor="refrigerantAdded"
                                        className={labelClass}
                                    >
                                        Quantity of Refrigerant Added
                                        (Kilograms)
                                    </Label>
                                    <Input
                                        id="refrigerantAdded"
                                        name="refrigerantAdded"
                                        type="number"
                                        min={0}
                                        step="any"
                                        value={formState.refrigerantAdded}
                                        onChange={handleChange}
                                        className={`w-full ${
                                            errors.refrigerantAdded
                                                ? "border-red-500"
                                                : ""
                                        }`}
                                    />
                                    {errors.refrigerantAdded && (
                                        <p className="text-red-600 text-xs mt-1">
                                            {errors.refrigerantAdded}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <section className="space-y-6">
                                <h4 className="text-gray-800 text-md font-semibold">
                                    1.2 Documents/Evidence Upload
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-2">
                                    {uploadFields.map((field) => (
                                        <div
                                            key={field}
                                            className="flex flex-col h-full"
                                        >
                                            <Label className="text-sm font-medium mb-2 text-gray-700 min-h-[3rem] flex items-center">
                                                {field}
                                            </Label>
                                            <Card className="p-4 flex flex-col items-center justify-center border-2 border-gray-300 hover:border-green-500 transition-all h-full">
                                                <Label
                                                    htmlFor={`upload-${field
                                                        .replace(/\s/g, "-")
                                                        .toLowerCase()}`}
                                                    className="cursor-pointer flex flex-col items-center gap-2 w-full"
                                                >
                                                    <CloudUpload className="h-8 w-8 text-gray-400" />
                                                    <span className="text-sm text-gray-500 text-center">
                                                        Upload{" "}
                                                        {field.split(" ")[0]}
                                                        <br />
                                                        <span className="text-xs">
                                                            (Max. 10MB)
                                                        </span>
                                                    </span>
                                                </Label>
                                                <Input
                                                    id={`upload-${field
                                                        .replace(/\s/g, "-")
                                                        .toLowerCase()}`}
                                                    type="file"
                                                    className="hidden"
                                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                                    onChange={(e) =>
                                                        handleFileChange(
                                                            e,
                                                            (() => {
                                                                switch (field) {
                                                                    case "Asset register of cooling units":
                                                                        return setAssetRegister;
                                                                    case "Refrigerant purchase invoices":
                                                                        return setPurchaseInvoices;
                                                                    case "Maintenance/service logs showing recharge volumes":
                                                                        return setServiceLogs;
                                                                    case "Certification of refrigerant type":
                                                                        return setCertification;
                                                                    default:
                                                                        return () => {};
                                                                }
                                                            })()
                                                        )
                                                    }
                                                    aria-label={`Upload ${field}`}
                                                />
                                                {(() => {
                                                    const stateFile = (() => {
                                                        switch (field) {
                                                            case "Asset register of cooling units":
                                                                return assetRegister.file;
                                                            case "Refrigerant purchase invoices":
                                                                return purchaseInvoices.file;
                                                            case "Maintenance/service logs showing recharge volumes":
                                                                return serviceLogs.file;
                                                            case "Certification of refrigerant type":
                                                                return certification.file;
                                                            default:
                                                                return null;
                                                        }
                                                    })();
                                                    if (stateFile) {
                                                        return (
                                                            <p className="text-green-600 text-xs mt-2 truncate w-full text-center">
                                                                Uploaded:{" "}
                                                                {stateFile.name}
                                                            </p>
                                                        );
                                                    }
                                                    return null;
                                                })()}
                                            </Card>
                                        </div>
                                    ))}
                                </div>
                            </section>

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
                                    aria-label="Submit form"
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
