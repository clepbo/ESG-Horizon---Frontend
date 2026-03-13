import { PILLAR_TABS } from "./constants";
import type { PillarTabId } from "./types";

interface PillarTabsProps {
  activeTabId: PillarTabId;
  onChange: (tabId: PillarTabId) => void;
}

export function PillarTabs({ activeTabId, onChange }: PillarTabsProps) {
  return (
    <div className="flex gap-2">
      {PILLAR_TABS.map((tab) => {
        const isActive = activeTabId === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              flex-1 inline-flex items-center justify-center py-2 rounded-sm text-sm font-medium
              transition-colors cursor-pointer border
              ${
                isActive
                  ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                  : "bg-white text-teal-700 border-teal-300 hover:bg-teal-50"
              }
            `}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
