import { formatWithCommas } from "@/app/(company)/components/ranking/FormatNumberFigures";
import { Card, CardContent, CardHeader } from "@/app/components/ui/card";
import { CustomButton } from "@/app/components/ui/reusables/CustomButton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/components/ui/tooltip";
import { Info, TrendingDown, TrendingUp } from "lucide-react";
import { FaCaretLeft } from "react-icons/fa";

interface ScopeData {
  scope: string;
  timeline: number;
  targetReduction: number;
  annualRate: number;
  reductionPercentage: number;
  baselineYear: number;
  targetYear: number;
  description: string;
  targetEmission: number;
  totalReduction: number;
  baselineEmission: number;
}

interface ScopeSummaryProps {
  scopes: ScopeData[];
  targetYear?: number;
  baselinePeriodLabel?: string;
  onPrevious: () => void;
  onSetTarget: () => void;
  isLoading?: boolean;
  isEdit?: boolean;
}

function ScopeSectionSummary({ scope }: { scope: ScopeData }) {
  const isReducing = scope.totalReduction > 0;
  const TrendIcon = isReducing ? TrendingDown : TrendingUp;

  return (
    <div className="space-y-4">
      {/* Scope label */}
      <h6 className="text-sm font-semibold tracking-wide text-gray-500 uppercase">
        {scope.scope}
      </h6>

      {/* Headline */}
      <div className="text-center space-y-3">
        <TrendIcon
          className={`mx-auto h-6 w-6 ${isReducing ? "text-green-600" : "text-red-600"}`}
        />
        <p className="text-2xl font-semibold text-gray-900">
          {formatWithCommas(scope.reductionPercentage)}% Reduction Target
        </p>

        {/* From / To / By */}
        <div className="text-sm text-gray-600 max-w-sm mx-auto space-y-1.5">
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
                  <p>
                    {scope.scope} baseline emissions from the selected assessment period.
                  </p>
                </TooltipContent>
              </Tooltip>
            </span>
            <span className="font-semibold text-gray-900 text-right">
              {formatWithCommas(scope.baselineEmission)} tCO₂e
            </span>
          </div>

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
                  <p>= Baseline × (1 − Reduction% ÷ 100)</p>
                  <p>
                    = {formatWithCommas(scope.baselineEmission)} × (1 −{" "}
                    {formatWithCommas(scope.reductionPercentage)} ÷ 100)
                  </p>
                  <p className="font-semibold">
                    = {formatWithCommas(scope.targetEmission)} tCO₂e
                  </p>
                </TooltipContent>
              </Tooltip>
            </span>
            <span
              className={`font-semibold text-right ${isReducing ? "text-green-600" : "text-red-600"}`}
            >
              {formatWithCommas(scope.targetEmission)} tCO₂e
            </span>
          </div>

          <div className="flex items-center justify-between gap-6">
            <span className="font-medium text-gray-700">By</span>
            <span className="font-semibold text-gray-900 text-right">{scope.targetYear}</span>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="flex flex-col divide-y divide-gray-100 w-full mx-1 sm:mx-4">
        {/* Timeline */}
        <div className="py-3 flex items-center justify-between gap-4">
          <span className="text-sm font-medium text-gray-600 inline-flex items-center gap-1">
            Timeline
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="max-w-xs bg-primary text-white p-3 rounded-lg shadow-xl border-none font-mono text-xs"
              >
                <p className="font-sans font-medium mb-1">Timeline</p>
                <p>= |Target Year − Baseline Year|</p>
                <p>
                  = |{scope.targetYear} − {scope.baselineYear}|
                </p>
                <p className="font-semibold">
                  = {scope.timeline} {scope.timeline === 1 ? "year" : "years"}
                </p>
              </TooltipContent>
            </Tooltip>
          </span>
          <span className="text-sm font-semibold text-gray-900">
            {scope.timeline} {scope.timeline === 1 ? "year" : "years"}
          </span>
        </div>

        {/* Total Reduction */}
        <div className="py-3 flex items-center justify-between gap-4">
          <span className="text-sm font-medium text-gray-600 inline-flex items-center gap-1">
            Total Reduction
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="max-w-xs bg-primary text-white p-3 rounded-lg shadow-xl border-none font-mono text-xs"
              >
                <p className="font-sans font-medium mb-1">Total Reduction</p>
                <p>= Baseline − Target Emission</p>
                <p>
                  = {formatWithCommas(scope.baselineEmission)} −{" "}
                  {formatWithCommas(scope.targetEmission)}
                </p>
                <p className="font-semibold">
                  = {formatWithCommas(scope.totalReduction)} tCO₂e
                </p>
              </TooltipContent>
            </Tooltip>
          </span>
          <span className="text-sm font-semibold text-red-600">
            -{formatWithCommas(scope.totalReduction)} tCO₂e
          </span>
        </div>

        {/* Annual Rate */}
        <div className="py-3 flex items-center justify-between gap-4">
          <span className="text-sm font-medium text-gray-600 inline-flex items-center gap-1">
            Annual Rate
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="max-w-xs bg-primary text-white p-3 rounded-lg shadow-xl border-none font-mono text-xs"
              >
                <p className="font-sans font-medium mb-1">Annual Rate</p>
                <p>= Total Reduction ÷ Timeline</p>
                <p>
                  = {formatWithCommas(scope.totalReduction)} ÷ {scope.timeline}
                </p>
                <p className="font-semibold">
                  = {formatWithCommas(scope.annualRate)} tCO₂e/year
                </p>
              </TooltipContent>
            </Tooltip>
          </span>
          <span className="text-sm font-semibold text-red-600">
            {formatWithCommas(scope.annualRate)} tCO₂e/year
          </span>
        </div>
      </div>
    </div>
  );
}

export function ScopeSummary({
  scopes,
  baselinePeriodLabel,
  onPrevious,
  onSetTarget,
  isLoading = false,
  isEdit = false,
}: ScopeSummaryProps) {
  return (
    <TooltipProvider>
      <div className="space-y-6 max-w-3xl mx-auto px-4">
        <Card className="shadow-md border border-gray-100">
          <CardHeader className="pb-2 border-b border-gray-100">
            <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Target Summary
            </p>
          </CardHeader>
          <CardContent className="space-y-8 pt-6">
            {baselinePeriodLabel && (
              <p className="text-xs text-gray-500">
                Baseline period:{" "}
                <span className="font-semibold">{baselinePeriodLabel}</span>
              </p>
            )}

            {scopes.map((scope, index) => (
              <div key={scope.scope}>
                <ScopeSectionSummary scope={scope} />
                {index < scopes.length - 1 && (
                  <hr className="mt-6 border-gray-200" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-between mb-8">
          <CustomButton
            icon={<FaCaretLeft className="mr-2" />}
            variant="outlined"
            onClick={onPrevious}
            className="px-6 py-2"
          >
            Previous
          </CustomButton>

          <CustomButton onClick={onSetTarget}>
            {isLoading
              ? isEdit
                ? "Updating Target..."
                : "Setting Target..."
              : isEdit
                ? "Update Target"
                : "Set Target"}
          </CustomButton>
        </div>
      </div>
    </TooltipProvider>
  );
}
