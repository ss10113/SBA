import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  Clock, 
  FileText, 
  Sparkles, 
  PlusCircle, 
  CheckCircle2, 
  Shield, 
  DollarSign, 
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  Eye,
  ExternalLink,
  ChevronDown,
  X,
  Copy,
  Check,
  ShieldCheck,
  Search,
  Lock,
  Unlock,
  Paperclip
} from 'lucide-react';
import { SAMOpportunity, BusinessProfile, FitScore, FilterState } from '../types/contract';
import { calculateFitScore } from '../utils/fitEngine';
import { getSafeSamGovUrl } from '../utils/samUrlHelper';
import { FEDERAL_DEPARTMENTS, FEDERAL_ORGANIZATIONS, getFederalOrgDisplayName } from '../data/federalOrganizations';

interface OpportunityTableViewProps {
  opportunities: SAMOpportunity[];
  currentProfile: BusinessProfile;
  onInspect: (opp: SAMOpportunity) => void;
  onGeneratePlan: (opp: SAMOpportunity) => void;
  onTogglePipeline: (opp: SAMOpportunity) => void;
  onFilterByAgency: (agency: string) => void;
  onValidate?: (opp: SAMOpportunity) => void;
  isPipelineMap: Record<string, boolean>;
  selectedAgencyFilter?: string;
  sortBy?: FilterState['sortBy'];
  onSortChange?: (newSort: FilterState['sortBy']) => void;
}

