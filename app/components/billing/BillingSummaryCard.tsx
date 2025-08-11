"use client";

import Image from "next/image";
import React from "react";

interface BillingSummaryCardProps {
  label: string;
  value: string | number;
  iconSrc: string;
  iconBgColor: string;
}

export default function BillingSummaryCard({
  label,
  value,
  iconSrc,
  iconBgColor,
}: BillingSummaryCardProps) {
  return (
    <div className="flex items-center justify-between bg-white rounded-xl shadow-sm px-5 py-4 h-[120px] ">
      <div>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
      <div
        className={`w-10 h-10 flex items-center justify-center rounded-lg ${iconBgColor}`}
      >
        <Image src={iconSrc} alt={label} width={20} height={20} />
      </div>
    </div>
  );
}
