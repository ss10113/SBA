import React from 'react';
import { 
  Search, 
  X, 
  MapPin, 
  Tag, 
  Clock, 
  SlidersHorizontal, 
  RotateCcw,
  Building,
  Target,
  LayoutGrid,
  TableProperties
} from 'lucide-react';
import { FilterState } from '../types/contract';
import { 
  POPULAR_NAICS, 
  SET_ASIDE_OPTIONS, 
  US_STATES 
} from '../data/samCuratedData';
import { 
  FEDERAL_ORGANIZATIONS, 
  FEDERAL_ORGANIZATION_CATEGORIES, 
  getFederalOrgDisplayName 
} from '../data/federalOrganizations';
import { 
  NAICS_BY_SECTOR, 
  getNaicsDefinition 
} from '../data/naicsDatabase';

const QUICK_PRESET_AGENCIES = [
  { name: 'DEPARTMENT OF DEFENSE', label: 'DOD (097)', displayName: 'Department of Defense (DOD) [Code: 097]' },
  { name: 'DEPT OF THE ARMY', label: 'Army (021)', displayName: 'Department of the Army (USA) [Code: 021]' },
  { name: 'DEPT OF THE NAVY', label: 'Navy (017)', displayName: 'Department of the Navy (USN) [Code: 017]' },
  { name: 'DEPARTMENT OF THE AIR FORCE', label: 'Air Force (057)', displayName: 'Department of the Air Force (USAF) [Code: 057]' },
  { name: 'DEPARTMENT OF VETERANS AFFAIRS', label: 'VA (036)', displayName: 'Department of Veterans Affairs (VA) [Code: 036]' },
  { name: 'DEPARTMENT OF HOMELAND SECURITY', label: 'DHS (070)', displayName: 'Department of Homeland Security (DHS) [Code: 070]' },
  { name: 'GENERAL SERVICES ADMINISTRATION', label: 'GSA (047)', displayName: 'General Services Administration (GSA) [Code: 047]' },
  { name: 'NATIONAL AERONAUTICS AND SPACE ADMINISTRATION', label: 'NASA (080)', displayName: 'NASA [Code: 080]' },
  { name: 'US ARMY CORPS OF ENGINEERS', label: 'USACE (096)', displayName: 'U.S. Army Corps of Engineers (USACE) [Code: 096]' },
  { name: 'FEDERAL AVIATION ADMINISTRATION', label: 'FAA (069)', displayName: 'Federal Aviation Administration (FAA) [Code: 069]' },
  { name: 'CYBERSECURITY AND INFRASTRUCTURE SECURITY AGENCY', label: 'CISA (070)', displayName: 'CISA [Code: 070]' },
  { name: 'DEPARTMENT OF HEALTH AND HUMAN SERVICES', label: 'HHS (075)', displayName: 'Health & Human Services (HHS) [Code: 075]' },
  { name: 'NATIONAL INSTITUTES OF HEALTH', label: 'NIH (075)', displayName: 'National Institutes of Health (NIH) [Code: 075]' },
  { name: 'DEPARTMENT OF AGRICULTURE', label: 'USDA (012)', displayName: 'Department of Agriculture (USDA) [Code: 012]' },
  { name: 'DEPARTMENT OF ENERGY', label: 'DOE (089)', displayName: 'Department of Energy (DOE) [Code: 089]' },
  { name: 'ENVIRONMENTAL PROTECTION AGENCY', label: 'EPA (068)', displayName: 'EPA [Code: 068]' },
  { name: 'INTERNAL REVENUE SERVICE', label: 'IRS (020)', displayName: 'Internal Revenue Service (IRS) [Code: 020]' },
  { name: 'SMALL BUSINESS ADMINISTRATION', label: 'SBA (073)', displayName: 'Small Business Administration (SBA) [Code: 073]' },
];

