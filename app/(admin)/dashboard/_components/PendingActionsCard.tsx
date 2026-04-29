import { pendingActions, type PendingTone } from "../_fixtures/pendingActions";

const TONE_STYLES: Record<
  PendingTone,
  { bg: string; border: string; title: string; subtitle: string }
> = {
  danger: {
    bg: "bg-red-50",
    border: "border-red-100",
    title: "text-red-700",
    subtitle: "text-red-600/70",
  },
  warning: {
    bg: "bg-amber-50",
    border: "border-amber-100",
    title: "text-amber-700",
    subtitle: "text-amber-700/70",
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-100",
    title: "text-blue-700",
    subtitle: "text-blue-600/70",
  },
};

export default function PendingActionsCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">Pending Actions</h3>
        <span className="text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-full px-2.5 py-0.5">
          {pendingActions.length} items
        </span>
      </div>
      <ul className="space-y-3">
        {pendingActions.map((action) => {
          const styles = TONE_STYLES[action.tone];
          return (
            <li
              key={action.id}
              className={`flex items-center justify-between gap-3 rounded-lg border ${styles.bg} ${styles.border} px-4 py-3`}
            >
              <div className="min-w-0">
                <p className={`text-sm font-semibold truncate ${styles.title}`}>{action.title}</p>
                <p className={`text-xs truncate ${styles.subtitle}`}>{action.subtitle}</p>
              </div>
              <button
                type="button"
                className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-md border border-gray-200 bg-white text-gray-800 hover:bg-gray-50"
              >
                Review
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
