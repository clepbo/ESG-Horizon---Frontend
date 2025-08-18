"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Spinner from "@/app/components/ui/reusables/Spinner";

type ReportSummaryCardProps = {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  iconSrc?: string;
  iconBgColor?: string;
  change?: number;
  changeText?: string;
};

export function ReportSummaryCard({
  label,
  value,
  change,
  changeText,
  icon,
  iconSrc,
  iconBgColor = "bg-gray-100",
}: ReportSummaryCardProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const getChangeDisplay = () => {
    if (change === undefined) return null;

    const isPositive = change >= 0;
    const textColor = isPositive ? "text-green-600" : "text-red-600";
    const sign = isPositive ? "+" : "";

    return (
      <span className="text-sm text-gray-500">
        <span className={`${textColor} font-medium`}>
          {sign}
          {change}
        </span>{" "}
        {changeText}
      </span>
    );
  };

  return (
    <div className="flex h-32 w-full items-center justify-between rounded-xl border border-black/10 bg-white p-4 shadow-sm">
      {isLoading ? (
        <div className="flex w-full h-full justify-center items-center">
          <Spinner />
        </div>
      ) : (
        <>
          {/* Left Content */}
          <div className="flex flex-col justify-between h-full">
            <span className="text-sm text-gray-500">{label}</span>
            <span className="text-3xl font-bold text-gray-900">{value}</span>
            {getChangeDisplay()}
          </div>

          {/* Icon or Image */}
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-md p-2 ${iconBgColor} text-gray-700`}
          >
            {iconSrc ? (
              <Image
                src={iconSrc}
                alt={`${label} icon`}
                width={20}
                height={20}
                className="object-contain"
              />
            ) : (
              icon
            )}
          </div>
        </>
      )}
    </div>
  );
}
