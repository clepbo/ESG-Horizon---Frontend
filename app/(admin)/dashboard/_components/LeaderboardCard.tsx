import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { leaderboard } from "../_fixtures/leaderboard";

function scoreColor(score: number): string {
  if (score >= 90) return "bg-emerald-50 text-emerald-700 border-emerald-100";
  if (score >= 80) return "bg-blue-50 text-blue-700 border-blue-100";
  if (score >= 70) return "bg-amber-50 text-amber-700 border-amber-100";
  return "bg-red-50 text-red-700 border-red-100";
}

export default function LeaderboardCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 h-full">
      <h3 className="text-base font-semibold text-gray-900 mb-4">ESG Leaderboard</h3>
      <div className="overflow-x-auto -mx-5 px-5">
        <table className="w-full min-w-[380px]">
          <thead>
            <tr className="text-left text-[11px] font-semibold tracking-wider text-gray-600 uppercase">
              <th className="py-2 pr-4">#</th>
              <th className="py-2 pr-4">Organization</th>
              <th className="py-2 pr-4">Industry</th>
              <th className="py-2 pr-4">Score</th>
              <th className="py-2">Trend</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {leaderboard.map((row) => (
              <tr key={row.rank} className="border-t border-gray-100">
                <td className="py-3 pr-4 font-medium text-gray-900">{row.rank}</td>
                <td className="py-3 pr-4">{row.organization}</td>
                <td className="py-3 pr-4 text-gray-700">{row.industry}</td>
                <td className="py-3 pr-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-semibold ${scoreColor(row.score)}`}
                  >
                    {row.score}%
                  </span>
                </td>
                <td className="py-3">
                  {row.trend.direction === "flat" ? (
                    <span className="inline-flex items-center text-gray-600">
                      <Minus className="w-3.5 h-3.5" />
                    </span>
                  ) : row.trend.direction === "up" ? (
                    <span className="inline-flex items-center gap-0.5 text-emerald-600 text-xs font-medium">
                      <ArrowUp className="w-3.5 h-3.5" />
                      {row.trend.delta}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 text-red-600 text-xs font-medium">
                      <ArrowDown className="w-3.5 h-3.5" />
                      {row.trend.delta}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
