"use client";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onChange }: PaginationProps) {
  const pages = buildPageList(currentPage, totalPages);
  return (
    <div className="flex items-center gap-1 flex-wrap">
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => onChange(currentPage - 1)}
        className="px-3 h-8 text-sm text-gray-800 hover:bg-gray-100 rounded-md disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Prev
      </button>
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`e-${i}`} className="px-2 text-gray-600 text-sm">
            …
          </span>
        ) : (
          <button
            type="button"
            key={p}
            onClick={() => onChange(p)}
            className={`w-8 h-8 text-sm rounded-md ${
              p === currentPage
                ? "bg-[#119B95] text-white font-semibold"
                : "text-gray-800 hover:bg-gray-100"
            }`}
          >
            {p}
          </button>
        )
      )}
      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => onChange(currentPage + 1)}
        className="px-3 h-8 text-sm text-gray-800 hover:bg-gray-100 rounded-md disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
}

function buildPageList(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const result: (number | "…")[] = [1];
  if (current > 3) result.push("…");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) result.push(i);
  if (current < total - 2) result.push("…");
  result.push(total);
  return result;
}
