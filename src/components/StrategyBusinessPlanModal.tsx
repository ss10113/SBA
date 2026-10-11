import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  FileText, 
  Users, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle2, 
  Download, 
  Printer, 
  BookmarkCheck, 
  RefreshCw,
  Building2,
  Calendar,
  Layers,
  ChevronRight,
  PieChart,
  Award,
  Package,
  FileCheck,
  Copy,
  Check,
  Eye,
  SlidersHorizontal,
  ExternalLink,
  Edit3,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { 
  SAMOpportunity, 
  BusinessProfile, 
  BidStrategy, 
  ShipleyProposalArtifact, 
  ProposalArtifactStatus 
} from '../types/contract';
import { ShipleyArtifactModal } from './ShipleyArtifactModal';
import { 
  generateAllShipleyArtifacts, 
  generateArtifactForDeliverable, 
  downloadArtifact, 
  downloadConsolidatedShipleyPackage 
} from '../utils/shipleyArtifactGenerator';

import { ProposalPublisherModule } from './ProposalPublisherModule.tsx';

interface StrategyBusinessPlanModalProps {
  opportunity: SAMOpportunity | null;
  currentProfile: BusinessProfile;
  existingStrategy?: BidStrategy;
  onClose: () => void;
  onSaveToPipeline: (opp: SAMOpportunity, strategy: BidStrategy, artifacts?: ShipleyProposalArtifact[]) => void;
}

