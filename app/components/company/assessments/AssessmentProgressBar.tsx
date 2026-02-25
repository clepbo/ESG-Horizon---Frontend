"use client";

import React from "react";

interface AssessmentProgressBarProps {
  stepIndex: number; // current step (1-based, e.g., Section 1 of N)
  totalSteps: number; // total number of steps
  isSubmitted?: boolean;
  fieldsCompleted: number; // new prop: number of fields completed in the current step
  totalFields: number; // new prop: total number of fields in the current step
}

export function AssessmentProgressBar({
  stepIndex,
  totalSteps,
  fieldsCompleted,
  totalFields,
  isSubmitted,
}: AssessmentProgressBarProps) {
  // Show current section completion — "Section X of Y" already communicates position.
  // Cap at 99% until submitted; 100% only after submit.
  const rawPercent = totalFields > 0 ? (fieldsCompleted / totalFields) * 100 : 0;
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
