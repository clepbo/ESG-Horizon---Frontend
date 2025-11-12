"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowUp, ArrowDown } from "lucide-react";
import Spinner from "@/app/components/ui/reusables/Spinner"; // Make sure you have this

export interface StatCardProps {
  title: string;
  value: number;
  trend: "up" | "down";
  trendValue: string;
  icon?: React.ReactNode;
  iconSrc?: string;
  gradientClass: string;
  bottomBarColor?: string;
}

export function StatCard({
  title,
  value,
  trend,
  trendValue,
  icon,
  iconSrc,
  gradientClass,
  bottomBarColor = "",
}: StatCardProps) {
  const isTrendUp = trend === "up";
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data fetching
    const timer = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      className="rounded-xl overflow-hidden shadow-md w-full h-[190px] bg-white"
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
        <>
          <div
            className={`p-4 h-[145px] flex flex-col justify-between bg-gradient-to-b ${gradientClass} text-white`}
          >
            <div className="flex items-start justify-between p-2">
              <div>
                <h4 className="text-sm font-medium">{title}</h4>
                <p className="text-4xl font-bold mt-1">{value}</p>
              </div>
              <div className="p-3 bg-green-200 rounded-lg flex items-center justify-center">
                {iconSrc ? (
                  <Image
                    src={iconSrc}
                    alt={`${title} icon`}
                    width={25}
                    height={25}
                    className="object-contain"
                  />
                ) : (
                  icon
                )}
              </div>
            </div>
          </div>

          <div
            className={`px-6 py-3 text-white text-xs flex items-center justify-between ${bottomBarColor}`}
          >
            <p className="font-medium">From last report</p>
            <div
              className={`flex items-center gap-1 font-medium px-2 py-1 rounded-full ${
                isTrendUp ? "bg-green-200 text-green-600" : "bg-red-100 text-red-600"
              }`}
            >
              {isTrendUp ? <ArrowUp className="w-3 h-4" /> : <ArrowDown className="w-3 h-4" />}
              <span>{trendValue}</span>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