export const OpportunityTableView: React.FC<OpportunityTableViewProps> = ({
  opportunities,
  currentProfile,
  onInspect,
  onGeneratePlan,
  onTogglePipeline,
  onFilterByAgency,
  onValidate,
  isPipelineMap,
  selectedAgencyFilter,
  sortBy,
  onSortChange,
}) => {
  const now = new Date('2026-10-01T08:36:33-07:00');
  const [showHeaderFilterMenu, setShowHeaderFilterMenu] = useState(false);
  const [tableAgencySearch, setTableAgencySearch] = useState('');
  const [copiedSolMap, setCopiedSolMap] = useState<Record<string, boolean>>({});

  const handleCopySol = (solNum: string, noticeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(solNum);
    setCopiedSolMap((prev) => ({ ...prev, [noticeId]: true }));
    setTimeout(() => {
      setCopiedSolMap((prev) => ({ ...prev, [noticeId]: false }));
    }, 2000);
  };

  // Fit score style helper
  const getFitBadgeStyle = (score: number) => {
    if (score >= 80) return 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold';
    if (score >= 60) return 'bg-blue-50 text-blue-700 border-blue-300 font-semibold';
    return 'bg-amber-50 text-amber-700 border-amber-300 font-medium';
  };

  // Set aside style helper
  const getSetAsideStyle = (setAside?: string) => {
    const s = String(setAside || '');
    if (s.includes('8(a)')) return 'bg-purple-100 text-purple-800 border-purple-200';
    if (s.includes('SDVOSB') || s.includes('Veteran')) return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    if (s.includes('WOSB')) return 'bg-rose-100 text-rose-800 border-rose-200';
    if (s.includes('HUBZone')) return 'bg-teal-100 text-teal-800 border-teal-200';
    if (s.includes('Total Small Business')) return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const handleToggleAgencySort = () => {
    if (!onSortChange) return;
    if (sortBy === 'agency_asc') {
      onSortChange('agency_desc');
    } else if (sortBy === 'agency_desc') {
      onSortChange('fit_desc'); // return to default fit score
    } else {
      onSortChange('agency_asc');
    }
  };

  const handleToggleTitleSort = () => {
    if (!onSortChange) return;
    if (sortBy === 'title_asc') onSortChange('title_desc');
    else if (sortBy === 'title_desc') onSortChange('solnum_asc');
    else if (sortBy === 'solnum_asc') onSortChange('solnum_desc');
    else onSortChange('title_asc');
  };

  const handleToggleNaicsSort = () => {
    if (!onSortChange) return;
    if (sortBy === 'naics_asc') onSortChange('naics_desc');
    else onSortChange('naics_asc');
  };

  const handleToggleValueSort = () => {
    if (!onSortChange) return;
    if (sortBy === 'value_desc') onSortChange('value_asc');
    else onSortChange('value_desc');
  };

  const handleToggleDeadlineSort = () => {
    if (!onSortChange) return;
    if (sortBy === 'deadline_asc') onSortChange('deadline_desc');
    else onSortChange('deadline_asc');
  };

  const handleToggleFitSort = () => {
    if (!onSortChange) return;
    if (sortBy === 'fit_desc') onSortChange('fit_asc');
    else onSortChange('fit_desc');
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all">
      {/* Table Header Summary */}
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Federal Opportunities Matrix</span>
          </span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-600 font-medium">
            Showing <strong className="text-slate-900 font-mono">{opportunities.length}</strong> solicitations
          </span>
        </div>

        <div className="flex items-center gap-2">
          {selectedAgencyFilter ? (
            <div className="flex items-center gap-1.5 bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full text-xs font-semibold">
              <Filter className="w-3 h-3 text-blue-600" />
              <span>Federal Org: <strong>{selectedAgencyFilter}</strong></span>
              <button
                onClick={() => onFilterByAgency('')}
                className="text-blue-600 hover:text-blue-900 ml-1 text-xs cursor-pointer"
                title="Clear Federal Organization filter"
              >
                ✕
              </button>
            </div>
          ) : (
            <span className="text-slate-400 text-[11px] hidden sm:inline">
              Tip: Click any Federal Org name or filter button to isolate agency opportunities
            </span>
          )}
        </div>
      </div>

      {/* Main Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs divide-y divide-slate-200">
          <thead className="bg-slate-100/90 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
            <tr>
              {/* COLUMN 1: Federal Organization (Sticky & Filterable & Sortable) */}
              <th 
                scope="col" 
                className={`py-3 px-4 min-w-[230px] border-r border-slate-200/80 sticky left-0 z-20 ${
                  selectedAgencyFilter ? 'bg-blue-50/95 text-blue-950' : 'bg-slate-100/95 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <div 
                    onClick={handleToggleAgencySort}
                    className="flex items-center gap-1.5 cursor-pointer hover:text-blue-700 select-none group/hdr"
                    title="Click to sort by Federal Organization (A-Z / Z-A)"
                  >
                    <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Federal Organization</span>
                    {sortBy === 'agency_asc' && (
                      <ArrowUp className="w-3.5 h-3.5 text-blue-600 ml-0.5" />
                    )}
                    {sortBy === 'agency_desc' && (
                      <ArrowDown className="w-3.5 h-3.5 text-blue-600 ml-0.5" />
                    )}
                    {sortBy !== 'agency_asc' && sortBy !== 'agency_desc' && (
                      <ArrowUpDown className="w-3 h-3 text-slate-400 group-hover/hdr:text-slate-600 ml-0.5 opacity-60" />
                    )}
                  </div>

                  {/* Quick Filter Menu Trigger */}
                  <div className="relative">
                    <button
                      onClick={() => setShowHeaderFilterMenu(!showHeaderFilterMenu)}
                      className={`p-1 rounded hover:bg-slate-200/80 transition cursor-pointer ${
                        selectedAgencyFilter ? 'text-blue-700 bg-blue-100' : 'text-slate-400 hover:text-slate-700'
                      }`}
                      title="Filter by Federal Organization"
                    >
                      <Filter className="w-3.5 h-3.5" />
                    </button>

                    {showHeaderFilterMenu && (
                      <div 
                        className="absolute left-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 z-50 text-left normal-case tracking-normal"
                        onMouseLeave={() => {
                          setShowHeaderFilterMenu(false);
                          setTableAgencySearch('');
                        }}
                      >
                        <div className="px-3 py-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                          <span>Filter Organization ({FEDERAL_ORGANIZATIONS.length})</span>
                          {selectedAgencyFilter && (
                            <button
                              onClick={() => {
                                onFilterByAgency('');
                                setShowHeaderFilterMenu(false);
                                setTableAgencySearch('');
                              }}
                              className="text-blue-600 hover:underline text-[10px] normal-case"
                            >
                              Reset
                            </button>
                          )}
                        </div>

                        {/* Search Input for Agencies */}
                        <div className="p-2 border-b border-slate-100">
                          <div className="relative">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              placeholder="Search 115+ organizations / acronyms..."
                              value={tableAgencySearch}
                              onChange={(e) => setTableAgencySearch(e.target.value)}
                              className="w-full pl-8 pr-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-600"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>

                        <div className="max-h-60 overflow-y-auto py-1">
                          <button
                            onClick={() => {
                              onFilterByAgency('');
                              setShowHeaderFilterMenu(false);
                              setTableAgencySearch('');
                            }}
                            className={`w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 transition flex items-center justify-between ${
                              !selectedAgencyFilter ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700'
                            }`}
                          >
                            <span className="truncate">🏛️ All Federal Organizations</span>
                            {!selectedAgencyFilter && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 ml-2"></span>}
                          </button>

                          {FEDERAL_ORGANIZATIONS
                            .filter((org) => {
                              if (!tableAgencySearch.trim()) return true;
                              const q = tableAgencySearch.toLowerCase().trim();
                              return (
                                org.name.toLowerCase().includes(q) ||
                                org.displayName.toLowerCase().includes(q) ||
                                org.acronym.toLowerCase().includes(q) ||
                                org.aliases.some((a) => a.includes(q))
                              );
                            })
                            .map((org) => {
                              const isSelected = selectedAgencyFilter === org.name;
                              return (
                                <button
                                  key={org.name}
                                  onClick={() => {
                                    onFilterByAgency(org.name);
                                    setShowHeaderFilterMenu(false);
                                    setTableAgencySearch('');
                                  }}
                                  className={`w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 transition flex items-center justify-between ${
                                    isSelected ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700'
                                  }`}
                                  title={org.name}
                                >
                                  <span className="truncate">{org.displayName}</span>
                                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 ml-2 shrink-0"></span>}
                                </button>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </th>
              <th scope="col" className="py-3 px-4 min-w-[260px]">
                <div 
                  onClick={handleToggleTitleSort}
                  className="flex items-center gap-1.5 cursor-pointer hover:text-blue-700 select-none group/th"
                  title="Click to sort by Title (A-Z / Z-A) or Solicitation Number"
                >
                  <span>Solicitation & Title</span>
                  {sortBy === 'title_asc' && <ArrowUp className="w-3.5 h-3.5 text-blue-600" />}
                  {sortBy === 'title_desc' && <ArrowDown className="w-3.5 h-3.5 text-blue-600" />}
                  {sortBy === 'solnum_asc' && <span className="text-[10px] text-blue-600 font-mono font-bold">SOL↑</span>}
                  {sortBy === 'solnum_desc' && <span className="text-[10px] text-blue-600 font-mono font-bold">SOL↓</span>}
                  {!sortBy?.startsWith('title_') && !sortBy?.startsWith('solnum_') && (
                    <ArrowUpDown className="w-3 h-3 text-slate-400 group-hover/th:text-slate-600 opacity-60" />
                  )}
                </div>
              </th>
              <th scope="col" className="py-3 px-3 min-w-[130px]">
                <div 
                  onClick={handleToggleNaicsSort}
                  className="flex items-center gap-1.5 cursor-pointer hover:text-blue-700 select-none group/th"
                  title="Click to sort by NAICS Code"
                >
                  <span>NAICS Code</span>
                  {sortBy === 'naics_asc' && <ArrowUp className="w-3.5 h-3.5 text-blue-600" />}
                  {sortBy === 'naics_desc' && <ArrowDown className="w-3.5 h-3.5 text-blue-600" />}
                  {!sortBy?.startsWith('naics_') && (
                    <ArrowUpDown className="w-3 h-3 text-slate-400 group-hover/th:text-slate-600 opacity-60" />
                  )}
                </div>
              </th>
              <th scope="col" className="py-3 px-3 min-w-[160px]">
                <span>SBA Set-Aside</span>
              </th>
              <th scope="col" className="py-3 px-3 min-w-[110px]">
                <span>Location</span>
              </th>
              <th scope="col" className="py-3 px-3 min-w-[130px]">
                <div 
                  onClick={handleToggleValueSort}
                  className="flex items-center gap-1.5 cursor-pointer hover:text-blue-700 select-none group/th"
                  title="Click to sort by Contract Value"
                >
                  <span>Est. Value</span>
                  {sortBy === 'value_desc' && <ArrowDown className="w-3.5 h-3.5 text-blue-600" />}
                  {sortBy === 'value_asc' && <ArrowUp className="w-3.5 h-3.5 text-blue-600" />}
                  {!sortBy?.startsWith('value_') && (
                    <ArrowUpDown className="w-3 h-3 text-slate-400 group-hover/th:text-slate-600 opacity-60" />
                  )}
                </div>
              </th>
              <th scope="col" className="py-3 px-3 min-w-[130px]">
                <div 
                  onClick={handleToggleDeadlineSort}
                  className="flex items-center gap-1.5 cursor-pointer hover:text-blue-700 select-none group/th"
                  title="Click to sort by Response Deadline"
                >
                  <span>Response Due</span>
                  {sortBy === 'deadline_asc' && <ArrowUp className="w-3.5 h-3.5 text-blue-600" />}
                  {sortBy === 'deadline_desc' && <ArrowDown className="w-3.5 h-3.5 text-blue-600" />}
                  {!sortBy?.startsWith('deadline_') && (
                    <ArrowUpDown className="w-3 h-3 text-slate-400 group-hover/th:text-slate-600 opacity-60" />
                  )}
                </div>
              </th>
              <th scope="col" className="py-3 px-3 min-w-[95px] text-center">
                <div 
                  onClick={handleToggleFitSort}
                  className="flex items-center justify-center gap-1.5 cursor-pointer hover:text-blue-700 select-none group/th"
                  title="Click to sort by Fit Score"
                >
                  <span>Fit Score</span>
                  {sortBy === 'fit_desc' && <ArrowDown className="w-3.5 h-3.5 text-blue-600" />}
                  {sortBy === 'fit_asc' && <ArrowUp className="w-3.5 h-3.5 text-blue-600" />}
                  {!sortBy?.startsWith('fit_') && (
                    <ArrowUpDown className="w-3 h-3 text-slate-400 group-hover/th:text-slate-600 opacity-60" />
                  )}
                </div>
              </th>
              <th scope="col" className="py-3 px-3 min-w-[130px]">
                <div className="flex items-center gap-1">
                  <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                  <span>Attachments & SOW</span>
                </div>
              </th>
              <th scope="col" className="py-3 px-4 min-w-[180px] text-right">
                <span>Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {opportunities.map((opp, idx) => {
              const fit: FitScore = calculateFitScore(opp, currentProfile);
              const deadline = new Date(opp.responseDeadLine);
              const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              const isUrgent = diffDays <= 14 && diffDays > 0;
              const isExpired = diffDays <= 0;
              const inPipeline = Boolean(isPipelineMap[opp.noticeId]);
              const isAgencyFiltered = selectedAgencyFilter && (opp.department || '').toLowerCase().includes(selectedAgencyFilter.toLowerCase());

              return (
                <tr 
                  key={`${opp.noticeId || 'row'}-${opp.solicitationNumber || idx}-${idx}`}
                  className="hover:bg-blue-50/40 transition-colors group"
                >
                  {/* COLUMN 1: Federal Organization (Sticky) */}
                  <td className={`py-3 px-4 border-r border-slate-200/80 sticky left-0 z-10 ${
                    isAgencyFiltered ? 'bg-blue-50/70 group-hover:bg-blue-100/60' : 'bg-white group-hover:bg-blue-50/50'
                  }`}>
                    <div className="space-y-1 max-w-[220px]">
                      {/* Department / Independent Agency */}
                      <div className="flex items-start justify-between gap-1">
                        <div className="min-w-0">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Dept/Ind Agency:</span>
                          <button
                            onClick={() => onFilterByAgency(opp.department || '')}
                            className="text-xs font-bold text-slate-900 hover:text-blue-700 transition text-left block truncate max-w-[170px] cursor-pointer"
                            title={`Click to filter dashboard by: ${opp.department || 'Agency'}`}
                          >
                            {opp.department || 'Federal Agency'}
                          </button>
                        </div>
                        <button
                          onClick={() => onFilterByAgency(opp.department || '')}
                          className="opacity-0 group-hover:opacity-100 text-[10px] text-blue-600 hover:text-blue-800 bg-blue-50 px-1 py-0.5 rounded border border-blue-200 transition cursor-pointer shrink-0"
                          title={`Filter to ${opp.department || 'Agency'}`}
                        >
                          Filter
                        </button>
                      </div>

                      {/* Sub-tier Agency */}
                      <div>
                        <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 block">Sub-tier:</span>
                        <div className="text-[11px] text-slate-700 font-medium truncate" title={opp.subTier || opp.department}>
                          {opp.subTier || opp.department || 'Federal Sub-tier'}
                        </div>
                      </div>

                      {/* Major Command / Sub Command if available */}
                      {(opp.majorCommand || opp.subCommand) && (
                        <div className="space-y-0.5 pt-0.5">
                          {opp.majorCommand && (
                            <div className="flex items-center gap-1 text-[10px] text-blue-800 bg-blue-50/80 px-1.5 py-0.5 rounded border border-blue-200/70 truncate" title={`Major Command: ${opp.majorCommand}`}>
                              <span className="font-semibold text-blue-900 shrink-0">Maj Cmd:</span>
                              <span className="truncate">{opp.majorCommand}</span>
                            </div>
                          )}
                          {opp.subCommand && (
                            <div className="flex items-center gap-1 text-[10px] text-indigo-800 bg-indigo-50/80 px-1.5 py-0.5 rounded border border-indigo-200/70 truncate" title={`Sub Command: ${opp.subCommand}`}>
                              <span className="font-semibold text-indigo-900 shrink-0">Sub Cmd:</span>
                              <span className="truncate">{opp.subCommand}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Contracting Office */}
                      <div>
                        <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 block">Office:</span>
                        <div className="text-[10px] text-slate-500 font-mono truncate" title={opp.office}>
                          {opp.office || 'Contracting Office'}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* COLUMN 2: Solicitation & Title */}
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => handleCopySol(opp.solicitationNumber, opp.noticeId, e)}
                          className="font-mono text-[10px] font-bold bg-slate-900 hover:bg-slate-800 text-white px-1.5 py-0.5 rounded flex items-center gap-1 transition cursor-pointer"
                          title="Official Solicitation Number. Click to copy for SAM.gov search"
                        >
                          <span className="text-[9px] text-blue-300 font-sans font-semibold">SOL #</span>
                          <span>{opp.solicitationNumber}</span>
                          {copiedSolMap[opp.noticeId] ? (
                            <Check className="w-2.5 h-2.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-2.5 h-2.5 text-slate-400" />
                          )}
                        </button>

                        {onValidate && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onValidate(opp);
                            }}
                            className="text-[10px] font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-1.5 py-0.2 rounded flex items-center gap-0.5 transition cursor-pointer"
                            title="Validate contract ID & check live status on SAM.gov"
                          >
                            <span>Validate</span>
                            <ExternalLink className="w-2.5 h-2.5 text-blue-600" />
                          </button>
                        )}

                        <a
                          href={getSafeSamGovUrl(opp)}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[10px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded flex items-center gap-1 transition shadow-2xs hover:shadow-xs cursor-pointer"
                          title="Open official live solicitation directly on SAM.gov"
                        >
                          <span>Live SAM.gov</span>
                          <ExternalLink className="w-2.5 h-2.5 text-emerald-600" />
                        </a>

                        <span className="text-[10px] font-medium bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded border border-slate-200">
                          {opp.type}
                        </span>

                        {/* Status Badge */}
                        {opp.status === 'awarded' ? (
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.2 rounded flex items-center gap-1">
                            <span>🏆 Awarded</span>
                          </span>
                        ) : opp.status === 'inactive' || isExpired ? (
                          <span className="text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-300 px-1.5 py-0.2 rounded">
                            <span>⚪ Inactive</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.2 rounded flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>Active</span>
                          </span>
                        )}
                      </div>
                      <h4
                        onClick={() => onInspect(opp)}
                        className="font-bold text-slate-900 group-hover:text-blue-700 transition cursor-pointer line-clamp-1 text-xs"
                        title={opp.title}
                      >
                        {opp.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                        <span>Notice ID: {opp.noticeId}</span>
                      </div>
                    </div>
                  </td>

                  {/* COLUMN 3: NAICS Code */}
                  <td className="py-3 px-3">
                    <div className="space-y-0.5">
                      <span className="font-mono font-bold text-blue-700 text-xs block">
                        {opp.naicsCode}
                      </span>
                      <span className="text-[10px] text-slate-500 line-clamp-1" title={opp.naicsTitle}>
                        {opp.naicsTitle}
                      </span>
                    </div>
                  </td>

                  {/* COLUMN 4: SBA Set-Aside */}
                  <td className="py-3 px-3">
                    <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded border leading-tight ${getSetAsideStyle(opp.setAside)}`}>
                      {opp.setAside}
                    </span>
                  </td>

                  {/* COLUMN 5: Location */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1 text-slate-700">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="font-medium text-xs">
                        {opp.placeOfPerformance?.city || 'Washington'}, <strong>{opp.placeOfPerformance?.state || 'DC'}</strong>
                      </span>
                    </div>
                  </td>

                  {/* COLUMN 6: Estimated Value */}
                  <td className="py-3 px-3">
                    <span className="font-bold text-emerald-700 text-xs font-mono block">
                      {opp.estimatedValue || '$1,000,000+'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {opp.contractType || 'FFP'}
                    </span>
                  </td>

                  {/* COLUMN 7: Response Deadline / Status */}
                  <td className="py-3 px-3">
                    {opp.status === 'awarded' && opp.awardeeInfo ? (
                      <div className="space-y-0.5">
                        <span className="font-bold text-xs text-amber-900 flex items-center gap-1">
                          <span>🏆 Awarded</span>
                        </span>
                        <span className="text-[10px] text-slate-700 block font-semibold truncate max-w-[130px]" title={opp.awardeeInfo.vendorName}>
                          {opp.awardeeInfo.vendorName}
                        </span>
                        <span className="text-[10px] text-emerald-700 font-mono font-bold block">
                          {opp.awardeeInfo.awardAmount}
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        <span className={`font-semibold text-xs flex items-center gap-1 ${isUrgent ? 'text-amber-700' : isExpired ? 'text-slate-500' : 'text-slate-700'}`}>
                          <Clock className={`w-3 h-3 ${isUrgent ? 'text-amber-600' : 'text-slate-400'}`} />
                          <span>{isExpired ? 'Closed' : `${diffDays} days left`}</span>
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {isNaN(deadline.getTime()) ? 'Open Notice' : deadline.toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </td>

                  {/* COLUMN 8: Fit Score */}
                  <td className="py-3 px-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-mono border ${getFitBadgeStyle(fit.overallScore)}`}>
                      {fit.overallScore}%
                    </span>
                  </td>

                  {/* COLUMN 8.5: Attachments & SOW */}
                  <td className="py-3 px-3">
                    <div className="space-y-1">
                      {opp.attachmentsAccessStatus === 'Access Request Required' ? (
                        <div 
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200"
                          title="Restricted SOW: Additional access request required on SAM.gov under authenticated contractor profile (CAGE + MPIN)"
                        >
                          <Lock className="w-3 h-3 text-amber-600 shrink-0" />
                          <span>Req. Access ({opp.attachments?.length || 1})</span>
                        </div>
                      ) : opp.attachmentsAccessStatus === 'Mixed / Some Restricted' ? (
                        <div 
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200"
                          title="Mixed Access: Public RFP synopsis posted; technical SOW / attachments require SAM.gov access request"
                        >
                          <Shield className="w-3 h-3 text-indigo-600 shrink-0" />
                          <span>Mixed ({opp.attachments?.length || 2})</span>
                        </div>
                      ) : opp.attachmentsAccessStatus === 'No Attachments Posted' ? (
                        <span className="text-[10px] text-slate-400">None Posted</span>
                      ) : (
                        <div 
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
                          title="All RFP attachments and Statement of Work documents are public and immediately downloadable"
                        >
                          <Unlock className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>Public ({opp.attachments?.length || 1})</span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onInspect(opp);
                        }}
                        className="text-[10px] text-blue-600 hover:text-blue-800 hover:underline block font-medium cursor-pointer"
                        title="Inspect SOW & solicitation attachments"
                      >
                        Inspect SOW
                      </button>
                    </div>
                  </td>

                  {/* COLUMN 9: Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {onValidate && (
                        <button
                          onClick={() => onValidate(opp)}
                          className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg border border-blue-200 transition cursor-pointer"
                          title="Validate Solicitation Number & check on SAM.gov"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                        </button>
                      )}

                      <button
                        onClick={() => onInspect(opp)}
                        className="p-1.5 text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-lg border border-slate-200 transition cursor-pointer"
                        title="Inspect full RFP profile, SOW execution strategy, and proposal generator"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onTogglePipeline(opp)}
                        className={`p-1.5 rounded-lg border transition cursor-pointer ${
                          inPipeline
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 border-slate-200'
                        }`}
                        title={inPipeline ? 'In Pipeline' : 'Add to Pipeline'}
                      >
                        {inPipeline ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                        ) : (
                          <PlusCircle className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => onGeneratePlan(opp)}
                        className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-xs flex items-center gap-1 transition cursor-pointer"
                        title="Generate AI Bid Strategy & Business Plan"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span className="hidden sm:inline">Strategy</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
