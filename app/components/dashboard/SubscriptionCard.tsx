import Image from "next/image";
import { ArrowDown, ArrowUp } from "lucide-react";
import React from "react";

interface ESGCardProps {
  title: string;
  value: number | string;
  trend: "up" | "down";
  trendValue: string;
  icon?: React.ReactNode;
  iconSrc?: string;
  bgColor: string;
  textColor?: string;
}

export function ESGCard({
  title,
  value,
  trend,
  trendValue,
  icon,
  iconSrc,
  bgColor,
  textColor = "text-white",
}: ESGCardProps) {
  const isTrendUp = trend === "up";

  return (
    <div
      className={`rounded-xl overflow-hidden shadow-md ${bgColor} ${textColor} flex flex-col`}
    >
      {/* Top Content */}
      <div className="p-3 flex-1">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="text-sm font-medium">{title}</h4>
            <p className="text-3xl font-bold mt-1">
              {value}
              <span className="text-base font-normal">/100</span>
            </p>
          </div>
          <div className="p-2 bg-white/20 rounded-lg flex items-center justify-center">
            {iconSrc ? (
              <Image
                src={iconSrc}
                alt={`${title} icon`}
                width={20}
                height={20}
                className="object-contain"
                style={{ width: "auto", height: "auto" }}
              />
            ) : (
              icon
            )}
          </div>
        </div>
      </div>

      {/* Bottom Trend Section */}
      <div className="px-4 py-2 bg-white/10 flex items-center justify-between text-xs">
        <p className="font-medium">From last report</p>
        <div
          className={`flex items-center gap-1 font-medium px-2 py-1 rounded-full ${
            isTrendUp
              ? "bg-green-200 text-green-600"
              : "bg-red-100 text-red-600"
          }`}
        >
          {isTrendUp ? (
            <ArrowUp className="w-3 h-3" />
          ) : (
            <ArrowDown className="w-3 h-3" />
          )}
          <span>{trendValue}</span>
        </div>
      </div>
    </div>
  );
}

interface ESGOverallCardProps {
  score: number;
  trend: "up" | "down";
  trendValue: string;
  icon?: React.ReactNode;
  iconSrc?: string;
}

export function ESGOverallCard({
  score,
  trend,
  trendValue,
  icon,
  iconSrc,
}: ESGOverallCardProps) {
  const isTrendUp = trend === "up";

  return (
    <div className="rounded-xl overflow-hidden shadow-md bg-gradient-to-r from-gray-800 to-gray-600 text-white flex flex-col">
      <div className="p-6 flex items-start justify-between">
        <div>
          <h4 className="text-sm font-medium">Overall ESG Score</h4>
          <p className="text-4xl font-bold mt-1">
            {score}
            <span className="text-lg font-normal">/100</span>
          </p>
        </div>
        <div className="p-3 bg-white/20 rounded-lg flex items-center justify-center">
          {iconSrc ? (
            <Image
              src={iconSrc}
              alt="Overall ESG icon"
              width={28}
              height={28}
              className="object-contain"
              style={{ width: "auto", height: "auto" }}
            />
          ) : (
            icon
          )}
        </div>
      </div>
      <div className="px-6 py-3 bg-white/10 flex items-center justify-between text-xs mt-8">
        <p className="font-medium">From last report</p>
        <div
          className={`flex items-center gap-1 font-medium px-2 py-1 rounded-full ${
            isTrendUp
              ? "bg-green-200 text-green-600"
              : "bg-red-100 text-red-600"
          }`}
        >
          {isTrendUp ? (
            <ArrowUp className="w-3 h-3" />
          ) : (
            <ArrowDown className="w-3 h-3" />
          )}
          <span>{trendValue}</span>
        </div>
      </div>
    </div>
  );
}
