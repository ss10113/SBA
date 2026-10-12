import React, { useMemo } from 'react';
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
  TableProperties,
  Globe,
  Compass
} from 'lucide-react';
import { FilterState } from '../types/contract';
import { 
  POPULAR_NAICS, 
  SET_ASIDE_OPTIONS, 
  US_STATES,
  US_TERRITORIES,
  US_STATES_LIST,
  US_MILITARY_OVERSEAS,
  getJurisdictionName,
  getPopularCitiesForJurisdiction,
  isTerritory
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
  availableCities?: { city: string; state: string; count: number }[];
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
  availableCities = [],
}) => {
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const activeFiltersCount = [
    filters.searchQuery,
    filters.naicsFilter,
    filters.setAsideFilter !== 'All Set-Asides' ? filters.setAsideFilter : '',
    filters.stateFilter,
    filters.cityFilter,
    filters.noticeTypeFilter,
    filters.agencyFilter,
    filters.dueWithinDays !== 'all' ? filters.dueWithinDays : '',
    filters.minFitScore > 0 ? `${filters.minFitScore}%+` : '',
    filters.verifiedOnly ? 'verified-live-only' : '',
  ].filter(Boolean).length;

  const popularCitiesForSelected = useMemo(() => {
    if (!filters.stateFilter || filters.stateFilter === 'all' || filters.stateFilter === 'ALL') {
      return [];
    }
    if (filters.stateFilter === 'ALL_TERRITORIES') {
      return ['San Juan', 'Santa Rita', 'St. Thomas', 'Pago Pago', 'Saipan'];
    }
    return getPopularCitiesForJurisdiction(filters.stateFilter);
  }, [filters.stateFilter]);

  const citySuggestions = useMemo(() => {
    if (!availableCities || availableCities.length === 0) return [];
    if (!filters.stateFilter || filters.stateFilter === 'all' || filters.stateFilter === 'ALL') {
      return availableCities.slice(0, 50);
    }
    if (filters.stateFilter === 'ALL_TERRITORIES') {
      return availableCities.filter((c: { city: string; state: string; count: number }) =>
        ['PR', 'GU', 'VI', 'AS', 'MP', 'UM'].includes(c.state.toUpperCase())
      );
    }
    if (filters.stateFilter === 'ALL_50_STATES') {
      return availableCities.filter((c: { city: string; state: string; count: number }) =>
        !['PR', 'GU', 'VI', 'AS', 'MP', 'UM'].includes(c.state.toUpperCase())
      );
    }
    return availableCities.filter((c: { city: string; state: string; count: number }) =>
      c.state.toUpperCase() === filters.stateFilter.toUpperCase()
    );
  }, [availableCities, filters.stateFilter]);

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
                ⭐ Primary: {primaryNaics}
              </option>
            )}
            {NAICS_BY_SECTOR.map((sector) => (
              <optgroup key={sector.sectorCode} label={`Sector ${sector.sectorCode}: ${sector.sectorTitle}`}>
                {sector.codes.map((n) => (
                  <option key={n.code} value={n.code}>
                    {n.code}
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
        <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 animate-in fade-in duration-200">
          {/* Location: State & U.S. Territories */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span>State & U.S. Territory</span>
              </span>
              {filters.stateFilter && (
                <button
                  type="button"
                  onClick={() => setFilters((prev) => ({ ...prev, stateFilter: '' }))}
                  className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                >
                  Clear
                </button>
              )}
            </label>
            <select
              value={filters.stateFilter}
              onChange={(e) => setFilters((prev) => ({ ...prev, stateFilter: e.target.value }))}
              className="w-full py-2 px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium cursor-pointer"
            >
              <option value="">🌐 All 50 States & All Territories</option>
              <option value="ALL_TERRITORIES">🏝️ All U.S. Territories (PR, GU, VI, AS, MP, UM)</option>
              <option value="ALL_50_STATES">🇺🇸 All 50 U.S. States & D.C.</option>
              <optgroup label="🏝️ U.S. Territories (6)">
                {US_TERRITORIES.map((t) => (
                  <option key={t.code} value={t.code}>
                    {t.name} ({t.code})
                  </option>
                ))}
              </optgroup>
              <optgroup label="🇺🇸 U.S. States (50) & District of Columbia">
                {US_STATES_LIST.map((st) => (
                  <option key={st.code} value={st.code}>
                    {st.name} ({st.code})
                  </option>
                ))}
              </optgroup>
              <optgroup label="🌍 Military Overseas & Forward Regions">
                {US_MILITARY_OVERSEAS.map((m) => (
                  <option key={m.code} value={m.code}>
                    {m.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Location: City / Local Area Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>City / Metro Area</span>
              </span>
              {filters.cityFilter && (
                <button
                  type="button"
                  onClick={() => setFilters((prev) => ({ ...prev, cityFilter: '' }))}
                  className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                >
                  Clear
                </button>
              )}
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder={
                  filters.stateFilter === 'PR' ? 'e.g. San Juan, Guaynabo' :
                  filters.stateFilter === 'GU' ? 'e.g. Santa Rita, Yigo' :
                  filters.stateFilter === 'VI' ? 'e.g. St. Thomas, St. Croix' :
                  'Filter by city...'
                }
                value={filters.cityFilter || ''}
                onChange={(e) => setFilters((prev) => ({ ...prev, cityFilter: e.target.value }))}
                list="filterbar-cities-list"
                className="w-full py-2 pl-2.5 pr-7 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              {filters.cityFilter && (
                <button
                  type="button"
                  onClick={() => setFilters((prev) => ({ ...prev, cityFilter: '' }))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  title="Clear city filter"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <datalist id="filterbar-cities-list">
              {citySuggestions.map((c: { city: string; state: string; count: number }) => (
                <option key={`${c.city}-${c.state}`} value={c.city}>
                  {c.city}, {c.state} ({c.count} notices)
                </option>
              ))}
            </datalist>
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
                <span>Min Fit Score</span>
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

          {/* Territorial & Regional Quick Selector Row */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-5 pt-3 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-500 font-medium flex items-center gap-1 mr-1">
                <Compass className="w-3.5 h-3.5 text-blue-600" />
                <span>Quick Location:</span>
              </span>
              <button
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, stateFilter: '', cityFilter: '' }))}
                className={`px-2.5 py-1 rounded text-[11px] font-medium border transition cursor-pointer ${
                  !filters.stateFilter ? 'bg-blue-600 text-white border-blue-700 shadow-2xs font-semibold' : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                Nationwide
              </button>
              <button
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, stateFilter: 'ALL_TERRITORIES', cityFilter: '' }))}
                className={`px-2.5 py-1 rounded text-[11px] font-medium border transition cursor-pointer ${
                  filters.stateFilter === 'ALL_TERRITORIES' ? 'bg-indigo-600 text-white border-indigo-700 shadow-2xs font-semibold' : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                🏝️ All Territories
              </button>
              <button
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, stateFilter: 'PR', cityFilter: '' }))}
                className={`px-2 py-1 rounded text-[11px] font-medium border transition cursor-pointer ${
                  filters.stateFilter === 'PR' ? 'bg-blue-600 text-white border-blue-700 shadow-2xs font-semibold' : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                🇵🇷 PR
              </button>
              <button
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, stateFilter: 'GU', cityFilter: '' }))}
                className={`px-2 py-1 rounded text-[11px] font-medium border transition cursor-pointer ${
                  filters.stateFilter === 'GU' ? 'bg-blue-600 text-white border-blue-700 shadow-2xs font-semibold' : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                🇬🇺 GU
              </button>
              <button
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, stateFilter: 'VI', cityFilter: '' }))}
                className={`px-2 py-1 rounded text-[11px] font-medium border transition cursor-pointer ${
                  filters.stateFilter === 'VI' ? 'bg-blue-600 text-white border-blue-700 shadow-2xs font-semibold' : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                🇻🇮 VI
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-500 font-medium flex items-center gap-1 mr-1">
                <Building className="w-3.5 h-3.5 text-blue-600" />
                <span>Quick Agency:</span>
              </span>
              {[
                { name: 'DEPARTMENT OF DEFENSE', label: 'DOD' },
                { name: 'DEPT OF THE ARMY', label: 'Army' },
                { name: 'DEPT OF THE NAVY', label: 'Navy' },
                { name: 'DEPARTMENT OF HOMELAND SECURITY', label: 'DHS' },
                { name: 'DEPARTMENT OF VETERANS AFFAIRS', label: 'VA' },
              ].map((a) => {
                const isSelected = filters.agencyFilter === a.name;
                return (
                  <button
                    key={a.name}
                    type="button"
                    onClick={() => setFilters((prev) => ({ ...prev, agencyFilter: isSelected ? '' : a.name }))}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium border transition cursor-pointer ${
                      isSelected ? 'bg-blue-600 text-white border-blue-700 shadow-2xs font-semibold' : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {a.label}
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

          <button
            type="button"
            onClick={() => setFilters((prev) => ({ ...prev, verifiedOnly: !prev.verifiedOnly }))}
            className={`text-[11px] font-semibold px-2.5 py-0.5 rounded border transition cursor-pointer flex items-center gap-1.5 ${
              filters.verifiedOnly
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs font-bold'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
            }`}
            title="Filter to show only contracts with direct, verified live links on official SAM.gov portal"
          >
            <span className={`w-2 h-2 rounded-full ${filters.verifiedOnly ? 'bg-white' : 'bg-emerald-500 animate-pulse'}`} />
            <span>Verified Live Site Links</span>
          </button>

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
              NAICS: <strong className="font-semibold">{filters.naicsFilter}</strong>
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
            <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-900 px-2.5 py-0.5 rounded-full text-[11px] font-medium">
              <Globe className="w-3 h-3 text-indigo-700" />
              <span>
                {filters.stateFilter === 'ALL_TERRITORIES'
                  ? 'Scope: All U.S. Territories (PR, GU, VI, AS, MP, UM)'
                  : filters.stateFilter === 'ALL_50_STATES'
                  ? 'Scope: 50 States & D.C.'
                  : `${getJurisdictionName(filters.stateFilter)} (${filters.stateFilter})`}
              </span>
              <button
                onClick={() => setFilters((prev) => ({ ...prev, stateFilter: '' }))}
                className="hover:text-indigo-950 cursor-pointer ml-0.5"
                title="Clear state/territory filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.cityFilter && (
            <span className="inline-flex items-center gap-1 bg-violet-100 text-violet-900 px-2.5 py-0.5 rounded-full text-[11px] font-medium">
              <MapPin className="w-3 h-3 text-violet-700" />
              <span>City: {filters.cityFilter}</span>
              <button
                onClick={() => setFilters((prev) => ({ ...prev, cityFilter: '' }))}
                className="hover:text-violet-950 cursor-pointer ml-0.5"
                title="Clear city filter"
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

          {filters.verifiedOnly && (
            <span className="inline-flex items-center gap-1 bg-emerald-600 text-white px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse" />
              <span>Verified SAM.gov Live Links Only</span>
              <button
                onClick={() => setFilters((prev) => ({ ...prev, verifiedOnly: false }))}
                className="hover:text-emerald-200 ml-0.5 cursor-pointer"
                title="Show all records"
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
