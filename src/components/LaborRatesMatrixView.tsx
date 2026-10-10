import React, { useState, useMemo, useEffect } from 'react';
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
  FileSpreadsheet,
  Key,
  Globe,
  RefreshCw,
  Zap,
  Check
} from 'lucide-react';
import {
  FEDERAL_LABOR_CATEGORIES,
  LaborCategoryBenchmark,
  OpportunityCustomLaborItem,
  searchLaborCategories
} from '../data/federalLaborCategories';
import { SAMOpportunity, BusinessProfile } from '../types/contract';
import { AddLaborCategoryModal } from './AddLaborCategoryModal';
import { GsaApiKeyModal } from './GsaApiKeyModal';

interface LaborRatesMatrixViewProps {
  opportunities: SAMOpportunity[];
  currentProfile: BusinessProfile;
  activeOpportunity?: SAMOpportunity | null;
  onOpenOpportunityDetail: (opp: SAMOpportunity) => void;
  onAddLaborToOpportunity?: (oppNoticeId: string, item: OpportunityCustomLaborItem) => void;
  onOpenGsaApiKeyModal?: () => void;
}

export const LaborRatesMatrixView: React.FC<LaborRatesMatrixViewProps> = ({
  opportunities,
  currentProfile,
  activeOpportunity,
  onOpenOpportunityDetail,
  onAddLaborToOpportunity,
  onOpenGsaApiKeyModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedExemption, setSelectedExemption] = useState<string>('all');
  const [selectedClearance, setSelectedClearance] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'rate_desc' | 'rate_asc' | 'title' | 'exp'>('rate_desc');

  // GSA API Key Modal state
  const [isGsaModalOpen, setIsGsaModalOpen] = useState(false);
  const [gsaStatus, setGsaStatus] = useState<any>(null);
  
  // Live GSA Rates Pull state
  const [viewMode, setViewMode] = useState<'benchmarks' | 'live_gsa'>('benchmarks');
  const [liveGsaQuery, setLiveGsaQuery] = useState('');
  const [liveGsaRates, setLiveGsaRates] = useState<any[]>([]);
  const [isLoadingLiveGsa, setIsLoadingLiveGsa] = useState(false);
  const [liveGsaError, setLiveGsaError] = useState<string | null>(null);

  // Modal state for adding to solicitation
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedBenchmarkForAdd, setSelectedBenchmarkForAdd] = useState<LaborCategoryBenchmark | null>(null);
  const [targetOppNoticeId, setTargetOppNoticeId] = useState<string>(
    activeOpportunity?.noticeId || opportunities[0]?.noticeId || ''
  );
  const [recentlyAddedFeedback, setRecentlyAddedFeedback] = useState<string | null>(null);

  const fetchGsaStatus = async () => {
    try {
      const res = await fetch('/api/gsa/status');
      const data = await res.json();
      setGsaStatus(data);
    } catch (e) {
      console.warn('Could not fetch GSA status:', e);
    }
  };

  useEffect(() => {
    fetchGsaStatus();
  }, []);

  useEffect(() => {
    if (viewMode === 'live_gsa') {
      fetchGsaStatus();
      if (liveGsaRates.length === 0) {
        handleFetchLiveGsaRates('Engineer');
      }
    }
  }, [viewMode]);

  const handleFetchLiveGsaRates = async (overrideQuery?: string) => {
    const q = overrideQuery !== undefined ? overrideQuery : (liveGsaQuery || searchQuery || 'Engineer');
    setIsLoadingLiveGsa(true);
    setLiveGsaError(null);
    try {
      const res = await fetch('/api/gsa/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, limit: 30 }),
      });
      const data = await res.json();
      fetchGsaStatus();
      if (data.rates && data.rates.length > 0) {
        setLiveGsaRates(data.rates);
      } else {
        setLiveGsaRates([]);
        setLiveGsaError(data.message || 'No live GSA rates returned for query.');
      }
    } catch (err: any) {
      setLiveGsaError(err.message || 'Error communicating with GSA CALC API endpoint.');
    } finally {
      setIsLoadingLiveGsa(false);
    }
  };

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
              Search and analyze all federal labor categories with comprehensive minimum wage floors, median pricing benchmarks, and maximum ceiling rates. Connect your GSA API key to execute live real-time queries against GSA Acquisition Gateway & CALC APIs (api.gsa.gov).
            </p>

            {/* GSA API Key Integration Status Bar */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (onOpenGsaApiKeyModal) onOpenGsaApiKeyModal();
                  else setIsGsaModalOpen(true);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition border cursor-pointer ${
                  gsaStatus?.hasLiveApiKey
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 hover:bg-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-400/40 hover:bg-amber-500/30'
                }`}
              >
                <Key className="w-4 h-4" />
                <span>
                  {gsaStatus?.hasLiveApiKey
                    ? `GSA API Key Connected (${gsaStatus.maskedKey})`
                    : 'Input GSA API Key for Live Pulls (api.gsa.gov)'}
                </span>
              </button>

              <div className="flex items-center bg-slate-900/90 border border-slate-700 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setViewMode('benchmarks')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                    viewMode === 'benchmarks'
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Federal Benchmarks Matrix
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('live_gsa');
                    if (liveGsaRates.length === 0) {
                      handleFetchLiveGsaRates();
                    }
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5 cursor-pointer ${
                    viewMode === 'live_gsa'
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Live GSA CALC Pulls</span>
                </button>
              </div>
            </div>
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

      {/* Live GSA CALC Rate Pulls View Mode */}
      {viewMode === 'live_gsa' ? (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white space-y-4 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-emerald-400" />
                  <span>Live GSA CALC API Real-Time Rate Search</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                    api.gsa.gov v4.0
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Query live contract-awarded hourly ceiling rates across GSA MAS Schedule contracts in real time.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsGsaModalOpen(true)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer border ${
                  gsaStatus?.hasLiveApiKey
                    ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40'
                }`}
              >
                {gsaStatus?.hasLiveApiKey ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>GSA API Key: Active ({gsaStatus.maskedKey})</span>
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4 text-amber-400" />
                    <span>GSA Rates API Key: Configure</span>
                  </>
                )}
              </button>
            </div>

            {/* Live Search Controls */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Query live GSA CALC rates (e.g., Engineer, Security Analyst, Developer, Cloud)..."
                  value={liveGsaQuery}
                  onChange={(e) => setLiveGsaQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleFetchLiveGsaRates();
                  }}
                  className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="button"
                onClick={() => handleFetchLiveGsaRates()}
                disabled={isLoadingLiveGsa}
                className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-950/50 disabled:opacity-50"
              >
                {isLoadingLiveGsa ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Querying api.gsa.gov...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>Query Live GSA Rates</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Query Pill Presets */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-slate-400 text-[11px] font-medium">Suggested Searches:</span>
              {['Software Engineer', 'Cybersecurity Analyst', 'Cloud Architect', 'Project Manager', 'Database Administrator', 'Data Scientist'].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => {
                    setLiveGsaQuery(q);
                    handleFetchLiveGsaRates(q);
                  }}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] border border-slate-700 transition"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Error / Notice Banner */}
          {liveGsaError && (
            <div className="p-4 bg-amber-950/50 border border-amber-500/40 rounded-xl text-xs text-amber-200 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">{liveGsaError}</span>
                  <span className="text-[11px] opacity-90 mt-0.5 block">
                    Ensure your GSA API key is valid or click "Input GSA API Key" to update your key.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsGsaModalOpen(true)}
                className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-semibold rounded-lg shrink-0 border border-amber-500/40"
              >
                Set Key
              </button>
            </div>
          )}

          {/* Live GSA Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveGsaRates.map((rate, idx) => (
              <div
                key={rate.id || idx}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white shadow-md hover:border-emerald-500/50 transition flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Live GSA CALC Award
                    </span>
                    <span className="text-lg font-bold font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-lg border border-emerald-800/60">
                      ${rate.ceilingRate.toFixed(2)}/hr
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-100">{rate.laborCategory}</h4>

                  <div className="text-xs text-slate-300 space-y-1 bg-slate-950/60 p-2.5 rounded-xl border border-slate-850">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">Vendor:</span>
                      <strong className="text-slate-200 truncate max-w-[180px]">{rate.vendorName}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">Contract #:</span>
                      <code className="text-emerald-400 font-mono text-[11px]">{rate.contractNumber}</code>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">Schedule:</span>
                      <span className="text-slate-300 truncate max-w-[180px]">{rate.schedule}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
                    <span>Min Experience: <strong className="text-slate-200">{rate.minYearsExp} yrs</strong></span>
                    <span>• Education: <strong className="text-slate-200">{rate.educationLevel}</strong></span>
                    <span>• Site: <strong className="text-slate-200">{rate.site}</strong></span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const mapEdu = (edu: string): 'High School' | 'Associate' | 'Bachelor' | 'Master' | 'Doctorate' => {
                      const l = (edu || '').toLowerCase();
                      if (l.includes('master')) return 'Master';
                      if (l.includes('doc') || l.includes('phd')) return 'Doctorate';
                      if (l.includes('assoc')) return 'Associate';
                      if (l.includes('high')) return 'High School';
                      return 'Bachelor';
                    };

                    const benchItem: LaborCategoryBenchmark = {
                      id: rate.id,
                      title: rate.laborCategory,
                      category: 'Information Technology',
                      socCode: '15-1211',
                      exemptionStatus: 'Exempt (FLSA)',
                      minRate: Math.round(rate.ceilingRate * 0.8),
                      medianRate: rate.ceilingRate,
                      maxRate: Math.round(rate.ceilingRate * 1.25),
                      minYearsExp: rate.minYearsExp,
                      education: mapEdu(rate.educationLevel),
                      clearanceLevel: 'Public Trust',
                      gsaScheduleSource: `${rate.vendorName} (${rate.contractNumber})`,
                      certifications: ['GSA MAS Certified'],
                      description: `Live contract-awarded GSA MAS ceiling rate from ${rate.vendorName} under contract ${rate.contractNumber}.`,
                      typicalClinDeliverables: ['Monthly Progress Report (CDRL A001)'],
                    };
                    handleOpenAddForRole(benchItem);
                  }}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Solicitation CLIN Matrix</span>
                </button>
              </div>
            ))}
          </div>

          {liveGsaRates.length === 0 && !isLoadingLiveGsa && !liveGsaError && (
            <div className="text-center p-8 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-xs space-y-2">
              <Globe className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="font-semibold text-slate-300">Search Live GSA Awarded Ceiling Rates</p>
              <p className="max-w-md mx-auto text-slate-500">
                Type a labor title or select a preset above to stream real-time price ceiling data from api.gsa.gov across GSA MAS contracts.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Standard Federal Benchmarks Grid */
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

                    {isSca && role.scaWageFloor && (
                      <div className="mt-1.5 pt-1.5 border-t border-slate-200 flex items-center justify-between text-[10px] text-amber-900">
                        <span>DOL Statutory Direct Wage Floor:</span>
                        <strong className="font-mono">${role.scaWageFloor.toFixed(2)}/hr + $5.36 H&W</strong>
                      </div>
                    )}
                  </div>

                  {/* Description */}
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

                  {/* Deliverables */}
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
      )}

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

      {/* GSA API Key Modal */}
      <GsaApiKeyModal
        isOpen={isGsaModalOpen}
        onClose={() => setIsGsaModalOpen(false)}
        onKeySaved={fetchGsaStatus}
      />
    </div>
  );
};
