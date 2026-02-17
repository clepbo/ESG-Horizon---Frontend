"use client";

import { Card, CardContent, CardHeader } from "@/app/components/ui/card";
import { CustomButton } from "@/app/components/ui/reusables/CustomButton";
import { TrendingDown } from "lucide-react";
import { FaCaretLeft } from "react-icons/fa";
import { calculateTimelineYear } from "../../utils";

interface TargetSummaryProps {
  reductionPercentage: number;
  baselineEmission: number;
  targetEmission: number;
  targetYear: number;
  baselineYear: number;
  onPrevious: () => void;
  onSetTarget: () => void;
  isLoading?: boolean;
  annualRate: number;
}

export function GeneralTargetSummary({
  reductionPercentage = 0,
  baselineEmission = 0,
  targetEmission = 0,
  targetYear = 0,
  baselineYear = 0,
  onPrevious,
  annualRate,
  onSetTarget,
  isLoading = false,
}: TargetSummaryProps) {
  // Fix: Calculate total reduction correctly
  const totalReduction = baselineEmission - targetEmission;
  const yearsDifferenceRaw = calculateTimelineYear(baselineYear, targetYear);
  const yearsDifference =
    typeof yearsDifferenceRaw === "number"
      ? yearsDifferenceRaw
      : Number.parseInt(String(yearsDifferenceRaw), 10) || 0;

  const formattedAnnualRate = Number.isFinite(annualRate)
    ? annualRate.toLocaleString(undefined, {
        maximumFractionDigits: 2,
      })
    : annualRate;

  return (
    <div className="space-y-6 max-w-3xl mx-auto px-4">
      {/* Target Summary Card */}
      <Card className="shadow-md border border-gray-100">
        <CardHeader className="pb-2 border-b border-gray-100">
          <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
            Target Summary
          </p>
        </CardHeader>
        <CardContent className="space-y-8 pt-6">
          {/* Main Reduction Target */}
          <div className="text-center space-y-4">
            <TrendingDown className={`justify-self-auto mx-auto text-green-600 font-semibold`} />
            <h6 className="text-2xl md:text-3xl font-semibold text-gray-900">
              {reductionPercentage}% Reduction Target
            </h6>
            <div className="text-sm md:text-base text-gray-600 leading-relaxed max-w-md mx-auto space-y-1.5">
              <div className="flex items-baseline justify-between gap-6">
                <span className="font-medium text-gray-700">From</span>
                <span className="font-semibold text-red-500 text-right">
                  {baselineEmission?.toLocaleString()} tCO₂e
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-6">
                <span className="font-medium text-gray-700">To</span>
                <span className="font-semibold text-green-500 text-right">
                  {targetEmission?.toLocaleString()} tCO₂e
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-6">
                <span className="font-medium text-gray-700">By</span>
                <span className="font-semibold text-gray-900 text-right">{targetYear}</span>
              </div>
            </div>
          </div>

          {/* Target Details */}
          <div className="space-y-4 mx-1 sm:mx-4 md:mx-10">
            <h6 className="text-base font-semibold text-gray-900">Target Details</h6>

            <div className="flex flex-col divide-y divide-gray-100 w-full">
              {/* Timeline */}
              <div className="py-3 flex items-baseline justify-between gap-4 w-full">
                <div className="text-sm md:text-base font-medium text-gray-600">Timeline</div>
                <div className="text-sm md:text-base font-semibold text-gray-900">
                  {yearsDifference} {yearsDifference === 1 ? "year" : "years"}
                </div>
              </div>

              {/* Total Reduction - FIXED */}
              <div className="py-3 flex items-baseline justify-between gap-4 w-full">
                <div className="text-sm md:text-base font-medium text-gray-600">
                  Total Reduction
                </div>
                <div className="text-sm md:text-base font-semibold text-red-600 text-right">
                  -{totalReduction?.toLocaleString()} tCO₂e
                </div>
              </div>

              {/* Annual Rate */}
              <div className="py-3 flex items-baseline justify-between gap-4 w-full">
                <div className="text-sm md:text-base font-medium text-gray-600">Annual Rate</div>
                <div className="text-sm md:text-base font-semibold text-green-600 text-right">
                  {formattedAnnualRate} tCO₂e/year
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