interface FilterBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  totalMatches: number;
  displayedCount?: number;
  currentPage?: number;
  totalPages?: number;
  onReset: () => void;
  primaryNaics?: string;
  viewMode?: 'cards' | 'table';
  setViewMode?: (mode: 'cards' | 'table') => void;
  totalSamDatabaseRecords?: number;
  onOpenApiWorkbench?: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  setFilters,
  totalMatches,
  displayedCount,
  currentPage,
  totalPages,
  onReset,
  primaryNaics,
  viewMode = 'table',
  setViewMode,
  totalSamDatabaseRecords,
  onOpenApiWorkbench,
}) => {
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const activeFiltersCount = [
    filters.searchQuery,
    filters.naicsFilter,
    filters.setAsideFilter !== 'All Set-Asides' ? filters.setAsideFilter : '',
    filters.stateFilter,
    filters.noticeTypeFilter,
    filters.agencyFilter,
    filters.dueWithinDays !== 'all' ? filters.dueWithinDays : '',
    filters.minFitScore > 0 ? `${filters.minFitScore}%+` : '',
  ].filter(Boolean).length;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, searchQuery: e.target.value }));
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5 mb-6 transition-all">
      {/* Primary Row: Search & Fast Filter Buttons */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search SAM.gov by keyword, solicitation #, agency / acronym (DOD, FAA, CISA), SOW..."
            value={filters.searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
          />
          {filters.searchQuery && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Federal Organization / Agency Quick Dropdown */}
        <div className="w-full sm:w-72 lg:w-80 shrink-0">
          <select
            value={filters.agencyFilter}
            onChange={(e) => setFilters((prev) => ({ ...prev, agencyFilter: e.target.value }))}
            className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white cursor-pointer truncate"
            title="Filter by any of the 115+ U.S. Federal Organizations"
          >
            <option value="">🏛️ All Federal Organizations ({FEDERAL_ORGANIZATIONS.length})</option>
            {FEDERAL_ORGANIZATION_CATEGORIES.map((cat) => {
              const orgsInCat = FEDERAL_ORGANIZATIONS.filter((o) => o.category === cat.id);
              return (
                <optgroup key={cat.id} label={`${cat.label} (${orgsInCat.length})`}>
                  {orgsInCat.map((org) => (
                    <option key={org.name} value={org.name}>
                      {org.displayName}
                    </option>
                  ))}
                </optgroup>
              );
            })}
          </select>
        </div>

        {/* Set-Aside Dropdown */}
        <div className="w-full sm:w-56">
          <select
            value={filters.setAsideFilter}
            onChange={(e) => setFilters((prev) => ({ ...prev, setAsideFilter: e.target.value }))}
            className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white cursor-pointer"
          >
            {SET_ASIDE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Industry / NAICS Quick Selector (naics.com directory synchronized) */}
        <div className="w-full sm:w-64 lg:w-72">
          <select
            value={filters.naicsFilter}
            onChange={(e) => setFilters((prev) => ({ ...prev, naicsFilter: e.target.value }))}
            className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white cursor-pointer truncate"
            title="Filter by NAICS Industry Code (Synchronized with NAICS.com Directory & Census Bureau)"
          >
            <option value="">🏢 All NAICS Industry Codes</option>
            {primaryNaics && (
              <option value={primaryNaics}>
                ⭐ Your Primary: {primaryNaics} - {getNaicsDefinition(primaryNaics).censusTitle}
              </option>
            )}
            {NAICS_BY_SECTOR.map((sector) => (
              <optgroup key={sector.sectorCode} label={`Sector ${sector.sectorCode}: ${sector.sectorTitle}`}>
                {sector.codes.map((n) => (
                  <option key={n.code} value={n.code}>
                    {n.code} - {n.censusTitle}{n.code === '541512' ? ' (Commercial & Gov)' : ''}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Filter Toggle & Reset */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium rounded-lg border transition cursor-pointer ${
              showAdvanced || activeFiltersCount > 0
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center ml-0.5">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {activeFiltersCount > 0 && (
            <button
              onClick={onReset}
              title="Reset all search filters"
              className="p-2.5 text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-200">
          {/* Location State */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>Place of Performance (State)</span>
            </label>
            <select
              value={filters.stateFilter}
              onChange={(e) => setFilters((prev) => ({ ...prev, stateFilter: e.target.value }))}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">All 50 States & Territories</option>
              {US_STATES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Response Deadline */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Response Deadline Window</span>
            </label>
            <select
              value={filters.dueWithinDays}
              onChange={(e) => setFilters((prev) => ({ ...prev, dueWithinDays: e.target.value }))}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">Any Active Deadline</option>
              <option value="7">Closing within 7 Days (Urgent)</option>
              <option value="14">Closing within 14 Days</option>
              <option value="30">Closing within 30 Days</option>
              <option value="60">Closing within 60 Days</option>
            </select>
          </div>

          {/* Notice Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-slate-500" />
              <span>SAM.gov Notice Type</span>
            </label>
            <select
              value={filters.noticeTypeFilter}
              onChange={(e) => setFilters((prev) => ({ ...prev, noticeTypeFilter: e.target.value }))}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">All Notice Types</option>
              <option value="Solicitation">Solicitation (RFP/IFB)</option>
              <option value="Presolicitation">Presolicitation</option>
              <option value="Sources Sought">Sources Sought / RFI</option>
              <option value="Combined Synopsis/Solicitation">Combined Synopsis/Solicitation</option>
            </select>
          </div>

          {/* Fit Score Match Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-blue-600" />
                <span>Min SBA Profile Fit Score</span>
              </span>
              <span className="font-mono text-blue-700 font-bold">
                {filters.minFitScore > 0 ? `${filters.minFitScore}%+` : 'Any'}
              </span>
            </label>
            <input
              type="range"
              min="0"
              max="90"
              step="10"
              value={filters.minFitScore}
              onChange={(e) => setFilters((prev) => ({ ...prev, minFitScore: Number(e.target.value) }))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
              <span>All</span>
              <span>50%</span>
              <span>70% (High)</span>
              <span>90% (Direct)</span>
            </div>
          </div>

          {/* Quick Federal Organization Presets Bar */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-4 pt-3 border-t border-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-blue-600" />
                <span>Popular Federal Organization Fast Filters ({FEDERAL_ORGANIZATIONS.length} available in dropdown above)</span>
              </span>
              {filters.agencyFilter && (
                <button
                  type="button"
                  onClick={() => setFilters((prev) => ({ ...prev, agencyFilter: '' }))}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium underline cursor-pointer"
                >
                  Clear Organization Filter
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {QUICK_PRESET_AGENCIES.map((preset) => {
                const isSelected = filters.agencyFilter === preset.name;
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setFilters((prev) => ({ ...prev, agencyFilter: isSelected ? '' : preset.name }))}
                    className={`text-[11px] font-medium px-2 py-1 rounded-md border transition cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-700 font-semibold shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                    title={preset.displayName}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Active Filter Chips & View Mode Toggle Row */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-slate-600 font-medium mr-1 flex flex-wrap items-center gap-1.5">
            <span>
              Showing <strong className="text-blue-700 font-mono font-bold">{displayedCount !== undefined ? displayedCount : totalMatches}</strong> of{' '}
              <strong className="text-slate-900 font-mono font-bold">{totalMatches}</strong> federal notices
              {totalPages && totalPages > 1 && currentPage && (
                <span className="text-slate-500 font-normal ml-1">
                  (Page <strong className="text-slate-800 font-mono">{currentPage}</strong> of <strong className="text-slate-800 font-mono">{totalPages}</strong>)
                </span>
              )}
            </span>
            {totalSamDatabaseRecords !== undefined && totalSamDatabaseRecords > 0 && (
              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200 text-[11px] font-medium flex items-center gap-1" title="All database notices currently stored in repository">
                <span>Database:</span>
                <strong className="text-blue-700 font-mono font-bold">{totalSamDatabaseRecords.toLocaleString()}</strong>
                <span>total</span>
              </span>
            )}
          </span>

          {onOpenApiWorkbench && (
            <button
              type="button"
              onClick={onOpenApiWorkbench}
              className="text-[11px] text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 font-medium flex items-center gap-1 transition cursor-pointer"
              title="Open SAM.gov API Specification & Alpha Test Environment Workbench"
            >
              <span>🧪 API Workbench</span>
            </button>
          )}

          {filters.statusFilter && filters.statusFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 bg-slate-800 text-white px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
              <span>Status: {filters.statusFilter.toUpperCase()}</span>
              <button
                onClick={() => setFilters((prev) => ({ ...prev, statusFilter: 'all' }))}
                className="hover:text-slate-300 ml-0.5 cursor-pointer"
                title="Reset to all notice statuses"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.agencyFilter && (
            <span className="inline-flex items-center gap-1 bg-cyan-100 text-cyan-800 px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
              <Building className="w-3 h-3 text-cyan-700" />
              <span>Org: {getFederalOrgDisplayName(filters.agencyFilter)}</span>
              <button
                onClick={() => setFilters((prev) => ({ ...prev, agencyFilter: '' }))}
                className="hover:text-cyan-950 ml-0.5 cursor-pointer"
                title="Clear Federal Organization filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.naicsFilter && (
            <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[11px] font-mono">
              NAICS: <strong className="font-semibold">{filters.naicsFilter}</strong> ({getNaicsDefinition(filters.naicsFilter).censusTitle})
              <button
                onClick={() => setFilters((prev) => ({ ...prev, naicsFilter: '' }))}
                className="hover:text-blue-900 cursor-pointer ml-0.5"
                title="Clear NAICS filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.setAsideFilter !== 'All Set-Asides' && (
            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[11px]">
              {filters.setAsideFilter}
              <button
                onClick={() => setFilters((prev) => ({ ...prev, setAsideFilter: 'All Set-Asides' }))}
                className="hover:text-emerald-900 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.stateFilter && (
            <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded text-[11px]">
              State: {filters.stateFilter}
              <button
                onClick={() => setFilters((prev) => ({ ...prev, stateFilter: '' }))}
                className="hover:text-indigo-900 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.dueWithinDays !== 'all' && (
            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[11px]">
              Due within {filters.dueWithinDays} days
              <button
                onClick={() => setFilters((prev) => ({ ...prev, dueWithinDays: 'all' }))}
                className="hover:text-amber-900 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.minFitScore > 0 && (
            <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-[11px]">
              Fit ≥ {filters.minFitScore}%
              <button
                onClick={() => setFilters((prev) => ({ ...prev, minFitScore: 0 }))}
                className="hover:text-purple-900 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>

        {/* View Switcher & Sort Selector */}
        <div className="flex items-center gap-3 ml-auto">
          {/* View Mode Switcher */}
          {setViewMode && (
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1 text-xs font-semibold rounded flex items-center gap-1 transition cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Table view with explicit Federal Organization column"
              >
                <TableProperties className="w-3.5 h-3.5" />
                <span>Table Ledger</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`px-2.5 py-1 text-xs font-semibold rounded flex items-center gap-1 transition cursor-pointer ${
                  viewMode === 'cards' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Card grid view"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Cards</span>
              </button>
            </div>
          )}

          {/* Sort selector */}
          <div className="flex items-center gap-1.5">
            <label className="text-slate-500 font-medium text-xs hidden sm:inline">Sort:</label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value as any }))}
              className="py-1 px-2.5 bg-slate-50 border border-slate-300 rounded text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
            >
              <optgroup label="SBA Opportunity Fit">
                <option value="fit_desc">Highest Fit Score (Best Match)</option>
                <option value="fit_asc">Lowest Fit Score</option>
              </optgroup>
              <optgroup label="Federal Organization">
                <option value="agency_asc">Federal Org (A-Z)</option>
                <option value="agency_desc">Federal Org (Z-A)</option>
              </optgroup>
              <optgroup label="Response Deadline">
                <option value="deadline_asc">Closing Soonest (Earliest Deadline)</option>
                <option value="deadline_desc">Closing Latest (Furthest Deadline)</option>
              </optgroup>
              <optgroup label="Posted Date">
                <option value="posted_desc">Recently Posted (Newest)</option>
                <option value="posted_asc">Oldest Posted</option>
              </optgroup>
              <optgroup label="Contract Value & Size">
                <option value="value_desc">Contract Value / Ceiling (High to Low)</option>
                <option value="value_asc">Contract Value / Ceiling (Low to High)</option>
              </optgroup>
              <optgroup label="Notice Title & Number">
                <option value="title_asc">Solicitation Title (A-Z)</option>
                <option value="title_desc">Solicitation Title (Z-A)</option>
                <option value="solnum_asc">Solicitation Number (A-Z)</option>
                <option value="solnum_desc">Solicitation Number (Z-A)</option>
              </optgroup>
              <optgroup label="Industry NAICS">
                <option value="naics_asc">NAICS Code (Ascending)</option>
                <option value="naics_desc">NAICS Code (Descending)</option>
              </optgroup>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
