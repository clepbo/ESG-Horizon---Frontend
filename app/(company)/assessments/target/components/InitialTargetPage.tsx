import { CustomButton } from "@/app/components/ui/reusables/CustomButton";
import React from "react";

export default function InitialTargetPage() {
  return (
    <div className="w-full rounded-lg shadow-md gap-4 flex flex-col items-center justify-center bg-white p-4">
      <h5 className=""> Set a New Reduction Target</h5>
      <p className="text-sm max-w-md text-center">
        Define your company’s emission reduction goal. Specify the target percentage or amount, set
        the baseline year, and choose the deadline to track progress over time.
      </p>
      <CustomButton> Set Target</CustomButton>
    </div>
  );
}
