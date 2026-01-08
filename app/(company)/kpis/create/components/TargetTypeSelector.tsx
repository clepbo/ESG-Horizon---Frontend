"use client";
import { Checkbox } from "@/app/components/ui/checkbox";
import { TargetType } from "@/types/target";

interface TargetTypeSelectorProps {
  selectedType: TargetType;
  onTypeChange: (type: TargetType) => void;
}

export function TargetTypeSelector({ selectedType, onTypeChange }: TargetTypeSelectorProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Select type of target;</h2>

      <div className="flex flex-col gap-6 items-start">
        <div
          className={`cursor-pointer transition-all  ${selectedType === "general" ? "" : ""}`}
          onClick={() => onTypeChange("general")}
        >
          <div className="flex items-center space-x-3">
            <Checkbox
              checked={selectedType === "general"}
              onCheckedChange={() => onTypeChange("general")}
              className="text-white rounded-full"
            />
            <div>
              <h6 className="font-medium text-gray-900">Set general target</h6>
              <p className="text-sm text-gray-600 mt-1">
                Set an overall emissions reduction goal for your company.
              </p>
            </div>
          </div>
        </div>
        <div
          className={`cursor-pointer transition-all  ${selectedType === "general" ? "" : ""}`}
          onClick={() => onTypeChange("scope")}
        >
          <div className="flex items-center space-x-3">
            <Checkbox
              checked={selectedType === "scope"}
              onCheckedChange={() => onTypeChange("general")}
              className="text-white rounded-full"
            />
            <div>
              <h6 className="font-medium text-gray-900">Set target by scope</h6>
              <p className="text-sm text-gray-600 mt-1">
                Set specific reduction goals for each emission scope.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
