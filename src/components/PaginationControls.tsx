import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  Layers, 
  Sparkles, 
  ArrowDownCircle, 
  ArrowUp, 
  CheckCircle2, 
  Info,
  SlidersHorizontal
} from 'lucide-react';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  visibleCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onLoadMore: () => void;
  onShowAll: () => void;
  autoScrollEnabled: boolean;
  onToggleAutoScroll: (enabled: boolean) => void;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  visibleCount,
  onPageChange,
  onPageSizeChange,
  onLoadMore,
  onShowAll,
  autoScrollEnabled,
  onToggleAutoScroll,
}) => {
  const [jumpPageInput, setJumpPageInput] = useState('');
  const [showInfoBanner, setShowInfoBanner] = useState(false);

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  const percentLoaded = totalItems > 0 ? Math.round((visibleCount / totalItems) * 100) : 100;
  const hasMore = visibleCount < totalItems;

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(jumpPageInput, 10);
    if (!isNaN(p) && p >= 1 && p <= totalPages) {
      onPageChange(p);
      setJumpPageInput('');
    }
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  // Generate numbered pages with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mt-6 space-y-4">
      {/* Top Clarification & Progress Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border-b border-slate-100 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-slate-800">
            Showing <span className="font-mono text-blue-700 font-bold">{startItem}–{endItem}</span> of{' '}
            <span className="font-mono text-slate-900 font-bold">{totalItems}</span> matching opportunities
          </span>
          <span className="text-slate-300">|</span>
          <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>All {totalItems} Notices Active (Open for Bids)</span>
          </span>
          <button
            type="button"
            onClick={() => setShowInfoBanner(!showInfoBanner)}
            className="text-slate-400 hover:text-blue-600 cursor-pointer ml-0.5"
            title="Why was it showing 15 notices initially?"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Page Size Selector */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">Notices per page:</span>
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs font-semibold">
            {[15, 25, 50, 100, 213].map((size) => {
              const label = size === 213 ? 'All' : String(size);
              const isActive = pageSize === size;
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => onPageSizeChange(size)}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Explanatory Dropdown Banner when info icon is clicked */}
      {showInfoBanner && (
        <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-3 text-xs text-blue-900 space-y-1 animate-in fade-in duration-200">
          <div className="font-bold flex items-center gap-1.5 text-blue-950">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Database Matching vs. View Pagination:</span>
          </div>
          <p className="leading-relaxed text-blue-800">
            The database maintains <strong>{totalItems} active federal procurement notices</strong> with active upcoming response deadlines. To optimize response speed and ensure zero browser stutter, the system displays notices in pages (15 by default). You can scroll through pages, click <strong>&quot;Load More&quot;</strong>, or choose <strong>&quot;All&quot;</strong> to view and scroll all {totalItems} matches in a single continuous stream.
          </p>
        </div>
      )}

      {/* Dual Browsing Controls: Traditional Pagination & Load-More Stream */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Page Navigation Controls */}
        <div className="flex items-center gap-1 text-xs">
          <button
            type="button"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
            title="First Page"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed font-medium transition cursor-pointer flex items-center gap-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Prev</span>
          </button>

          {/* Numbered Page Buttons */}
          <div className="flex items-center gap-1 px-1">
            {getPageNumbers().map((num, idx) => {
              if (num === '...') {
                return (
                  <span key={`ellipsis-${idx}`} className="px-1 text-slate-400 font-mono">
                    ...
                  </span>
                );
              }
              const isCurrent = currentPage === num;
              return (
                <button
                  key={`page-${num}`}
                  type="button"
                  onClick={() => onPageChange(num as number)}
                  className={`min-w-8 h-8 rounded-lg font-mono text-xs font-semibold transition cursor-pointer flex items-center justify-center ${
                    isCurrent
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed font-medium transition cursor-pointer flex items-center gap-1"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage >= totalPages}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
            title="Last Page"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>

          {/* Direct Jump Input */}
          <form onSubmit={handleJumpSubmit} className="hidden lg:flex items-center gap-1.5 ml-3 pl-3 border-l border-slate-200">
            <span className="text-slate-500">Go to:</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              placeholder="#"
              value={jumpPageInput}
              onChange={(e) => setJumpPageInput(e.target.value)}
              className="w-12 py-1 px-1.5 text-center bg-slate-50 border border-slate-200 rounded font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
            <button
              type="submit"
              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium transition cursor-pointer"
            >
              Go
            </button>
          </form>
        </div>

        {/* Load More & Infinite Scroll Helper Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {hasMore && pageSize < totalItems && (
            <button
              type="button"
              onClick={onLoadMore}
              className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            >
              <ArrowDownCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>Load Next +{Math.min(15, totalItems - visibleCount)} Notices</span>
            </button>
          )}

          {hasMore && pageSize < totalItems && (
            <button
              type="button"
              onClick={onShowAll}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition cursor-pointer"
            >
              <span>View All {totalItems}</span>
            </button>
          )}

          {/* Auto-scroll checkbox */}
          <label className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer ml-1 select-none">
            <input
              type="checkbox"
              checked={autoScrollEnabled}
              onChange={(e) => onToggleAutoScroll(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span>Auto-load on scroll</span>
          </label>

          {/* Scroll to Top */}
          <button
            type="button"
            onClick={handleScrollToTop}
            title="Scroll back to top of notices"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
