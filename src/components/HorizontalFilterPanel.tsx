import React, { useState, useMemo } from 'react';
import { 
  Search, 
  X, 
  MapPin, 
  Building, 
  Target, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Clock, 
  SlidersHorizontal,
  Building2,
  Check
} from 'lucide-react';
import { FilterState, BusinessProfile } from '../types/contract.ts';
import { 
  SET_ASIDE_OPTIONS, 
  POPULAR_NAICS 
} from '../data/samCuratedData.ts';
import { US_STATE_CODES } from '../data/usJurisdictions.ts';
import { 
  FEDERAL_ORGANIZATIONS, 
  FEDERAL_ORGANIZATION_CATEGORIES, 
  getFederalOrgDisplayName 
} from '../data/federalOrganizations.ts';

const QUICK_AGENCY_PILLS = [
  { name: 'DEPARTMENT OF DEFENSE', label: 'DOD' },
  { name: 'DEPT OF THE ARMY', label: 'Army' },
  { name: 'DEPT OF THE NAVY', label: 'Navy' },
  { name: 'DEPARTMENT OF THE AIR FORCE', label: 'Air Force' },
  { name: 'DEPARTMENT OF VETERANS AFFAIRS', label: 'VA' },
  { name: 'DEPARTMENT OF HOMELAND SECURITY', label: 'DHS' },
  { name: 'GENERAL SERVICES ADMINISTRATION', label: 'GSA' },
  { name: 'NATIONAL AERONAUTICS AND SPACE ADMINISTRATION', label: 'NASA' },
  { name: 'DEPARTMENT OF HEALTH AND HUMAN SERVICES', label: 'HHS' },
];

interface HorizontalFilterPanelProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  totalMatches: number;
  totalSamDatabaseRecords?: number;
  databaseStats?: any;
  currentProfile: BusinessProfile;
  profiles?: BusinessProfile[];
  onSelectProfile?: (profile: BusinessProfile) => void;
  onReset: () => void;
  availableCities?: { city: string; state: string; count: number }[];
}

