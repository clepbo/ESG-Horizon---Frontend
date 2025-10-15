"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
};

const Pagination = ({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
  onItemsPerPageChange,
}: PaginationProps) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
      {/* Left: Rows per page */}
      <div className="flex items-center gap-2">
        <span className="text-gray-700">Rows per page</span>
        {onItemsPerPageChange && (
          <select
            id="itemsPerPage"
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="border rounded px-3 py-1 text-sm focus:outline-none focus:ring-1 border-[var(--color-primary)] text-gray-800 focus:ring-[var(--color-primary)]"
          >
            {[5, 10, 15, 20].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Center: Pagination range */}
      <div className="text-gray-600">
        {totalItems === 0 ? (
          "0 results"
        ) : (
          <>
            {itemsPerPage * (currentPage - 1) + 1} -{" "}
            {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
          </>
        )}
      </div>

      {/* Right: Navigation buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => canGoPrev && onPageChange(currentPage - 1)}
          disabled={!canGoPrev}
          className="p-1 rounded disabled:opacity-30"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Numbered buttons (optional, limit to 5 for now) */}
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .slice(Math.max(currentPage - 2, 0), Math.min(currentPage + 1, totalPages))
          .map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-8 h-8 rounded text-sm ${
                currentPage === page
                  ? "bg-[var(--color-primary)] text-white"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              {page}
            </button>
          ))}

        <button
          onClick={() => canGoNext && onPageChange(currentPage + 1)}
          disabled={!canGoNext}
          className="p-1 rounded disabled:opacity-30"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
