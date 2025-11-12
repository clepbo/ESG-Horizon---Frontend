"use client";

import { ArrowUp, ArrowDown } from "lucide-react";
import Image from "next/image";
import React from "react";

interface Change {
  direction: "up" | "down";
  value: string;
}

interface MonthlyRevenue {
  amount: number;
}

interface Stat {
  label: string;
  value: number | string;
  change: Change;
  icon: string;
  iconBg: string;
}

interface SubscriptionProps {
  monthlyRevenue: MonthlyRevenue;
  stats: Stat[];
}

export default function Subscription({ monthlyRevenue, stats }: SubscriptionProps) {
  return (
    <div className="bg-white rounded-2xl shadow p-2 space-y-6 ">
      {/* Top Row: Monthly Revenue & Icon */}
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-sm font-medium text-gray-500">Monthly Revenue</h4>
          <p className="text-4xl font-bold mt-2">₦{monthlyRevenue.amount.toLocaleString()}</p>
        </div>
        <div className="bg-gray-100 p-3 rounded-xl">
          <Image src="/icons/environment.svg" alt="Growth" width={32} height={32} />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-0 lg:pt-12">
        {stats.map((stat, i) => {
          const isUp = stat.change.direction === "up";
          return (
            <div key={i} className="bg-gray-100 shadow rounded-xl flex flex-col overflow-hidden">
              {/* Stat Content */}
              <div className="p-2 flex flex-col flex-1">
                <div className="">
                  <h4 className="text-sm font-medium text-gray-700">{stat.label}</h4>
                </div>
                <div className="flex justify-between">
                  <p className="text-xl font-bold mt-2">{stat.value}</p>
                  <span
                    className={`p-2 rounded-lg ${stat.iconBg} flex items-center justify-center`}
                  >
                    <Image src={stat.icon} alt={stat.label} width={16} height={16} />
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-black text-white flex items-center justify-between text-xs px-3 py-2">
                <span>From last report</span>
                <div
                  className={`flex items-center gap-1 font-medium px-2 py-0.5 rounded-full ${
                    isUp ? "bg-green-200 text-green-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  {isUp ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  {stat.change.value}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
