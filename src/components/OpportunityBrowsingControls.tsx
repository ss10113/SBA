import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  Layers, 
  ArrowDownCircle, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Trophy, 
  ListFilter,
  FileSpreadsheet,
  MousePointerClick,
  Download,
  FileCode2
} from 'lucide-react';
import { OpportunityStatus } from '../types/contract';

interface OpportunityBrowsingControlsProps {
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
  awardedCount: number;
  filteredCount: number;
  currentStatusFilter: 'all' | 'active' | 'inactive' | 'awarded';
  onStatusFilterChange: (status: 'all' | 'active' | 'inactive' | 'awarded') => void;
  browseMode: 'paged' | 'infinite';
  onBrowseModeChange: (mode: 'paged' | 'infinite') => void;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  infiniteVisibleCount: number;
  onLoadMore: () => void;
  onLoadAll: () => void;
  onExportCsv?: () => void;
  onExportJson?: () => void;
}

export const OpportunityBrowsingControls: React.FC<OpportunityBrowsingControlsProps> = ({
  totalCount,
  activeCount,
  inactiveCount,
  awardedCount,
  filteredCount,
  currentStatusFilter,
  onStatusFilterChange,
  browseMode,
  onBrowseModeChange,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  infiniteVisibleCount,
  onLoadMore,
  onLoadAll,
  onExportCsv,
  onExportJson,
}) => {
  const [jumpPageInput, setJumpPageInput] = useState('');
  const totalPages = Math.ceil(filteredCount / pageSize) || 1;

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(jumpPageInput, 10);
    if (!isNaN(p) && p >= 1 && p <= totalPages) {
      onPageChange(p);
      setJumpPageInput('');
    }
  };

  // Generate page numbers to show with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const startRecord = browseMode === 'paged' 
    ? Math.min((currentPage - 1) * pageSize + 1, filteredCount) 
    : 1;
  const endRecord = browseMode === 'paged' 
    ? Math.min(currentPage * pageSize, filteredCount) 
    : Math.min(infiniteVisibleCount, filteredCount);

  const percentLoaded = filteredCount > 0 ? Math.round((endRecord / filteredCount) * 100) : 100;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 sm:p-5 mb-5 space-y-4">
      {/* Top Row: Explanatory Status Filter Tabs & Browsing Mode Selector */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Notice Status Filter Tabs */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ListFilter className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Notice Status Filter (SAM.gov Active vs Inactive Ledger)
            </span>
          </div>
          
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {/* Tab 1: All */}
            <button
              type="button"
              onClick={() => onStatusFilterChange('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
                currentStatusFilter === 'all'
                  ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
              title={`View all ${totalCount} notices in the database`}
            >
              <span>All Notices</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                currentStatusFilter === 'all' ? 'bg-blue-800 text-blue-100' : 'bg-slate-200 text-slate-700'
              }`}>
                {totalCount}
              </span>
            </button>

            {/* Tab 2: Active Only */}
            <button
              type="button"
              onClick={() => onStatusFilterChange('active')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
                currentStatusFilter === 'active'
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                  : 'bg-slate-50 hover:bg-emerald-50/70 text-slate-700 border-slate-200 hover:border-emerald-300'
              }`}
              title="Open solicitations accepting proposals with future deadlines"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Active Solicitations</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                currentStatusFilter === 'active' ? 'bg-emerald-800 text-emerald-100' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {activeCount}
              </span>
            </button>

            {/* Tab 3: Inactive / Closed */}
            <button
              type="button"
              onClick={() => onStatusFilterChange('inactive')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
                currentStatusFilter === 'inactive'
                  ? 'bg-slate-800 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
              title="Past notices whose response deadline has closed"
            >
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Inactive / Closed</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                currentStatusFilter === 'inactive' ? 'bg-slate-700 text-slate-200' : 'bg-slate-200 text-slate-700'
              }`}>
                {inactiveCount}
              </span>
            </button>

            {/* Tab 4: Awarded */}
            <button
              type="button"
              onClick={() => onStatusFilterChange('awarded')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
                currentStatusFilter === 'awarded'
                  ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                  : 'bg-slate-50 hover:bg-amber-50/70 text-slate-700 border-slate-200 hover:border-amber-300'
              }`}
              title="Contracts awarded to vendors with historical pricing"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>Awarded Contracts</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                currentStatusFilter === 'awarded' ? 'bg-amber-800 text-amber-100' : 'bg-amber-100 text-amber-800'
              }`}>
                {awardedCount}
              </span>
            </button>
          </div>
        </div>

        {/* Browsing Method Toggle (Pagination vs Infinite Scroll) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => onBrowseModeChange('paged')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-1.5 transition cursor-pointer ${
                browseMode === 'paged'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Standard page-by-page ledger with customizable items per page"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Page Navigation</span>
            </button>
            
            <button
              type="button"
              onClick={() => onBrowseModeChange('infinite')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-1.5 transition cursor-pointer ${
                browseMode === 'infinite'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Continuous scroll down through all notices"
            >
              <MousePointerClick className="w-3.5 h-3.5" />
              <span>Continuous Scroll</span>
            </button>
          </div>

          {/* Items Per Page Selector (applicable for both modes) */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Batch size:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="py-1 px-2.5 bg-slate-50 border border-slate-300 rounded-md text-xs font-bold text-slate-800 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value={15}>15 per batch</option>
              <option value={25}>25 per batch</option>
              <option value={50}>50 per batch</option>
              <option value={100}>100 per batch</option>
              <option value={totalCount || 200}>Show All ({totalCount})</option>
            </select>
          </div>

          {/* Quick Export Controls */}
          {(onExportCsv || onExportJson) && (
            <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
              <span className="text-[11px] text-slate-500 font-medium hidden xl:inline">Export:</span>
              {onExportCsv && (
                <button
                  type="button"
                  onClick={onExportCsv}
                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-md font-semibold text-xs flex items-center gap-1 transition cursor-pointer"
                  title={`Export ${filteredCount} filtered opportunities to CSV spreadsheet`}
                >
                  <Download className="w-3 h-3 text-emerald-600" />
                  <span>CSV</span>
                </button>
              )}
              {onExportJson && (
                <button
                  type="button"
                  onClick={onExportJson}
                  className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 rounded-md font-semibold text-xs flex items-center gap-1 transition cursor-pointer"
                  title={`Export ${filteredCount} filtered opportunities to JSON`}
                >
                  <FileCode2 className="w-3 h-3 text-blue-600" />
                  <span>JSON</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Detailed Navigation Controls */}
      <div className="pt-3 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Record count summary & progress */}
        <div className="flex flex-wrap items-center gap-2 text-slate-600">
          <span>
            Showing <strong className="text-blue-700 font-mono font-bold">{startRecord}</strong> - <strong className="text-blue-700 font-mono font-bold">{endRecord}</strong> of{' '}
            <strong className="text-slate-900 font-mono font-bold">{filteredCount}</strong> matches
          </span>
          
          {currentStatusFilter !== 'all' && (
            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200 text-[11px] font-medium">
              Filtered to: <strong>{currentStatusFilter.toUpperCase()}</strong>
            </span>
          )}

          {browseMode === 'infinite' && (
            <div className="flex items-center gap-2 ml-2">
              <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                  style={{ width: `${percentLoaded}%` }}
                ></div>
              </div>
              <span className="text-[11px] font-mono text-slate-500">{percentLoaded}% loaded</span>
            </div>
          )}
        </div>

        {/* METHOD A: Paged Mode Navigation */}
        {browseMode === 'paged' && (
          <div className="flex flex-wrap items-center gap-1.5">
            {/* First Page */}
            <button
              type="button"
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Go to First Page"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>

            {/* Previous Page */}
            <button
              type="button"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded border border-slate-200 text-slate-700 font-semibold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
              title="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>

            {/* Page Number Buttons */}
            <div className="flex items-center gap-1">
              {getPageNumbers().map((num, i) => {
                if (num === '...') {
                  return (
                    <span key={`ellipsis-${i}`} className="px-1 text-slate-400 font-bold">
                      ...
                    </span>
                  );
                }
                const isCurrent = num === currentPage;
                return (
                  <button
                    key={`page-btn-${i}-${num}`}
                    type="button"
                    onClick={() => onPageChange(Number(num))}
                    className={`min-w-[28px] h-7 px-1.5 rounded text-xs font-mono font-bold transition cursor-pointer border ${
                      isCurrent
                        ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>

            {/* Next Page */}
            <button
              type="button"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 rounded border border-slate-200 text-slate-700 font-semibold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
              title="Next Page"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* Last Page */}
            <button
              type="button"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Go to Last Page"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </button>

            {/* Jump to page form */}
            <form onSubmit={handleJumpSubmit} className="flex items-center gap-1 ml-2">
              <span className="text-[11px] text-slate-400">Go to:</span>
              <input
                type="number"
                min={1}
                max={totalPages}
                placeholder="#"
                value={jumpPageInput}
                onChange={(e) => setJumpPageInput(e.target.value)}
                className="w-12 py-0.5 px-1.5 border border-slate-300 rounded text-xs font-mono text-center focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
              <button
                type="submit"
                className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded text-xs font-medium cursor-pointer"
              >
                Go
              </button>
            </form>
          </div>
        )}

        {/* METHOD B: Infinite Scroll Actions */}
        {browseMode === 'infinite' && (
          <div className="flex items-center gap-2">
            {endRecord < filteredCount ? (
              <>
                <button
                  type="button"
                  onClick={onLoadMore}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <ArrowDownCircle className="w-3.5 h-3.5" />
                  <span>Load More (+{Math.min(pageSize, filteredCount - endRecord)})</span>
                </button>
                <button
                  type="button"
                  onClick={onLoadAll}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg font-medium transition cursor-pointer"
                >
                  <span>Load All ({filteredCount - endRecord} remaining)</span>
                </button>
              </>
            ) : (
              <span className="text-emerald-700 font-semibold flex items-center gap-1 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>All {filteredCount} notices loaded</span>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
