import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { CustomButton } from "@/app/components/ui/reusables/CustomButton";
import { FaCaretLeft } from "react-icons/fa";

interface ScopeData {
  scope: string;
  timeline: number;
  targetReduction: number;
  annualRate: number;
  targetYear: number;
}

interface ScopeSummaryProps {
  scopes: ScopeData[];
  onPrevious: () => void;
  onSetTarget: () => void;
  isLoading?: boolean;
}

export function ScopeSummary({
  scopes,
  onPrevious,
  onSetTarget,
  isLoading = false,
}: ScopeSummaryProps) {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-left">Target Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {scopes.map((scope, index) => (
            <div key={index} className="space-y-4">
              <h6 className="font-semibold text-gray-900 text-left">{scope.scope}:</h6>
              <div className="flex flex-col gap-3 w-full">
                <div className="flex items-center justify-between w-full">
                  <div className="text-sm font-medium text-gray-600">Timeline:</div>
                  <div className="text-sm font-semibold text-gray-900">{scope.timeline} years</div>
                </div>
                <div className="flex items-center justify-between w-full">
                  <div className="text-sm font-medium text-gray-600">
                    Target ({scope.targetYear}):
                  </div>
                  <div className="text-sm font-semibold text-green-500">
                    {scope.targetReduction.toLocaleString()} tCO₂e
                  </div>
                </div>
                <div className="flex items-center justify-between w-full">
                  <div className="text-sm font-medium text-gray-600">Annual Rate:</div>
                  <div className="text-sm font-semibold text-red-500">
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
