import { formatNumberShort } from "@/lib/numberFormat";

export type ScopeId = "scope1" | "scope2" | "scope3";

interface ScopeTab {
  id: ScopeId;
  label: string;
  sublabel: string;
  total: number;
}

interface ScopeTabBarProps {
  activeScope: ScopeId;
  onChange: (scope: ScopeId) => void;
  scope1Total: number;
  scope2Total: number;
  scope3Total: number;
}

export function ScopeTabBar({
  activeScope,
  onChange,
  scope1Total,
  scope2Total,
  scope3Total,
}: ScopeTabBarProps) {
  const tabs: ScopeTab[] = [
    { id: "scope1", label: "SCOPE 1", sublabel: "DIRECT EMISSION", total: scope1Total },
    { id: "scope2", label: "SCOPE 2", sublabel: "INDIRECT EMISSION", total: scope2Total },
    { id: "scope3", label: "SCOPE 3", sublabel: "VALUE CHAIN", total: scope3Total },
  ];

  return (
    <div className="flex divide-x divide-gray-100 border-b border-gray-100">
      {tabs.map((tab) => {
        const isActive = activeScope === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex-1 flex items-center justify-between px-5 py-3 text-left transition-colors cursor-pointer ${
              isActive ? "bg-gray-50 border-b-2 border-teal-600" : "hover:bg-gray-50/50"
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold tracking-wider px-2 py-0.5 ${
                  isActive ? "bg-gray-800 text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                {tab.label}
              </span>
              <span
                className={`text-xs font-medium tracking-wide uppercase ${isActive ? "text-gray-700" : "text-gray-400"}`}
              >
                {tab.sublabel}
              </span>
            </div>
            <span className={`text-sm font-bold ${isActive ? "text-gray-900" : "text-gray-400"}`}>
              {formatNumberShort(tab.total)} tCO₂e
            </span>
          </button>
        );
      })}
    </div>
  );
}
