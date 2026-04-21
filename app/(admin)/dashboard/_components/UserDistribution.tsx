import { userDistribution } from "../_fixtures/userDistribution";

export default function UserDistribution() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 h-full">
      <h3 className="text-base font-semibold text-gray-900 mb-5">User Distribution</h3>
      <div className="space-y-4">
        {userDistribution.map((row) => (
          <div key={row.label}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm text-gray-700">{row.label}</span>
              <span className="text-sm font-semibold text-gray-900">{row.percent.toFixed(1)}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(row.percent, 100)}%`,
                  backgroundColor: row.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
