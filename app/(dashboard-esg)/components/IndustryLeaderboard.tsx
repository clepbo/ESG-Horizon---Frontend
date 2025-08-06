"use client";

import { useLeaderboard } from "@/hooks/useLeaderboard";
import Spinner from "@/app/components/Spinner";

export function IndustryLeaderboard() {
  const { data: leaderboardData = [], isLoading, error } = useLeaderboard();

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-center text-red-500">Failed to load leaderboard.</p>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <h2 className="text-lg font-semibold text-gray-900">
          Industry Leaderboard
        </h2>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100 h-full">
        {leaderboardData.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-green-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">
                  Organization
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">
                  Reports Submitted
                </th>
              </tr>
            </thead>
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
          </table>
        ) : (
          <div className="text-center py-6 text-gray-500">
            No leaderboard data available.
          </div>
        )}
      </div>
    </div>
  );
}
