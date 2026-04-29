import { ChevronRight } from "lucide-react";

export interface Crumb {
  label: string;
  onClick?: () => void;
}

export default function Breadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav className="flex items-center text-sm text-gray-700">
      {crumbs.map((c, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={`${c.label}-${i}`} className="inline-flex items-center">
            {c.onClick && !isLast ? (
              <button
                type="button"
                onClick={c.onClick}
                className="hover:text-gray-900 transition-colors"
              >
                {c.label}
              </button>
            ) : (
              <span className={isLast ? "text-gray-900 font-medium" : ""}>{c.label}</span>
            )}
            {!isLast && <ChevronRight className="w-3.5 h-3.5 mx-2 text-gray-500" />}
          </span>
        );
      })}
    </nav>
  );
}
