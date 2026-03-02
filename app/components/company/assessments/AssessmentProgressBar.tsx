"use client";

import React from "react";

interface AssessmentProgressBarProps {
  stepIndex: number; // current step (1-based, e.g., Section 1 of N)
  totalSteps: number; // total number of steps
  isSubmitted?: boolean;
  fieldsCompleted?: number; // fields completed in the current step
  totalFields?: number; // total fields in the current step
}

export function AssessmentProgressBar({
  stepIndex,
  totalSteps,
  fieldsCompleted,
  totalFields,
  isSubmitted,
}: AssessmentProgressBarProps) {
  // Combine step position + field completion for accurate progress.
  const completedSteps = stepIndex - 1;
  const currentStepFraction =
    fieldsCompleted != null && totalFields != null && totalFields > 0
      ? fieldsCompleted / totalFields
      : 0;
  const rawPercent =
    totalSteps > 0
      ? ((completedSteps + currentStepFraction) / totalSteps) * 100
      : 0;
  const percent = isSubmitted ? 100 : Math.round(rawPercent);

  return (
    <div className="mb-6">
      {" "}
      <div className="flex justify-between items-center mb-2">
        {" "}
        <span className="text-sm font-medium text-gray-500">
          Section {stepIndex} of {totalSteps}{" "}
        </span>{" "}
        <span className="text-sm font-medium text-gray-500">{percent}% complete </span>{" "}
      </div>{" "}
      <div className="w-full h-3 bg-green-300 rounded-lg">
        {" "}
        <div
          className="h-3 bg-green-800 rounded transition-all duration-300"
          style={{ width: `${percent}%` }}
        />{" "}
      </div>{" "}
    </div>
  );
}
