/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { CustomButton } from "@/app/components/ui/reusables/CustomButton";
import { useFormattedNumber } from "@/hooks/useNumberFormater";
import { GeneralTargetData } from "@/types/target";
import { useEffect, useState } from "react";
import { FaCaretRight } from "react-icons/fa";
import { years } from "./GeneralSetTarget";
import { ScopeSummary } from "./scope/ScopeTargetSummary";
import { SuccessModal } from "./SuccessModal";

interface ScopeData {
  scope: string;
  timeline: number;
  targetReduction: number;
  annualRate: number;
}

export default function SetTargetByScope() {
  const [scopeTargetData, setScopeTargetData] = useState<GeneralTargetData>({
    reductionPercentage: null,
    baselineYear: null,
    targetYear: null,
    description: "",
    targetEmission: null,
    totalReduction: null,
  });
  const [step, setStep] = useState(0);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Use the formatting hook for targetEmission
  const targetEmissionFormatter = useFormattedNumber(scopeTargetData.targetEmission || "");

  const handleInputChange = (field: keyof GeneralTargetData, value: string | number) => {
    let processedValue: number | string | null | any = value;

    if (field === "reductionPercentage") {
      processedValue = value === "" ? null : Number(value);
      // Auto-calculate target emission when percentage changes
      if (processedValue !== null && scopeTargetData.baselineYear && scopeTargetData.targetYear) {
        const baselineEmission = 26830; // Fixed baseline from image
        const targetEmission = baselineEmission * (1 - processedValue / 100);
        const totalReduction = baselineEmission - targetEmission;

        setScopeTargetData((prev) => ({
          ...prev,
          reductionPercentage: processedValue,
          targetEmission: Math.round(targetEmission),
          totalReduction: Math.round(totalReduction),
        }));
        return;
      }
    }

    if (field === "baselineYear" || field === "targetYear") {
      processedValue = value === "" ? null : Number(value);
    }

    // Handle targetEmission changes from formatted input
    if (field === "targetEmission") {
      processedValue = value === "" ? null : Number(value);
    }

    setScopeTargetData((prev) => ({
      ...prev,
      [field]: processedValue,
    }));
  };

  useEffect(() => {
    if (scopeTargetData.targetEmission !== Number(targetEmissionFormatter.rawValue)) {
      targetEmissionFormatter.setRawValue(String(scopeTargetData.targetEmission || ""));
    }
  }, [scopeTargetData.targetEmission]);

  const handleContinue = () => {
    if (step === 0) {
      // Validate required fields before proceeding
      if (
        scopeTargetData.reductionPercentage &&
        scopeTargetData.baselineYear &&
        scopeTargetData.targetYear
      ) {
        setStep(1);
      }
    }
  };

  const handlePrevious = () => {
    setStep(0);
  };

  const handleSetTarget = () => {
    // Open the success modal
    setIsSuccessModalOpen(true);
  };

  const handleModalContinue = () => {
    // Close the modal
    setIsSuccessModalOpen(false);
    // Add any additional logic here for after modal continue
  };

  const handleModalClose = () => {
    setIsSuccessModalOpen(false);
  };

  // Mock scope data - replace with your actual data
  const scopesData: ScopeData[] = [
    { scope: "Scope 1", timeline: 6, targetReduction: 5366, annualRate: 894 },
    { scope: "Scope 2", timeline: 6, targetReduction: 5366, annualRate: 894 },
    { scope: "Scope 3", timeline: 6, targetReduction: 5366, annualRate: 894 },
  ];

  // Calculate dynamic values for display

  const calculatedTargetEmission = scopeTargetData.targetEmission || 0;
  const calculatedTotalReduction = scopeTargetData.totalReduction || 0;

  if (step === 0) {
    return (
      <div className="space-y-6 text-left">
        {/* Scope 1 Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-left font-normal">Scope 1 Target</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-gray-600 text-left">
              Direct emissions from owned or controlled sources
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scope1-reductionPercentage">Reduction Percentage (%)</Label>
                <Input
                  id="scope1-reductionPercentage"
                  type="number"
                  placeholder="e.g. 30"
                  value={scopeTargetData.reductionPercentage ?? ""}
                  onChange={(e) => handleInputChange("reductionPercentage", e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scope1-baselineYear">Baseline Year</Label>
                <select
                  id="scope1-baselineYear"
                  value={scopeTargetData.baselineYear ?? ""}
                  onChange={(e) => handleInputChange("baselineYear", e.target.value)}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select year</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scope1-targetYear">Target Year</Label>
                <select
                  id="scope1-targetYear"
                  value={scopeTargetData.targetYear ?? ""}
                  onChange={(e) => handleInputChange("targetYear", e.target.value)}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select year</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scope1-description">Description (Optional)</Label>
              <Textarea
                id="scope1-description"
                placeholder="Describe your scope-based reduction strategy..."
                value={scopeTargetData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={3}
              />
            </div>

            {/* Target Calculation */}
            <div className="flex flex-col w-full gap-2 justify-end">
              <div className="space-y-2 flex items-center justify-between w-full">
                <Label>Baseline (2024):</Label>
                <div className="text-sm text-gray-900 font-semibold">26,830 tCO₂e</div>
              </div>
              <div className="space-y-2 flex items-center justify-between w-full">
                <Label>Target (2030):</Label>
                <div className="text-sm text-primary font-semibold">
                  {calculatedTargetEmission.toLocaleString()} tCO₂e
                </div>
              </div>
              <hr className="text-gray-300" />
              <div className="space-y-2 flex items-center justify-between w-full">
                <Label>Total:</Label>
                <div className="text-sm text-red-500 font-semibold">
                  -{calculatedTotalReduction.toLocaleString()} tCO₂e
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scope 2 Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-left font-normal">Scope 2 Target</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-gray-600 text-left">
              Indirect emissions from purchased energy
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scope2-reductionPercentage">Reduction Percentage (%)</Label>
                <Input
                  id="scope2-reductionPercentage"
                  type="number"
                  placeholder="e.g. 30"
                  value={scopeTargetData.reductionPercentage ?? ""}
                  onChange={(e) => handleInputChange("reductionPercentage", e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scope2-baselineYear">Baseline Year</Label>
                <select
                  id="scope2-baselineYear"
                  value={scopeTargetData.baselineYear ?? ""}
                  onChange={(e) => handleInputChange("baselineYear", e.target.value)}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select year</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scope2-targetYear">Target Year</Label>
                <select
                  id="scope2-targetYear"
                  value={scopeTargetData.targetYear ?? ""}
                  onChange={(e) => handleInputChange("targetYear", e.target.value)}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select year</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scope2-description">Description (Optional)</Label>
              <Textarea
                id="scope2-description"
                placeholder="Describe your scope-based reduction strategy..."
                value={scopeTargetData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={3}
              />
            </div>

            {/* Target Calculation */}
            <div className="flex flex-col w-full gap-2 justify-end">
              <div className="space-y-2 flex items-center justify-between w-full">
                <Label>Baseline (2024):</Label>
                <div className="text-sm text-gray-900 font-semibold">26,830 tCO₂e</div>
              </div>
              <div className="space-y-2 flex items-center justify-between w-full">
                <Label>Target (2030):</Label>
                <div className="text-sm text-primary font-semibold">
                  {calculatedTargetEmission.toLocaleString()} tCO₂e
                </div>
              </div>
              <hr className="text-gray-300" />
              <div className="space-y-2 flex items-center justify-between w-full">
                <Label>Total:</Label>
                <div className="text-sm text-red-500 font-semibold">
                  -{calculatedTotalReduction.toLocaleString()} tCO₂e
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scope 3 Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-left font-normal">Scope 3 Target</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-gray-600 text-left">
              All other indirect emissions in the value chain.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scope3-reductionPercentage">Reduction Percentage (%)</Label>
                <Input
                  id="scope3-reductionPercentage"
                  type="number"
                  placeholder="e.g. 30"
                  value={scopeTargetData.reductionPercentage ?? ""}
                  onChange={(e) => handleInputChange("reductionPercentage", e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scope3-baselineYear">Baseline Year</Label>
                <select
                  id="scope3-baselineYear"
                  value={scopeTargetData.baselineYear ?? ""}
                  onChange={(e) => handleInputChange("baselineYear", e.target.value)}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select year</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scope3-targetYear">Target Year</Label>
                <select
                  id="scope3-targetYear"
                  value={scopeTargetData.targetYear ?? ""}
                  onChange={(e) => handleInputChange("targetYear", e.target.value)}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select year</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scope3-description">Description (Optional)</Label>
              <Textarea
                id="scope3-description"
                placeholder="Describe your scope-based reduction strategy..."
                value={scopeTargetData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={3}
              />
            </div>

            {/* Target Calculation */}
            <div className="flex flex-col w-full gap-2 justify-end">
              <div className="space-y-2 flex items-center justify-between w-full">
                <Label>Baseline (2024):</Label>
                <div className="text-sm text-gray-900 font-semibold">26,830 tCO₂e</div>
              </div>
              <div className="space-y-2 flex items-center justify-between w-full">
                <Label>Target (2030):</Label>
                <div className="text-sm text-primary font-semibold">
                  {calculatedTargetEmission.toLocaleString()} tCO₂e
                </div>
              </div>
              <hr className="text-gray-300" />
              <div className="space-y-2 flex items-center justify-between w-full">
                <Label>Total:</Label>
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
            disabled={
              !scopeTargetData.reductionPercentage ||
              !scopeTargetData.baselineYear ||
              !scopeTargetData.targetYear
            }
          >
            Continue
          </CustomButton>
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <>
        <ScopeSummary
          scopes={scopesData}
          onPrevious={handlePrevious}
          onSetTarget={handleSetTarget}
        />
        <SuccessModal
          isOpen={isSuccessModalOpen}
          onClose={handleModalClose}
          onContinue={handleModalContinue}
        />
      </>
    );
  }

  // return null;

return <h2> Troubleshooting the error</h2>;
}
