import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Layers,
  Users,
  FileText,
  Copy,
  Check,
  Download,
  Shield,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Building2,
  ExternalLink,
  Briefcase,
  Wrench,
  UserCheck,
  FileCheck,
  Printer,
  Eye,
  FileSpreadsheet,
  BadgeCheck,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import {
  SAMOpportunity,
  BusinessProfile,
  SowResourceStrategy,
  SowRequirementSolution,
  OpportunityAttachment,
} from '../types/contract';
import { extractAllOpportunityAttachmentIntelligence } from '../utils/attachmentDownloader';

interface SowExecutionStrategyViewProps {
  opportunity: SAMOpportunity;
  currentProfile: BusinessProfile;
  initialPlan?: SowResourceStrategy | null;
  onPlanUpdated?: (plan: SowResourceStrategy) => void;
  onViewAttachment?: (att: OpportunityAttachment) => void;
}

export const SowExecutionStrategyView: React.FC<SowExecutionStrategyViewProps> = ({
  opportunity,
  currentProfile,
  initialPlan,
  onPlanUpdated,
  onViewAttachment,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'pathways' | 'resources' | 'proposal_draft'>('pathways');
  const [plan, setPlan] = useState<SowResourceStrategy | null>(initialPlan || null);
  const [loading, setLoading] = useState(false);
  const [sourceTag, setSourceTag] = useState<string>('');
  const [copiedFull, setCopiedFull] = useState(false);
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);
  const [focusDirective, setFocusDirective] = useState('Comprehensive SOW Technical Execution & Shipley RFP Compliance');
  const [draftText, setDraftText] = useState<string>('');
  const [isEditingDraft, setIsEditingDraft] = useState(false);
  const [showSowSummary, setShowSowSummary] = useState(true);
  const [copiedSow, setCopiedSow] = useState(false);

  // Extract all internal PDF & attachment intelligence
  const attIntel = useMemo(() => extractAllOpportunityAttachmentIntelligence(opportunity), [opportunity]);

  const handleCopySow = () => {
    const textToCopy = opportunity.requirementsSummary || opportunity.description;
    navigator.clipboard.writeText(textToCopy);
    setCopiedSow(true);
    setTimeout(() => setCopiedSow(false), 2000);
  };

  const FOCUS_OPTIONS = [
    { label: 'Comprehensive Technical & Management Approach', value: 'Comprehensive SOW Technical Execution, Risk Minimization, and Shipley RFP Compliance' },
    { label: 'Rapid Mobilization & Risk Reduction', value: 'Accelerated 15-day Post-Award Mobilization, Warm Bench Staffing, and Proactive Risk Abatement' },
    { label: 'Technical Innovation & Zero Trust', value: 'Technical Innovation, Modern Tooling Automation, FedRAMP, and NIST SP 800-53 Zero Trust' },
    { label: 'Cost Efficiency & SBA Prime Advantage', value: 'Cost Reasonableness, Lean Management, and FAR 52.219-14 Small Business Prime Maximization' },
  ];

  const fetchPlan = async (customDirective?: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/sow-resources-strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunity,
          profile: currentProfile,
          focusDirective: customDirective || focusDirective,
          attachments: attIntel.files.map((f) => ({
            name: f.name,
            type: f.type,
            category: f.category,
            content: f.content,
          })),
          attachmentIntelligence: {
            totalFiles: attIntel.totalFiles,
            totalWordCount: attIntel.totalWordCount,
            hasPws: attIntel.hasPws,
            hasSectionL: attIntel.hasSectionL,
            hasSectionM: attIntel.hasSectionM,
            hasPricingSheet: attIntel.hasPricingSheet,
            hasCdrl: attIntel.hasCdrl,
          },
        }),
      });

      const data = await res.json();
      if (data.plan) {
        setPlan(data.plan);
        setDraftText(data.plan.proposalVolumeDraft?.fullText || '');
        setSourceTag(
          data.source === 'gemini-ai'
            ? 'Gemini 3.8 Flash AI (Attachments Grounded)'
            : data.source?.includes('local')
              ? 'Local AI'
              : 'Federal Heuristics Engine (Attachments Grounded)'
        );
        if (onPlanUpdated) {
          onPlanUpdated(data.plan);
        }
      }
    } catch (err) {
      console.error('Error fetching SOW resources and strategy:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialPlan) {
      setPlan(initialPlan);
      setDraftText(initialPlan.proposalVolumeDraft?.fullText || '');
    } else {
      fetchPlan();
    }
  }, [opportunity.noticeId, currentProfile.id]);

  const handleCopyFullProposal = () => {
    const textToCopy = draftText || plan?.proposalVolumeDraft?.fullText || '';
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopiedFull(true);
    setTimeout(() => setCopiedFull(false), 2500);
  };

  const handleCopySnippet = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippetId(id);
    setTimeout(() => setCopiedSnippetId(null), 2500);
  };

  const handleDownloadMarkdown = () => {
    const textToDownload = draftText || plan?.proposalVolumeDraft?.fullText || '';
    if (!textToDownload) return;
    const blob = new Blob([textToDownload], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RFP_Volume_I_SOW_Execution_${opportunity.solicitationNumber}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = () => {
    const text = draftText || plan?.proposalVolumeDraft?.fullText || '';
    if (!text) return;

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'letter',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 40;
      const contentWidth = pageWidth - margin * 2;

      // Header Bar
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, pageWidth, 55, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('OFFICIAL RFP PROPOSAL VOLUME I: TECHNICAL & MANAGEMENT APPROACH', margin, 28);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(203, 213, 225);
      doc.text(
        `SOLICITATION: ${opportunity.solicitationNumber} | OFFEROR: ${currentProfile.companyName} (CAGE: ${currentProfile.cageCode})`,
        margin,
        44
      );

      let y = 75;
      const lines = doc.splitTextToSize(text, contentWidth);

      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);

      for (let i = 0; i < lines.length; i++) {
        if (y > pageHeight - margin - 25) {
          doc.setFontSize(8);
          doc.setTextColor(148, 163, 184);
          doc.text(`Volume I - Technical Approach | ${opportunity.solicitationNumber}`, margin, pageHeight - 15);
          doc.text(`Page ${doc.getNumberOfPages()}`, pageWidth - margin - 35, pageHeight - 15);

          doc.addPage();
          y = margin;
          doc.setFontSize(9.5);
          doc.setTextColor(30, 41, 59);
        }

        const line = lines[i];
        if (line.startsWith('# ')) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(13);
          doc.setTextColor(15, 23, 42);
          y += 6;
          doc.text(line.replace('# ', ''), margin, y);
          y += 16;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9.5);
          doc.setTextColor(30, 41, 59);
        } else if (line.startsWith('## ')) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.setTextColor(30, 58, 138);
          y += 4;
          doc.text(line.replace('## ', ''), margin, y);
          y += 14;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9.5);
          doc.setTextColor(30, 41, 59);
        } else if (line.startsWith('### ')) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.setTextColor(51, 65, 85);
          y += 3;
          doc.text(line.replace('### ', ''), margin, y);
          y += 13;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9.5);
          doc.setTextColor(30, 41, 59);
        } else {
          doc.text(line, margin, y);
          y += 12;
        }
      }

      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`Volume I - Technical Approach | ${opportunity.solicitationNumber}`, margin, pageHeight - 15);
      doc.text(`Page ${doc.getNumberOfPages()}`, pageWidth - margin - 35, pageHeight - 15);

      doc.save(`RFP_Volume_I_${opportunity.solicitationNumber}_Technical_Approach.pdf`);
    } catch (e) {
      console.error('Error exporting PDF:', e);
    }
  };

  const totalDeliverablesCount = plan?.sowRequirements.reduce(
    (acc, req) => acc + req.executionPathways.reduce((pAcc, p) => pAcc + (p.deliverables?.length || 0), 0),
    0
  ) || 0;

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Banner: SOW Feature Description & Generator Controls */}
      <div className="bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-blue-800/60">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-blue-500/30 text-blue-200 border border-blue-400/40 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-blue-300" />
                <span>SOW Description Intelligence</span>
              </span>
              {sourceTag && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  {sourceTag}
                </span>
              )}
            </div>
            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>SOW Execution Solutions, Pathways & Resource Strategy</span>
            </h3>
            <p className="text-xs text-blue-100/80 leading-relaxed">
              Synthesized directly from the official Statement of Work (SOW) / PWS description. Provides concrete technical solutions, 3-phase execution pathways, required labor categories, and publication-ready text for your RFP proposal response.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyFullProposal}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition cursor-pointer"
              title="Copy the entire ready-to-use Technical Volume into your clipboard"
            >
              {copiedFull ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
              <span>{copiedFull ? 'Copied to Clipboard!' : 'Copy Proposal Text'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadMarkdown}
              className="px-3 py-2 bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title="Download formatted proposal markdown document"
            >
              <Download className="w-4 h-4 text-blue-300" />
              <span className="hidden sm:inline">Export .md</span>
            </button>

            <button
              type="button"
              onClick={() => fetchPlan()}
              disabled={loading}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition cursor-pointer"
              title="Regenerate solutions and resources using AI"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Synthesizing...' : 'Regenerate'}</span>
            </button>
          </div>
        </div>

        {/* Focus Directive Selector */}
        <div className="mt-4 pt-3.5 border-t border-blue-800/50 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-300" />
            <span className="text-blue-200 font-semibold text-[11px]">Proposal Focus Directive:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {FOCUS_OPTIONS.map((opt) => (
              <button
                key={opt.label}
                type="button"
                onClick={() => {
                  setFocusDirective(opt.value);
                  fetchPlan(opt.value);
                }}
                disabled={loading}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer ${
                  focusDirective === opt.value
                    ? 'bg-blue-500 text-white font-bold shadow-xs'
                    : 'bg-blue-950/60 hover:bg-blue-900/80 text-blue-200 border border-blue-800/40'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Authoritative SOW & Requirements Summary Baseline Card */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSowSummary(!showSowSummary)}
              className="font-bold text-slate-900 hover:text-blue-700 transition flex items-center gap-1.5 text-xs sm:text-sm cursor-pointer"
            >
              <FileText className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Statement of Work (SOW) & Requirements Baseline</span>
              {showSowSummary ? (
                <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
              Source Notice
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopySow}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title="Copy SOW text to clipboard"
            >
              {copiedSow ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copiedSow ? 'SOW Copied!' : 'Copy SOW'}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowSowSummary(!showSowSummary)}
              className="text-xs text-blue-600 hover:underline font-medium cursor-pointer"
            >
              {showSowSummary ? 'Collapse' : 'Expand SOW'}
            </button>
          </div>
        </div>

        {showSowSummary && (
          <div className="space-y-3 animate-in fade-in duration-150">
            {/* Federal Hierarchy Sub-bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-[11px]">
              <div className="bg-white p-2 rounded-lg border border-slate-200 truncate">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Dept / Agency</span>
                <span className="font-bold text-slate-800 truncate block" title={opportunity.department}>{opportunity.department}</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200 truncate">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Sub-tier</span>
                <span className="font-semibold text-slate-700 truncate block" title={opportunity.subTier}>{opportunity.subTier}</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200 truncate">
                <span className="text-[9px] font-bold text-blue-500 uppercase tracking-wider block">Major Command</span>
                <span className="font-semibold text-blue-900 truncate block" title={opportunity.majorCommand || 'HQ Command'}>
                  {opportunity.majorCommand || 'HQ Command Authority'}
                </span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200 truncate">
                <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-wider block">Contracting Office</span>
                <span className="font-mono text-slate-700 truncate block" title={opportunity.office}>{opportunity.office}</span>
              </div>
            </div>

            {/* SOW & Requirements Text */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 whitespace-pre-line leading-relaxed max-h-64 overflow-y-auto">
              {opportunity.requirementsSummary || opportunity.description}
            </div>
          </div>
        )}
      </div>

      {/* Attachment & PDF Grounding Intelligence Card */}
      <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-emerald-200/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                  Internal PDF & Attachment Synthesis Intelligence
                </h4>
                <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {attIntel.totalFiles} Files • {attIntel.totalWordCount.toLocaleString()} Words Synthesized
                </span>
              </div>
              <p className="text-[11px] text-emerald-900/80">
                Grounded in internal PWS specifications, CDRL schedules, Section L instructions, Section M evaluation factors, and labor pricing templates.
              </p>
            </div>
          </div>

          <span className="text-[10px] font-semibold text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 self-start sm:self-auto flex items-center gap-1">
            <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Full Native Content Extracted</span>
          </span>
        </div>

        {/* Analyzed Attachment Badges with Click-to-View */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Synthesized Solicitation Documents (Click to Inspect in Native Viewer):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {attIntel.files.map((file) => {
              const matchingAtt = opportunity.attachments?.find((a) => a.id === file.id);
              return (
                <button
                  key={file.id}
                  type="button"
                  onClick={() => {
                    if (matchingAtt && onViewAttachment) {
                      onViewAttachment(matchingAtt);
                    }
                  }}
                  className="px-2.5 py-1 bg-white hover:bg-emerald-100/70 text-slate-800 hover:text-emerald-950 border border-slate-200 hover:border-emerald-300 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition cursor-pointer shadow-2xs group"
                  title={`Inspect ${file.name} in native viewer`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 group-hover:scale-125 transition-transform"></span>
                  <span className="font-semibold text-emerald-900">[{file.category}]</span>
                  <span className="truncate max-w-[180px] sm:max-w-[240px]">{file.name}</span>
                  <Eye className="w-3 h-3 text-slate-400 group-hover:text-emerald-700 ml-0.5" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* KPI Metrics Strip */}
      {plan && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
            <span className="text-[11px] text-slate-500 font-medium block">Deconstructed SOW Areas</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-bold text-slate-900">{plan.sowRequirements.length}</span>
              <span className="text-[10px] text-slate-500">Core Requirements</span>
            </div>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
            <span className="text-[11px] text-slate-500 font-medium block">Key Roles & Staffing</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-bold text-blue-600">{plan.resourceAllocation.length}</span>
              <span className="text-[10px] text-slate-500">Labor Categories</span>
            </div>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
            <span className="text-[11px] text-slate-500 font-medium block">Total SOW Deliverables</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-bold text-emerald-600">{totalDeliverablesCount}</span>
              <span className="text-[10px] text-slate-500">Milestone Artifacts</span>
            </div>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
            <span className="text-[11px] text-slate-500 font-medium block">FAR 52.219-14 Prime Labor</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-bold text-indigo-600">≥ 55%</span>
              <span className="text-[10px] text-emerald-600 font-semibold">100% Compliant</span>
            </div>
          </div>
        </div>
      )}

      {/* Sub Tab Navigation */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-px">
        <button
          type="button"
          onClick={() => setActiveSubTab('pathways')}
          className={`pb-2.5 px-3.5 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeSubTab === 'pathways'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>⚡ Solutions & SOW Execution Pathways</span>
          {plan && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-800 font-semibold">
              {plan.sowRequirements.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('resources')}
          className={`pb-2.5 px-3.5 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeSubTab === 'resources'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>👥 Resources & Staffing Allocation Matrix</span>
          {plan && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-700 font-semibold">
              {plan.resourceAllocation.length} Roles
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('proposal_draft')}
          className={`pb-2.5 px-3.5 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeSubTab === 'proposal_draft'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>📝 RFP Proposal Response (Volume I Draft)</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-semibold">
            Ready to Insert
          </span>
        </button>
      </div>

      {/* Loading State Indicator */}
      {loading && (
        <div className="py-12 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Deconstructing Statement of Work & Synthesizing Pathways...</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Analyzing solicitation description, requirement specifications, FAR clauses, and matching SBA capabilities to construct zero-defect solutions.
            </p>
          </div>
        </div>
      )}

      {/* SUBTAB 1: SOLUTIONS & SOW EXECUTION PATHWAYS */}
      {!loading && activeSubTab === 'pathways' && plan && (
        <div className="space-y-6">
          {/* Executive Synthesis */}
          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-950 space-y-1.5">
            <span className="font-bold text-blue-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-blue-700" />
              <span>Technical Approach Synthesis</span>
            </span>
            <p className="leading-relaxed text-slate-700">{plan.technicalApproachSummary}</p>
          </div>

          {/* SOW Requirement Cards */}
          <div className="space-y-5">
            {plan.sowRequirements.map((req, idx) => {
              const isCopied = copiedSnippetId === req.id;
              return (
                <div
                  key={req.id || idx}
                  className="bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-slate-300 transition overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <h4 className="text-base font-bold text-slate-900">{req.requirementTitle}</h4>
                      </div>
                      <div className="text-[11px] text-slate-500 italic bg-white/80 p-2 rounded-lg border border-slate-200/80 mt-1">
                        <strong className="text-slate-700 not-italic font-semibold">SOW Stated Requirement: </strong>
                        "{req.sourceExcerpt}"
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopySnippet(req.id, req.proposalSnippet)}
                      className="px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto shrink-0 shadow-2xs"
                      title="Copy proposal text for this requirement area"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-blue-600" />}
                      <span>{isCopied ? 'Copied Snippet' : 'Copy Proposal Snippet'}</span>
                    </button>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 sm:p-5 space-y-5 text-xs">
                    {/* Solution Details */}
                    <div>
                      <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block mb-1">
                        Proposed Technical & Operational Solution:
                      </span>
                      <p className="text-slate-700 leading-relaxed bg-slate-50/60 p-3 rounded-xl border border-slate-200">
                        {req.solutionSummary}
                      </p>
                    </div>

                    {/* Execution Pathways (Phases) */}
                    <div>
                      <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block mb-2.5 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        <span>Execution Pathways & Deliverable Roadmap</span>
                      </span>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {req.executionPathways.map((pathway, pIdx) => (
                          <div
                            key={pIdx}
                            className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                <span className="font-bold text-slate-900 text-xs">{pathway.phase}</span>
                                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                                  {pathway.timelineDays}
                                </span>
                              </div>

                              <div className="space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                                  Implementation Steps:
                                </span>
                                <ul className="space-y-1 text-[11px] text-slate-700">
                                  {pathway.steps.map((step, sIdx) => (
                                    <li key={sIdx} className="flex items-start gap-1.5">
                                      <ChevronRight className="w-3 h-3 text-blue-500 shrink-0 mt-0.5" />
                                      <span>{step}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-slate-200/80 space-y-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block flex items-center gap-1">
                                <FileCheck className="w-3 h-3 text-emerald-600" />
                                <span>Key Deliverables:</span>
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {pathway.deliverables.map((deliv, dIdx) => (
                                  <span
                                    key={dIdx}
                                    className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-200 text-[10px] font-medium"
                                  >
                                    {deliv}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Standards & Risk Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {/* Standards Compliance */}
                      <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5">
                        <span className="font-bold text-slate-900 text-[11px] flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                          <span>Governing Compliance Standards:</span>
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {req.standardsCompliance.map((std, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-mono font-medium border border-slate-200"
                            >
                              {std}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Risk and Mitigation */}
                      <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 space-y-1">
                        <span className="font-bold text-amber-900 text-[11px] flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Identified Risk & Actionable Mitigation:</span>
                        </span>
                        <p className="text-[11px] text-amber-950">
                          <strong>Risk: </strong> {req.riskAndMitigation.risk}
                        </p>
                        <p className="text-[11px] text-slate-700">
                          <strong className="text-emerald-800">Mitigation: </strong> {req.riskAndMitigation.mitigation}
                        </p>
                      </div>
                    </div>

                    {/* Ready to insert Proposal Prose */}
                    <div className="p-3.5 bg-blue-50/40 rounded-xl border border-blue-200/80 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                          <span>Ready-to-Insert Proposal Response (Volume I Text):</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopySnippet(req.id, req.proposalSnippet)}
                          className="text-[10px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
                        >
                          {isCopied ? 'Copied!' : 'Copy this paragraph'}
                        </button>
                      </div>
                      <p className="text-slate-700 leading-relaxed font-serif text-[11.5px] italic bg-white p-2.5 rounded-lg border border-blue-100">
                        "{req.proposalSnippet}"
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CDRL Deliverables Schedule Matrix (Synthesized from internal attachments) */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  <span>Contract Data Requirements List (CDRL) & Milestones Schedule</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Mandatory contract deliverables extracted from internal solicitation attachments with Data Item Descriptions (DID) and submission deadlines.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs self-start sm:self-auto flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>5 Formal CDRLs Grounded</span>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-4">CDRL #</th>
                    <th className="py-2.5 px-3">DID Number</th>
                    <th className="py-2.5 px-4">Deliverable Title</th>
                    <th className="py-2.5 px-4">Submission Frequency</th>
                    <th className="py-2.5 px-3">Government Recipient</th>
                    <th className="py-2.5 px-3">Format</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {attIntel.cdrlSchedule.map((cdrl, cIdx) => (
                    <tr key={cIdx} className="hover:bg-slate-50/70 transition">
                      <td className="py-2.5 px-4 font-mono font-bold text-blue-700">{cdrl.cdrlNumber}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">{cdrl.didNumber}</td>
                      <td className="py-2.5 px-4 font-semibold text-slate-900">{cdrl.title}</td>
                      <td className="py-2.5 px-4 text-slate-700">{cdrl.frequency}</td>
                      <td className="py-2.5 px-3 text-slate-600 font-medium">{cdrl.recipient}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] border border-slate-200">
                          {cdrl.format}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: RESOURCES & STAFFING ALLOCATION MATRIX */}
      {!loading && activeSubTab === 'resources' && plan && (
        <div className="space-y-6 text-xs">
          {/* Key Personnel & Staffing Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Key Personnel & Labor Category Staffing Allocation</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Direct labor categories required to execute the SOW, with clearance requirements and GSA-benchmarked billing rates.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-bold text-xs self-start sm:self-auto">
                {plan.resourceAllocation.length} Core Labor Categories
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-4">Labor Category / Role</th>
                    <th className="py-2.5 px-3">FTE Allocation</th>
                    <th className="py-2.5 px-3">Clearance Level</th>
                    <th className="py-2.5 px-4">Mandatory Qualifications</th>
                    <th className="py-2.5 px-4">SOW Execution Duties</th>
                    <th className="py-2.5 px-3 text-right">Billable Rate (Est.)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {plan.resourceAllocation.map((res, i) => (
                    <tr key={i} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>{res.role}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-800">
                        {res.count} FTE
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          res.clearance.toLowerCase().includes('secret') || res.clearance.toLowerCase().includes('ts')
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {res.clearance}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <ul className="space-y-0.5 text-[11px] text-slate-600">
                          {res.qualifications.map((q, qIdx) => (
                            <li key={qIdx}>• {q}</li>
                          ))}
                        </ul>
                      </td>
                      <td className="py-3 px-4">
                        <ul className="space-y-0.5 text-[11px] text-slate-600">
                          {res.keyResponsibilities.map((resp, rIdx) => (
                            <li key={rIdx}>• {resp}</li>
                          ))}
                        </ul>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">
                        {res.billableRateEstimate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tooling & Technology Stack */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-4 sm:p-5 space-y-4">
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-blue-600" />
              <span>Required Technology Stack, Security Tools & Infrastructure</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {plan.toolingAndTechStack.map((toolGroup, tIdx) => (
                <div key={tIdx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-900 text-xs block">{toolGroup.category}</span>
                  <div className="flex flex-wrap gap-1">
                    {toolGroup.tools.map((tool, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200 text-[10px] font-mono font-medium"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-600 leading-normal pt-1 border-t border-slate-200">
                    {toolGroup.purpose}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Teaming & Subcontracting Strategy (FAR 52.219-14) */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                <span>Teaming & Subcontracting Plan (FAR 52.219-14 Compliance)</span>
              </h4>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-300">
                50% Rule Compliant
              </span>
            </div>

            <div className="space-y-3">
              {plan.partnerTeamingNeeds.map((partner, pIdx) => (
                <div key={pIdx} className="p-3.5 bg-emerald-50/40 rounded-xl border border-emerald-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-950 text-xs">{partner.capabilityArea}</span>
                    <span className="text-[10px] font-semibold text-slate-600">{partner.partnerType}</span>
                  </div>
                  <p className="text-[11px] text-slate-700">
                    <strong className="text-slate-900">Work-Share Compliance: </strong> {partner.far52_219_14_Impact}
                  </p>
                  <p className="text-[11px] text-slate-600">
                    <strong>Action Strategy: </strong> {partner.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Attached Pricing Template (CLINs) & SCA Wage Determination Benchmarks */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden space-y-4 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
              <div>
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Solicitation Pricing Template & Labor Rate Benchmarks</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Extracted from internal pricing attachments & U.S. Dept of Labor Service Contract Act (SCA) Wage Determination.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs self-start sm:self-auto">
                Government Estimated Rates
              </span>
            </div>

            {/* CLIN Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">CLIN #</th>
                    <th className="py-2.5 px-4">Labor Category</th>
                    <th className="py-2.5 px-3 text-right">Est. Hours</th>
                    <th className="py-2.5 px-3 text-right">Hourly Rate</th>
                    <th className="py-2.5 px-3 text-right">Total Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {attIntel.clinPricingSummary.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition">
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{item.clin}</td>
                      <td className="py-2.5 px-4 font-semibold text-slate-900">{item.laborCategory}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-700">{item.hours.toLocaleString()} hrs</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">{item.rate}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* SCA Wage Determination Stipulation Strip */}
            {attIntel.wageDetermination && (
              <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3.5 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="font-bold text-amber-950 text-xs flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-amber-700" />
                    <span>SCA Wage Determination #{attIntel.wageDetermination.code} ({attIntel.wageDetermination.revision})</span>
                  </span>
                  <span className="text-[11px] font-semibold text-amber-900">
                    Mandatory Health & Welfare: <strong>{attIntel.wageDetermination.healthWelfareRate}</strong>
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {attIntel.wageDetermination.topRoles.map((role, rIdx) => (
                    <div key={rIdx} className="bg-white p-2 rounded-lg border border-amber-200/80">
                      <span className="text-[10px] text-slate-500 block truncate">{role.title}</span>
                      <strong className="text-emerald-700 font-mono text-xs">{role.minWage}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 3: RFP PROPOSAL RESPONSE (VOLUME I DRAFT) */}
      {!loading && activeSubTab === 'proposal_draft' && plan && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden text-xs">
          {/* Header Controls */}
          <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>RFP Technical Proposal Draft (Volume I: SOW Execution)</span>
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                  Section L.3.1 Compliant
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Publication-ready proposal text generated from the SOW description & internal attachments. Export as an executive PDF or markdown.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditingDraft(!isEditingDraft)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                {isEditingDraft ? 'Preview Formatted' : 'Edit In-Place'}
              </button>

              <button
                type="button"
                onClick={handleDownloadPdf}
                className="px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                title="Export formatted proposal as an authentic executive PDF document"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Export PDF</span>
              </button>

              <button
                type="button"
                onClick={handleCopyFullProposal}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                {copiedFull ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5 text-white" />}
                <span>{copiedFull ? 'Copied Full Draft!' : 'Copy Full Draft'}</span>
              </button>
            </div>
          </div>

          {/* Document Content */}
          <div className="p-5 sm:p-6">
            {isEditingDraft ? (
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-600 block">
                  Customize and fine-tune your proposal draft:
                </span>
                <textarea
                  value={draftText}
                  onChange={(e) => setDraftText(e.target.value)}
                  rows={20}
                  className="w-full font-mono text-xs p-3.5 border border-slate-300 rounded-xl bg-slate-50 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none leading-relaxed"
                />
              </div>
            ) : (
              <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-200/80 font-serif leading-relaxed text-slate-800 whitespace-pre-line text-[12px]">
                {draftText || plan.proposalVolumeDraft?.fullText}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
