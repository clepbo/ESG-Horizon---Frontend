"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  CloudUpload,
  ArrowRight,
} from "lucide-react";
import { useAssessment } from "@/hooks/useAssessment";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";
import type { AssessmentData } from "@/hooks/useAssessment";
import { calculateProgress } from "@/lib/utils";
import { AssessmentProgressBar } from "@/app/components/company/assessments/AssessmentProgressBar";

interface FertilizerEmissionsProps {
  onBack: () => void;
  onNext: () => void;
  stepIndex: number;
  totalSteps: number;
}

interface FileMetadata {
  name: string;
  size: number;
  lastModified: number;
}

const fertilizerProducts = [
  "Ammonia",
  "Urea",
  "Nitric Acid",
  "Ammonium Nitrate",
  "Diammonium Phosphate (DAP)",
  "Triple Superphosphate (TSP)",
];

const petrochemicalProducts = [
  "Methanol",
  "Ethylene",
  "Propylene",
  "Polyethylene (PE)",
  "Polypropylene (PP)",
  "Vinyl Chloride Monomer (VCM)",
  "Polyvinyl Chloride (PVC)",
  "Formaldehyde",
];

const uploadFields = [
  "Production logs",
  "Feedstock purchase/metered records",
  "Plant production efficiency reports",
];

