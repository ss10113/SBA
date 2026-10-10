import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Filter,
  SlidersHorizontal,
  DollarSign,
  Clock,
  Shield,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Plus,
  HelpCircle,
  Sparkles,
  Info
} from 'lucide-react';
import {
  FEDERAL_LABOR_CATEGORIES,
  LaborCategoryBenchmark,
  OpportunityCustomLaborItem,
  searchLaborCategories
} from '../data/federalLaborCategories';
import { SAMOpportunity } from '../types/contract';

interface AddLaborCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetOpportunity: SAMOpportunity;
  onAddLaborCategory: (item: OpportunityCustomLaborItem) => void;
  existingItems?: OpportunityCustomLaborItem[];
}

export const AddLaborCategoryModal: React.FC<AddLaborCategoryModalProps> = ({
  isOpen,
  onClose,
  targetOpportunity,
  onAddLaborCategory,
  existingItems = [],
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedExemption, setSelectedExemption] = useState<string>('all');
  const [selectedBenchmark, setSelectedBenchmark] = useState<LaborCategoryBenchmark | null>(null);

  // Configuration form state
  const [customClinNumber, setCustomClinNumber] = useState('CLIN 0001');
  const [customRate, setCustomRate] = useState<number>(0);
  const [customHours, setCustomHours] = useState<number>(1920);
  const [customClearance, setCustomClearance] = useState<string>('Secret');
  const [performerType, setPerformerType] = useState<'Prime Contractor' | 'Subcontractor / Teaming Partner'>('Prime Contractor');
  const [notes, setNotes] = useState('');

  // Mode: benchmark selection vs custom freeform entry
  const [isFreeformMode, setIsFreeformMode] = useState(false);
  const [freeformTitle, setFreeformTitle] = useState('');
  const [freeformCategory, setFreeformCategory] = useState('Information Technology');
  const [freeformMinRate, setFreeformMinRate] = useState(85);
  const [freeformMaxRate, setFreeformMaxRate] = useState(165);
  const [freeformIsSca, setFreeformIsSca] = useState(false);

  // Filtered benchmarks
  const filteredBenchmarks = useMemo(() => {
    return searchLaborCategories(searchQuery, selectedCategory, selectedExemption);
  }, [searchQuery, selectedCategory, selectedExemption]);

  // When a benchmark is selected, auto-fill default values
  const handleSelectBenchmark = (bm: LaborCategoryBenchmark) => {
    setSelectedBenchmark(bm);
    setIsFreeformMode(false);
    setCustomRate(bm.medianRate);

    // Auto calculate next CLIN number
    const count = existingItems.length + 1;
    const formattedClin = `CLIN 000${count}`.slice(-9);
    setCustomClinNumber(formattedClin || `CLIN 000${count}`);

    if (bm.clearanceLevel.includes('TS/SCI')) {
      setCustomClearance('TS/SCI');
    } else if (bm.clearanceLevel.includes('Top Secret')) {
      setCustomClearance('Top Secret');
    } else if (bm.clearanceLevel.includes('Secret')) {
      setCustomClearance('Secret');
    } else {
      setCustomClearance('Public Trust');
    }
  };

  const handleConfirmAdd = () => {
    if (isFreeformMode) {
      if (!freeformTitle.trim()) return;
      const newItem: OpportunityCustomLaborItem = {
        id: `custom-lc-${Date.now()}`,
        clinNumber: customClinNumber || `CLIN 000${existingItems.length + 1}`,
        laborCategoryId: `custom-${Date.now()}`,
        roleTitle: freeformTitle,
        category: freeformCategory,
        hours: customHours || 1920,
        rate: customRate || (freeformMinRate + freeformMaxRate) / 2,
        minRateLimit: freeformMinRate,
        maxRateLimit: freeformMaxRate,
        clearance: customClearance,
        isScaCovered: freeformIsSca,
        performerType: performerType,
        notes: notes || 'Custom labor position added to solicitation.',
      };
      onAddLaborCategory(newItem);
      onClose();
    } else if (selectedBenchmark) {
      const newItem: OpportunityCustomLaborItem = {
        id: `item-${selectedBenchmark.id}-${Date.now()}`,
        clinNumber: customClinNumber || `CLIN 000${existingItems.length + 1}`,
        laborCategoryId: selectedBenchmark.id,
        roleTitle: selectedBenchmark.title,
        category: selectedBenchmark.category,
        hours: customHours || 1920,
        rate: customRate || selectedBenchmark.medianRate,
        minRateLimit: selectedBenchmark.minRate,
        maxRateLimit: selectedBenchmark.maxRate,
        clearance: customClearance,
        isScaCovered: selectedBenchmark.exemptionStatus.includes('SCA'),
        performerType: performerType,
        notes: notes || selectedBenchmark.description.slice(0, 140),
      };
      onAddLaborCategory(newItem);
      onClose();
    }
  };

  if (!isOpen) return null;

  const currentMinLimit = isFreeformMode ? freeformMinRate : (selectedBenchmark?.minRate || 0);
  const currentMaxLimit = isFreeformMode ? freeformMaxRate : (selectedBenchmark?.maxRate || 0);
  const isRateBelowFloor = customRate < currentMinLimit;
  const isRateAboveCeiling = customRate > currentMaxLimit;
  const totalItemValue = customRate * (customHours || 0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/30 text-blue-300 border border-blue-400/30">
                CLIN & SCA Pricing Engine
              </span>
              <span className="text-xs text-slate-400 truncate max-w-xs">
                Target: {targetOpportunity.solicitationNumber}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <span>Add Labor Category & Set Rate Limits</span>
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Two-Column Layout */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          
          {/* Left Column: Search & Browse Benchmarks */}
          <div className="lg:col-span-7 p-4 sm:p-5 space-y-3.5 bg-slate-50/50 flex flex-col max-h-[600px] overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                1. Select from Federal Benchmark Catalog
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsFreeformMode(!isFreeformMode);
                  setSelectedBenchmark(null);
                }}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                {isFreeformMode ? '← Back to Benchmark List' : '+ Or Enter Custom Position'}
              </button>
            </div>

            {!isFreeformMode ? (
              <>
                {/* Search & Filters */}
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search roles by title, SOC code, skills (e.g., Cyber, Cloud, PMP, Clerk)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 text-[11px] overflow-x-auto pb-1">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-700 outline-none"
                    >
                      <option value="all">All Domains</option>
                      <option value="Cybersecurity">Cybersecurity</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Program Management">Program Management</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Administrative">Administrative (SCA)</option>
                      <option value="Logistics">Logistics</option>
                    </select>

                    <select
                      value={selectedExemption}
                      onChange={(e) => setSelectedExemption(e.target.value)}
                      className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-700 outline-none"
                    >
                      <option value="all">All FLSA Types</option>
                      <option value="Exempt (FLSA)">FLSA Exempt</option>
                      <option value="Non-Exempt (SCA Covered)">SCA Covered</option>
                    </select>

                    <span className="text-slate-400 ml-auto whitespace-nowrap">
                      {filteredBenchmarks.length} available
                    </span>
                  </div>
                </div>

                {/* Benchmarks Scrollable List */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[300px]">
                  {filteredBenchmarks.map((bm) => {
                    const isSelected = selectedBenchmark?.id === bm.id;
                    return (
                      <div
                        key={bm.id}
                        onClick={() => handleSelectBenchmark(bm)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                          isSelected
                            ? 'bg-blue-50/90 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                            : 'bg-white hover:bg-slate-100/70 border-slate-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-slate-900">{bm.title}</span>
                              {bm.exemptionStatus.includes('SCA') && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                  SCA Covered
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono">
                              SOC: {bm.socCode} {bm.scaCode && `• DOL SCA ${bm.scaCode}`} • {bm.category}
                            </span>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="font-mono font-bold text-emerald-700 text-sm block">
                              ${bm.medianRate.toFixed(2)}/hr
                            </span>
                            <span className="text-[10px] text-slate-500">
                              Range: ${bm.minRate.toFixed(0)} - ${bm.maxRate.toFixed(0)}
                            </span>
                          </div>
                        </div>

                        {/* Rate Limit Bar Visualizer */}
                        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-600">
                          <span>Floor: <strong className="font-mono text-slate-800">${bm.minRate.toFixed(2)}</strong></span>
                          <span>Target: <strong className="font-mono text-emerald-800">${bm.medianRate.toFixed(2)}</strong></span>
                          <span>Ceiling: <strong className="font-mono text-blue-900">${bm.maxRate.toFixed(2)}</strong></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              /* Custom Freeform Role Entry */
              <div className="space-y-3 p-3 bg-white border border-slate-200 rounded-xl text-xs">
                <span className="font-bold text-slate-900 block">Custom Position Parameters:</span>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Position / Labor Title *</label>
                  <input
                    type="text"
                    value={freeformTitle}
                    onChange={(e) => setFreeformTitle(e.target.value)}
                    placeholder="e.g., Senior Zero Trust Migration Specialist"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Functional Domain</label>
                    <select
                      value={freeformCategory}
                      onChange={(e) => setFreeformCategory(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs outline-none"
                    >
                      <option value="Information Technology">Information Technology</option>
                      <option value="Cybersecurity">Cybersecurity</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Program Management">Program Management</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Logistics">Logistics</option>
                      <option value="Administrative">Administrative</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Labor Type</label>
                    <div className="flex items-center gap-2 pt-1.5">
                      <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={freeformIsSca}
                          onChange={(e) => setFreeformIsSca(e.target.checked)}
                          className="rounded text-blue-600"
                        />
                        <span>SCA Wage Covered</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Min Rate Limit ($/hr)</label>
                    <input
                      type="number"
                      value={freeformMinRate}
                      onChange={(e) => setFreeformMinRate(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Max Ceiling Limit ($/hr)</label>
                    <input
                      type="number"
                      value={freeformMaxRate}
                      onChange={(e) => setFreeformMaxRate(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Pricing & CLIN Configuration */}
          <div className="lg:col-span-5 p-4 sm:p-5 space-y-4 bg-white flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block border-b border-slate-200 pb-2">
                2. Configure Solicitation Pricing & Limits
              </span>

              {/* Selected Role Summary */}
              {(selectedBenchmark || (isFreeformMode && freeformTitle)) ? (
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs space-y-1">
                  <span className="text-[10px] text-blue-800 font-bold uppercase tracking-wider">
                    Position Configured:
                  </span>
                  <p className="font-bold text-slate-900 text-sm">
                    {isFreeformMode ? freeformTitle : selectedBenchmark?.title}
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Category: {isFreeformMode ? freeformCategory : selectedBenchmark?.category}
                  </p>

                  <div className="mt-2 pt-2 border-t border-blue-200/80 flex items-center justify-between font-mono text-[11px]">
                    <span className="text-slate-600">
                      Rate Limits: <strong>${currentMinLimit.toFixed(2)} - ${currentMaxLimit.toFixed(2)}</strong>/hr
                    </span>
                    <span className="text-emerald-700 font-bold">
                      Target: ${isFreeformMode ? ((freeformMinRate + freeformMaxRate) / 2).toFixed(2) : selectedBenchmark?.medianRate.toFixed(2)}/hr
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center text-xs text-slate-500">
                  <SlidersHorizontal className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                  <span>Select a labor category on the left to set rate and hours.</span>
                </div>
              )}

              {/* CLIN Number & Performer Type */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">CLIN Number *</label>
                  <input
                    type="text"
                    value={customClinNumber}
                    onChange={(e) => setCustomClinNumber(e.target.value)}
                    placeholder="CLIN 0001"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Clearance Level</label>
                  <select
                    value={customClearance}
                    onChange={(e) => setCustomClearance(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs outline-none"
                  >
                    <option value="None / Public Trust">Public Trust</option>
                    <option value="Secret">Secret</option>
                    <option value="Top Secret">Top Secret</option>
                    <option value="TS/SCI">TS/SCI</option>
                  </select>
                </div>
              </div>

              {/* Rate & Hours Adjustment */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Offered Billable Rate ($/hr) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-400 font-mono text-xs">$</span>
                    <input
                      type="number"
                      step="0.5"
                      value={customRate || ''}
                      onChange={(e) => setCustomRate(parseFloat(e.target.value) || 0)}
                      className={`w-full pl-7 pr-3 py-1.5 border rounded-lg text-xs font-mono font-bold ${
                        isRateBelowFloor
                          ? 'border-amber-400 bg-amber-50 text-amber-900'
                          : isRateAboveCeiling
                            ? 'border-blue-400 bg-blue-50 text-blue-900'
                            : 'border-slate-300 text-emerald-800'
                      }`}
                    />
                  </div>
                  {/* Validation notice */}
                  {isRateBelowFloor && (
                    <span className="text-[10px] text-amber-700 font-semibold block mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                      <span>Below benchmark floor (${currentMinLimit.toFixed(2)})</span>
                    </span>
                  )}
                  {isRateAboveCeiling && (
                    <span className="text-[10px] text-blue-700 font-semibold block mt-1 flex items-center gap-1">
                      <Info className="w-3 h-3 text-blue-600 shrink-0" />
                      <span>Above GSA 90th percentile (${currentMaxLimit.toFixed(2)})</span>
                    </span>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Estimated Annual Hours *
                  </label>
                  <input
                    type="number"
                    step="10"
                    value={customHours || ''}
                    onChange={(e) => setCustomHours(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Standard 1 FTE = 1,920 or 2,080 hrs
                  </span>
                </div>
              </div>

              {/* Prime vs Subcontractor Work-share */}
              <div className="text-xs space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 block">
                  Performer (FAR 52.219-14 Work-Share)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPerformerType('Prime Contractor')}
                    className={`p-2 rounded-lg border text-[11px] font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      performerType === 'Prime Contractor'
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-400 ring-1 ring-emerald-400'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>🏢 Prime Small Business</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPerformerType('Subcontractor / Teaming Partner')}
                    className={`p-2 rounded-lg border text-[11px] font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      performerType === 'Subcontractor / Teaming Partner'
                        ? 'bg-blue-100 text-blue-900 border-blue-400 ring-1 ring-blue-400'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>🤝 Teaming Partner</span>
                  </button>
                </div>
              </div>

              {/* Total Item Value Card */}
              <div className="p-3 bg-slate-900 text-white rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Total CLIN Subtotal:</span>
                  <span>{customHours.toLocaleString()} hrs × ${customRate.toFixed(2)}/hr</span>
                </div>
                <div className="text-xl font-bold font-mono text-emerald-400">
                  ${totalItemValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmAdd}
                disabled={(!selectedBenchmark && !freeformTitle) || customRate <= 0}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Position to RFP Output</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
