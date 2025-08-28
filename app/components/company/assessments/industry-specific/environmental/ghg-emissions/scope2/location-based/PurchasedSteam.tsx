"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Textarea } from "@/app/components/ui/textarea";
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  ArrowRight,
  CloudUpload,
} from "lucide-react";
import { useAssessment } from "@/hooks/useAssessment";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";

interface PurchasedSteamFormProps {
  onBack: () => void;
  onNext: () => void;
  stepIndex: number;
  totalSteps: number;
  percent: number;
}

interface FileMetadata {
  name: string;
  size: number;
  lastModified: number;
}

const uploadFields = [
  "Supplier invoices for steam purchases",
  "Metered records of steam consumption",
  "Contracts or agreements with providers",
];

const steamSources = [
  { id: "industrial-supplier", label: "Industrial Supplier" },
  { id: "district-heating", label: "District Heating/Steam Plant" },
];

export function PurchasedSteamForm({
  onBack,
  onNext,
  stepIndex,
  totalSteps,
  percent,
}: PurchasedSteamFormProps) {
  const { state, dispatch } = useAssessment();

  const [steamConsumed, setSteamConsumed] = useState("");
  const [reportingPeriod, setReportingPeriod] = useState("monthly");
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [otherComments, setOtherComments] = useState("");
  const [files, setFiles] = useState<{ [key: string]: FileMetadata | null }>(
    Object.fromEntries(uploadFields.map((field) => [field, null]))
  );

  const [errors, setErrors] = useState<{
    steamConsumed?: string;
    selectedSources?: string;
    files?: string;
  }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // Hydrate from context or localStorage
  useEffect(() => {
    const existingData =
      state.assessmentData.steam ||
      JSON.parse(localStorage.getItem("steam") || "{}");

    if (existingData) {
      setSteamConsumed(existingData.steamConsumed || "");
      setReportingPeriod(existingData.reportingPeriod || "monthly");
      setSelectedSources(existingData.selectedSources || []);
      setOtherComments(existingData.otherComments || "");
      setFiles(
        existingData.files ||
          Object.fromEntries(uploadFields.map((field) => [field, null]))
      );
    }
  }, [state.assessmentData.steam]);

  const validateForm = () => {
    const newErrors: {
      steamConsumed?: string;
      selectedSources?: string;
      files?: string;
    } = {};

    if (!steamConsumed || Number(steamConsumed) <= 0) {
      newErrors.steamConsumed = "Please enter a valid positive number";
    }

    if (selectedSources.length === 0) {
      newErrors.selectedSources = "Please select at least one steam source";
    }

    if (!Object.values(files).some((file) => file !== null)) {
      newErrors.files = "Please upload at least one supporting document";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSourceChange = (sourceId: string, checked: boolean) => {
    setSelectedSources((prev) =>
      checked ? [...prev, sourceId] : prev.filter((id) => id !== sourceId)
    );
    if (errors.selectedSources) {
      setErrors((prev) => ({ ...prev, selectedSources: undefined }));
    }
  };

  const handleFileChange = (
    field: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
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
    }
  };

  const handleSaveAndContinue = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    const payload = {
      volume: steamConsumed,
      reportingPeriod,
      selectedSources,
      otherComments,
      files,
    };

    dispatch({ type: "UPDATE_STEAM", payload });
    dispatch({ type: "SAVE_PROGRESS" });

    localStorage.setItem("steam", JSON.stringify(payload));

    setIsSaving(false);
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 2000);
  };

  const handleNext = () => {
    if (!validateForm()) return;

    const payload = {
      volume: steamConsumed,
      reportingPeriod,
      selectedSources,
      otherComments,
      files,
    };

    dispatch({
      type: "UPDATE_STEAM",
      payload,
    });

    localStorage.setItem("steam", JSON.stringify(payload));

    onNext();
  };

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-6 mb-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="cursor-pointer flex items-center gap-2 bg-white border-green-600 text-green-700 hover:bg-green-50"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div>
            <h3 className="text-2xl font-semibold text-foreground">
              Scope 2: Purchased Steam
            </h3>
            <p className="text-muted-foreground text-base">
              Emissions from steam purchased for your facilities
            </p>
          </div>
        </div>

        <Card className="animate-in slide-in-from-bottom-4 duration-500 bg-gray-50 mt-6 mb-8 pt-6">
          <CardContent className="space-y-8">
            {/* Progress bar */}
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

            {/* Steam Consumed */}
            <div>
              <Label htmlFor="steam-consumed">Steam Consumed (tonnes)</Label>
              <Input
                id="steam-consumed"
                type="number"
                placeholder="Enter amount in tonnes"
                value={steamConsumed}
                onChange={(e) => setSteamConsumed(e.target.value)}
                className={`w-full border-gray-400 ${
                  errors.steamConsumed ? "border-red-500" : ""
                }`}
              />
              {errors.steamConsumed && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.steamConsumed}
                </p>
              )}
            </div>

            {/* Steam Sources */}
            <div>
              <Label className="text-md font-medium mb-2 block">
                Source of Steam
              </Label>
              <div className="space-y-3 ml-6">
                {steamSources.map((src) => (
                  <div key={src.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={src.id}
                      checked={selectedSources.includes(src.id)}
                      onCheckedChange={(checked) =>
                        handleSourceChange(src.id, checked as boolean)
                      }
                    />
                    <Label htmlFor={src.id}>{src.label}</Label>
                  </div>
                ))}
              </div>
              {errors.selectedSources && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.selectedSources}
                </p>
              )}
            </div>

            {/* Other Comments */}
            <div>
              <Label htmlFor="other-comments">Other Comments</Label>
              <Textarea
                id="other-comments"
                placeholder="Please specify"
                value={otherComments}
                onChange={(e) => setOtherComments(e.target.value)}
                rows={3}
              />
            </div>

            {/* Reporting Period */}
            <div>
              <Label className="text-md font-medium mb-2 block">
                Reporting Period
              </Label>
              <RadioGroup
                value={reportingPeriod}
                onValueChange={setReportingPeriod}
                className="space-y-3 ml-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="monthly" id="monthly" />
                  <Label htmlFor="monthly">Monthly</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="quarterly" id="quarterly" />
                  <Label htmlFor="quarterly">Quarterly</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="annually" id="annually" />
                  <Label htmlFor="annually">Annually</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Uploads */}
            <div>
              <Label className="text-md font-medium mb-2 block">
                Supporting Documents
              </Label>
              {errors.files && (
                <p className="text-sm text-red-500">{errors.files}</p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {uploadFields.map((field) => (
                  <div key={field} className="flex flex-col gap-2">
                    <Label className="text-sm font-medium mb-1 ml-1 text-gray-700">
                      {field}
                    </Label>
                    <Card className="p-4 flex flex-col items-center justify-center border hover:border-solid hover:border-primary transition-all">
                      <Label
                        htmlFor={`upload-${field
                          .replace(/\s/g, "-")
                          .toLowerCase()}`}
                        className="cursor-pointer flex flex-col items-center gap-2"
                      >
                        <CloudUpload className="h-6 w-6 text-muted-foreground" />
                        <span className="text-xs text-gray-400 text-center">
                          Upload {field} (Max. 10MB)
                        </span>
                      </Label>
                      <Input
                        id={`upload-${field.replace(/\s/g, "-").toLowerCase()}`}
                        type="file"
                        className="hidden"
                        onChange={(e) => handleFileChange(field, e)}
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                      {files[field] && (
                        <p className="text-sm text-green-600 mt-2 text-center">
                          Uploaded: {files[field]!.name}
                        </p>
                      )}
                    </Card>
                  </div>
                ))}
              </div>
            </div>

            {/* Save Status */}
            {isSaving ? (
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <LoadingSpinner size="sm" /> Saving...
              </div>
            ) : showSaveSuccess ? (
              <p className="text-sm text-green-600 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> Saved successfully!
              </p>
            ) : null}

            {/* Nav Buttons */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              <Button
                variant="outline"
                onClick={onBack}
                className="cursor-pointer justify-self-start border-green-600 text-green-700 hover:bg-green-50 flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" /> Previous
              </Button>

              <Button
                variant="outline"
                onClick={handleSaveAndContinue}
                disabled={isSaving}
                className="justify-self-center bg-green-500 text-white hover:bg-green-300 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" /> Saving...
                  </>
                ) : showSaveSuccess ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" /> Saved!
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" /> Save & Continue Later
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={handleNext}
                disabled={isSaving}
                className="cursor-pointer justify-self-end border-green-600 text-green-700 hover:bg-green-50 flex items-center gap-2"
              >
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
