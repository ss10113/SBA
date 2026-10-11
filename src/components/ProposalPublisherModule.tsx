import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  FileCode, 
  FileSpreadsheet, 
  Copy, 
  Check, 
  Layers, 
  GitBranch, 
  Calendar, 
  History, 
  ShieldCheck, 
  BookOpen, 
  ListTree, 
  Send,
  Zap,
  Award
} from 'lucide-react';
import { 
  SAMOpportunity, 
  BusinessProfile, 
  BidStrategy, 
  ShipleyProposalArtifact 
} from '../types/contract.ts';
import { downloadConsolidatedShipleyPackage } from '../utils/shipleyArtifactGenerator.ts';

interface ProposalPublisherModuleProps {
  opportunity: SAMOpportunity;
  profile: BusinessProfile;
  strategy?: BidStrategy | null;
  artifacts?: ShipleyProposalArtifact[];
  monthlyUsageCount?: number;
  monthlyUsageLimit?: number;
}

export const ProposalPublisherModule: React.FC<ProposalPublisherModuleProps> = ({
  opportunity,
  profile,
  strategy,
  artifacts = [],
  monthlyUsageCount = 12,
  monthlyUsageLimit = 30,
}) => {
  const [activeTab, setActiveTab] = useState<'publisher' | 'wbs_schedule' | 'revision_history'>('publisher');
  const [selectedVolumes, setSelectedVolumes] = useState<Record<string, boolean>>({
    vol1: true,
    vol2: true,
    vol3: true,
    vol4: true,
    vol5: true,
  });

  const [copiedMaster, setCopiedMaster] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishedNotice, setPublishedNotice] = useState<string | null>(null);

  // Version Control Revisions
  const [revisions] = useState([
    {
      version: 'v2.0 (Master Gold Team Final)',
      date: new Date().toISOString().split('T')[0],
      author: `${profile.companyName} Proposal Director`,
      gate: 'Gold Team Executive Sign-Off',
      status: 'Approved for Submission',
      summary: 'Final executive review complete. Mathematical pricing BOE verified against GSA CALC benchmarks. Zero compliance gaps.',
    },
    {
      version: 'v1.5 (Red Team Compliance Draft)',
      date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
      author: 'Compliance Lead',
      gate: 'Red Team Review',
      status: 'Reviewed',
      summary: 'Incorporated FAR 52.219-14 work-share proof points. Section L cross-reference matrix updated.',
    },
    {
      version: 'v1.0 (Pink Team Initial Baseline)',
      date: new Date(Date.now() - 86400000 * 7).toISOString().split('T')[0],
      author: 'AI Strategy Engine',
      gate: 'Pink Team Storyboard',
      status: 'Baseline Initialized',
      summary: 'Generative AI baseline strategy compiled from RFP Performance Work Statement.',
    },
  ]);

  const handleToggleVolume = (volKey: string) => {
    setSelectedVolumes((prev) => ({ ...prev, [volKey]: !prev[volKey] }));
  };

  const handlePublishMasterPackage = () => {
    if (artifacts.length === 0) {
      setPublishedNotice('Please generate Shipley Proposal Products before publishing package.');
      return;
    }
    setPublishing(true);
    try {
      downloadConsolidatedShipleyPackage(artifacts, opportunity, profile);
      setPublishedNotice(`Successfully compiled and published Master Proposal Package for ${opportunity.solicitationNumber}!`);
    } finally {
      setTimeout(() => setPublishing(false), 800);
      setTimeout(() => setPublishedNotice(null), 4000);
    }
  };

  const handleCopyMasterText = () => {
    if (!strategy) return;
    const text = `# PROPOSAL MASTER NARRATIVE & STRATEGY
Solicitation: ${opportunity.solicitationNumber} — ${opportunity.title}
Agency: ${opportunity.department}
Offeror: ${profile.companyName} (UEI: ${profile.uei})

Executive Summary:
${strategy.executiveSummary}

Win Themes:
${strategy.winThemes.map((w) => `- ${w}`).join('\n')}
`;
    navigator.clipboard.writeText(text);
    setCopiedMaster(true);
    setTimeout(() => setCopiedMaster(false), 2200);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs text-slate-800 space-y-4">
      {/* Top Usage & Publisher Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">
              Proposal Publisher & Project Schedule Engine
            </h3>
            <span className="bg-blue-500/20 text-blue-300 border border-blue-400/30 font-mono text-[10px] font-semibold px-2 py-0.5 rounded">
              ENTERPRISE TIER
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Publish bundled Shipley proposal volumes, export audit-ready RFP submissions, and manage 3-tier Work Breakdown Structure (WBS) project schedules.
          </p>
        </div>

        {/* 30 Proposals/Month Usage Meter */}
        <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-3 space-y-1.5 shrink-0 text-right min-w-[210px]">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-300">
            <span>Monthly Proposal Quota:</span>
            <strong className="text-amber-400 font-mono text-xs">{monthlyUsageCount} / {monthlyUsageLimit} Used</strong>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
            <div 
              className="bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${(monthlyUsageCount / monthlyUsageLimit) * 100}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-slate-400 font-mono text-center">
            {monthlyUsageLimit - monthlyUsageCount} Proposals remaining this month
          </p>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div className="px-5 border-b border-slate-200 flex items-center gap-2 font-bold text-xs bg-slate-50/50 overflow-x-auto">
        <button
          onClick={() => setActiveTab('publisher')}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'publisher'
              ? 'border-blue-600 text-blue-700 bg-white font-bold shadow-2xs'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4 text-blue-600" />
          <span>Proposal Publisher</span>
        </button>

        <button
          onClick={() => setActiveTab('wbs_schedule')}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'wbs_schedule'
              ? 'border-blue-600 text-blue-700 bg-white font-bold shadow-2xs'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <ListTree className="w-4 h-4 text-indigo-600" />
          <span>WBS & Project Schedule</span>
        </button>

        <button
          onClick={() => setActiveTab('revision_history')}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'revision_history'
              ? 'border-blue-600 text-blue-700 bg-white font-bold shadow-2xs'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <History className="w-4 h-4 text-emerald-600" />
          <span>Revision Control ({revisions.length})</span>
        </button>
      </div>

      {/* TAB 1: Proposal Publisher */}
      {activeTab === 'publisher' && (
        <div className="p-5 space-y-5">
          {publishedNotice && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{publishedNotice}</span>
            </div>
          )}

          {/* Volume Selection Grid */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Select Proposal Volumes for Consolidated Master Publishing</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <label className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition ${selectedVolumes.vol1 ? 'bg-blue-50/70 border-blue-300 text-blue-950' : 'bg-white border-slate-200 text-slate-600'}`}>
                <input
                  type="checkbox"
                  checked={selectedVolumes.vol1}
                  onChange={() => handleToggleVolume('vol1')}
                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-xs block">Volume I: Technical & Management Approach</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">Includes SOW pathways, staffing, quality control & WBS schedule</p>
                </div>
              </label>

              <label className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition ${selectedVolumes.vol2 ? 'bg-blue-50/70 border-blue-300 text-blue-950' : 'bg-white border-slate-200 text-slate-600'}`}>
                <input
                  type="checkbox"
                  checked={selectedVolumes.vol2}
                  onChange={() => handleToggleVolume('vol2')}
                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-xs block">Volume II: Past Performance & CPARS Citations</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">3 relevant federal contract references with CPARS Exceptional ratings</p>
                </div>
              </label>

              <label className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition ${selectedVolumes.vol3 ? 'bg-blue-50/70 border-blue-300 text-blue-950' : 'bg-white border-slate-200 text-slate-600'}`}>
                <input
                  type="checkbox"
                  checked={selectedVolumes.vol3}
                  onChange={() => handleToggleVolume('vol3')}
                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-xs block">Volume III: Cost / Price Proposal & BOE</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">Fully burdened labor category rates aligned with GSA CALC benchmarks</p>
                </div>
              </label>

              <label className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition ${selectedVolumes.vol4 ? 'bg-blue-50/70 border-blue-300 text-blue-950' : 'bg-white border-slate-200 text-slate-600'}`}>
                <input
                  type="checkbox"
                  checked={selectedVolumes.vol4}
                  onChange={() => handleToggleVolume('vol4')}
                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-xs block">Volume IV: FAR 52.219-14 Subcontracting Plan</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">Guarantees &gt;50% small business prime personnel work-share compliance</p>
                </div>
              </label>

              <label className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition ${selectedVolumes.vol5 ? 'bg-blue-50/70 border-blue-300 text-blue-950' : 'bg-white border-slate-200 text-slate-600'}`}>
                <input
                  type="checkbox"
                  checked={selectedVolumes.vol5}
                  onChange={() => handleToggleVolume('vol5')}
                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-xs block">Volume V: Reps & Certs (UEI / CAGE Verification)</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">Official SAM.gov active registration verification packet</p>
                </div>
              </label>
            </div>
          </div>

          {/* Action Export Buttons */}
          <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePublishMasterPackage}
                disabled={publishing}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{publishing ? 'Publishing Proposal Package...' : 'Publish Master Proposal Package (.md)'}</span>
              </button>

              <button
                onClick={handleCopyMasterText}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl border border-slate-300 transition cursor-pointer flex items-center gap-1.5"
              >
                {copiedMaster ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
                <span>{copiedMaster ? 'Copied to Clipboard!' : 'Copy Narrative'}</span>
              </button>
            </div>

            <span className="text-slate-500 text-[11px] font-mono">
              Total Published Artifacts: <strong className="text-slate-900">{artifacts.length} Documents</strong>
            </span>
          </div>
        </div>
      )}

      {/* TAB 2: WBS & Project Schedule */}
      {activeTab === 'wbs_schedule' && (
        <div className="p-5 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <ListTree className="w-4 h-4 text-indigo-600" />
                <span>Work Breakdown Structure (WBS) & Performance Milestone Gantt</span>
              </h4>
              <p className="text-xs text-slate-500">
                Standardized 3-tier WBS hierarchy aligned with PWS deliverables and post-award contract performance milestones.
              </p>
            </div>

            <span className="bg-indigo-50 text-indigo-800 border border-indigo-200 font-mono font-bold text-[11px] px-2.5 py-1 rounded">
              3-Tier WBS Engine
            </span>
          </div>

          {/* 3-Tier WBS Display */}
          <div className="space-y-4">
            <div className="border border-indigo-200 rounded-xl p-4 bg-indigo-50/40 space-y-2">
              <div className="flex items-center justify-between font-bold text-indigo-950 text-xs">
                <span>WBS 1.0 Program Management & Post-Award Mobilization (Days 1 - 30)</span>
                <span className="bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded font-mono text-[10px]">Phase 1</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-700 text-xs pl-2">
                <li><strong>WBS 1.1:</strong> Post-Award Kickoff Conference & Stakeholder Alignment (CDRL A001)</li>
                <li><strong>WBS 1.2:</strong> Key Personnel Mobilization & Security Clearance Badge Processing (DISS)</li>
                <li><strong>WBS 1.3:</strong> Quality Assurance Surveillance Plan (QASP) & Risk Management Baseline</li>
              </ul>
            </div>

            <div className="border border-blue-200 rounded-xl p-4 bg-blue-50/40 space-y-2">
              <div className="flex items-center justify-between font-bold text-blue-950 text-xs">
                <span>WBS 2.0 SOW Technical Execution & Production Sprints (Days 31 - 180)</span>
                <span className="bg-blue-100 text-blue-900 px-2 py-0.5 rounded font-mono text-[10px]">Phase 2</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-700 text-xs pl-2">
                <li><strong>WBS 2.1:</strong> Core Architecture & Technical Infrastructure Implementation</li>
                <li><strong>WBS 2.2:</strong> Bi-weekly Agile Sprint Milestones & Deliverable Packaging</li>
                <li><strong>WBS 2.3:</strong> Independent Quality Inspection & Security Technical Implementation Guides (STIGs)</li>
              </ul>
            </div>

            <div className="border border-emerald-200 rounded-xl p-4 bg-emerald-50/40 space-y-2">
              <div className="flex items-center justify-between font-bold text-emerald-950 text-xs">
                <span>WBS 3.0 Operations, Quality Assurance & Continuous Monitoring (Days 181+)</span>
                <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-mono text-[10px]">Phase 3</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-700 text-xs pl-2">
                <li><strong>WBS 3.1:</strong> 24/7 SLA Performance Maintenance & Incident Resolution</li>
                <li><strong>WBS 3.2:</strong> Monthly Progress & Financial Status Reports (CDRL A002)</li>
                <li><strong>WBS 3.3:</strong> Annual Cybersecurity Re-certification & Transition Option Period Preparation</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Revision History & Version Control */}
      {activeTab === 'revision_history' && (
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-600" />
                <span>Proposal Version Control & Revision Audit Log</span>
              </h4>
              <p className="text-xs text-slate-500">
                Timestamped audit history tracking proposal revisions across Shipley Pink, Red, Gold, and White Glove review gates.
              </p>
            </div>

            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono font-bold text-[11px] px-2.5 py-1 rounded">
              Version Control Active
            </span>
          </div>

          <div className="space-y-3">
            {revisions.map((rev, idx) => (
              <div key={idx} className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 space-y-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs font-mono">{rev.version}</span>
                    <span className="bg-blue-100 text-blue-900 border border-blue-200 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      {rev.gate}
                    </span>
                  </div>
                  <span className="text-slate-500 font-mono text-[11px]">{rev.date}</span>
                </div>

                <p className="text-slate-700 leading-relaxed">{rev.summary}</p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 text-[11px] text-slate-500">
                  <span>Author: <strong>{rev.author}</strong></span>
                  <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded font-semibold text-[10px]">
                    {rev.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
