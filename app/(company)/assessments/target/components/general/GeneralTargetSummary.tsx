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
import { formatWithCommas } from "@/app/(company)/components/ranking/FormatNumberFigures";

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

  // Semantic coloring: green = emission reduction (on track), red = emission increase (off track)
  const isReducing = totalReduction > 0;
  const TrendIcon = isReducing ? TrendingDown : TrendingUp;

  return (
    <TooltipProvider>
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Target Summary Card */}
        <Card className="shadow-md">
          <CardHeader>
            <div className="text-lg font-semibold">Target Summary</div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Main Reduction Target */}
            <div className="text-center space-y-2">
              <TrendIcon
                className={`justify-self-auto mx-auto ${isReducing ? "text-green-600" : "text-red-600"} font-semibold`}
              />
              <h6 className="text-2xl font-semibold text-gray-900">
                {formatWithCommas(reductionPercentage)}% Reduction Target
              </h6>
              <div className="text-sm text-gray-600 leading-relaxed max-w-md mx-auto space-y-1.5">
                {/* From (Baseline) */}
                <div className="flex items-center justify-between gap-6">
                  <span className="font-medium text-gray-700 inline-flex items-center gap-1">
                    From
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        className="max-w-xs bg-primary text-white p-3 rounded-lg shadow-xl border-none"
                      >
                        <p>Your total emissions from the baseline assessment period.</p>
                      </TooltipContent>
                    </Tooltip>
                  </span>
                  <span className="font-semibold text-gray-900 text-right">
                    {formatWithCommas(baselineEmission)} tCO₂e
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
                      <TooltipContent
                        side="top"
                        className="max-w-xs bg-primary text-white p-3 rounded-lg shadow-xl border-none font-mono text-xs"
                      >
                        <p className="font-sans font-medium mb-1">Target Emission</p>
                        <p>= Baseline x (1 - Reduction% / 100)</p>
                        <p>
                          = {formatWithCommas(baselineEmission)} x (1 -{" "}
                          {formatWithCommas(reductionPercentage)} / 100)
                        </p>
                        <p className="font-semibold">= {formatWithCommas(targetEmission)} tCO₂e</p>
                      </TooltipContent>
                    </Tooltip>
                  </span>
                  <span
                    className={`font-semibold text-right ${isReducing ? "text-green-600" : "text-red-600"}`}
                  >
                    {formatWithCommas(targetEmission)} tCO₂e
                  </span>
                </div>
                <div className="flex items-center justify-between gap-6">
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
                  <div className="text-sm font-medium text-gray-600 inline-flex items-center gap-1">
                    Timeline:
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        className="max-w-xs bg-primary text-white p-3 rounded-lg shadow-xl border-none font-mono text-xs"
                      >
                        <p className="font-sans font-medium mb-1">Timeline</p>
                        <p>= |Target Year - Baseline Year|</p>
                        <p>
                          = |{targetYear} - {baselineYear}|
                        </p>
                        <p className="font-semibold">
                          = {yearsDifference} {yearsDifference === 1 ? "year" : "years"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">{yearsDifference} years</div>
                </div>

                {/* Total Reduction */}
                <div className="space-y-2 flex items-center justify-between w-full">
                  <div className="text-sm font-medium text-gray-600 inline-flex items-center gap-1">
                    Total Reduction:
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        className="max-w-xs bg-primary text-white p-3 rounded-lg shadow-xl border-none font-mono text-xs"
                      >
                        <p className="font-sans font-medium mb-1">Total Reduction</p>
                        <p>= Baseline - Target Emission</p>
                        <p>
                          = {formatWithCommas(baselineEmission)} -{" "}
                          {formatWithCommas(targetEmission)}
                        </p>
                        <p className="font-semibold">= {formatWithCommas(totalReduction)} tCO₂e</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="text-sm font-semibold text-red-600">
                    -{formatWithCommas(totalReduction)} tCO₂e
                  </div>
                </div>

                {/* Annual Rate */}
                <div className="space-y-2 flex items-center justify-between w-full">
                  <div className="text-sm font-medium text-gray-600 inline-flex items-center gap-1">
                    Annual Rate:
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        className="max-w-xs bg-primary text-white p-3 rounded-lg shadow-xl border-none font-mono text-xs"
                      >
                        <p className="font-sans font-medium mb-1">Annual Rate</p>
                        <p>= Total Reduction / Timeline</p>
                        <p>
                          = {formatWithCommas(totalReduction)} / {yearsDifference}
                        </p>
                        <p className="font-semibold">= {formatWithCommas(annualRate)} tCO₂e/year</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="text-sm font-semibold text-red-600">
                    {formatWithCommas(annualRate)} tCO₂e/year
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
    </TooltipProvider>
  );
}
