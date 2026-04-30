"use client";

import { CustomButton } from "@/app/components/ui/reusables/CustomButton";
import { Plus, FileWarning } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type TargetFormType = "general" | "scope";

interface InitialTargetPageProps {
  /** Whether the company has at least one approved assessment available as a baseline. */
  hasApprovedAssessment?: boolean;
  onSetTarget?: (type: TargetFormType) => void;
}

export default function InitialTargetPage({
  hasApprovedAssessment = false,
  onSetTarget,
}: InitialTargetPageProps) {
  const [popupOpen, setPopupOpen] = useState(false);

  // Pre-flight: targets require at least one approved assessment as baseline.
  if (!hasApprovedAssessment) {
    return (
      <div className="w-full rounded-lg shadow-md gap-4 flex flex-col items-center justify-center bg-white p-8 min-h-[280px]">
        <div className="rounded-full bg-amber-50 p-3">
          <FileWarning className="h-7 w-7 text-amber-600" />
        </div>
        <h5 className="text-xl font-semibold text-gray-900">Approved Assessment Required</h5>
        <p className="text-sm max-w-md text-center text-gray-500">
          Before setting a reduction target, you need at least one approved assessment to use as your
          baseline. Submit an assessment for review and once it is approved you can set targets here.
        </p>
        <Link
          href="/assessments/new-assessment"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 transition-colors"
        >
          Go to Assessments
        </Link>
      </div>
    );
  }

  const handleSelect = (type: TargetFormType) => {
    setPopupOpen(false);
    onSetTarget?.(type);
  };

  return (
    <div className="w-full rounded-lg shadow-md gap-4 flex flex-col items-center justify-center bg-white p-8 min-h-[280px]">
      <h5 className="text-xl font-semibold text-gray-900">Set a New Reduction Target</h5>
      <p className="text-sm max-w-md text-center text-gray-500">
        Define your company&apos;s emission reduction goal. Specify the target percentage or amount,
        set the baseline year, and choose the deadline to track progress over time.
      </p>

      <div className="relative">
        <CustomButton onClick={() => setPopupOpen((o) => !o)}>Set Target</CustomButton>

        {popupOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setPopupOpen(false)} />
            <div className="absolute left-1/2 top-full z-20 mt-2 w-56 -translate-x-1/2 rounded-md border border-gray-100 bg-white shadow-lg">
              <div className="py-1">
                <button
                  type="button"
                  onClick={() => handleSelect("general")}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Plus className="h-3.5 w-3.5 text-teal-600" />
                  Add General Target
                </button>
                <button
                  type="button"
                  onClick={() => handleSelect("scope")}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Plus className="h-3.5 w-3.5 text-purple-600" />
                  Add Scope Target
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
