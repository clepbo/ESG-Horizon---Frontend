import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { CustomButton } from "@/app/components/ui/reusables/CustomButton";
import { TrendingDown } from "lucide-react";
import { FaCaretLeft } from "react-icons/fa";

interface TargetSummaryProps {
  reductionPercentage: number;
  baselineEmission: number;
  targetEmission: number;
  targetYear: number;
  baselineYear: number;
  onPrevious: () => void;
  onSetTarget: () => void;
}

export function GeneralTargetSummary({
  reductionPercentage = 20,
  baselineEmission = 26830,
  targetEmission = 21464,
  targetYear = 2030,
  baselineYear = 2024,
  onPrevious,
  onSetTarget
}: TargetSummaryProps) {
  const totalReduction = baselineEmission - targetEmission;
  const yearsDifference = targetYear - baselineYear;
  const annualRate = totalReduction / yearsDifference;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Target Summary Card */}
      <Card>
        <CardHeader>
          
          <CardTitle className="text-lg font-semibold">
           
            Target Summary
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Reduction Target */}
          <div className="text-center space-y-2">
            <TrendingDown className={`justify-self-auto mx-auto text-green-600 font-semibold`} />
            <h6 className="text-2xl font-semibold text-gray-900">
               
              {reductionPercentage}% Reduction Target
            </h6>
            <p className="text-gray-600">
              From {baselineEmission.toLocaleString()} to {targetEmission.toLocaleString()} tCO₂e by {targetYear}
            </p>
          </div>

          {/* Target Details */}
          <div className="space-y-4 mx-2 lg:mx-14">
            <h6 className="font-semibold text-gray-900">Target Details</h6>

            
            <div className="flex flex-col gap-4 w-full">
              {/* Timeline */}
              <div className="space-y-2 flex items-center justify-between w-full">
                <div className="text-sm font-medium text-gray-600">Timeline:</div>
                <div className="text-sm font-semibold text-gray-900">
                  {yearsDifference} years
                </div>
              </div>
              <div className="space-y-2 flex items-center justify-between w-full">
                <div className="text-sm font-medium text-gray-600"> Target ({targetYear}):</div>
                <div className="text-sm font-semibold text-red-600">
                  {totalReduction.toLocaleString()} tCO₂e
                </div>
              </div>
              <div className="space-y-2 flex items-center justify-between w-full">
                <div className="text-sm font-medium text-gray-600"> Annual Rate: </div>
                <div className={`text-sm font-semibold text-green-600`}>
                 {Math.round(annualRate).toLocaleString()} tCO₂e/year
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
        
        <CustomButton 
          onClick={onSetTarget}
          className=""
        >
          Set Target
        </CustomButton>
      </div>
    </div>
  );
}