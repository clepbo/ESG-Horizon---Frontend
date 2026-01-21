"use client";

import React from "react";
import { Users } from "lucide-react";
import { TiGroup } from "react-icons/ti";

export default function SocialStepTwo() {
  return (
    <div
      className="w-full rounded-2xl p-5 sm:p-6 md:p-7 shadow-sm"
      style={{ backgroundColor: "#EBEFFF" }}
    >
      {/* Icon and Title */}
      <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
        <div
          className="flex shrink-0 items-center justify-center w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl"
          style={{ backgroundColor: "#FFF" }}
        >
          <TiGroup
            className="w-5 h-5 sm:w-6 sm:h-6"
            style={{ color: "#2962FF" }}
            //   strokeWidth={2}
            aria-hidden
          />
        </div>
        <h2 className="text-lg sm:text-xl font-semibold leading-tight" style={{ color: "#2962FF" }}>
          Social Capital
        </h2>
      </div>

      {/* Description */}
      <p
        className="text-sm sm:text-base font-normal leading-relaxed mb-4 sm:mb-5"
        style={{ color: "#4A6080" }}
      >
        We maintain a formal third-party grievance mechanism accessible to all host communities. Our
        due diligence process involves regular human rights impact assessments and continuous
        dialogue with community leaders.
      </p>

      {/* Status tag */}
      <span
        className="inline-block px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium"
        style={{
          backgroundColor: "#E6FFEB",
          color: "#34A853",
        }}
      >
        ISO 14001 Aligned
      </span>
    </div>
  );
}
