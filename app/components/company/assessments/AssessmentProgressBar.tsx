"use client";

import React, { useContext } from "react";
import { AssessmentContext } from "@/hooks/useAssessment";

interface AssessmentProgressBarProps {
  stepIndex: number; // current step (1-based, e.g., Section 1 of N)
  totalSteps: number; // total number of steps
  isSubmitted?: boolean;
  groupKey?: string; // canonical group path — checked against submittedGroups
  fieldsCompleted?: number; // fields completed in the current step
  totalFields?: number; // total fields in the current step
}

export function AssessmentProgressBar({
  stepIndex,
  totalSteps,
  fieldsCompleted,
  totalFields,
  isSubmitted,
  groupKey,
}: AssessmentProgressBarProps) {
  const ctx = useContext(AssessmentContext);
  const submittedGroups: string[] = (ctx?.state?.assessmentData as any)?.submittedGroups || [];
  const groupSubmitted = groupKey ? submittedGroups.includes(groupKey) : false;

  // Progress = purely how many required fields are filled (0–99%), 100% only after submission.
  const rawPercent =
    fieldsCompleted != null && totalFields != null && totalFields > 0
      ? (fieldsCompleted / totalFields) * 100
      : 0;
  const percent = isSubmitted || groupSubmitted ? 100 : Math.min(Math.round(rawPercent), 99);

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
