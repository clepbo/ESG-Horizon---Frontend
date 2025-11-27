"use client";

import { useRouter } from "next/navigation";
import React from "react";

export default function ReportEmptyState() {
  const router = useRouter();
  return (
    <div className="container mx-auto my-32 px-4 h-full flex items-center justify-center">
      <div className="text-center">
        {/* Your content here */}
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          You have&apos;nt generated any report yet!
        </h2>
        <div className="flex flex-col items-center  justify-center mx-auto">
          <p className="text-gray-600 mb-6  mx-auto max-w-md">
            Once you complete an assessment, you can generate your first ESG report to track
            performance and share insights with stakeholders.
          </p>
        </div>
        <div className="flex w-full gap-4 items-center justify-center">
          <button
            className="border-primary border cursor-pointer text-primary px-6 py-3 rounded-lg hover:bg-primary/40 transition-colors"
            onClick={() => router.push("/assessments/new-assessment/")}
          >
            Generate Report
          </button>
          <button
            className="bg-primary cursor-pointer text-white px-6 py-3 rounded-lg hover:bg-primary/40 transition-colors"
            onClick={() => router.push("/assessments/hub/")}
          >
            Start an Assessment
          </button>
        </div>
      </div>
    </div>
  );
}
