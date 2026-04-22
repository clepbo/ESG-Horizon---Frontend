import type { CompanyCategory } from "../_fixtures/companies";

const STYLES: Record<CompanyCategory, string> = {
  Company: "bg-emerald-50 text-emerald-700",
  Investor: "bg-blue-50 text-blue-700",
  Regulator: "bg-purple-50 text-purple-700",
};

export default function CategoryPill({ category }: { category: CompanyCategory }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STYLES[category]}`}
    >
      {category}
    </span>
  );
}
