"use client";

import Spinner from "@/app/components/ui/reusables/Spinner";
import { motion } from "framer-motion";
import { Clock, Sparkles } from "lucide-react";

export function IndustryLeaderboard() {
  const isLoading = false;
  const error = false;
  const leaderboardData: {
    organization: string;
    score: string;
    reports: string;
    rank: string | number;
  }[] = [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-500">Failed to load leaderboard.</p>;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
        <h2 className="text-lg font-semibold text-gray-900">Industry Leaderboard</h2>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100 flex-1">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-teal-500">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Rank</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">
                Organization
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Score</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">
                Reports Submitted
              </th>
            </tr>
          </thead>

          {leaderboardData.length > 0 ? (
            <tbody className="bg-white divide-y divide-gray-100">
              {leaderboardData.map((item) => (
                <tr
                  key={item.rank}
                  className={
                    item.organization === "Your Company"
                      ? "bg-green-50 font-semibold text-green-700"
                      : ""
                  }
                >
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-green-200 text-green-700 text-xs font-bold">
                      {item.rank}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{item.organization}</td>
                  <td className="px-6 py-4 text-sm">{item.score}</td>
                  <td className="px-6 py-4 text-sm">{item.reports}</td>
                </tr>
              ))}
            </tbody>
          ) : (
            <tbody>
              <tr>
                <td colSpan={4}>
                  <div className="flex flex-col items-center min-h-[20vh] text-center p-6">
                    <div className="flex justify-center mb-6">
                      <div className="relative">
                        <motion.div
                          animate={{
                            rotate: [0, 10, -10, 0],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                          className="inline-block"
                        >
                          <Clock className="w-16 h-16 text-primary" />
                        </motion.div>
                        <Sparkles className="absolute -top-3 -right-3 w-6 h-6 text-yellow-500 animate-pulse" />
                      </div>
                    </div>
                    <p>Leaderboard Coming Soon!</p>
                  </div>
                </td>
              </tr>
            </tbody>
          )}
        </table>
      </div>
    </div>
  );
}
