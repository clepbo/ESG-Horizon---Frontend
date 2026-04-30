import { systemHealth, type HealthStatus } from "../_fixtures/systemHealth";

const STATUS_STYLES: Record<HealthStatus, { bg: string; text: string }> = {
  healthy: { bg: "bg-emerald-50", text: "text-emerald-700" },
  active: { bg: "bg-emerald-50", text: "text-emerald-700" },
  degraded: { bg: "bg-amber-50", text: "text-amber-700" },
  down: { bg: "bg-red-50", text: "text-red-700" },
  info: { bg: "bg-gray-50", text: "text-gray-800" },
};

export default function SystemHealthCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 h-full">
      <h3 className="text-base font-semibold text-gray-900 mb-4">System Health</h3>
      <ul className="space-y-2">
        {systemHealth.map((row) => {
          const styles = STATUS_STYLES[row.status];
          return (
            <li
              key={row.label}
              className={`flex items-center justify-between py-3 px-4 rounded-md ${styles.bg}`}
            >
              <span className="text-sm text-gray-700">{row.label}</span>
              <span className={`text-xs font-semibold ${styles.text}`}>{row.value}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
