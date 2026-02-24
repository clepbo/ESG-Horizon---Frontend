"use client";

import { Card, CardContent, CardHeader } from "@/app/components/ui/card";
import { CustomButton } from "@/app/components/ui/reusables/CustomButton";
import { TrendingDown } from "lucide-react";
import { FaCaretLeft } from "react-icons/fa";
import { formatNumberFull } from "@/lib/numberFormat";

interface TargetSummaryProps {
  reductionPercentage: number;
  baselineEmission: number;
  targetEmission: number;
  targetYear: number;
  baselineYear: number;
  onPrevious: () => void;
  onSetTarget: () => void;
  isLoading?: boolean;
}

export function GeneralTargetSummary({
  reductionPercentage = 20,
  baselineEmission = 26830,
  targetEmission = 21464,
  targetYear = 2030,
  baselineYear = 2024,
  onPrevious,
  onSetTarget,
  isLoading = false,
}: TargetSummaryProps) {
  // Fix: Calculate total reduction correctly
  const totalReduction = baselineEmission - targetEmission;
  const yearsDifference = Math.abs(targetYear - baselineYear);
  const annualRate = yearsDifference > 0 ? totalReduction / yearsDifference : 0;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Target Summary Card */}
      <Card className="shadow-md">
        <CardHeader>
          <div className="text-lg font-semibold">Target Summary</div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Reduction Target */}
          <div className="text-center space-y-2">
            <TrendingDown className={`justify-self-auto mx-auto text-green-600 font-semibold`} />
            <h6 className="text-2xl font-semibold text-gray-900">
              {reductionPercentage}% Reduction Target
            </h6>
            <div className="text-sm text-gray-600 leading-relaxed max-w-md mx-auto space-y-1.5">
              <div className="flex items-baseline justify-between gap-6">
                <span className="font-medium text-gray-700">From</span>
                <span className="font-semibold text-red-500 text-right">
                  {formatNumberFull(baselineEmission)} tCO₂e
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-6">
                <span className="font-medium text-gray-700">To</span>
                <span className="font-semibold text-green-600 text-right">
                  {formatNumberFull(targetEmission)} tCO₂e
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-6">
                <span className="font-medium text-gray-700">By</span>
                <span className="font-semibold text-gray-900 text-right">{targetYear}</span>
              </div>
            </div>
          </div>

          {/* Target Details */}
          <div className="space-y-4 mx-2 lg:mx-14">
            <h6 className="font-semibold text-gray-900">Target Details</h6>

            <div className="flex flex-col gap-4 w-full">
              {/* Timeline */}
              <div className="space-y-2 flex items-center justify-between w-full">
                <div className="text-sm font-medium text-gray-600">Timeline:</div>
                <div className="text-sm font-semibold text-gray-900">{yearsDifference} years</div>
              </div>

              {/* Total Reduction - FIXED */}
              <div className="space-y-2 flex items-center justify-between w-full">
                <div className="text-sm font-medium text-gray-600">Total Reduction:</div>
                <div className="text-sm font-semibold text-red-600">
                  -{formatNumberFull(totalReduction)} tCO₂e
                </div>
              </div>

              {/* Annual Rate */}
              <div className="space-y-2 flex items-center justify-between w-full">
                <div className="text-sm font-medium text-gray-600">Annual Rate:</div>
                <div className={`text-sm font-semibold text-green-600`}>
                  {formatNumberFull(Math.round(annualRate))} tCO₂e/year
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <CustomButton
          icon={<FaCaretLeft className="mr-2" />}
          variant="outlined"
          onClick={onPrevious}
          className="px-6 py-2"
        >
          Previous
        </CustomButton>

        <CustomButton onClick={onSetTarget} className="">
          {isLoading ? "Setting Target..." : "Set Target"}
        </CustomButton>
      </div>
    </div>
  );
}
