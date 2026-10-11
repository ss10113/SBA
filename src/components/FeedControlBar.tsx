import React, { useState } from 'react';
import { 
  LayoutGrid, 
  TableProperties, 
  Download, 
  FileSpreadsheet, 
  FileCode, 
  SlidersHorizontal, 
  X, 
  ArrowUpDown,
  Sparkles,
  Layers,
  ChevronDown
} from 'lucide-react';
import { FilterState, OpportunityStatus } from '../types/contract';

interface FeedControlBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  totalMatches: number;
  displayedCount: number;
  totalSamDatabaseRecords: number;
  databaseStats: {
    total: number;
    active: number;
    inactive: number;
    awarded: number;
  };
  viewMode: 'cards' | 'table';
  setViewMode: (mode: 'cards' | 'table') => void;
  browseMode: 'paged' | 'infinite';
  setBrowseMode: (mode: 'paged' | 'infinite') => void;
  onOpenMobileFilters: () => void;
  onExportCsv: () => void;
  onExportJson: () => void;
}

export const FeedControlBar: React.FC<FeedControlBarProps> = ({
  filters,
  setFilters,
  totalMatches,
  displayedCount,
  totalSamDatabaseRecords,
  databaseStats,
  viewMode,
  setViewMode,
  browseMode,
  setBrowseMode,
  onOpenMobileFilters,
  onExportCsv,
  onExportJson,
}) => {
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  // Compute active chips to dismiss individually (Amazon / Meta search chips)
  const activeChips: { key: string; label: string; onClear: () => void }[] = [];

  if (filters.searchQuery) {
    activeChips.push({
      key: 'search',
      label: `"${filters.searchQuery}"`,
      onClear: () => setFilters((prev) => ({ ...prev, searchQuery: '' })),
    });
  }

  if (filters.statusFilter && filters.statusFilter !== 'all') {
    activeChips.push({
      key: 'status',
      label: filters.statusFilter === 'active' ? '🟢 Active Only' : filters.statusFilter === 'awarded' ? '🏆 Awarded' : '⚪ Closed',
      onClear: () => setFilters((prev) => ({ ...prev, statusFilter: 'all' })),
    });
  }

  if (filters.agencyFilter) {
    activeChips.push({
      key: 'agency',
      label: filters.agencyFilter,
      onClear: () => setFilters((prev) => ({ ...prev, agencyFilter: '' })),
    });
  }

  if (filters.setAsideFilter && filters.setAsideFilter !== 'All Set-Asides') {
    activeChips.push({
      key: 'setAside',
      label: filters.setAsideFilter,
      onClear: () => setFilters((prev) => ({ ...prev, setAsideFilter: 'All Set-Asides' })),
    });
  }

  if (filters.naicsFilter) {
    activeChips.push({
      key: 'naics',
      label: `NAICS ${filters.naicsFilter}`,
      onClear: () => setFilters((prev) => ({ ...prev, naicsFilter: '' })),
    });
  }

  if (filters.stateFilter) {
    activeChips.push({
      key: 'state',
      label: `State: ${filters.stateFilter}`,
      onClear: () => setFilters((prev) => ({ ...prev, stateFilter: '', cityFilter: '' })),
    });
  }

  if (filters.cityFilter) {
    activeChips.push({
      key: 'city',
      label: `City: ${filters.cityFilter}`,
      onClear: () => setFilters((prev) => ({ ...prev, cityFilter: '' })),
    });
  }

  if (filters.verifiedOnly) {
    activeChips.push({
      key: 'verified',
      label: 'Verified Link',
      onClear: () => setFilters((prev) => ({ ...prev, verifiedOnly: false })),
    });
  }

  if (filters.minFitScore > 0) {
    activeChips.push({
      key: 'fit',
      label: `Fit ≥ ${filters.minFitScore}%`,
      onClear: () => setFilters((prev) => ({ ...prev, minFitScore: 0 })),
    });
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-3 sm:p-3.5 space-y-2.5">
      {/* Main Control Line */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        {/* Left: Mobile Filter Toggle + Matches Counter */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mobile Refine Button */}
          <button
            type="button"
            onClick={onOpenMobileFilters}
            className="lg:hidden px-2.5 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer text-xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Refine Filters</span>
            {activeChips.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                {activeChips.length}
              </span>
            )}
          </button>

          {/* Scannable Results Summary with Tabular Numerals */}
          <div className="flex items-center gap-1.5 text-slate-800">
            <span className="font-bold text-slate-900 text-sm font-mono tabular-nums">
              {totalMatches}
            </span>
            <span className="text-slate-600 font-medium">solicitations</span>
            <span className="text-slate-300 font-normal">|</span>
            <span className="text-slate-500 hidden sm:inline">
              showing <strong className="text-slate-700 font-mono tabular-nums">{displayedCount}</strong>
            </span>
          </div>

          {/* Quick Status Segmented Tabs (Meta / Amazon style) */}
          <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px] font-medium text-slate-600">
            {[
              { id: 'all', label: `All (${databaseStats.total})` },
              { id: 'active', label: `Active (${databaseStats.active})` },
              { id: 'inactive', label: `Closed (${databaseStats.inactive})` },
              { id: 'awarded', label: `Awarded (${databaseStats.awarded})` },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, statusFilter: st.id as any }))}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  (filters.statusFilter || 'all') === st.id
                    ? 'bg-white text-slate-900 font-bold shadow-2xs'
                    : 'hover:text-slate-900'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Layout Toggle, Sort By, and Export */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
          {/* Sort By Selector */}
          <div className="flex items-center gap-1 text-slate-600">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value as any }))}
              className="py-1.5 px-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white cursor-pointer"
            >
              <option value="fit_desc">🎯 SBA Fit Score (High → Low)</option>
              <option value="deadline_asc">⏳ Due Date (Soonest First)</option>
              <option value="value_desc">💰 Ceiling Value (High → Low)</option>
              <option value="posted_desc">📅 Recently Posted</option>
              <option value="agency_asc">🏛️ Agency Name (A → Z)</option>
              <option value="title_asc">📝 Title (A → Z)</option>
              <option value="solnum_asc">🔢 Solicitation #</option>
            </select>
          </div>

          {/* View Mode Toggle (Feed Cards vs Table Ledger) */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === 'cards'
                  ? 'bg-white text-blue-700 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Social Feed Cards View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium hidden md:inline">Feed</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === 'table'
                  ? 'bg-white text-blue-700 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Procurement Table Ledger View"
            >
              <TableProperties className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium hidden md:inline">Table</span>
            </button>
          </div>

          {/* Browse Mode (Paged vs Infinite) */}
          <div className="hidden xl:flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px]">
            <button
              type="button"
              onClick={() => setBrowseMode('paged')}
              className={`px-2 py-1 rounded-md transition cursor-pointer ${
                browseMode === 'paged' ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Pages
            </button>
            <button
              type="button"
              onClick={() => setBrowseMode('infinite')}
              className={`px-2 py-1 rounded-md transition cursor-pointer ${
                browseMode === 'infinite' ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Infinite
            </button>
          </div>

          {/* Export Menu Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setExportMenuOpen(!exportMenuOpen)}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold flex items-center gap-1 transition cursor-pointer border border-slate-200"
              title="Export results"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {exportMenuOpen && (
              <div 
                className="absolute right-0 mt-1.5 w-56 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-30 text-xs"
                onMouseLeave={() => setExportMenuOpen(false)}
              >
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  Export {totalMatches} Matches
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onExportCsv();
                    setExportMenuOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-2 hover:bg-slate-50 rounded-lg flex items-center gap-2 text-slate-800 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="font-semibold block">CSV Spreadsheet</span>
                    <span className="text-[10px] text-slate-400">Excel / Google Sheets</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onExportJson();
                    setExportMenuOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-2 hover:bg-slate-50 rounded-lg flex items-center gap-2 text-slate-800 cursor-pointer"
                >
                  <FileCode className="w-4 h-4 text-blue-600" />
                  <div>
                    <span className="font-semibold block">Structured JSON</span>
                    <span className="text-[10px] text-slate-400">Complete notice schema</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Filter Breadcrumb Chips (Amazon / Meta standard) */}
      {activeChips.length > 0 && (
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] text-slate-400 font-medium">Applied Filters:</span>
          {activeChips.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-medium pl-2 pr-1.5 py-0.5 rounded-md"
            >
              <span>{chip.label}</span>
              <button
                type="button"
                onClick={chip.onClear}
                className="hover:bg-blue-200 text-blue-600 hover:text-blue-900 rounded p-0.5 cursor-pointer transition"
                title={`Remove ${chip.label}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          <button
            type="button"
            onClick={() =>
              setFilters({
                searchQuery: '',
                naicsFilter: '',
                setAsideFilter: 'All Set-Asides',
                stateFilter: '',
                cityFilter: '',
                noticeTypeFilter: '',
                agencyFilter: '',
                statusFilter: 'all',
                dueWithinDays: 'all',
                minVal: 0,
                maxVal: 100000000,
                minFitScore: 0,
                sortBy: 'fit_desc',
                verifiedOnly: false,
              })
            }
            className="text-[11px] text-slate-400 hover:text-red-600 hover:underline ml-1 cursor-pointer font-medium"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};
