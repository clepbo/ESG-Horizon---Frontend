"use client";

import { ReportResponse } from "@/types/report/reportResponse";

interface HumanStepTwoProps {
  reportData?: ReportResponse;
}

export default function HumanStepTwo({ reportData }: HumanStepTwoProps) {
  const safetyCards = reportData?.humanCapital?.safetyManagementSystems || [];

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:gap-6">
      {safetyCards.length > 0 ? (
        safetyCards.map((card, index) => (
          <SafetyCard
            key={index}
            title={card.title}
            description={card.description}
            tag={card.tag}
          />
        ))
      ) : (
        <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-600 italic">No safety management information reported.</p>
        </div>
      )}
    </div>
  );
}

function SafetyCard({
  title,
  description,
  tag,
}: {
  title: string;
  description: string;
  tag: string;
}) {
  return (
    <article className="flex flex-col rounded-xl bg-blue-50 p-4 shadow-sm sm:p-5 md:p-6 overflow-hidden">
      <h3 className="text-base font-bold text-blue-700 sm:text-lg md:text-xl">{title}</h3>
      <p className="mt-2 text-sm font-normal leading-relaxed text-blue-700 sm:mt-3 sm:text-base md:mt-4">
        {description}
      </p>
      <span
        className="mt-3 inline-flex w-fit rounded-lg px-3 py-1.5 text-sm font-medium sm:mt-4 sm:px-4 sm:py-2 sm:text-base"
        style={{ backgroundColor: "#E0F7EB", color: "#52B788" }}
      >
        {tag}
      </span>
    </article>
  );
}
