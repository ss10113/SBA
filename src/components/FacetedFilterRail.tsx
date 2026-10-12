import React, { useState, useMemo } from 'react';
import { 
  Search, 
  X, 
  MapPin, 
  Building, 
  Target, 
  RotateCcw, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  SlidersHorizontal,
  ExternalLink,
  Layers
} from 'lucide-react';
import { FilterState, BusinessProfile, OpportunityStatus } from '../types/contract';
import { 
  SET_ASIDE_OPTIONS, 
  US_STATES_LIST, 
  US_TERRITORIES, 
  US_MILITARY_OVERSEAS, 
  POPULAR_NAICS,
  getPopularCitiesForJurisdiction
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

export const TOP_AGENCY_SHORTCUTS = [
  { name: 'DEPARTMENT OF DEFENSE', short: 'DOD' },
  { name: 'DEPT OF THE ARMY', short: 'Army' },
  { name: 'DEPT OF THE NAVY', short: 'Navy' },
  { name: 'DEPARTMENT OF THE AIR FORCE', short: 'Air Force' },
  { name: 'DEPARTMENT OF VETERANS AFFAIRS', short: 'VA' },
  { name: 'DEPARTMENT OF HOMELAND SECURITY', short: 'DHS' },
  { name: 'GENERAL SERVICES ADMINISTRATION', short: 'GSA' },
  { name: 'NATIONAL AERONAUTICS AND SPACE ADMINISTRATION', short: 'NASA' },
  { name: 'DEPARTMENT OF HEALTH AND HUMAN SERVICES', short: 'HHS' },
];

interface FacetedFilterRailProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  totalMatches: number;
  totalSamDatabaseRecords: number;
  databaseStats: {
    total: number;
    active: number;
    inactive: number;
    awarded: number;
  };
  currentProfile: BusinessProfile;
  profiles: BusinessProfile[];
  onSelectProfile: (profile: BusinessProfile) => void;
  onReset: () => void;
  availableCities?: { city: string; state: string; count: number }[];
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const FacetedFilterRail: React.FC<FacetedFilterRailProps> = ({
  filters,
  setFilters,
  totalMatches,
  totalSamDatabaseRecords,
  databaseStats,
  currentProfile,
  profiles,
  onSelectProfile,
  onReset,
  availableCities = [],
  isMobileOpen = false,
  onCloseMobile,
}) => {
  // Collapsible sections
  const [openSections, setOpenSections] = useState({
    status: true,
    agency: true,
    setAside: true,
    naics: true,
    location: false,
    valueFit: false,
    urgency: false,
  });

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const activeFiltersCount = [
    filters.searchQuery,
    filters.naicsFilter,
    filters.setAsideFilter !== 'All Set-Asides' ? filters.setAsideFilter : '',
    filters.stateFilter,
    filters.cityFilter,
    filters.noticeTypeFilter,
    filters.agencyFilter,
    filters.statusFilter !== 'all' ? filters.statusFilter : '',
    filters.dueWithinDays !== 'all' ? filters.dueWithinDays : '',
    filters.minFitScore > 0 ? `${filters.minFitScore}%+` : '',
    filters.verifiedOnly ? 'verified-only' : '',
    filters.minVal > 0 || filters.maxVal < 100000000 ? 'val-range' : '',
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

  const content = (
    <div className="space-y-4 text-xs text-slate-700">
      {/* Rail Header with Active Count & Reset */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-blue-600" />
          <span className="font-bold text-slate-900 text-sm">Filters & Facets</span>
          {activeFiltersCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white font-bold text-[10px]">
              {activeFiltersCount}
            </span>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Instant Search Bar */}
      <div>
        <label className="font-semibold text-slate-900 block mb-1 text-[11px]">
          Keyword & Notice Search
        </label>
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search keywords, solicitations, acronyms..."
            value={filters.searchQuery}
            onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
            className="w-full pl-8 pr-7 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
          />
          {filters.searchQuery && (
            <button
              type="button"
              onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* FACET 1: Notice Status (Amazon Radio Style) */}
      <div className="pt-2 border-t border-slate-200/80">
        <button
          type="button"
          onClick={() => toggleSection('status')}
          className="w-full flex items-center justify-between font-bold text-slate-900 mb-2 py-0.5 text-left"
        >
          <span>Notice Status</span>
          {openSections.status ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
        </button>

        {openSections.status && (
          <div className="space-y-1 pl-0.5">
            {[
              { id: 'all', label: 'All Solicitations', count: databaseStats.total },
              { id: 'active', label: 'Active Open Notices', count: databaseStats.active, dot: 'bg-emerald-500' },
              { id: 'inactive', label: 'Closed / Inactive', count: databaseStats.inactive, dot: 'bg-slate-400' },
              { id: 'awarded', label: 'Awarded Contracts', count: databaseStats.awarded, dot: 'bg-amber-500' },
            ].map((st) => {
              const checked = (filters.statusFilter || 'all') === st.id;
              return (
                <label
                  key={st.id}
                  className={`flex items-center justify-between p-1.5 rounded-md cursor-pointer transition ${
                    checked ? 'bg-blue-50/80 text-blue-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="rail-status-filter"
                      checked={checked}
                      onChange={() => setFilters((prev) => ({ ...prev, statusFilter: st.id as any }))}
                      className="text-blue-600 focus:ring-blue-500 rounded-full"
                    />
                    <div className="flex items-center gap-1.5">
                      {st.dot && <span className={`w-2 h-2 rounded-full ${st.dot}`} />}
                      <span className="text-xs">{st.label}</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                    {st.count}
                  </span>
                </label>
              );
            })}

            {/* Verified Direct Link Checkbox */}
            <div className="pt-1.5 mt-1 border-t border-slate-100">
              <label className="flex items-center justify-between p-1.5 rounded-md cursor-pointer hover:bg-slate-50 text-slate-700">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={Boolean(filters.verifiedOnly)}
                    onChange={(e) => setFilters((prev) => ({ ...prev, verifiedOnly: e.target.checked }))}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-medium text-slate-800">Verified SAM.gov Link Only</span>
                </div>
                <span className="text-[10px] text-emerald-700 font-mono font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  LIVE
                </span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* FACET 2: Target Agency & Department */}
      <div className="pt-2 border-t border-slate-200/80">
        <button
          type="button"
          onClick={() => toggleSection('agency')}
          className="w-full flex items-center justify-between font-bold text-slate-900 mb-2 py-0.5 text-left"
        >
          <span>Federal Agency</span>
          {openSections.agency ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
        </button>

        {openSections.agency && (
          <div className="space-y-2">
            {/* Quick agency buttons */}
            <div className="flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, agencyFilter: '' }))}
                className={`px-2 py-1 rounded text-[11px] font-medium border transition cursor-pointer ${
                  !filters.agencyFilter
                    ? 'bg-blue-600 text-white border-blue-700'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                All
              </button>
              {TOP_AGENCY_SHORTCUTS.map((ag) => {
                const isActive = filters.agencyFilter === ag.name;
                return (
                  <button
                    key={ag.name}
                    type="button"
                    onClick={() => setFilters((prev) => ({ ...prev, agencyFilter: isActive ? '' : ag.name }))}
                    className={`px-2 py-1 rounded text-[11px] font-medium border transition cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white border-blue-700'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {ag.short}
                  </button>
                );
              })}
            </div>

            {/* Comprehensive 115+ Federal Organization select */}
            <select
              value={filters.agencyFilter}
              onChange={(e) => setFilters((prev) => ({ ...prev, agencyFilter: e.target.value }))}
              className="w-full py-1.5 px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white truncate"
            >
              <option value="">🏛️ All Federal Organizations (115+)</option>
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
        )}
      </div>

      {/* FACET 3: Small Business Program (Set-Aside) */}
      <div className="pt-2 border-t border-slate-200/80">
        <button
          type="button"
          onClick={() => toggleSection('setAside')}
          className="w-full flex items-center justify-between font-bold text-slate-900 mb-2 py-0.5 text-left"
        >
          <span>SBA Set-Aside Program</span>
          {openSections.setAside ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
        </button>

        {openSections.setAside && (
          <div className="space-y-1">
            {SET_ASIDE_OPTIONS.map((opt) => {
              const checked = filters.setAsideFilter === opt;
              return (
                <label
                  key={opt}
                  className={`flex items-center gap-2 p-1.5 rounded-md cursor-pointer transition text-xs ${
                    checked ? 'bg-blue-50/80 text-blue-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="rail-setaside-filter"
                    checked={checked}
                    onChange={() => setFilters((prev) => ({ ...prev, setAsideFilter: opt }))}
                    className="text-blue-600 focus:ring-blue-500 rounded-full"
                  />
                  <span className="truncate">{opt}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* FACET 4: Industry & Primary NAICS */}
      <div className="pt-2 border-t border-slate-200/80">
        <button
          type="button"
          onClick={() => toggleSection('naics')}
          className="w-full flex items-center justify-between font-bold text-slate-900 mb-2 py-0.5 text-left"
        >
          <span>Industry & NAICS</span>
          {openSections.naics ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
        </button>

        {openSections.naics && (
          <div className="space-y-2">
            {currentProfile.primaryNaics && (
              <button
                type="button"
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    naicsFilter: prev.naicsFilter === currentProfile.primaryNaics ? '' : currentProfile.primaryNaics,
                  }))
                }
                className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                  filters.naicsFilter === currentProfile.primaryNaics
                    ? 'bg-blue-600 text-white border-blue-700'
                    : 'bg-blue-50 hover:bg-blue-100 text-blue-900 border-blue-200'
                }`}
              >
                <span>⭐ My NAICS: {currentProfile.primaryNaics}</span>
                <span className="text-[10px] opacity-80">
                  {filters.naicsFilter === currentProfile.primaryNaics ? 'Active' : 'Select'}
                </span>
              </button>
            )}

            <select
              value={filters.naicsFilter}
              onChange={(e) => setFilters((prev) => ({ ...prev, naicsFilter: e.target.value }))}
              className="w-full py-1.5 px-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white truncate"
            >
              <option value="">🏢 All NAICS Industry Codes</option>
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
        )}
      </div>

      {/* FACET 5: Performance Geography (State & City) */}
      <div className="pt-2 border-t border-slate-200/80">
        <button
          type="button"
          onClick={() => toggleSection('location')}
          className="w-full flex items-center justify-between font-bold text-slate-900 mb-2 py-0.5 text-left"
        >
          <span>Performance Location</span>
          {openSections.location ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
        </button>

        {openSections.location && (
          <div className="space-y-2">
            <select
              value={filters.stateFilter}
              onChange={(e) => setFilters((prev) => ({ ...prev, stateFilter: e.target.value, cityFilter: '' }))}
              className="w-full py-1.5 px-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            >
              <option value="">📍 All States & Jurisdictions</option>
              <option value="ALL_TERRITORIES">🏝️ All Territories (PR, GU, VI, AS, MP)</option>
              <option value="ALL_50_STATES">🇺🇸 All 50 U.S. States</option>
              <optgroup label="U.S. States">
                {US_STATES_LIST.map((st) => (
                  <option key={st.code} value={st.code}>
                    {st.name} ({st.code})
                  </option>
                ))}
              </optgroup>
              <optgroup label="U.S. Territories">
                {US_TERRITORIES.map((t) => (
                  <option key={t.code} value={t.code}>
                    {t.name} ({t.code})
                  </option>
                ))}
              </optgroup>
              <optgroup label="Military Overseas">
                {US_MILITARY_OVERSEAS.map((m) => (
                  <option key={m.code} value={m.code}>
                    {m.name} ({m.code})
                  </option>
                ))}
              </optgroup>
            </select>

            {/* City input & popular cities */}
            {popularCitiesForSelected.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Popular Cities:</span>
                <div className="flex flex-wrap gap-1">
                  {popularCitiesForSelected.map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          cityFilter: prev.cityFilter === city ? '' : city,
                        }))
                      }
                      className={`px-1.5 py-0.5 rounded text-[10px] border transition cursor-pointer ${
                        filters.cityFilter === city
                          ? 'bg-blue-600 text-white border-blue-700'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FACET 6: Fit Score & Ceiling Value */}
      <div className="pt-2 border-t border-slate-200/80">
        <button
          type="button"
          onClick={() => toggleSection('valueFit')}
          className="w-full flex items-center justify-between font-bold text-slate-900 mb-2 py-0.5 text-left"
        >
          <span>Fit Score & Ceiling Value</span>
          {openSections.valueFit ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
        </button>

        {openSections.valueFit && (
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] font-semibold text-slate-700">Min. SBA Fit Score</span>
                <span className="font-mono text-xs font-bold text-blue-700">{filters.minFitScore}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="90"
                step="10"
                value={filters.minFitScore}
                onChange={(e) => setFilters((prev) => ({ ...prev, minFitScore: parseInt(e.target.value, 10) }))}
                className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0% (All)</span>
                <span>50%</span>
                <span>70%+</span>
                <span>90%+</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-700 block">Ceiling Magnitude</span>
              <div className="grid grid-cols-2 gap-1 text-[11px]">
                {[
                  { label: '< $1M', min: 0, max: 1000000 },
                  { label: '$1M - $5M', min: 1000000, max: 5000000 },
                  { label: '$5M - $25M', min: 5000000, max: 25000000 },
                  { label: '$25M+', min: 25000000, max: 100000000 },
                ].map((val) => {
                  const isMatch = filters.minVal === val.min && filters.maxVal === val.max;
                  return (
                    <button
                      key={val.label}
                      type="button"
                      onClick={() =>
                        setFilters((prev) =>
                          isMatch
                            ? { ...prev, minVal: 0, maxVal: 100000000 }
                            : { ...prev, minVal: val.min, maxVal: val.max }
                        )
                      }
                      className={`px-2 py-1.5 rounded border text-center transition cursor-pointer font-medium ${
                        isMatch
                          ? 'bg-blue-600 text-white border-blue-700 font-semibold'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {val.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Profile Info Card at Bottom of Rail */}
      <div className="pt-3 border-t border-slate-200/80 bg-slate-50/70 p-3 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Active SBA Profile</span>
          <span className="text-[10px] font-mono font-bold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
            CAGE {currentProfile.cageCode}
          </span>
        </div>
        <p className="font-bold text-slate-900 text-xs truncate" title={currentProfile.companyName}>
          {currentProfile.companyName}
        </p>
        <p className="text-[11px] text-slate-500 truncate">
          Primary NAICS: <strong className="font-mono text-slate-800">{currentProfile.primaryNaics}</strong>
        </p>

        {/* Preset Switcher */}
        {profiles.length > 1 && (
          <div className="mt-2 pt-2 border-t border-slate-200">
            <span className="text-[10px] text-slate-400 block mb-1">Switch Contractor Preset:</span>
            <select
              value={currentProfile.id}
              onChange={(e) => {
                const found = profiles.find((p) => p.id === e.target.value);
                if (found) onSelectProfile(found);
              }}
              className="w-full text-[11px] py-1 px-1.5 bg-white border border-slate-300 rounded text-slate-800 font-medium"
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.companyName} (CAGE: {p.cageCode})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Rail */}
      <div className="hidden lg:block bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sticky top-24">
        {content}
      </div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={onCloseMobile} />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl p-5 overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                <span className="font-bold text-base text-slate-900">Refine Solicitations</span>
                <button
                  type="button"
                  onClick={onCloseMobile}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {content}
            </div>

            <div className="pt-4 border-t border-slate-200 mt-6">
              <button
                type="button"
                onClick={onCloseMobile}
                className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-bold text-xs"
              >
                Apply Filters ({totalMatches} matches)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