export const StrategyBusinessPlanModal: React.FC<StrategyBusinessPlanModalProps> = ({
  opportunity,
  currentProfile,
  existingStrategy,
  onClose,
  onSaveToPipeline,
}) => {
  const [activeStrategyTab, setActiveStrategyTab] = useState<'win_strategy' | 'business_plan' | 'compliance' | 'teaming' | 'pricing' | 'timeline' | 'publisher'>('win_strategy');
  const [strategy, setStrategy] = useState<BidStrategy | null>(existingStrategy || null);
  const [loading, setLoading] = useState(false);
  const [focusArea, setFocusArea] = useState('Comprehensive Win Strategy & Proposal Business Plan');
  const [sourceTag, setSourceTag] = useState<string>('');
  
  // Shipley Proposal Products / Artifacts state
  const [artifacts, setArtifacts] = useState<ShipleyProposalArtifact[]>([]);
  const [selectedArtifact, setSelectedArtifact] = useState<ShipleyProposalArtifact | null>(null);
  const [isArtifactModalOpen, setIsArtifactModalOpen] = useState(false);
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [copiedArtifactId, setCopiedArtifactId] = useState<string | null>(null);
  const [downloadingBundle, setDownloadingBundle] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  const fetchStrategy = async (customFocus?: string) => {
    if (!opportunity) return;
    setLoading(true);
    try {
      const res = await fetch('/api/generate-strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunity,
          profile: currentProfile,
          focusArea: customFocus || focusArea,
        }),
      });

      const data = await res.json();
      if (data.strategy) {
        setStrategy(data.strategy);
        setSourceTag(data.source === 'gemini-ai' ? 'Gemini 3.8 Flash AI' : 'Federal Heuristics Engine');
      }
    } catch (err) {
      console.error('Error creating bid strategy:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!opportunity) return;
    if (!existingStrategy) {
      fetchStrategy();
    } else {
      setStrategy(existingStrategy);
    }
  }, [opportunity?.noticeId, currentProfile.id]);

  // Synchronize or auto-generate Shipley proposal artifacts when strategy is present
  useEffect(() => {
    if (strategy && opportunity && artifacts.length === 0) {
      const initialArtifacts = generateAllShipleyArtifacts(strategy.timelinePlan, opportunity, currentProfile);
      setArtifacts(initialArtifacts);
    }
  }, [strategy, opportunity, currentProfile, artifacts.length]);

  const handleBatchGenerateArtifacts = () => {
    if (!strategy || !opportunity) return;
    const fresh = generateAllShipleyArtifacts(strategy.timelinePlan, opportunity, currentProfile);
    setArtifacts(fresh);
  };

  const handleUpdateArtifact = (updated: ShipleyProposalArtifact) => {
    setArtifacts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    if (selectedArtifact && selectedArtifact.id === updated.id) {
      setSelectedArtifact(updated);
    }
  };

  const handleQuickCopyArtifact = (artifact: ShipleyProposalArtifact) => {
    navigator.clipboard.writeText(artifact.content);
    setCopiedArtifactId(artifact.id);
    setTimeout(() => setCopiedArtifactId(null), 2200);
  };

  const handleDownloadAllArtifacts = () => {
    if (!opportunity || artifacts.length === 0) return;
    setDownloadingBundle(true);
    try {
      downloadConsolidatedShipleyPackage(artifacts, opportunity, currentProfile);
    } finally {
      setTimeout(() => setDownloadingBundle(false), 900);
    }
  };

  if (!opportunity) return null;

  const handleExportMarkdown = () => {
    if (!strategy) return;
    const content = `# SOLICITATION BUSINESS PLAN & BID STRATEGY
## Solicitation: ${opportunity.solicitationNumber} - ${opportunity.title}
### Agency: ${opportunity.department} / ${opportunity.subTier}
### Offeror: ${currentProfile.companyName} (CAGE: ${currentProfile.cageCode} | UEI: ${currentProfile.uei})
### Date: ${new Date().toLocaleDateString()}

---

## 1. EXECUTIVE SUMMARY & VALUE PROPOSITION
**P-Win Score:** ${strategy.pWinScore}%
**Bid Decision:** ${strategy.recommendation}
**Rationale:** ${strategy.recommendationRationale}

### Executive Proposal Narrative:
${strategy.executiveSummary}

---

## 2. WIN THEMES & DISCRIMINATORS
### Core Win Themes:
${strategy.winThemes.map((w) => `- ${w}`).join('\n')}

### Competitive Discriminators vs Incumbents:
${strategy.discriminators.map((d) => `- ${d}`).join('\n')}

---

## 3. SECTION L & M COMPLIANCE MATRIX
### Proposal Volumes:
${strategy.sectionLComplianceOutline.map((sec) => `#### ${sec.section}\n- Requirements: ${sec.requirements}\n- Strategy: ${sec.strategy}`).join('\n\n')}

### Section M Evaluation Tactics:
${strategy.sectionMEvaluationStrategy.map((fac) => `#### ${fac.factor} (${fac.weight})\n- Tactics: ${fac.scoringTactic}`).join('\n\n')}

---

## 4. TEAMING & FAR 52.219-14 SUBCONTRACTING PLAYBOOK
- **Recommended Role:** ${strategy.teamingStrategy.recommendedRole}
- **FAR 52.219-14 Work-Share Compliance:** ${strategy.teamingStrategy.far52_219_14_Compliance}
- **Teaming Action Plan:** ${strategy.teamingStrategy.teamingActionPlan}
- **Target Partner Profiles:**
${strategy.teamingStrategy.recommendedPartnerProfiles.map((p) => `  * ${p}`).join('\n')}

---

## 5. PRICE-TO-WIN & LABOR STRATEGY
- **Pricing Model:** ${strategy.priceToWinStrategy.recommendedPricingModel}
- **Target Operating Margin:** ${strategy.priceToWinStrategy.marginRecommendation}
- **Labor Categories:**
${strategy.priceToWinStrategy.laborCategorySuggestions.map((l) => `  * ${l.role} | ${l.rateRange} | Clearance: ${l.clearance}`).join('\n')}
- **Key Cost Drivers:**
${strategy.priceToWinStrategy.costDrivers.map((c) => `  * ${c}`).join('\n')}

---

## 6. PROPOSAL SUBMISSION TIMELINE (PINK/RED/GOLD TEAMS)
${strategy.timelinePlan.map((t) => `- T-${t.daysBeforeDue} Days: ${t.phase}\n  Deliverables: ${t.deliverables.join(', ')}`).join('\n')}
${artifacts.length > 0 ? `
---

## 7. SHIPLEY PROPOSAL PRODUCTS & ARTIFACTS INVENTORY
${artifacts.map((a, i) => `### 7.${i + 1} ${a.title} (${a.documentType} - Status: ${a.status})
- **Shipley Review Gate:** ${a.phase} (T-${a.daysBeforeDue} Days)
- **Draft Scope:** ${a.wordCount} words
- **Description:** ${a.summary}
`).join('\n')}` : ''}
`;

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SBA_Bid_Strategy_${opportunity.solicitationNumber}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getRecommendationBadge = (rec: string) => {
    if (rec.includes('PRIME')) return 'bg-emerald-600 text-white';
    if (rec.includes('TEAM') || rec.includes('JV')) return 'bg-blue-600 text-white';
    if (rec.includes('SUBCONTRACTOR')) return 'bg-purple-600 text-white';
    return 'bg-amber-600 text-white';
  };

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center transition-all ${isMaximized ? 'p-0' : 'p-1.5 sm:p-3 md:p-5'}`}>
      <div className={`bg-white border border-slate-200 shadow-2xl flex flex-col overflow-hidden transition-all duration-150 ${isMaximized ? 'w-full h-full max-w-none max-h-none rounded-none' : 'w-full max-w-5xl xl:max-w-6xl max-h-[94vh] sm:max-h-[92vh] rounded-2xl animate-in fade-in zoom-in-95'}`}>
        {/* Top Header */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-blue-500/30 text-blue-300 font-mono text-[11px] font-bold px-2 py-0.5 rounded border border-blue-400/30">
                SBA BID STRATEGY STUDIO
              </span>
              <span className="text-slate-400 text-xs font-mono">
                {opportunity.solicitationNumber}
              </span>
              {sourceTag && (
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                  {sourceTag}
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white truncate max-w-2xl">
              {opportunity.title}
            </h2>
            <p className="text-xs text-slate-400">
              Formulated for <strong className="text-slate-200">{currentProfile.companyName}</strong> (NAICS {currentProfile.primaryNaics} | {currentProfile.certifications.join(', ')})
            </p>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 self-end sm:self-center">
            <button
              onClick={() => fetchStrategy()}
              disabled={loading}
              title="Regenerate strategy with latest parameters"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleExportMarkdown}
              title="Export complete plan as Markdown"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => window.print()}
              title="Print Strategy Dossier"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsMaximized(!isMaximized)}
              title={isMaximized ? "Restore window size (Minimize to standard dialog)" : "Expand window to full screen (Maximize)"}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
            >
              {isMaximized ? <Minimize2 className="w-4 h-4 text-blue-400" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              title="Close window"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 flex items-center gap-2 overflow-x-auto text-xs font-semibold scrollbar-none">
          <button
            onClick={() => setActiveStrategyTab('win_strategy')}
            className={`py-3 px-3 border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeStrategyTab === 'win_strategy'
                ? 'border-blue-600 text-blue-700 bg-white/70'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>P-Win & Decision Matrix</span>
          </button>

          <button
            onClick={() => setActiveStrategyTab('business_plan')}
            className={`py-3 px-3 border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeStrategyTab === 'business_plan'
                ? 'border-blue-600 text-blue-700 bg-white/70'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Solicitation Business Plan</span>
          </button>

          <button
            onClick={() => setActiveStrategyTab('compliance')}
            className={`py-3 px-3 border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeStrategyTab === 'compliance'
                ? 'border-blue-600 text-blue-700 bg-white/70'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Section L & M Matrix</span>
          </button>

          <button
            onClick={() => setActiveStrategyTab('teaming')}
            className={`py-3 px-3 border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeStrategyTab === 'teaming'
                ? 'border-blue-600 text-blue-700 bg-white/70'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>FAR 52.219-14 Teaming</span>
          </button>

          <button
            onClick={() => setActiveStrategyTab('pricing')}
            className={`py-3 px-3 border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeStrategyTab === 'pricing'
                ? 'border-blue-600 text-blue-700 bg-white/70'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Price-to-Win Model</span>
          </button>

          <button
            onClick={() => setActiveStrategyTab('timeline')}
            className={`py-3 px-3 border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeStrategyTab === 'timeline'
                ? 'border-blue-600 text-blue-700 bg-white/70'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>Color Teams & Proposal Artifacts</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
              {artifacts.length > 0 ? artifacts.length : 12}
            </span>
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-6 flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin mb-4"></div>
              <h3 className="text-base font-bold text-slate-900">
                Synthesizing Opportunity Intelligence...
              </h3>
              <p className="text-xs text-slate-500 max-w-md mt-1">
                Cross-referencing solicitation scope against {currentProfile.companyName}'s NAICS codes, past performance, and FAR Part 19 socioeconomic preferences.
              </p>
            </div>
          ) : !strategy ? (
            <div className="text-center py-12">
              <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-800">No strategy formulated yet</p>
              <button
                onClick={() => fetchStrategy()}
                className="mt-3 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition"
              >
                Generate Strategy Now
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* TAB 1: P-Win & Decision Matrix */}
              {activeStrategyTab === 'win_strategy' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  {/* Scorecard Hero */}
                  <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 rounded-2xl p-6 text-white shadow-md">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                      {/* P-Win Gauge */}
                      <div className="text-center md:text-left border-b md:border-b-0 md:border-r border-slate-700 pb-4 md:pb-0 md:pr-6">
                        <span className="text-xs font-medium text-slate-400 block mb-1 uppercase tracking-wider">
                          Probability of Win (P-Win)
                        </span>
                        <div className="flex items-baseline gap-2 justify-center md:justify-start">
                          <span className="text-4xl sm:text-5xl font-extrabold font-mono text-emerald-400">
                            {strategy.pWinScore}%
                          </span>
                          <span className="text-xs text-emerald-300 font-medium">Competitive Confidence</span>
                        </div>
                        <div className="w-full bg-slate-700 h-2.5 rounded-full mt-3 overflow-hidden">
                          <div 
                            className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                            style={{ width: `${strategy.pWinScore}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Bid Decision */}
                      <div className="md:col-span-2 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">Bid / No-Bid Decision:</span>
                          <span className={`text-xs font-extrabold font-mono px-3 py-1 rounded-md uppercase tracking-wider ${getRecommendationBadge(strategy.recommendation)}`}>
                            {strategy.recommendation}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {strategy.recommendationRationale}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Win Themes */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-blue-600" />
                      <span>Strategic Win Themes (Agency Aligned)</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {strategy.winThemes.map((theme, i) => (
                        <div key={i} className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <p className="text-xs text-slate-800 font-medium leading-relaxed">
                            {theme}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Discriminators */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                      <span>Key Discriminators vs Incumbents & Large Rivals</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {strategy.discriminators.map((disc, i) => (
                        <div key={i} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <p className="text-xs text-slate-700 leading-relaxed">
                            {disc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Solicitation Business Plan */}
              {activeStrategyTab === 'business_plan' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <span className="text-[11px] font-mono text-slate-400 uppercase">Volume I Proposal Lead-In</span>
                        <h3 className="text-base font-bold text-slate-900">Executive Summary & Technical Methodology</h3>
                      </div>
                      <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-1 rounded">
                        FAR 15.305 Compliant
                      </span>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-line font-sans">
                      {strategy.executiveSummary}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
                      <div className="p-3 bg-blue-50/60 border border-blue-200/60 rounded-lg">
                        <span className="font-bold text-blue-900 block mb-1">Contract Type & Billing</span>
                        <p className="text-slate-700">{opportunity.contractType}</p>
                      </div>
                      <div className="p-3 bg-purple-50/60 border border-purple-200/60 rounded-lg">
                        <span className="font-bold text-purple-900 block mb-1">Set-Aside Strategy</span>
                        <p className="text-slate-700">{opportunity.setAside}</p>
                      </div>
                      <div className="p-3 bg-emerald-50/60 border border-emerald-200/60 rounded-lg">
                        <span className="font-bold text-emerald-900 block mb-1">Clearance Protocol</span>
                        <p className="text-slate-700">{opportunity.requiredClearance} Verified</p>
                      </div>
                    </div>
                  </div>

                  {/* Core Operational Plan */}
                  <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-3">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Operational Risk Mitigation Controls
                    </h3>
                    <div className="space-y-2">
                      {strategy.riskMatrix.map((risk, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="sm:max-w-md">
                            <span className="font-semibold text-slate-900 block">{risk.risk}</span>
                            <span className="text-slate-500">{risk.mitigation}</span>
                          </div>
                          <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded self-start sm:self-center ${
                            risk.impact === 'High' ? 'bg-red-100 text-red-800' :
                            risk.impact === 'Medium' ? 'bg-amber-100 text-amber-800' :
                            'bg-slate-200 text-slate-700'
                          }`}>
                            {risk.impact} Impact
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Section L & M Compliance Matrix */}
              {activeStrategyTab === 'compliance' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  {/* Section L Proposal Volumes */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                      Section L: Instructions, Conditions & Submission Volumes
                    </h3>
                    <div className="space-y-3">
                      {strategy.sectionLComplianceOutline.map((sec, i) => (
                        <div key={i} className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                              {i + 1}
                            </span>
                            <h4 className="font-bold text-slate-900 text-sm">{sec.section}</h4>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80">
                              <span className="font-semibold text-slate-700 block mb-0.5">Section L Mandate:</span>
                              <p className="text-slate-600">{sec.requirements}</p>
                            </div>
                            <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-200/80">
                              <span className="font-semibold text-blue-900 block mb-0.5">Our Response Strategy:</span>
                              <p className="text-blue-800">{sec.strategy}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section M Evaluation Factors */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                      Section M: Evaluation Factors for Award
                    </h3>
                    <div className="space-y-3">
                      {strategy.sectionMEvaluationStrategy.map((fac, i) => (
                        <div key={i} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-slate-900 text-sm">{fac.factor}</h4>
                              <span className="text-[10px] font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                Weight: {fac.weight}
                              </span>
                            </div>
                            <p className="text-slate-600">{fac.scoringTactic}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: Teaming & FAR 52.219-14 */}
              {activeStrategyTab === 'teaming' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  {/* Role & FAR 52.219-14 Box */}
                  <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 text-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-amber-200 mb-3">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-amber-700" />
                        <h3 className="text-sm font-bold text-amber-950">
                          FAR 52.219-14 Limitations on Subcontracting Compliance
                        </h3>
                      </div>
                      <span className="bg-amber-200 text-amber-900 font-mono font-bold px-2 py-0.5 rounded">
                        Role: {strategy.teamingStrategy.recommendedRole}
                      </span>
                    </div>

                    <p className="text-slate-800 leading-relaxed mb-3">
                      {strategy.teamingStrategy.far52_219_14_Compliance}
                    </p>

                    <div className="p-3 bg-white/90 border border-amber-300 rounded-lg text-slate-700">
                      <span className="font-bold text-slate-900 block mb-1">Teaming Action Plan:</span>
                      <p>{strategy.teamingStrategy.teamingActionPlan}</p>
                    </div>
                  </div>

                  {/* Recommended Partners */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                      Recommended Subcontractor & Teaming Partner Profiles
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {strategy.teamingStrategy.recommendedPartnerProfiles.map((partner, i) => (
                        <div key={i} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5 text-xs text-slate-800">
                          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                          <span>{partner}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: Price-to-Win Model */}
              {activeStrategyTab === 'pricing' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs text-xs">
                      <span className="text-slate-400 font-medium block">Recommended Contract Pricing Model</span>
                      <span className="text-base font-bold text-slate-900 block mt-0.5">
                        {strategy.priceToWinStrategy.recommendedPricingModel}
                      </span>
                    </div>

                    <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs text-xs">
                      <span className="text-slate-400 font-medium block">Target Gross Margin</span>
                      <span className="text-base font-bold text-emerald-600 block mt-0.5">
                        {strategy.priceToWinStrategy.marginRecommendation}
                      </span>
                    </div>
                  </div>

                  {/* Labor Categories */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                      Labor Category & Rate Range Guidance (Fully Burdened)
                    </h3>
                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                          <tr>
                            <th className="py-2.5 px-4">Labor Category / Role</th>
                            <th className="py-2.5 px-4">Rate Range (Fully Burdened)</th>
                            <th className="py-2.5 px-4">Clearance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {strategy.priceToWinStrategy.laborCategorySuggestions.map((cat, i) => (
                            <tr key={i} className="hover:bg-slate-50">
                              <td className="py-2.5 px-4 font-medium text-slate-900">{cat.role}</td>
                              <td className="py-2.5 px-4 font-mono font-semibold text-emerald-700">{cat.rateRange}</td>
                              <td className="py-2.5 px-4">
                                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                                  {cat.clearance}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Key Cost Drivers */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                      Key Cost Drivers to Manage
                    </h3>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {strategy.priceToWinStrategy.costDrivers.map((driver, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                          <span>{driver}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* TAB 6: Submission Timeline & Shipley Proposal Products */}
              {activeStrategyTab === 'timeline' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  {/* Master Shipley Products Header Banner */}
                  <div className="bg-linear-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-2xl p-5 border border-blue-900/70 shadow-lg space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="p-1 rounded-md bg-blue-500/20 text-blue-300 border border-blue-400/30">
                            <Package className="w-4 h-4" />
                          </span>
                          <span className="text-xs uppercase font-bold tracking-wider text-blue-300">
                            Shipley Federal Proposal Framework
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-white tracking-tight">
                          Color Team Review Schedule & Generated Proposal Products
                        </h3>
                        <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                          Every task in this review schedule is linked to an actionable, fully-drafted federal proposal product populated with your profile data (CAGE: {currentProfile.cageCode}, UEI: {currentProfile.uei}) and Solicitation <strong>{opportunity.solicitationNumber}</strong> scope deliverables.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                        <button
                          type="button"
                          onClick={handleBatchGenerateArtifacts}
                          className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                          title="Regenerate all proposal products using latest solicitation data"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-blue-300" />
                          <span>Refresh All Drafts</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleDownloadAllArtifacts}
                          disabled={downloadingBundle || artifacts.length === 0}
                          className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                          title="Download all generated Shipley proposal artifacts in one consolidated document package"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>{downloadingBundle ? 'Bundling...' : 'Download Complete Package (.md)'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Readiness Metrics Bar */}
                    <div className="pt-3 border-t border-blue-900/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="bg-white/5 rounded-lg p-2.5 border border-white/10">
                        <span className="text-[11px] text-slate-400 block">Total Proposal Deliverables</span>
                        <strong className="text-sm font-bold text-white font-mono">{artifacts.length || 12} Products</strong>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2.5 border border-white/10">
                        <span className="text-[11px] text-slate-400 block">Draft Ready & Verified</span>
                        <strong className="text-sm font-bold text-emerald-400 font-mono">
                          {artifacts.filter((a) => a.status === 'Draft Ready' || a.status === 'Approved & Signed').length} Ready
                        </strong>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2.5 border border-white/10">
                        <span className="text-[11px] text-slate-400 block">Under Formal Review</span>
                        <strong className="text-sm font-bold text-amber-400 font-mono">
                          {artifacts.filter((a) => a.status === 'Under Review').length} Reviewing
                        </strong>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2.5 border border-white/10">
                        <span className="text-[11px] text-slate-400 block">Estimated Text Volume</span>
                        <strong className="text-sm font-bold text-blue-300 font-mono">
                          ~{artifacts.reduce((sum, a) => sum + (a.wordCount || 0), 0).toLocaleString()} Words
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Stage Filter Buttons */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                    <span className="text-slate-500 font-medium shrink-0 flex items-center gap-1">
                      <SlidersHorizontal className="w-3.5 h-3.5" /> Filter Gate:
                    </span>
                    <button
                      type="button"
                      onClick={() => setStageFilter('all')}
                      className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer shrink-0 ${
                        stageFilter === 'all'
                          ? 'bg-blue-600 text-white font-bold'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      All Review Stages ({artifacts.length})
                    </button>
                    {strategy.timelinePlan.map((stage, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setStageFilter(stage.phase)}
                        className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer shrink-0 ${
                          stageFilter === stage.phase
                            ? 'bg-blue-600 text-white font-bold'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {stage.phase.split('(')[0].trim()} (T-{stage.daysBeforeDue}d)
                      </button>
                    ))}
                  </div>

                  {/* Review Stages List */}
                  <div className="space-y-6">
                    {strategy.timelinePlan
                      .filter((stage) => stageFilter === 'all' || stageFilter === stage.phase)
                      .map((stage, i) => {
                        const isKickoff = stage.phase.toLowerCase().includes('kickoff');
                        const isPink = stage.phase.toLowerCase().includes('pink');
                        const isRed = stage.phase.toLowerCase().includes('red');
                        const isGold = stage.phase.toLowerCase().includes('gold');

                        const stageColor = isGold
                          ? 'border-amber-300 bg-amber-50/40 text-amber-950'
                          : isRed
                          ? 'border-rose-300 bg-rose-50/40 text-rose-950'
                          : isPink
                          ? 'border-pink-300 bg-pink-50/40 text-pink-950'
                          : 'border-blue-300 bg-blue-50/40 text-blue-950';

                        const badgeColor = isGold
                          ? 'bg-amber-600 text-white'
                          : isRed
                          ? 'bg-rose-600 text-white'
                          : isPink
                          ? 'bg-pink-600 text-white'
                          : 'bg-blue-600 text-white';

                        return (
                          <div key={i} className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                            {/* Stage Header */}
                            <div className={`px-5 py-3.5 border-b flex flex-wrap items-center justify-between gap-2.5 ${stageColor}`}>
                              <div className="flex items-center gap-2.5">
                                <span className={`px-2.5 py-0.5 rounded-md font-mono font-bold text-xs shadow-2xs ${badgeColor}`}>
                                  T-{stage.daysBeforeDue} Days
                                </span>
                                <h4 className="font-bold text-slate-900 text-sm">{stage.phase}</h4>
                              </div>

                              <span className="text-xs text-slate-600 font-medium">
                                {stage.deliverables.length} Required Review Products
                              </span>
                            </div>

                            {/* Deliverables / Generated Products Grid */}
                            <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                              {stage.deliverables.map((del, dIdx) => {
                                // Find matched artifact or generate one on the fly
                                const artifact =
                                  artifacts.find(
                                    (a) =>
                                      a.deliverableName.toLowerCase() === del.toLowerCase() ||
                                      a.title.toLowerCase().includes(del.toLowerCase())
                                  ) ||
                                  generateArtifactForDeliverable(
                                    del,
                                    stage.phase,
                                    stage.daysBeforeDue,
                                    opportunity,
                                    currentProfile
                                  );

                                const isCopied = copiedArtifactId === artifact.id;

                                const getDocTagStyle = (type: string) => {
                                  switch (type) {
                                    case 'Compliance Matrix':
                                      return 'bg-purple-100 text-purple-800 border-purple-200';
                                    case 'Proposal Volume':
                                      return 'bg-blue-100 text-blue-800 border-blue-200';
                                    case 'Legal & Teaming':
                                      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
                                    case 'Pricing & BOE':
                                      return 'bg-amber-100 text-amber-800 border-amber-200';
                                    case 'Staffing & Resumes':
                                      return 'bg-indigo-100 text-indigo-800 border-indigo-200';
                                    case 'Executive Approval':
                                      return 'bg-rose-100 text-rose-800 border-rose-200';
                                    case 'Submission Package':
                                      return 'bg-sky-100 text-sky-800 border-sky-200';
                                    default:
                                      return 'bg-slate-100 text-slate-800 border-slate-200';
                                  }
                                };

                                return (
                                  <div
                                    key={dIdx}
                                    className="bg-slate-50/70 border border-slate-200/90 rounded-xl p-3.5 flex flex-col justify-between hover:border-blue-300 hover:bg-blue-50/20 transition group shadow-2xs"
                                  >
                                    <div className="space-y-2">
                                      {/* Top Row: Type and Status */}
                                      <div className="flex items-center justify-between gap-1.5">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getDocTagStyle(artifact.documentType)}`}>
                                          {artifact.documentType}
                                        </span>

                                        <span
                                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                            artifact.status === 'Approved & Signed'
                                              ? 'bg-emerald-100 text-emerald-800'
                                              : artifact.status === 'Under Review'
                                              ? 'bg-amber-100 text-amber-800'
                                              : 'bg-blue-100 text-blue-800'
                                          }`}
                                        >
                                          ✓ {artifact.status}
                                        </span>
                                      </div>

                                      {/* Artifact Title */}
                                      <div>
                                        <h5 className="font-bold text-slate-900 text-xs leading-snug line-clamp-2 group-hover:text-blue-700 transition">
                                          {artifact.title}
                                        </h5>
                                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                                          {artifact.summary}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Bottom Area: Stats & Action Buttons */}
                                    <div className="pt-3 mt-2 border-t border-slate-200/70 space-y-2">
                                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                                        <span>{artifact.wordCount || 850} words</span>
                                        <span>~{Math.max(1, Math.ceil((artifact.wordCount || 850) / 420))} pages</span>
                                      </div>

                                      <div className="flex items-center gap-1.5 pt-1">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setSelectedArtifact(artifact);
                                            setIsArtifactModalOpen(true);
                                          }}
                                          className="flex-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 shadow-2xs transition cursor-pointer"
                                          title="Open document editor and preview"
                                        >
                                          <Sparkles className="w-3 h-3 text-amber-300" />
                                          <span>View & Edit</span>
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => handleQuickCopyArtifact(artifact)}
                                          className="p-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-[11px] transition cursor-pointer"
                                          title="Copy document text to clipboard"
                                        >
                                          {isCopied ? (
                                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                                          ) : (
                                            <Copy className="w-3.5 h-3.5" />
                                          )}
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => downloadArtifact(artifact, opportunity)}
                                          className="p-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-[11px] transition cursor-pointer"
                                          title="Download artifact as Markdown"
                                        >
                                          <Download className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Due Date: <strong className="text-slate-800">{new Date(opportunity.responseDeadLine).toLocaleDateString()}</strong>
            {artifacts.length > 0 && (
              <span className="ml-3 text-blue-700 font-semibold hidden sm:inline">
                • {artifacts.length} Shipley proposal products ready
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportMarkdown}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
              title="Export complete strategy and artifact inventory as Markdown"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Dossier (.md)</span>
            </button>

            {strategy && (
              <button
                onClick={() => {
                  onSaveToPipeline(opportunity, strategy, artifacts);
                  onClose();
                }}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md rounded-lg flex items-center gap-2 transition cursor-pointer"
              >
                <BookmarkCheck className="w-4 h-4" />
                <span>Save Strategy & Products to Pipeline</span>
              </button>
            )}
          </div>
        </div>

        {/* Shipley Artifact Preview & Editor Modal */}
        {isArtifactModalOpen && selectedArtifact && (
          <ShipleyArtifactModal
            artifact={selectedArtifact}
            opportunity={opportunity}
            profile={currentProfile}
            isOpen={isArtifactModalOpen}
            onClose={() => setIsArtifactModalOpen(false)}
            onUpdateArtifact={handleUpdateArtifact}
          />
        )}
      </div>
    </div>
  );
};
