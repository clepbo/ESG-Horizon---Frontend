"use client";

import React from "react";

interface AssessmentProgressBarProps {
  stepIndex: number; // current step (1-based, e.g., Section 1 of N)
  totalSteps: number; // total number of steps
  isSubmitted: boolean;
  fieldsCompleted: number; // new prop: number of fields completed in the current step
  totalFields: number; // new prop: total number of fields in the current step
}

export function AssessmentProgressBar({
  stepIndex,
  totalSteps,
  isSubmitted,
  fieldsCompleted,
  totalFields,
}: AssessmentProgressBarProps) {
  // Calculate the overall progress based on completed steps.
  const overallProgress = (stepIndex - 1) / totalSteps; // Calculate the progress within the current step.

  const inputProgress = totalFields > 0 ? fieldsCompleted / totalFields : 0; // Combine the two concepts for a single percentage value.

  const rawPercent = (overallProgress + inputProgress / totalSteps) * 100; // Cap the percentage at 99% until the final submission.

  const cappedPercent = isSubmitted ? 100 : Math.min(rawPercent, 99);
  const percent = Math.round(cappedPercent);

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
