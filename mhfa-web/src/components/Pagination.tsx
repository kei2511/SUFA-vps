"use client";

import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
  itemLabel?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  itemLabel = "data",
}: PaginationProps) {
  if (totalItems <= 0 || totalPages <= 0) return null;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  // Generate pagination range with dots
  const getPaginationRange = () => {
    const delta = 1; // siblings on each side
    const range: (number | string)[] = [];
    const rangeWithDots: (number | string)[] = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const paginationRange = getPaginationRange();

  return (
    <div className="p-4 border-t border-outline-variant/40 flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-container-lowest rounded-b-2xl">
      <p className="text-xs text-on-surface-variant">
        Menampilkan{" "}
        <span className="font-semibold text-on-surface">
          {startIndex + 1}
        </span>{" "}
        -{" "}
        <span className="font-semibold text-on-surface">{endIndex}</span> dari{" "}
        <span className="font-semibold text-on-surface">{totalItems}</span>{" "}
        {itemLabel}
      </p>

      <div className="flex items-center gap-2 flex-wrap justify-center">
        {/* Jump to Page Dropdown (shown when totalPages > 5) */}
        {totalPages > 5 && (
          <div className="flex items-center gap-1.5 text-xs text-on-surface-variant mr-1">
            <span className="hidden md:inline">Ke hal:</span>
            <select
              value={currentPage}
              onChange={(e) => onPageChange(Number(e.target.value))}
              className="py-1 px-2 border border-outline-variant rounded-lg bg-surface text-on-surface font-semibold focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer text-xs"
            >
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <option key={page} value={page}>
                  Hal {page}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Previous Button */}
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1.5 rounded-lg border border-outline-variant text-xs font-semibold text-on-surface hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
          title="Halaman Sebelumnya"
        >
          <span className="material-symbols-outlined text-[16px]">
            chevron_left
          </span>
          <span className="hidden sm:inline">Sebelumnya</span>
        </button>

        {/* Page Buttons with Dots */}
        <div className="flex items-center gap-1">
          {paginationRange.map((page, idx) => {
            if (page === "...") {
              return (
                <span
                  key={`dots-${idx}`}
                  className="w-7 h-7 flex items-center justify-center text-xs font-medium text-outline"
                >
                  ...
                </span>
              );
            }

            const pageNum = page as number;
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`w-7 h-7 rounded-lg text-xs transition-all ${
                  currentPage === pageNum
                    ? "bg-primary text-on-primary shadow-xs font-bold"
                    : "text-on-surface-variant hover:bg-surface-container-high font-medium"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages || totalPages === 0}
          className="px-3 py-1.5 rounded-lg border border-outline-variant text-xs font-semibold text-on-surface hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
          title="Halaman Berikutnya"
        >
          <span className="hidden sm:inline">Berikutnya</span>
          <span className="material-symbols-outlined text-[16px]">
            chevron_right
          </span>
        </button>
      </div>
    </div>
  );
}