export function FertilizerEmissions({
  onBack,
  onNext,
  stepIndex,
  totalSteps,
}: FertilizerEmissionsProps) {
  const { state, dispatch } = useAssessment();
  const [products, setProducts] = useState<{ [product: string]: number }>(
    Object.fromEntries(
      [...fertilizerProducts, ...petrochemicalProducts].map((product) => [
        product,
        0,
      ])
    )
  );
  const [feedstock, setFeedstock] = useState<number>(0);
  const [files, setFiles] = useState<{ [key: string]: FileMetadata | null }>(
    Object.fromEntries(uploadFields.map((field) => [field, null]))
  );
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [errors, setErrors] = useState<{
    products?: string;
    feedstock?: string;
    files?: string;
    [key: string]: string | undefined;
  }>({});

  // useEffect(() => {
  //     const existingData = (state.assessmentData.processEmissions?.fertilizerEmissions ?? {}) as FertilizerEmissionsData;

  //     setProducts(
  //         existingData.products ??
  //             Object.fromEntries([...fertilizerProducts, ...petrochemicalProducts].map(product => [product, 0]))
  //     );
  //     setFeedstock(existingData.feedstock ?? 0);
  //     setFiles(
  //         existingData.files ??
  //             Object.fromEntries(uploadFields.map(field => [field, null]))
  //     );
  // }, [state.assessmentData.processEmissions?.fertilizerEmissions]);

  useEffect(() => {
    const existingData = state.assessmentData.processEmissions
      ?.fertilizerEmissions as NonNullable<
      AssessmentData["processEmissions"]
    >["fertilizerEmissions"];
    if (existingData) {
      setProducts(
        existingData.products ??
          Object.fromEntries(
            [...fertilizerProducts, ...petrochemicalProducts].map((product) => [
              product,
              0,
            ])
          )
      );
      setFeedstock(existingData.feedstock ?? 0);
      setFiles(
        existingData.files ??
          Object.fromEntries(uploadFields.map((field) => [field, null]))
      );
    }
  }, [state.assessmentData.processEmissions?.fertilizerEmissions]);

  const { filled, total } = useMemo(() => {
    const hasProducts = Object.values(products).some((qty) => qty > 0);

    const hasFeedstock = feedstock > 0;

    const allFilesUploaded = Object.values(files).every(Boolean);

    return calculateProgress([hasProducts, hasFeedstock, allFilesUploaded]);
  }, [products, feedstock, files]);

  const validateForm = () => {
    const newErrors: {
      products?: string;
      feedstock?: string;
      files?: string;
      [key: string]: string | undefined;
    } = {};
    const totalProducts = Object.values(products).reduce(
      (sum, qty) => sum + qty,
      0
    );
    if (totalProducts === 0) {
      newErrors.products = "Please enter the quantity for at least one product";
    } else {
      Object.entries(products).forEach(([product, qty]) => {
        if (qty < 0) {
          newErrors[`products.${product}`] =
            "Please enter a valid positive number";
        }
      });
    }
    if (feedstock <= 0) {
      newErrors.feedstock =
        "Please enter a positive quantity of feedstock consumed";
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
      setErrors((prev) => ({ ...prev, files: undefined }));
    }
  };

  const handleSaveAndContinue = () => {
    if (!validateForm()) return;
    setIsSaving(true);
    dispatch({
      type: "UPDATE_PROCESS_FERTILIZER_EMISSIONS",
      payload: { products, feedstock, files },
    });
    dispatch({ type: "SAVE_PROGRESS" });
    setIsSaving(false);
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 2000);
  };

  const handleNext = () => {
    if (!validateForm()) return;
    handleSaveAndContinue();
    onNext();
  };

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
            <h3 className="text-2xl font-bold text-foreground">
              Process Emissions
            </h3>
            <p className="text-muted-foreground text-base">
              Greenhouse gases released during industrial or chemical processes,
              not from fuel combustion.
            </p>
          </div>
        </div>
        <Card className="animate-in slide-in-from-bottom-4 duration-500 bg-gray-50 mt-6 mb-8 pt-6">
          <CardContent className="space-y-8">
            <AssessmentProgressBar
              stepIndex={stepIndex}
              totalSteps={totalSteps}
              fieldsCompleted={filled}
              totalFields={total}
              isSubmitted={false}
            />

            <div>
              <Label className="text-md font-semibold mb-2 block">
                1.1 Emissions from Fertilizer and Petrochemical Production
              </Label>

              {errors.products && (
                <p className="text-sm text-red-500">{errors.products}</p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left column: Fertilizers */}
                <div className="space-y-4">
                  <Label className="font-semibold">Fertilizer Products</Label>
                  {fertilizerProducts.map((product) => (
                    <div key={product} className="space-y-1">
                      <Label htmlFor={`product-${product}`}>{product}</Label>
                      <div className="relative">
                        <Input
                          id={`product-${product}`}
                          type="number"
                          value={products[product] || ""}
                          placeholder={`Enter quantity`}
                          onChange={(e) => {
                            setProducts((prev) => ({
                              ...prev,
                              [product]: Number(e.target.value),
                            }));
                            setErrors((prev) => ({
                              ...prev,
                              [`products.${product}`]: undefined,
                              products: undefined,
                            }));
                          }}
                          className={`w-full pr-16 border-gray-400 ${
                            errors[`products.${product}`]
                              ? "border-red-500 focus:border-red-500"
                              : ""
                          }`}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                          Tonnes
                        </span>
                      </div>
                      {errors[`products.${product}`] && (
                        <p className="text-sm text-red-500">
                          {errors[`products.${product}`]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Right column: Petrochemicals */}
                <div className="space-y-4">
                  <Label className="font-semibold">
                    Petrochemical Products
                  </Label>
                  {petrochemicalProducts.map((product) => (
                    <div key={product} className="space-y-1">
                      <Label htmlFor={`product-${product}`}>{product}</Label>
                      <div className="relative">
                        <Input
                          id={`product-${product}`}
                          type="number"
                          value={products[product] || ""}
                          placeholder={`Enter quantity`}
                          onChange={(e) => {
                            setProducts((prev) => ({
                              ...prev,
                              [product]: Number(e.target.value),
                            }));
                            setErrors((prev) => ({
                              ...prev,
                              [`products.${product}`]: undefined,
                              products: undefined,
                            }));
                          }}
                          className={`w-full pr-16 border-gray-400 ${
                            errors[`products.${product}`]
                              ? "border-red-500 focus:border-red-500"
                              : ""
                          }`}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                          Tonnes
                        </span>
                      </div>
                      {errors[`products.${product}`] && (
                        <p className="text-sm text-red-500">
                          {errors[`products.${product}`]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Feedstock consumed */}
              <div className="space-y-2 mt-6">
                <Label htmlFor="feedstock">
                  Quantity of Feedstock Consumed
                </Label>
                <div className="relative">
                  <Input
                    id="feedstock"
                    type="number"
                    value={feedstock || ""}
                    placeholder="Enter quantity"
                    onChange={(e) => {
                      setFeedstock(Number(e.target.value));
                      setErrors((prev) => ({
                        ...prev,
                        feedstock: undefined,
                      }));
                    }}
                    className={`w-full pr-16 border-gray-400 ${
                      errors.feedstock
                        ? "border-red-500 focus:border-red-500"
                        : ""
                    }`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                    Tonnes
                  </span>
                </div>
                {errors.feedstock && (
                  <p id="feedstock-error" className="text-sm text-red-500">
                    {errors.feedstock}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label className="text-md font-semibold mb-2 block">
                1.2 Document/Evidence Upload
              </Label>
              <div className="ml-6">
                {errors.files && (
                  <p className="text-sm text-red-500">{errors.files}</p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {uploadFields.map((field) => (
                    <div key={field} className="flex flex-col gap-2">
                      <Label className="text-sm font-medium mb-1 ml-1">
                        {field}
                      </Label>
                      <Card className="p-4 flex flex-col items-center justify-center border border-2 hover:border-solid hover:border-primary transition-all h-32">
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
                          id={`upload-${field
                            .replace(/\s/g, "-")
                            .toLowerCase()}`}
                          type="file"
                          className="hidden"
                          onChange={(e) => handleFileChange(field, e)}
                          accept=".pdf,.jpg,.jpeg,.png"
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
                    <LoadingSpinner size="sm" className="mr-2" />
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
                className="justify-self-end hover:cursor-pointer border-green-600 text-green-700 bg-transparent hover:bg-green-50 flex items-center gap-2"
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
