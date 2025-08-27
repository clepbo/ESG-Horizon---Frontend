/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
} from "@/app/components/ui/card";
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

interface FertilizerEmissionsProps {
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

const fertilizerProducts = [
  "Ammonia",
  "Urea",
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
  percent,
}: FertilizerEmissionsProps) {
  const { state, dispatch } = useAssessment();
  const [products, setProducts] = useState<{ [product: string]: string }>(
    Object.fromEntries([...fertilizerProducts, ...petrochemicalProducts].map((product) => [product, ""]))
  );
  const [feedstock, setFeedstock] = useState("");
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

  useEffect(() => {
    const existingData =
      state.assessmentData.processEmissions?.fertilizerEmissions ||
      JSON.parse(localStorage.getItem("esg-assessment-data") || "{}").processEmissions?.fertilizerEmissions ||
      {};
    if (existingData) {
      setProducts(
        existingData.products ||
          Object.fromEntries([...fertilizerProducts, ...petrochemicalProducts].map((product) => [product, ""]))
      );
      setFeedstock(existingData.feedstock || "");
      setFiles(existingData.files || Object.fromEntries(uploadFields.map((field) => [field, null])));
    }
  }, [state.assessmentData.processEmissions?.fertilizerEmissions]);

  const validateForm = () => {
    const newErrors: {
      products?: string;
      feedstock?: string;
      files?: string;
      [key: string]: string | undefined;
    } = {};
    const totalProducts = Object.values(products).reduce((sum, qty) => sum + (Number(qty) || 0), 0);
    if (totalProducts === 0) {
      newErrors.products = "Please enter the quantity for at least one product";
    } else {
      Object.entries(products).forEach(([product, qty]) => {
        if (qty && (isNaN(Number(qty)) || Number(qty) < 0)) {
          newErrors[`products.${product}`] = "Please enter a valid positive number";
        }
      });
    }
    if (!feedstock) {
      newErrors.feedstock = "Please enter the quantity of feedstock consumed";
    } else if (isNaN(Number(feedstock)) || Number(feedstock) < 0) {
      newErrors.feedstock = "Please enter a valid positive number";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (field: string, event: React.ChangeEvent<HTMLInputElement>) => {
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
        [field]: { name: file.name, size: file.size, lastModified: file.lastModified },
      }));
      if (errors.files) {
        setErrors((prev) => ({ ...prev, files: undefined }));
      }
    }
  };

  const handleSaveAndContinue = () => {
    if (!validateForm()) return;
    setIsSaving(true);
    // const payload = { products, feedstock, files };
    // dispatch({
    //   type: "UPDATE_PROCESS_EMISSIONS",
    //   payload: {
    //     ...state.assessmentData.processEmissions,
    //     fertilizerEmissions: payload,
    //   },
    // });
    // dispatch({ type: "SAVE_PROGRESS" });
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
            <h3 className="text-2xl font-bold text-foreground">Process Emissions</h3>
            <p className="text-muted-foreground text-base">
              Greenhouse gases released during industrial or chemical processes, not from fuel combustion.
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
                <span className="text-sm font-medium text-gray-500">{percent}% complete</span>
              </div>
              <div className="w-full h-3 bg-green-300 rounded-lg">
                <div
                  className="h-3 bg-green-800 rounded transition-all duration-300"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>

            <div>
              <Label className="text-md font-semibold mb-2 block">
                1.1 Emissions from Fertilizer and Petrochemical Production
              </Label>
              <div className="space-y-4 ml-6">
                <Label>Fertilizer Products (Tonnes)</Label>
                {errors.products && <p className="text-sm text-red-500">{errors.products}</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fertilizerProducts.map((product) => (
                    <div key={product} className="space-y-2">
                      <Label htmlFor={`product-${product.replace(/\s/g, "-").toLowerCase()}`}>
                        {product}
                      </Label>
                      <Input
                        id={`product-${product.replace(/\s/g, "-").toLowerCase()}`}
                        type="number"
                        placeholder={`Enter quantity of ${product.toLowerCase()}`}
                        value={products[product]}
                        onChange={(e) => {
                          setProducts((prev) => ({ ...prev, [product]: e.target.value }));
                          if (errors[`products.${product}`]) {
                            setErrors((prev) => ({ ...prev, [`products.${product}`]: undefined }));
                          }
                          if (errors.products) {
                            setErrors((prev) => ({ ...prev, products: undefined }));
                          }
                        }}
                        className={`w-full border-gray-400 ${
                          errors[`products.${product}`] ? "border-red-500 focus:border-red-500" : ""
                        }`}
                        aria-describedby={errors[`products.${product}`] ? `product-${product}-error` : undefined}
                      />
                      {errors[`products.${product}`] && (
                        <p id={`product-${product}-error`} className="text-sm text-red-500">
                          {errors[`products.${product}`]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                <Label className="mt-4 block">Petrochemical Products (Tonnes)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {petrochemicalProducts.map((product) => (
                    <div key={product} className="space-y-2">
                      <Label htmlFor={`product-${product.replace(/\s/g, "-").toLowerCase()}`}>
                        {product}
                      </Label>
                      <Input
                        id={`product-${product.replace(/\s/g, "-").toLowerCase()}`}
                        type="number"
                        placeholder={`Enter quantity of ${product.toLowerCase()}`}
                        value={products[product]}
                        onChange={(e) => {
                          setProducts((prev) => ({ ...prev, [product]: e.target.value }));
                          if (errors[`products.${product}`]) {
                            setErrors((prev) => ({ ...prev, [`products.${product}`]: undefined }));
                          }
                          if (errors.products) {
                            setErrors((prev) => ({ ...prev, products: undefined }));
                          }
                        }}
                        className={`w-full border-gray-400 ${
                          errors[`products.${product}`] ? "border-red-500 focus:border-red-500" : ""
                        }`}
                        aria-describedby={errors[`products.${product}`] ? `product-${product}-error` : undefined}
                      />
                      {errors[`products.${product}`] && (
                        <p id={`product-${product}-error`} className="text-sm text-red-500">
                          {errors[`products.${product}`]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="space-y-2 mt-4">
                  <Label htmlFor="feedstock">Quantity of Feedstock Consumed (Tonnes)</Label>
                  <Input
                    id="feedstock"
                    type="number"
                    placeholder="Enter quantity of feedstock consumed"
                    value={feedstock}
                    onChange={(e) => {
                      setFeedstock(e.target.value);
                      if (errors.feedstock) {
                        setErrors((prev) => ({ ...prev, feedstock: undefined }));
                      }
                    }}
                    className={`w-full border-gray-400 ${
                      errors.feedstock ? "border-red-500 focus:border-red-500" : ""
                    }`}
                    aria-describedby={errors.feedstock ? "feedstock-error" : undefined}
                  />
                  {errors.feedstock && (
                    <p id="feedstock-error" className="text-sm text-red-500">
                      {errors.feedstock}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <Label className="text-md font-semibold mb-2 block">
                1.2 Document/Evidence Upload
              </Label>
              <div className="ml-6">
                {errors.files && <p className="text-sm text-red-500">{errors.files}</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {uploadFields.map((field) => (
                    <div key={field} className="flex flex-col gap-2">
                      <Label className="text-sm font-medium mb-1 ml-1">{field}</Label>
                      <Card className="p-4 flex flex-col items-center justify-center border border-2 hover:border-solid hover:border-primary transition-all h-32">
                        <Label
                          htmlFor={`upload-${field.replace(/\s/g, "-").toLowerCase()}`}
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