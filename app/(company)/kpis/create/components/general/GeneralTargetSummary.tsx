"use client";

import { Card, CardContent, CardHeader } from "@/app/components/ui/card";
import { CustomButton } from "@/app/components/ui/reusables/CustomButton";
import { Info, TrendingDown, TrendingUp } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/components/ui/tooltip";
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
  isEdit?: boolean;
  annualRate: number;
  baselinePeriodLabel?: string;
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
  isEdit = false,
  baselinePeriodLabel,
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

  // Semantic coloring: green = emission reduction (on track), red = emission increase (off track)
  const isReducing = totalReduction > 0;
  const TrendIcon = isReducing ? TrendingDown : TrendingUp;

  return (
    <TooltipProvider>
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
              <TrendIcon className={`justify-self-auto mx-auto ${isReducing ? "text-green-600" : "text-red-600"} font-semibold`} />
              <h6 className="text-2xl md:text-3xl font-semibold text-gray-900">
                {reductionPercentage}% Reduction Target
              </h6>
              {baselinePeriodLabel && (
                <p className="text-xs text-gray-500">
                  Baseline period: <span className="font-semibold">{baselinePeriodLabel}</span>
                </p>
              )}
              <div className="text-sm md:text-base text-gray-600 leading-relaxed max-w-md mx-auto space-y-1.5">
                {/* From (Baseline) */}
                <div className="flex items-center justify-between gap-6">
                  <span className="font-medium text-gray-700 inline-flex items-center gap-1">
                    From
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs bg-gray-800 text-white p-3 rounded-lg shadow-xl border-none">
                        <p>Your total emissions from the baseline assessment period.</p>
                      </TooltipContent>
                    </Tooltip>
                  </span>
                  <span className="font-semibold text-gray-900 text-right">
                    {baselineEmission?.toLocaleString()} tCO₂e
                  </span>
                </div>
                {/* To (Target Emission) */}
                <div className="flex items-center justify-between gap-6">
                  <span className="font-medium text-gray-700 inline-flex items-center gap-1">
                    To
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs bg-gray-800 text-white p-3 rounded-lg shadow-xl border-none font-mono text-xs">
                        <p className="font-sans font-medium mb-1">Target Emission</p>
                        <p>= Baseline x (1 - Reduction% / 100)</p>
                        <p>= {baselineEmission?.toLocaleString()} x (1 - {reductionPercentage} / 100)</p>
                        <p className="font-semibold">= {targetEmission?.toLocaleString()} tCO₂e</p>
                      </TooltipContent>
                    </Tooltip>
                  </span>
                  <span className={`font-semibold text-right ${isReducing ? "text-green-600" : "text-red-600"}`}>
                    {targetEmission?.toLocaleString()} tCO₂e
                  </span>
                </div>
                <div className="flex items-center justify-between gap-6">
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
                <div className="py-3 flex items-center justify-between gap-4 w-full">
                  <div className="text-sm md:text-base font-medium text-gray-600 inline-flex items-center gap-1">
                    Timeline
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs bg-gray-800 text-white p-3 rounded-lg shadow-xl border-none font-mono text-xs">
                        <p className="font-sans font-medium mb-1">Timeline</p>
                        <p>= |Target Year - Baseline Year|</p>
                        <p>= |{targetYear} - {baselineYear}|</p>
                        <p className="font-semibold">= {yearsDifference} {yearsDifference === 1 ? "year" : "years"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="text-sm md:text-base font-semibold text-gray-900">
                    {yearsDifference} {yearsDifference === 1 ? "year" : "years"}
                  </div>
                </div>

                {/* Total Reduction */}
                <div className="py-3 flex items-center justify-between gap-4 w-full">
                  <div className="text-sm md:text-base font-medium text-gray-600 inline-flex items-center gap-1">
                    Total Reduction
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs bg-gray-800 text-white p-3 rounded-lg shadow-xl border-none font-mono text-xs">
                        <p className="font-sans font-medium mb-1">Total Reduction</p>
                        <p>= Baseline - Target Emission</p>
                        <p>= {baselineEmission?.toLocaleString()} - {targetEmission?.toLocaleString()}</p>
                        <p className="font-semibold">= {totalReduction?.toLocaleString()} tCO₂e</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="text-sm md:text-base font-semibold text-right text-red-600">
                    -{totalReduction?.toLocaleString()} tCO₂e
                  </div>
                </div>

                {/* Annual Rate */}
                <div className="py-3 flex items-center justify-between gap-4 w-full">
                  <div className="text-sm md:text-base font-medium text-gray-600 inline-flex items-center gap-1">
                    Annual Rate
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs bg-gray-800 text-white p-3 rounded-lg shadow-xl border-none font-mono text-xs">
                        <p className="font-sans font-medium mb-1">Annual Rate</p>
                        <p>= Total Reduction / Timeline</p>
                        <p>= {totalReduction?.toLocaleString()} / {yearsDifference}</p>
                        <p className="font-semibold">= {formattedAnnualRate} tCO₂e/year</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="text-sm md:text-base font-semibold text-right text-red-600">
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
            {isLoading
              ? isEdit ? "Updating Target..." : "Setting Target..."
              : isEdit ? "Update Target" : "Set Target"}
          </CustomButton>
        </div>
      </div>
    </TooltipProvider>
  );
}
