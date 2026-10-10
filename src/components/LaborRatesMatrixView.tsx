import React, { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  DollarSign,
  Shield,
  Briefcase,
  Users,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Download,
  Plus,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  Info,
  Layers,
  Sparkles,
  FileSpreadsheet
} from 'lucide-react';
import {
  FEDERAL_LABOR_CATEGORIES,
  LaborCategoryBenchmark,
  OpportunityCustomLaborItem,
  searchLaborCategories
} from '../data/federalLaborCategories';
import { SAMOpportunity, BusinessProfile } from '../types/contract';
import { AddLaborCategoryModal } from './AddLaborCategoryModal';

interface LaborRatesMatrixViewProps {
  opportunities: SAMOpportunity[];
  currentProfile: BusinessProfile;
  activeOpportunity?: SAMOpportunity | null;
  onOpenOpportunityDetail: (opp: SAMOpportunity) => void;
  onAddLaborToOpportunity?: (oppNoticeId: string, item: OpportunityCustomLaborItem) => void;
}

export const LaborRatesMatrixView: React.FC<LaborRatesMatrixViewProps> = ({
  opportunities,
  currentProfile,
  activeOpportunity,
  onOpenOpportunityDetail,
  onAddLaborToOpportunity,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedExemption, setSelectedExemption] = useState<string>('all');
  const [selectedClearance, setSelectedClearance] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'rate_desc' | 'rate_asc' | 'title' | 'exp'>('rate_desc');

  // Modal state for adding to solicitation
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedBenchmarkForAdd, setSelectedBenchmarkForAdd] = useState<LaborCategoryBenchmark | null>(null);
  const [targetOppNoticeId, setTargetOppNoticeId] = useState<string>(
    activeOpportunity?.noticeId || opportunities[0]?.noticeId || ''
  );
  const [recentlyAddedFeedback, setRecentlyAddedFeedback] = useState<string | null>(null);

  // Selected target opportunity
  const currentTargetOpp = useMemo(() => {
    return opportunities.find((o) => o.noticeId === targetOppNoticeId) || activeOpportunity || opportunities[0];
  }, [opportunities, targetOppNoticeId, activeOpportunity]);

  // Filtered & sorted benchmarks
  const filteredBenchmarks = useMemo(() => {
    let list = searchLaborCategories(searchQuery, selectedCategory, selectedExemption, selectedClearance);

    return list.sort((a, b) => {
      if (sortBy === 'rate_desc') return b.medianRate - a.medianRate;
      if (sortBy === 'rate_asc') return a.medianRate - b.medianRate;
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'exp') return b.minYearsExp - a.minYearsExp;
      return 0;
    });
  }, [searchQuery, selectedCategory, selectedExemption, selectedClearance, sortBy]);

  // Top stats
  const totalRoles = FEDERAL_LABOR_CATEGORIES.length;
  const scaRolesCount = FEDERAL_LABOR_CATEGORIES.filter((r) => r.exemptionStatus.includes('SCA')).length;
  const avgMedianRate = Math.round(
    FEDERAL_LABOR_CATEGORIES.reduce((acc, r) => acc + r.medianRate, 0) / totalRoles
  );
  const minRateAcrossAll = Math.min(...FEDERAL_LABOR_CATEGORIES.map((r) => r.minRate));
  const maxRateAcrossAll = Math.max(...FEDERAL_LABOR_CATEGORIES.map((r) => r.maxRate));

  const handleOpenAddForRole = (role: LaborCategoryBenchmark) => {
    setSelectedBenchmarkForAdd(role);
    setIsAddModalOpen(true);
  };

  const handleAddedItem = (newItem: OpportunityCustomLaborItem) => {
    if (onAddLaborToOpportunity && currentTargetOpp) {
      onAddLaborToOpportunity(currentTargetOpp.noticeId, newItem);
      setRecentlyAddedFeedback(`Added "${newItem.roleTitle}" (${newItem.clinNumber}) to ${currentTargetOpp.solicitationNumber}!`);
      setTimeout(() => setRecentlyAddedFeedback(null), 5000);
    }
  };

  const handleExportCsv = () => {
    const headers = [
      'Labor Title',
      'Category',
      'SOC Code',
      'DOL SCA Code',
      'FLSA Exemption',
      'Min Rate Floor ($/hr)',
      'Median Target Rate ($/hr)',
      'Max Ceiling Rate ($/hr)',
      'SCA Statutory Wage ($/hr)',
      'Health & Welfare ($/hr)',
      'Min Experience (Yrs)',
      'Education',
      'Clearance Level',
      'GSA Source Schedule'
    ];

    const rows = filteredBenchmarks.map((b) => [
      `"${b.title.replace(/"/g, '""')}"`,
      `"${b.category}"`,
      `"${b.socCode}"`,
      `"${b.scaCode || 'N/A'}"`,
      `"${b.exemptionStatus}"`,
      b.minRate.toFixed(2),
      b.medianRate.toFixed(2),
      b.maxRate.toFixed(2),
      b.scaWageFloor ? b.scaWageFloor.toFixed(2) : 'N/A',
      b.healthAndWelfare ? b.healthAndWelfare.toFixed(2) : 'N/A',
      b.minYearsExp,
      `"${b.education}"`,
      `"${b.clearanceLevel}"`,
      `"${b.gsaScheduleSource || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Federal_Labor_Categories_Wage_Rate_Limits_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner: Federal Labor Categories & Wage Determination Explorer */}
      <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-2xl p-5 sm:p-6 shadow-xl border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5">
                <DollarSign className="w-3 h-3 text-emerald-400" />
                <span>GSA CALC & DOL SCA Matrix</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                FAR 52.222-41 & Service Contract Act
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Federal Labor Categories & CLIN Wage Rate Limits Explorer</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Search and analyze all federal labor categories with comprehensive minimum wage floors, median pricing benchmarks, and maximum ceiling rates. Select any position to add directly to your active solicitation CLIN breakdown and RFP proposal output.
            </p>
          </div>

          {/* Quick Target Solicitation Selector & Export */}
          <div className="bg-slate-800/90 border border-slate-700/80 p-4 rounded-xl text-xs space-y-2.5 shrink-0 min-w-[280px]">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Active RFP Solicitation In-Context:
            </span>
            <div className="flex items-center gap-2">
              <select
                value={targetOppNoticeId}
                onChange={(e) => setTargetOppNoticeId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono outline-none"
              >
                {opportunities.map((opp) => (
                  <option key={opp.noticeId} value={opp.noticeId}>
                    {opp.solicitationNumber} - {opp.title.slice(0, 32)}...
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between pt-1">
              {currentTargetOpp && (
                <button
                  type="button"
                  onClick={() => onOpenOpportunityDetail(currentTargetOpp)}
                  className="text-blue-400 hover:text-blue-300 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <span>Open RFP Details</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}

              <button
                type="button"
                onClick={handleExportCsv}
                className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                title="Export complete database of labor categories and rate limits to CSV"
              >
                <Download className="w-3 h-3 text-emerald-400" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Success Feedback Notification */}
        {recentlyAddedFeedback && (
          <div className="mt-4 p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-xs text-emerald-200 flex items-center justify-between animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{recentlyAddedFeedback}</span>
            </div>
            {currentTargetOpp && (
              <button
                type="button"
                onClick={() => onOpenOpportunityDetail(currentTargetOpp)}
                className="underline font-bold text-white hover:text-emerald-300 ml-3 shrink-0"
              >
                View in Solicitation →
              </button>
            )}
          </div>
        )}
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <span className="text-[11px] text-slate-500 font-medium block">Standard Labor Categories</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold text-slate-900">{totalRoles}</span>
            <span className="text-[10px] text-slate-500">Benchmark Roles</span>
          </div>
          <span className="text-[10px] text-blue-600 mt-1 block">Full GSA CALC & SOC mapping</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <span className="text-[11px] text-slate-500 font-medium block">SCA Covered Positions</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold text-amber-700">{scaRolesCount}</span>
            <span className="text-[10px] text-slate-500">Wage Determined</span>
          </div>
          <span className="text-[10px] text-amber-800 font-medium mt-1 block">Mandatory $5.36/hr H&W benefit</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <span className="text-[11px] text-slate-500 font-medium block">Average Fully Burdened Rate</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold text-emerald-700">${avgMedianRate}</span>
            <span className="text-[10px] text-slate-500">/hr Target</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">50th Percentile government median</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <span className="text-[11px] text-slate-500 font-medium block">Statutory Rate Envelope</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-lg font-bold font-mono text-slate-900">${minRateAcrossAll} - ${maxRateAcrossAll}</span>
            <span className="text-[10px] text-slate-500">/hr</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Across entry SCA to Principal ZTA</span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search labor categories by title, SOC code (e.g. 15-1212), SCA code, certifications (CISSP, PMP), or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0 text-xs">
            <span className="text-slate-500 font-medium">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 text-xs outline-none"
            >
              <option value="rate_desc">Hourly Rate: Highest to Lowest</option>
              <option value="rate_asc">Hourly Rate: Lowest to Highest</option>
              <option value="title">Role Title: A to Z</option>
              <option value="exp">Experience Required: Highest</option>
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-semibold text-[11px] mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
            <span>Filters:</span>
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-700 outline-none text-xs"
          >
            <option value="all">All Domains ({totalRoles})</option>
            <option value="Cybersecurity">Cybersecurity & Zero Trust</option>
            <option value="Information Technology">Information Technology & Cloud</option>
            <option value="Program Management">Program Management & Quality</option>
            <option value="Engineering">Engineering & Telecommunications</option>
            <option value="Healthcare">Healthcare & Health Informatics</option>
            <option value="Administrative">Administrative & Clerical (SCA)</option>
            <option value="Logistics">Logistics & Supply Chain</option>
          </select>

          <select
            value={selectedExemption}
            onChange={(e) => setSelectedExemption(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-700 outline-none text-xs"
          >
            <option value="all">All Exemption Types</option>
            <option value="Exempt (FLSA)">FLSA Exempt Professional</option>
            <option value="Non-Exempt (SCA Covered)">SCA Covered (Wage Determined)</option>
          </select>

          <select
            value={selectedClearance}
            onChange={(e) => setSelectedClearance(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-700 outline-none text-xs"
          >
            <option value="all">All Clearances</option>
            <option value="Cleared">Security Cleared (Secret / TS / TS-SCI)</option>
            <option value="SCA">SCA Covered Only</option>
          </select>

          {(searchQuery || selectedCategory !== 'all' || selectedExemption !== 'all' || selectedClearance !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedExemption('all');
                setSelectedClearance('all');
              }}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium ml-2 cursor-pointer underline"
            >
              Reset Filters
            </button>
          )}

          <span className="text-slate-400 text-xs ml-auto font-mono">
            Showing {filteredBenchmarks.length} of {totalRoles} roles
          </span>
        </div>
      </div>

      {/* Labor Categories Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredBenchmarks.map((role) => {
          const isSca = role.exemptionStatus.includes('SCA');
          return (
            <div
              key={role.id}
              className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-blue-400 hover:shadow-md transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header: Title, SOC & Exemption */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                        {role.category}
                      </span>
                      {isSca ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                          <Shield className="w-3 h-3 text-amber-600" />
                          <span>SCA Wage Determination</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          FLSA Exempt
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 pt-0.5">
                      {role.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-slate-500">
                      <span>SOC: <strong>{role.socCode}</strong></span>
                      {role.scaCode && (
                        <span>• DOL SCA Code: <strong>{role.scaCode}</strong></span>
                      )}
                      <span>• Min Exp: <strong>{role.minYearsExp} yrs</strong></span>
                      <span>• Edu: <strong>{role.education}</strong></span>
                    </div>
                  </div>

                  {/* Target Rate Badge */}
                  <div className="text-right shrink-0 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Median Target</span>
                    <span className="text-lg font-bold font-mono text-emerald-700">
                      ${role.medianRate.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">/hr burdened</span>
                  </div>
                </div>

                {/* Rate Limit Envelope Visualizer */}
                <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 text-[11px] font-medium">Pricing Envelope Limits:</span>
                    <span className="font-mono text-slate-800 font-bold text-xs">
                      ${role.minRate.toFixed(0)} - ${role.maxRate.toFixed(0)}/hr
                    </span>
                  </div>

                  {/* Range Bar Gauge */}
                  <div className="relative w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div className="absolute left-0 w-full h-full bg-linear-to-r from-blue-300 via-emerald-400 to-indigo-500 rounded-full opacity-80"></div>
                    {/* Median Tick */}
                    <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-slate-900 -translate-x-1/2" title="Median Benchmark"></div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-600 font-mono">
                    <div>
                      <span className="text-slate-400 block">Floor (Min Limit)</span>
                      <strong className="text-slate-800">${role.minRate.toFixed(2)}/hr</strong>
                    </div>
                    <div className="text-center">
                      <span className="text-emerald-700 block font-bold">Government Median</span>
                      <strong className="text-emerald-800">${role.medianRate.toFixed(2)}/hr</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block">Ceiling (Max Limit)</span>
                      <strong className="text-blue-900">${role.maxRate.toFixed(2)}/hr</strong>
                    </div>
                  </div>

                  {/* SCA Statutory Floor Note */}
                  {isSca && role.scaWageFloor && (
                    <div className="mt-1.5 pt-1.5 border-t border-slate-200 flex items-center justify-between text-[10px] text-amber-900">
                      <span>DOL Statutory Direct Wage Floor:</span>
                      <strong className="font-mono">${role.scaWageFloor.toFixed(2)}/hr + $5.36 H&W</strong>
                    </div>
                  )}
                </div>

                {/* Description & Typical CLIN Tasks */}
                <p className="text-xs text-slate-600 leading-relaxed">
                  {role.description}
                </p>

                {/* Certifications & Clearance */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200 text-[10px] font-semibold flex items-center gap-1">
                    <Shield className="w-3 h-3 text-purple-600" />
                    <span>Clearance: {role.clearanceLevel}</span>
                  </span>

                  {role.certifications.map((cert, cIdx) => (
                    <span
                      key={cIdx}
                      className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-mono"
                    >
                      {cert}
                    </span>
                  ))}
                </div>

                {/* Typical Deliverables */}
                {role.typicalClinDeliverables && role.typicalClinDeliverables.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Typical CLIN / CDRL Deliverables:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {role.typicalClinDeliverables.map((deliv, dIdx) => (
                        <span
                          key={dIdx}
                          className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-200 text-[10px]"
                        >
                          {deliv}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button: Add to Active Solicitation */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <span className="text-[10px] text-slate-400 font-mono truncate">
                  Source: {role.gsaScheduleSource || 'GSA MAS Schedule'}
                </span>

                <button
                  type="button"
                  onClick={() => handleOpenAddForRole(role)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs shrink-0"
                  title={`Add ${role.title} to solicitation CLIN pricing & RFP proposal output`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Solicitation</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Labor Category Modal */}
      {selectedBenchmarkForAdd && currentTargetOpp && (
        <AddLaborCategoryModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setSelectedBenchmarkForAdd(null);
          }}
          targetOpportunity={currentTargetOpp}
          onAddLaborCategory={handleAddedItem}
          existingItems={currentTargetOpp.customLaborItems || []}
        />
      )}
    </div>
  );
};
