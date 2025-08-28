"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
    ArrowLeft,
    ArrowRight,
    CloudUpload,
    CheckCircle2,
    Save,
} from "lucide-react";
import { useAssessment } from "@/hooks/useAssessment";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";
import type { FileMetadata } from "@/hooks/useAssessment";

interface MethaneLeaksProps {
    onBack: () => void;
    onNext: () => void;
    stepIndex: number;
    totalSteps: number;
    percent: number;
}

const uploadFields = [
    "Equipment inventory (valves, flanges, storage tanks)",
    "Leak Detection and Repair (LDAR) survey reports",
    "Gas composition laboratory analysis",
] as const;

type UploadField = (typeof uploadFields)[number];

type ErrorKeys =
    | "compressors"
    | "pumps"
    | "prds"
    | "openEnded"
    | "seals"
    | "wellheads"
    | "manifolds"
    | "hoses"
    | "drains"
    | "sampling"
    | "others"
    | "methanePercent"
    | "files";

export function MethaneLeaks({
    onBack,
    onNext,
    stepIndex,
    totalSteps,
    percent,
}: MethaneLeaksProps) {
    const { state, dispatch } = useAssessment();

    const methaneLeaksData =
        state.assessmentData.fugitiveEmissions?.methaneLeaks;

    const [compressors, setCompressors] = useState("");
    const [pumps, setPumps] = useState("");
    const [prds, setPrds] = useState("");
    const [openEnded, setOpenEnded] = useState("");
    const [seals, setSeals] = useState("");
    const [wellheads, setWellheads] = useState("");
    const [manifolds, setManifolds] = useState("");
    const [hoses, setHoses] = useState("");
    const [drains, setDrains] = useState("");
    const [sampling, setSampling] = useState("");
    const [others, setOthers] = useState("");
    const [methanePercent, setMethanePercent] = useState("");

    const [files, setFiles] = useState<{ [key: string]: FileMetadata | null }>(
        Object.fromEntries(uploadFields.map((field) => [field, null]))
    );

    const [isSaving, setIsSaving] = useState(false);
    const [showSaveSuccess, setShowSaveSuccess] = useState(false);

    const [errors, setErrors] = useState<Partial<Record<ErrorKeys, string>>>(
        {}
    );

    useEffect(() => {
        if (methaneLeaksData) {
            setCompressors(methaneLeaksData.compressors?.toString() ?? "");
            setPumps(methaneLeaksData.pumps?.toString() ?? "");
            setPrds(methaneLeaksData.prds?.toString() ?? "");
            setOpenEnded(methaneLeaksData.openEnded?.toString() ?? "");
            setSeals(methaneLeaksData.seals?.toString() ?? "");
            setWellheads(methaneLeaksData.wellheads?.toString() ?? "");
            setManifolds(methaneLeaksData.manifolds?.toString() ?? "");
            setHoses(methaneLeaksData.hoses?.toString() ?? "");
            setDrains(methaneLeaksData.drains?.toString() ?? "");
            setSampling(methaneLeaksData.sampling?.toString() ?? "");
            setOthers(methaneLeaksData.others?.toString() ?? "");
            setMethanePercent(
                methaneLeaksData.methanePercent?.toString() ?? ""
            );
            setFiles(
                methaneLeaksData.files ??
                    Object.fromEntries(
                        uploadFields.map((field) => [field, null])
                    )
            );
        }
    }, [methaneLeaksData]);

    const numericErrorKeys: ErrorKeys[] = [
        "compressors",
        "pumps",
        "prds",
        "openEnded",
        "seals",
        "wellheads",
        "manifolds",
        "hoses",
        "drains",
        "sampling",
        "others",
    ];

    const validateForm = () => {
        const newErrors: Partial<Record<ErrorKeys, string>> = {};

        numericErrorKeys.forEach((key) => {
            const value = getValueByKey(key);
            if (value !== "") {
                const num = Number(value);
                if (isNaN(num) || num < 0) {
                    newErrors[key] = "Enter a valid non-negative number";
                }
            }
        });

        if (methanePercent !== "") {
            const val = Number(methanePercent);
            if (val < 0 || val > 100) {
                newErrors.methanePercent = "Must be between 0 and 100";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    function getValueByKey(key: ErrorKeys): string {
        switch (key) {
            case "compressors":
                return compressors;
            case "pumps":
                return pumps;
            case "prds":
                return prds;
            case "openEnded":
                return openEnded;
            case "seals":
                return seals;
            case "wellheads":
                return wellheads;
            case "manifolds":
                return manifolds;
            case "hoses":
                return hoses;
            case "drains":
                return drains;
            case "sampling":
                return sampling;
            case "others":
                return others;
            case "methanePercent":
                return methanePercent;
            default:
                return "";
        }
    }

    const handleInputChange =
        (
            setter: React.Dispatch<React.SetStateAction<string>>,
            errorKey: ErrorKeys
        ) =>
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            if (/^\d*\.?\d*$/.test(value)) {
                setter(value);
                if (errors[errorKey]) {
                    setErrors((prev) => ({ ...prev, [errorKey]: undefined }));
                }
            }
        };

    const handleFileChange = (
        field: UploadField,
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
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
            setErrors((prev) => ({ ...prev, files: undefined }));
        }
    };

    const handleSaveAndContinue = () => {
        if (!validateForm()) return;

        setIsSaving(true);

        const payload = buildPayload();

        dispatch({ type: "UPDATE_FUGITIVE_METHANE_LEAKS", payload });
        dispatch({ type: "SAVE_PROGRESS" });

        localStorage.setItem(
            "fugitiveEmissions.methaneLeaks",
            JSON.stringify(payload)
        );

        setIsSaving(false);
        setShowSaveSuccess(true);

        setTimeout(() => setShowSaveSuccess(false), 2000);
    };

    const handleNext = () => {
        if (!validateForm()) return;

        const payload = buildPayload();

        dispatch({ type: "UPDATE_FUGITIVE_METHANE_LEAKS", payload });

        localStorage.setItem(
            "fugitiveEmissions.methaneLeaks",
            JSON.stringify(payload)
        );

        onNext();
    };

    function buildPayload() {
        return {
            compressors: compressors ? Number(compressors) : 0,
            pumps: pumps ? Number(pumps) : 0,
            prds: prds ? Number(prds) : 0,
            openEnded: openEnded ? Number(openEnded) : 0,
            seals: seals ? Number(seals) : 0,
            wellheads: wellheads ? Number(wellheads) : 0,
            manifolds: manifolds ? Number(manifolds) : 0,
            hoses: hoses ? Number(hoses) : 0,
            drains: drains ? Number(drains) : 0,
            sampling: sampling ? Number(sampling) : 0,
            others: others ? Number(others) : 0,
            methanePercent: methanePercent ? Number(methanePercent) : 0,
            files,
        };
    }

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
                            Methane leaks from pipelines, valves, connectors,
                            and storage tanks.
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

                        <Label className="text-xl font-medium mb-4">
                            1.1 Methane Leaks from Pipelines, Valves,
                            Connectors, and Storage Tanks
                        </Label>

                        <div className="ml-6 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                            {numericErrorKeys.map((errorKey) => {
                                if (errorKey === "others") {
                                    return (
                                        <div
                                            key={errorKey}
                                            className="col-span-full flex flex-col"
                                        >
                                            <Label className="text-sm font-medium mb-2">
                                                Others
                                            </Label>
                                            <Input
                                                type="number"
                                                min={0}
                                                step="any"
                                                value={others}
                                                onChange={handleInputChange(
                                                    setOthers,
                                                    "others"
                                                )}
                                                className={
                                                    errors.others
                                                        ? "border-red-500 focus:border-red-500"
                                                        : ""
                                                }
                                                aria-invalid={!!errors.others}
                                                aria-describedby={
                                                    errors.others
                                                        ? "others-error"
                                                        : undefined
                                                }
                                            />
                                            {errors.others && (
                                                <p
                                                    id="others-error"
                                                    className="text-xs text-red-600 mt-1"
                                                >
                                                    {errors.others}
                                                </p>
                                            )}
                                        </div>
                                    );
                                }

                                const labelMap: Record<ErrorKeys, string> = {
                                    compressors:
                                        "Compressors (centrifugal, reciprocating)",
                                    pumps: "Pumps (mechanical seals)",
                                    prds: "Pressure relief devices (PRDs)",
                                    openEnded: "Open-ended lines",
                                    seals: "Seals (including stuffing boxes)",
                                    wellheads: "Wellheads",
                                    manifolds: "Manifolds",
                                    hoses: "Hoses and flexible connectors",
                                    drains: "Drain systems",
                                    sampling: "Sampling connections",
                                    others: "",
                                    methanePercent: "",
                                    files: "",
                                };

                                const valueMap: Record<ErrorKeys, string> = {
                                    compressors,
                                    pumps,
                                    prds,
                                    openEnded,
                                    seals,
                                    wellheads,
                                    manifolds,
                                    hoses,
                                    drains,
                                    sampling,
                                    others,
                                    methanePercent,
                                    files: "",
                                };

                                const setMap: Record<
                                    string,
                                    React.Dispatch<React.SetStateAction<string>>
                                > = {
                                    compressors: setCompressors,
                                    pumps: setPumps,
                                    prds: setPrds,
                                    openEnded: setOpenEnded,
                                    seals: setSeals,
                                    wellheads: setWellheads,
                                    manifolds: setManifolds,
                                    hoses: setHoses,
                                    drains: setDrains,
                                    sampling: setSampling,
                                    others: setOthers,
                                    methanePercent: setMethanePercent,
                                };

                                return (
                                    <div
                                        key={errorKey}
                                        className="flex flex-col"
                                    >
                                        <Label className="text-sm font-medium mb-2">
                                            {labelMap[errorKey]}
                                        </Label>
                                        <Input
                                            type="number"
                                            min={0}
                                            step="any"
                                            value={valueMap[errorKey]}
                                            onChange={handleInputChange(
                                                setMap[errorKey],
                                                errorKey
                                            )}
                                            className={
                                                errors[errorKey]
                                                    ? "border-red-500 focus:border-red-500"
                                                    : ""
                                            }
                                            aria-invalid={!!errors[errorKey]}
                                            aria-describedby={
                                                errors[errorKey]
                                                    ? `${errorKey}-error`
                                                    : undefined
                                            }
                                        />
                                        {errors[errorKey] && (
                                            <p
                                                id={`${errorKey}-error`}
                                                className="text-xs text-red-600 mt-1"
                                            >
                                                {errors[errorKey]}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}

                            <div className="col-span-full flex flex-col">
                                <Label className="text-sm font-medium mb-2">
                                    Gas Composition (% Methane)
                                </Label>
                                <Input
                                    type="number"
                                    min={0}
                                    max={100}
                                    step="any"
                                    value={methanePercent}
                                    onChange={handleInputChange(
                                        setMethanePercent,
                                        "methanePercent"
                                    )}
                                    className={
                                        errors.methanePercent
                                            ? "border-red-500 focus:border-red-500"
                                            : ""
                                    }
                                    aria-invalid={!!errors.methanePercent}
                                    aria-describedby={
                                        errors.methanePercent
                                            ? "methanePercent-error"
                                            : undefined
                                    }
                                />
                                {errors.methanePercent && (
                                    <p
                                        id="methanePercent-error"
                                        className="text-xs text-red-600 mt-1"
                                    >
                                        {errors.methanePercent}
                                    </p>
                                )}
                                <p className="text-xs text-gray-600 mt-1">
                                    Specify the percentage of methane in the
                                    leaked gas.
                                </p>
                            </div>
                        </div>

                        <Label className="text-xl font-medium mt-8 mb-4">
                            1.2 Documents/Evidence Upload
                        </Label>
                        {errors.files && (
                            <p className="text-red-600 text-sm mb-4">
                                {errors.files}
                            </p>
                        )}
                        <div className="space-y-6 ml-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {uploadFields.map((field) => (
                                <div
                                    key={field}
                                    className="flex flex-col gap-2"
                                >
                                    <Label
                                        htmlFor={`upload-${field
                                            .replace(/\s/g, "-")
                                            .toLowerCase()}`}
                                        className="text-sm font-medium"
                                    >
                                        {field} (Max. 10MB)
                                    </Label>
                                    <Card className="p-4 flex flex-col items-center justify-center border hover:border-green-700 transition-colors h-32">
                                        <Label
                                            htmlFor={`upload-${field
                                                .replace(/\s/g, "-")
                                                .toLowerCase()}`}
                                            className="cursor-pointer flex flex-col items-center gap-2"
                                        >
                                            <CloudUpload className="h-6 w-6 text-muted-foreground" />
                                            <span className="text-xs text-gray-400 text-center">
                                                Upload {field}
                                            </span>
                                        </Label>
                                        <Input
                                            type="file"
                                            id={`upload-${field
                                                .replace(/\s/g, "-")
                                                .toLowerCase()}`}
                                            className="hidden"
                                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                            onChange={(e) =>
                                                handleFileChange(field, e)
                                            }
                                            aria-label={`Upload ${field}`}
                                        />
                                        {files[field] && (
                                            <p className="text-sm text-green-600 mt-2 text-center truncate">
                                                Uploaded: {files[field]!.name}
                                            </p>
                                        )}
                                    </Card>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-3 gap-4 pt-8">
                            <Button
                                variant="outline"
                                onClick={onBack}
                                className="justify-self-start border-green-600 text-green-700 bg-transparent hover:bg-green-50 flex items-center gap-2"
                                aria-label="Previous step"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleSaveAndContinue}
                                disabled={isSaving}
                                className="justify-self-center bg-green-500 text-white hover:bg-green-300 transition-colors"
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
                                onClick={handleNext}
                                disabled={isSaving}
                                className="justify-self-end border-green-600 text-green-700 bg-transparent hover:bg-green-50 flex items-center gap-2"
                                aria-label="Next step"
                            >
                                Next
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
