import { Card, CardContent, CardHeader } from "@/app/components/ui/card";
import { CustomButton } from "@/app/components/ui/reusables/CustomButton";
import { FaCaretLeft } from "react-icons/fa";

interface ScopeData {
  scope: string;
  timeline: number;
  targetReduction: number;
  annualRate: number;
}

interface ScopeSummaryProps {
  scopes: ScopeData[];
  targetYear?: number;
  baselinePeriodLabel?: string;
  onPrevious: () => void;
  onSetTarget: () => void;
  isLoading?: boolean;
}

export function ScopeSummary({
  scopes,
  targetYear = 2030,
  baselinePeriodLabel,
  onPrevious,
  onSetTarget,
  isLoading = false,
}: ScopeSummaryProps) {
  return (
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
              Baseline period: <span className="font-semibold">{baselinePeriodLabel}</span>
            </p>
          )}
          {scopes.map((scope, index) => (
            <div key={index} className="space-y-4">
              <h6 className="font-semibold text-gray-900 text-left">{scope.scope}</h6>
              <div className="flex flex-col divide-y divide-gray-100 w-full">
                <div className="py-3 flex items-baseline justify-between gap-4 w-full">
                  <div className="text-sm md:text-base font-medium text-gray-600">Timeline</div>
                  <div className="text-sm md:text-base font-semibold text-gray-900">
                    {scope.timeline} {scope.timeline === 1 ? "year" : "years"}
                  </div>
                </div>
                <div className="py-3 flex items-baseline justify-between gap-4 w-full">
                  <div className="text-sm md:text-base font-medium text-gray-600">
                    Target ({targetYear})
                  </div>
                  <div className="text-sm md:text-base font-semibold text-green-500 text-right">
                    {scope.targetReduction.toLocaleString()} tCO₂e
                  </div>
                </div>
                <div className="py-3 flex items-baseline justify-between gap-4 w-full">
                  <div className="text-sm md:text-base font-medium text-gray-600">Annual Rate</div>
                  <div className="text-sm md:text-base font-semibold text-red-500 text-right">
                    {scope.annualRate.toLocaleString()} tCO₂e/year
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <CustomButton
          icon={<FaCaretLeft className="mr-2" />}
          variant="outlined"
          onClick={onPrevious}
          className="px-6 py-2"
        >
          Previous
        </CustomButton>

        <CustomButton onClick={onSetTarget} className="px-6 py-2">
          {isLoading ? "Loading..." : " Set Target"}
        </CustomButton>
      </div>
    </div>
  );
}

// Usage with array structure:
// const scopesData = [
//   { scope: "Scope 1", timeline: 6, targetReduction: 5366, annualRate: 894 },
//   { scope: "Scope 2", timeline: 6, targetReduction: 5366, annualRate: 894 },
//   { scope: "Scope 3", timeline: 6, targetReduction: 5366, annualRate: 894 },
// ];
