"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Button } from "@/app/components/ui/button";

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
    <div className="flex items-center justify-between px-2 mt-4">
      <div className="flex items-center space-x-2">
        <p className="text-sm text-muted-foreground">Rows per page</p>
        {onItemsPerPageChange && (
          <Select
            value={`${itemsPerPage}`}
            onValueChange={(value) => onItemsPerPageChange(Number(value))}
          >
            <SelectTrigger className="h-8 w-16">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              {[5, 10, 20, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="flex items-center space-x-6 lg:space-x-8">
        <p className="text-sm font-medium">
          {totalItems === 0 ? (
            "0 results"
          ) : (
            <>
              {itemsPerPage * (currentPage - 1) + 1} -{" "}
              {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
            </>
          )}
        </p>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => canGoPrev && onPageChange(currentPage - 1)}
            disabled={!canGoPrev}
          >
            ‹
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => canGoNext && onPageChange(currentPage + 1)}
            disabled={!canGoNext}
          >
            ›
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
