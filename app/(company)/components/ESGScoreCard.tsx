import Image from "next/image";
import Spinner from "@/app/components/ui/reusables/Spinner";
import {  ArrowUp, ArrowDown, TrendingUp, TrendingDown } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { formatNumberToTwoDecimals } from "@/lib/utils";

interface ESGScoreCardProps {
  title: string;
  score: number;
  iconSrc?: string;
  maxScore: number;
  trend: "up" | "down";
  trendValue: string;
  icon: React.ReactNode;
  bottomBarColor?: string; 
  gradientClass?: string;
  height?: string;
  main?: boolean;
  bgColor?: string;
  
}

export function ESGScoreCard({
  title,
  score,
  maxScore,
  trend,
  trendValue,
  icon,
  bgColor,
  bottomBarColor = "bg-[#2c2c2c]",
}: ESGScoreCardProps) {
  const isTrendUp = trend === "up";

  return (
    <div className="rounded-xl overflow-hidden shadow-md w-full">
      {/* Card Top */}
      <div
        className={`p-4 h-[150px] flex flex-col justify-between ${bgColor} text-white`}
      >
        <div className="flex items-start justify-between">
          <div>
            <h4 className="text-sm font-medium">{title}</h4>
            <p className="text-3xl font-bold mt-1">
              {score} / {maxScore}
            </p>
          </div>
          <div className="p-2 bg-white/30 rounded-lg">{icon}</div>
        </div>
      </div>

      {/* Card Bottom */}
      <div
        className={`px-4 py-3 text-white text-xs flex items-center justify-between ${bottomBarColor}`}
      >
        <p className="font-medium">From last report</p>
        <div
          className={`flex items-center gap-1 font-medium px-2 py-1 rounded-full ${
            isTrendUp
              ? "bg-green-100 text-[var(--color-tertiary)]"
              : "bg-red-100 text-red-600"
          }`}
        >
          {isTrendUp ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          <span>{trendValue}</span>
        </div>
      </div>
    </div>
  );
}


export function ESGCard({
  title,
  score,
  trend,
  trendValue,
  icon,
  iconSrc,
  gradientClass,
  bottomBarColor = "",
  maxScore,
  main = false
}: ESGScoreCardProps) {
  const isTrendUp = trend === "up";
  const [loading, setLoading] = useState(true);
  const formattedScore = formatNumberToTwoDecimals(score);

  useEffect(() => {
    // Simulate data fetching
    const timer = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      className={`rounded-xl overflow-hidden h-auto shadow-md w-full bg-white bg-gradient-to-b ${gradientClass}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
    >
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <Spinner />
        </div>
      ) : (
        <div className="flex flex-col justify-between h-full">
          <div
            className={`p-2 pt-4 flex h-4/5 flex-col gap-2 bg-gradient-to-b ${gradientClass} text-white`}
          >
            {/* <div className="flex items-center justify-between p-2"> */}
              <div className="">
                <h4 className={` text-xs font-medium`}>{title}</h4>
                
              </div>
              <div className=" flex items-center justify-between">
                <p className={` ${main ? "text-5xl" : "text-3xl"} font-bold mt-1`}>{formattedScore}<span className="text-xl">/{maxScore} </span> </p>
              <div className=" rounded-lg flex items-center justify-center">
                {iconSrc ? (
                  <Image
                    src={iconSrc}
                    alt={`${title} icon`}
                    width={50}
                    height={50}
                    className="object-contain"
                  />
                ) : (
                  icon
                )}
              </div>
              {/* </div> */}
            </div>
          </div>

          <div
            className={`p-2 text-white  flex items-center justify-between ${bottomBarColor} ${main ? "text-xs" : "text-[10px]"}`}
          >
            <p className="font-medium">From last report</p>
            <div
              className={`flex items-center gap-1 font-medium px-2 py-1 rounded-full ${
                isTrendUp
                  ? "bg-green-200 text-[var(--color-tertiary)]"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {isTrendUp ? (
                <ArrowUp className="w-3 h-4" />
              ) : (
                <ArrowDown className="w-3 h-4" />
              )}
              <span>{trendValue}</span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
