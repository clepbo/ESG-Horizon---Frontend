import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { CustomButton } from "@/app/components/ui/reusables/CustomButton";
import { Textarea } from "@/app/components/ui/textarea";
import { useFormattedNumber } from "@/hooks/useNumberFormater";
import { GeneralTargetData } from "@/types/target";
import { useEffect, useState } from "react";
import { FaCaretRight } from "react-icons/fa";
import { GeneralTargetSummary } from "./general/GeneralTargetSummary";
import { SuccessModal } from "./SuccessModal";


export interface GeneralTargetFormProps {
  data: GeneralTargetData;
  onChange: (data: GeneralTargetData) => void;
  onComplete?: (data: GeneralTargetData) => void;
}

const currentYear = new Date().getFullYear();
export const years = Array.from({ length: 30 }, (_, i) => currentYear - 10 + i);

export function GeneralTargetForm({ data, onChange, onComplete }: GeneralTargetFormProps) {
  const [step, setStep] = useState(0);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false); // Modal state
  
  // Use the formatting hook for targetEmission
  const targetEmissionFormatter = useFormattedNumber(data.targetEmission || "");

  const handleInputChange = (field: keyof GeneralTargetData, value: string | number) => {
    let processedValue: any = value;
    
    if (field === 'reductionPercentage') {
      processedValue = value === '' ? null : Number(value);
      // Auto-calculate target emission when percentage changes
      if (processedValue !== null && data.baselineYear && data.targetYear) {
        const baselineEmission = 26830; // Fixed baseline from image
        const targetEmission = baselineEmission * (1 - processedValue / 100);
        const totalReduction = baselineEmission - targetEmission;
        
        onChange({
          ...data,
          reductionPercentage: processedValue,
          targetEmission: Math.round(targetEmission),
          totalReduction: Math.round(totalReduction)
        });
        return;
      }
    }
    
    if (field === 'baselineYear' || field === 'targetYear') {
      processedValue = value === '' ? null : Number(value);
    }

    // Handle targetEmission changes from formatted input
    if (field === 'targetEmission') {
      processedValue = value === '' ? null : Number(value);
    }

    onChange({
      ...data,
      [field]: processedValue
    });
  };

  // Handle the formatted target emission input specifically
  const handleTargetEmissionChange = (inputValue: string) => {
    targetEmissionFormatter.handleChange(inputValue);
    
    // Update the actual data with the raw numeric value
    const numericValue = targetEmissionFormatter.rawValue === '' ? null : Number(targetEmissionFormatter.rawValue);
    onChange({
      ...data,
      targetEmission: numericValue
    });
  };

  // Sync the formatter when data changes externally
  useEffect(() => {
    if (data.targetEmission !== Number(targetEmissionFormatter.rawValue)) {
      targetEmissionFormatter.setRawValue(String(data.targetEmission || ""));
    }
  }, [data.targetEmission]);

  const handleContinue = () => {
    if (step === 0) {
      // Validate required fields before proceeding
      if (data.reductionPercentage && data.baselineYear && data.targetYear) {
        setStep(1);
      }
    }
  };

  const handlePrevious = () => {
    setStep(0);
  };

  const handleSetTarget = () => {
    // Call the onComplete callback with the data
    onComplete?.(data);
    
    // Open the success modal
    setIsSuccessModalOpen(true);
  };

  const handleModalContinue = () => {
    // Close the modal
    setIsSuccessModalOpen(false);
    
    // You can add additional logic here for what happens after modal "Continue"
    // For example: reset the form, navigate away, etc.
    console.log("Modal continue clicked - target setup complete!");
  };

  const handleModalClose = () => {
    setIsSuccessModalOpen(false);
  };

  // Calculate dynamic values for display
  const baselineEmission = 26830; // Fixed baseline from image
  const calculatedTargetEmission = data.targetEmission || 0;
  const calculatedTotalReduction = data.totalReduction || 0;

  return (
    <>
      {step === 0 ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">General Reduction Target</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-gray-600">
                Set your overall emissions reduction target across all scopes
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reductionPercentage">Reduction Percentage (%)</Label>
                  <Input
                    id="reductionPercentage"
                    type="number"
                    placeholder="e.g. 30"
                    value={data.reductionPercentage ?? ''}
                    onChange={(e) => handleInputChange('reductionPercentage', e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="baselineYear">Baseline Year</Label>
                  <select
                    id="baselineYear"
                    value={data.baselineYear ?? ''}
                    onChange={(e) => handleInputChange('baselineYear', e.target.value)}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select year</option>
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetYear">Target Year</Label>
                  <select
                    id="targetYear"
                    value={data.targetYear ?? ''}
                    onChange={(e) => handleInputChange('targetYear', e.target.value)}
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select year</option>
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your general reduction strategy..."
                  value={data.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Target Calculation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 w-full">
              <div className="flex flex-col w-full gap-2">
                <div className="space-y-2 flex items-center justify-between w-full">
                  <Label>Baseline (2024):</Label>
                  <div className="text-sm text-gray-900 font-semibold">26,830 tCO₂e</div>
                </div>
                <div className="space-y-2 flex items-center justify-between w-full">
                  <Label>Target ({data.targetYear || 2030}):</Label>
                  <div className="text-sm text-primary font-semibold">
                    {calculatedTargetEmission.toLocaleString()} tCO₂e
                  </div>
                </div>
                <hr className="text-gray-300"/>
                <div className="space-y-2 flex items-center justify-between w-full">
                  <Label>Total Reduction:</Label>
                  <div className="text-sm text-red-500 font-semibold">
                    -{calculatedTotalReduction.toLocaleString()} tCO₂e
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <CustomButton 
              icon={<FaCaretRight />} 
              onClick={handleContinue}
              className="text-white px-6 py-2"
              disabled={!data.reductionPercentage || !data.baselineYear || !data.targetYear}
            >
              Continue
            </CustomButton>
          </div>
        </div>
      ) : step === 1 ? (
        <GeneralTargetSummary
          reductionPercentage={data.reductionPercentage || 0}
          baselineEmission={baselineEmission}
          targetEmission={calculatedTargetEmission}
          targetYear={data.targetYear || 2030}
          baselineYear={data.baselineYear || 2024}
          onPrevious={handlePrevious}
          onSetTarget={handleSetTarget}
        />
      ) : null}

      {/* Success Modal - rendered outside the step condition so it's always available */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={handleModalClose}
        onContinue={handleModalContinue}
      />
    </>
  );
}