export const HorizontalFilterPanel: React.FC<HorizontalFilterPanelProps> = ({
  filters,
  setFilters,
  totalMatches,
  totalSamDatabaseRecords,
  databaseStats,
  currentProfile,
  profiles = [],
  onSelectProfile,
  onReset,
  availableCities = [],
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Calculate active filter count
  const activeCount = useMemo(() => {
    let count = 0;
    if (filters.searchQuery.trim()) count++;
    if (filters.agencyFilter && filters.agencyFilter !== 'All Federal Organizations') count++;
    if (filters.setAsideFilter && filters.setAsideFilter !== 'All Set-Asides') count++;
    if (filters.naicsFilter) count++;
    if (filters.stateFilter && filters.stateFilter !== 'all' && filters.stateFilter !== 'ALL_50_STATES' && filters.stateFilter !== 'ALL_TERRITORIES') count++;
    if (filters.cityFilter) count++;
    if (filters.noticeTypeFilter && filters.noticeTypeFilter !== 'all') count++;
    if (filters.minFitScore > 0) count++;
    if (filters.statusFilter && filters.statusFilter === 'active') count++;
    if (filters.verifiedOnly) count++;
    if (filters.minVal > 0 || filters.maxVal > 0) count++;
    return count;
  }, [filters]);

  const handleAgencySelect = (agencyName: string) => {
    setFilters((prev: FilterState) => ({
      ...prev,
      agencyFilter: prev.agencyFilter === agencyName ? 'All Federal Organizations' : agencyName,
    }));
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden text-xs text-slate-800 transition-all duration-200">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 px-4 sm:px-5 py-3 text-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-500/20 border border-blue-400/30 text-blue-300 shrink-0">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm tracking-tight text-white whitespace-nowrap">Filter & Refine Solicitations</h3>
              {activeCount > 0 && (
                <span className="bg-blue-600 text-white font-mono font-bold px-2 py-0.5 rounded-full text-[11px] shadow-2xs">
                  {activeCount} active
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-300">
              Filter federal contract opportunities horizontally across agencies, NAICS codes, set-asides, and location
            </p>
          </div>
        </div>

        {/* Profile Selector & Controls */}
        <div className="flex items-center gap-2.5 ml-auto flex-wrap">
          {profiles.length > 0 && onSelectProfile && (
            <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/80 rounded-lg px-2.5 py-1 text-[11px]">
              <Target className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-slate-300 font-medium hidden md:inline">Profile:</span>
              <select
                value={currentProfile.id}
                onChange={(e) => {
                  const selected = profiles.find((p) => p.id === e.target.value);
                  if (selected) onSelectProfile(selected);
                }}
                className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer pr-1"
              >
                {profiles.map((p) => (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                    {p.companyName} ({p.certifications?.[0] || 'Small Biz'})
                  </option>
                ))}
              </select>
            </div>
          )}

          {activeCount > 0 && (
            <button
              onClick={onReset}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg border border-slate-700 text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title="Reset all filters to defaults"
            >
              <RotateCcw className="w-3 h-3 text-amber-400" />
              <span>Reset All</span>
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition cursor-pointer flex items-center gap-1 text-[11px] font-medium"
            title={isExpanded ? 'Collapse filter window' : 'Expand filter window'}
          >
            <span>{isExpanded ? 'Hide Controls' : 'Show Controls'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Horizontal Controls */}
      {isExpanded && (
        <div className="p-3 sm:p-3.5 space-y-2.5 bg-slate-50/50">
          {/* Grid Row 1: Primary Horizontal Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* 1. Keyword Search */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>Search / Title</span>
                {filters.searchQuery && (
                  <button
                    onClick={() => setFilters((prev: FilterState) => ({ ...prev, searchQuery: '' }))}
                    className="text-slate-400 hover:text-slate-700 text-[10px]"
                  >
                    Clear
                  </button>
                )}
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Solicitation # or keywords..."
                  value={filters.searchQuery}
                  onChange={(e) => setFilters((prev: FilterState) => ({ ...prev, searchQuery: e.target.value }))}
                  className="w-full pl-8 pr-7 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                />
                {filters.searchQuery && (
                  <button
                    onClick={() => setFilters((prev: FilterState) => ({ ...prev, searchQuery: '' }))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* 2. Target Federal Agency */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <Building2 className="w-3 h-3 text-blue-600" />
                <span>Federal Agency</span>
              </label>
              <select
                value={filters.agencyFilter || 'All Federal Organizations'}
                onChange={(e) => setFilters((prev: FilterState) => ({ ...prev, agencyFilter: e.target.value }))}
                className={`w-full px-2.5 py-1.5 bg-white border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer truncate ${
                  filters.agencyFilter && filters.agencyFilter !== 'All Federal Organizations'
                    ? 'border-blue-500 text-blue-900 font-semibold bg-blue-50/50'
                    : 'border-slate-300 text-slate-800'
                }`}
              >
                <option value="All Federal Organizations">🏛️ All Organizations (115+ Orgs)</option>
                {FEDERAL_ORGANIZATIONS.map((org: any) => (
                  <option key={org.name} value={org.name}>
                    {org.acronym ? `[${org.acronym}] ${org.name}` : org.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. SBA Set-Aside Program */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <Building className="w-3 h-3 text-emerald-600" />
                <span>Set-Aside Program</span>
              </label>
              <select
                value={filters.setAsideFilter || 'All Set-Asides'}
                onChange={(e) => setFilters((prev: FilterState) => ({ ...prev, setAsideFilter: e.target.value }))}
                className={`w-full px-2.5 py-1.5 bg-white border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer truncate ${
                  filters.setAsideFilter && filters.setAsideFilter !== 'All Set-Asides'
                    ? 'border-emerald-500 text-emerald-900 font-semibold bg-emerald-50/50'
                    : 'border-slate-300 text-slate-800'
                }`}
              >
                {SET_ASIDE_OPTIONS.map((opt: string) => (
                  <option key={opt} value={opt}>
                    {opt === 'All Set-Asides' ? '🏷️ All Set-Asides & Unrestricted' : opt}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Industry NAICS Code */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <Target className="w-3 h-3 text-indigo-600" />
                <span>NAICS Industry Code</span>
              </label>
              <select
                value={filters.naicsFilter || ''}
                onChange={(e) => setFilters((prev: FilterState) => ({ ...prev, naicsFilter: e.target.value }))}
                className={`w-full px-2.5 py-1.5 bg-white border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer truncate ${
                  filters.naicsFilter
                    ? 'border-indigo-500 text-indigo-900 font-semibold bg-indigo-50/50'
                    : 'border-slate-300 text-slate-800'
                }`}
              >
                <option value="">🎯 All NAICS Codes ({POPULAR_NAICS.length} Codes)</option>
                {POPULAR_NAICS.map((naics: any) => (
                  <option key={naics.code} value={naics.code}>
                    {naics.code}
                  </option>
                ))}
              </select>
            </div>

            {/* 5. Performance State / Location */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3 h-3 text-rose-600" />
                <span>Performance Location</span>
              </label>
              <select
                value={filters.stateFilter || 'all'}
                onChange={(e) => setFilters((prev: FilterState) => ({ ...prev, stateFilter: e.target.value, cityFilter: '' }))}
                className={`w-full px-2.5 py-1.5 bg-white border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer truncate ${
                  filters.stateFilter && filters.stateFilter !== 'all' && filters.stateFilter !== 'ALL_50_STATES' && filters.stateFilter !== 'ALL_TERRITORIES'
                    ? 'border-rose-500 text-rose-900 font-semibold bg-rose-50/50'
                    : 'border-slate-300 text-slate-800'
                }`}
              >
                <option value="all">🗺️ All States & Territories</option>
                <option value="ALL_50_STATES">🇺🇸 All 50 U.S. States</option>
                <option value="ALL_TERRITORIES">🏝️ All U.S. Territories</option>
                {US_STATE_CODES.map((st: string) => (
                  <option key={st} value={st}>
                    {st} State Jurisdiction
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid Row 2: Agency Quick Pills & Feature Toggles */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-200/80">
            {/* Quick Agency Preset Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">Quick Agency:</span>
              <button
                onClick={() => setFilters((prev: FilterState) => ({ ...prev, agencyFilter: 'All Federal Organizations' }))}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition cursor-pointer border ${
                  !filters.agencyFilter || filters.agencyFilter === 'All Federal Organizations'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                }`}
              >
                All
              </button>
              {QUICK_AGENCY_PILLS.map((pill) => {
                const isSelected = filters.agencyFilter === pill.name;
                return (
                  <button
                    key={pill.name}
                    onClick={() => handleAgencySelect(pill.name)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition cursor-pointer border ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300'
                    }`}
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>

            {/* Status & Verified Link Toggles */}
            <div className="flex items-center gap-2 flex-wrap ml-auto">
              {/* Active Only Toggle */}
              <button
                type="button"
                onClick={() => setFilters((prev: FilterState) => ({ ...prev, statusFilter: prev.statusFilter === 'active' ? 'all' : 'active' }))}
                className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  filters.statusFilter === 'active'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Clock className={`w-3.5 h-3.5 ${filters.statusFilter === 'active' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>Active Only</span>
                {filters.statusFilter === 'active' && <Check className="w-3 h-3 text-emerald-600" />}
              </button>

              {/* Direct Link Verified Only */}
              <button
                type="button"
                onClick={() => setFilters((prev: FilterState) => ({ ...prev, verifiedOnly: !prev.verifiedOnly }))}
                className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  filters.verifiedOnly
                    ? 'bg-blue-50 text-blue-800 border-blue-300'
                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <ShieldCheck className={`w-3.5 h-3.5 ${filters.verifiedOnly ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>Direct Links Only</span>
                {filters.verifiedOnly && <Check className="w-3 h-3 text-blue-600" />}
              </button>

              {/* Min Fit Score Filter */}
              <div className="flex items-center bg-white border border-slate-300 rounded-lg p-0.5 text-[11px]">
                <span className="px-2 text-slate-500 font-bold">Fit Score:</span>
                <button
                  onClick={() => setFilters((prev: FilterState) => ({ ...prev, minFitScore: 0 }))}
                  className={`px-2 py-0.5 rounded font-semibold transition cursor-pointer ${
                    filters.minFitScore === 0 ? 'bg-slate-800 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilters((prev: FilterState) => ({ ...prev, minFitScore: 60 }))}
                  className={`px-2 py-0.5 rounded font-semibold transition cursor-pointer ${
                    filters.minFitScore === 60 ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  60%+
                </button>
                <button
                  onClick={() => setFilters((prev: FilterState) => ({ ...prev, minFitScore: 80 }))}
                  className={`px-2 py-0.5 rounded font-semibold transition cursor-pointer ${
                    filters.minFitScore === 80 ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  80%+ High
                </button>
              </div>
            </div>
          </div>

          {/* Active Filter Chips Bar */}
          {activeCount > 0 && (
            <div className="pt-2.5 border-t border-slate-200 flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="font-bold text-slate-500 uppercase tracking-wider mr-1">Active Filters:</span>

              {filters.searchQuery && (
                <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-900 border border-blue-300 px-2.5 py-0.5 rounded-full font-medium">
                  <span>Search: <strong>"{filters.searchQuery}"</strong></span>
                  <button onClick={() => setFilters((prev: FilterState) => ({ ...prev, searchQuery: '' }))} className="hover:text-blue-700 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.agencyFilter && filters.agencyFilter !== 'All Federal Organizations' && (
                <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-900 border border-blue-300 px-2.5 py-0.5 rounded-full font-medium">
                  <span>Agency: <strong>{filters.agencyFilter}</strong></span>
                  <button onClick={() => setFilters((prev: FilterState) => ({ ...prev, agencyFilter: 'All Federal Organizations' }))} className="hover:text-blue-700 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.setAsideFilter && filters.setAsideFilter !== 'All Set-Asides' && (
                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-0.5 rounded-full font-medium">
                  <span>Set-Aside: <strong>{filters.setAsideFilter}</strong></span>
                  <button onClick={() => setFilters((prev: FilterState) => ({ ...prev, setAsideFilter: 'All Set-Asides' }))} className="hover:text-emerald-700 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.naicsFilter && (
                <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-900 border border-indigo-300 px-2.5 py-0.5 rounded-full font-medium">
                  <span>NAICS: <strong>{filters.naicsFilter}</strong></span>
                  <button onClick={() => setFilters((prev: FilterState) => ({ ...prev, naicsFilter: '' }))} className="hover:text-indigo-700 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.stateFilter && filters.stateFilter !== 'all' && filters.stateFilter !== 'ALL_50_STATES' && filters.stateFilter !== 'ALL_TERRITORIES' && (
                <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-900 border border-rose-300 px-2.5 py-0.5 rounded-full font-medium">
                  <span>Location: <strong>{filters.stateFilter}</strong></span>
                  <button onClick={() => setFilters((prev: FilterState) => ({ ...prev, stateFilter: 'all', cityFilter: '' }))} className="hover:text-rose-700 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.minFitScore > 0 && (
                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-0.5 rounded-full font-medium">
                  <span>Min Fit: <strong>{filters.minFitScore}%+</strong></span>
                  <button onClick={() => setFilters((prev: FilterState) => ({ ...prev, minFitScore: 0 }))} className="hover:text-emerald-700 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.statusFilter === 'active' && (
                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-0.5 rounded-full font-medium">
                  <span>Active Solicitations Only</span>
                  <button onClick={() => setFilters((prev: FilterState) => ({ ...prev, statusFilter: 'all' }))} className="hover:text-emerald-700 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.verifiedOnly && (
                <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-900 border border-blue-300 px-2.5 py-0.5 rounded-full font-medium">
                  <span>Direct Notice Links Only</span>
                  <button onClick={() => setFilters((prev: FilterState) => ({ ...prev, verifiedOnly: false }))} className="hover:text-blue-700 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              <button
                onClick={onReset}
                className="text-blue-600 hover:text-blue-800 font-bold ml-1 hover:underline cursor-pointer"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
