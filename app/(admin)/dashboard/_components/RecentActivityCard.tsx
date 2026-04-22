import { recentActivity } from "../_fixtures/recentActivity";

export default function RecentActivityCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">Recent Activity</h3>
        <button
          type="button"
          className="text-xs font-medium px-3 py-1.5 rounded-md border border-gray-200 text-gray-800 hover:bg-gray-50"
        >
          View all
        </button>
      </div>
      <ul className="divide-y divide-gray-100">
        {recentActivity.map((entry) => (
          <li key={entry.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
              style={{
                backgroundColor: `${entry.initialsColor}1a`,
                color: entry.initialsColor,
              }}
            >
              {entry.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{entry.title}</p>
              <p className="text-xs text-gray-700 truncate">
                {entry.actor} · {entry.context}
              </p>
            </div>
            <span className="text-xs text-gray-600 shrink-0">{entry.time}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
