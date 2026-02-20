import { CustomButton } from "@/app/components/ui/reusables/CustomButton";
import React from "react";

interface InitialTargetPageProps {
  onSetTarget?: () => void;
}

export default function InitialTargetPage({ onSetTarget }: InitialTargetPageProps) {
  return (
    <div className="w-full rounded-lg shadow-md gap-4 flex flex-col items-center justify-center bg-white p-8 min-h-[280px]">
      <h5 className="text-xl font-semibold text-gray-900">Set a New Reduction Target</h5>
      <p className="text-sm max-w-md text-center text-gray-500">
        Define your company's emission reduction goal. Specify the target percentage or amount, set
        the baseline year, and choose the deadline to track progress over time.
      </p>
      <CustomButton onClick={onSetTarget}>Set Target</CustomButton>
    </div>
  );
}
