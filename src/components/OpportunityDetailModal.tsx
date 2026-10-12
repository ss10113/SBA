import React, { useState, useMemo } from 'react';
import { 
  Info, 
  X, 
  Building2, 
  MapPin, 
  Calendar, 
  Clock, 
  FileText, 
  Download, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Mail, 
  Phone, 
  ExternalLink,
  Shield,
  Briefcase,
  Layers,
  Printer,
  Eye,
  Check,
  FolderDown,
  Copy,
  FileSpreadsheet,
  FileCode,
  ChevronRight,
  Maximize2,
  Minimize2,
  Lock,
  Unlock,
  RefreshCw,
  FileCheck,
  BadgeCheck,
  DollarSign,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  SAMOpportunity,
  BusinessProfile,
  FitScore,
  OpportunityAttachment,
  SowResourceStrategy,
  OpportunityCustomLaborItem,
} from '../types/contract';
import { calculateFitScore } from '../utils/fitEngine';
import { getSafeSamGovUrl, isDirectSamGovNoticeId, getSamSearchUrl, extractSamNoticeUUID } from '../utils/samUrlHelper';
import { getNaicsDefinition } from '../data/naicsDatabase';
import { 
  downloadAttachment, 
  downloadCompleteRfpPackage, 
  generateAttachmentContent,
  extractAllOpportunityAttachmentIntelligence,
} from '../utils/attachmentDownloader';
import { SowExecutionStrategyView } from './SowExecutionStrategyView';
import { NativeAttachmentViewer } from './NativeAttachmentViewer';
import { AddLaborCategoryModal } from './AddLaborCategoryModal';

interface OpportunityDetailModalProps {
  opportunity: SAMOpportunity | null;
  currentProfile: BusinessProfile;
  onClose: () => void;
  onGeneratePlan: (opp: SAMOpportunity) => void;
  onTogglePipeline: (opp: SAMOpportunity) => void;
  onValidate?: (opp: SAMOpportunity) => void;
  isInPipeline: boolean;
  onAddLaborCategory?: (item: OpportunityCustomLaborItem) => void;
  onRemoveLaborCategory?: (itemId: string) => void;
}

export const OpportunityDetailModal: React.FC<OpportunityDetailModalProps> = ({
  opportunity,
  currentProfile,
  onClose,
  onGeneratePlan,
  onTogglePipeline,
  onValidate,
  isInPipeline,
  onAddLaborCategory,
  onRemoveLaborCategory,
}) => {
  const [previewAttachment, setPreviewAttachment] = useState<OpportunityAttachment | null>(null);
  const [downloadedIds, setDownloadedIds] = useState<Record<string, boolean>>({});
  const [downloadingPackage, setDownloadingPackage] = useState(false);
  const [copiedPreview, setCopiedPreview] = useState(false);
  const [copiedSolNum, setCopiedSolNum] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'overview' | 'sow_strategy'>('overview');
  const [sowPlan, setSowPlan] = useState<SowResourceStrategy | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [previewMaximized, setPreviewMaximized] = useState(false);
  const [copiedRequirements, setCopiedRequirements] = useState(false);
  const [showAccessGuideModal, setShowAccessGuideModal] = useState(false);
  const [isValidatingSam, setIsValidatingSam] = useState(false);
  const [liveValidation, setLiveValidation] = useState<any>(null);
  const [deepAiAnalysis, setDeepAiAnalysis] = useState<any>(null);
  const [loadingDeepAi, setLoadingDeepAi] = useState(false);
  const [activeIntelTab, setActiveIntelTab] = useState<'pws' | 'section_l_m' | 'cdrl' | 'pricing'>('pws');
  const [isAddLaborModalOpen, setIsAddLaborModalOpen] = useState(false);
  const [localCustomLabor, setLocalCustomLabor] = useState<OpportunityCustomLaborItem[]>(
    opportunity?.customLaborItems || []
  );

  React.useEffect(() => {
    if (opportunity) {
      setLocalCustomLabor(opportunity.customLaborItems || []);
    }
  }, [opportunity]);

  const handleAddCustomLabor = (item: OpportunityCustomLaborItem) => {
    const updated = [...localCustomLabor, item];
    setLocalCustomLabor(updated);
    if (opportunity) {
      opportunity.customLaborItems = updated;
    }
    if (onAddLaborCategory) {
      onAddLaborCategory(item);
    }
  };

  const handleRemoveCustomLabor = (itemId: string) => {
    const updated = localCustomLabor.filter((i) => i.id !== itemId);
    setLocalCustomLabor(updated);
    if (opportunity) {
      opportunity.customLaborItems = updated;
    }
    if (onRemoveLaborCategory) {
      onRemoveLaborCategory(itemId);
    }
  };

  const attIntel = useMemo(() => {
    return opportunity ? extractAllOpportunityAttachmentIntelligence(opportunity) : null;
  }, [opportunity]);

  const handleRunDeepAiAnalysis = async () => {
    if (!opportunity || !attIntel) return;
    setLoadingDeepAi(true);
    try {
      const res = await fetch('/api/rfp-synopsis-deep-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunity,
          profile: currentProfile,
          attachments: attIntel.files.map((f) => ({
            name: f.name,
            type: f.type,
            category: f.category,
            content: f.content,
          })),
        }),
      });
      const data = await res.json();
      if (data.analysis) {
        setDeepAiAnalysis(data.analysis);
      }
    } catch (e) {
      console.error('Error running deep RFP synopsis analysis:', e);
    } finally {
      setLoadingDeepAi(false);
    }
  };

  if (!opportunity) return null;

  const fit: FitScore = calculateFitScore(opportunity, currentProfile);

  const handleValidateNotice = async () => {
    if (!opportunity) return;
    setIsValidatingSam(true);
    setLiveValidation(null);
    try {
      const res = await fetch('/api/sam/validate-solicitation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          solicitationNumber: opportunity.solicitationNumber,
          noticeId: opportunity.noticeId,
        }),
      });
      const data = await res.json();
      setLiveValidation(data);
    } catch (e: any) {
      setLiveValidation({
        exists: false,
        isValidOnLiveSam: false,
        status: 'Connection Error',
        message: e.message || 'Error reaching live validation service',
      });
    } finally {
      setIsValidatingSam(false);
    }
  };

  const handleCopyRequirements = () => {
    const text = opportunity.requirementsSummary || `REQUIREMENTS & STATEMENT OF WORK SUMMARY (FOR PROPOSAL GENERATION):
• Project Title: ${opportunity.title}
• Solicitation Number: ${opportunity.solicitationNumber}
• Customer Agency: ${opportunity.department} | ${opportunity.subTier}${opportunity.majorCommand ? ` | ${opportunity.majorCommand}` : ''} | ${opportunity.office}
• Primary Industry NAICS: ${opportunity.naicsCode} (${opportunity.naicsTitle})
• Small Business Program: ${opportunity.setAside}
• Scope of Work:
  ${opportunity.description}
• Core Performance Deliverables:
${(opportunity.scopeBullets || []).map((b, i) => `  ${i + 1}. ${b}`).join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopiedRequirements(true);
    setTimeout(() => setCopiedRequirements(false), 2500);
  };

  const handleCopySolNum = () => {
    navigator.clipboard.writeText(opportunity.solicitationNumber);
    setCopiedSolNum(true);
    setTimeout(() => setCopiedSolNum(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadSingle = (att: OpportunityAttachment) => {
    downloadAttachment(att, opportunity);
    setDownloadedIds((prev) => ({ ...prev, [att.id]: true }));
    setTimeout(() => {
      setDownloadedIds((prev) => ({ ...prev, [att.id]: false }));
    }, 4000);
  };

  const handleDownloadAll = () => {
    setDownloadingPackage(true);
    downloadCompleteRfpPackage(opportunity);
    if (opportunity.attachments) {
      opportunity.attachments.forEach((att) => {
        setDownloadedIds((prev) => ({ ...prev, [att.id]: true }));
      });
    }
    setTimeout(() => {
      setDownloadingPackage(false);
    }, 2500);
  };

  const handleCopyPreviewText = () => {
    if (!previewAttachment) return;
    const text = generateAttachmentContent(previewAttachment, opportunity);
    navigator.clipboard.writeText(text);
    setCopiedPreview(true);
    setTimeout(() => setCopiedPreview(false), 2500);
  };

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center transition-all ${isMaximized ? 'p-0' : 'p-2 sm:p-4 md:p-6'}`}>
      <div className={`bg-white border border-slate-200 shadow-2xl flex flex-col overflow-hidden transition-all duration-150 ${isMaximized ? 'w-full h-full max-w-none max-h-none rounded-none' : 'w-full max-w-5xl xl:max-w-6xl max-h-[94vh] sm:max-h-[92vh] rounded-2xl animate-in fade-in zoom-in-95'}`}>
        {/* Header Bar */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 sm:py-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopySolNum}
              className="font-mono text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 rounded flex items-center gap-1.5 transition cursor-pointer"
              title="Official Solicitation Number. Click to copy for SAM.gov search"
            >
              <span className="text-[10px] text-blue-200 font-sans font-semibold">SOL #</span>
              <span>{opportunity.solicitationNumber}</span>
              {copiedSolNum ? (
                <Check className="w-3.5 h-3.5 text-emerald-300" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-blue-200" />
              )}
            </button>

            {(() => {
              const topDirectUUID = extractSamNoticeUUID(opportunity);
              const topUrl = topDirectUUID ? `https://sam.gov/opp/${topDirectUUID}/view` : getSafeSamGovUrl(opportunity);
              return (
                <a
                  href={topUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-semibold transition shadow-xs cursor-pointer"
                  title="Open official notice on SAM.gov"
                >
                  <span>View on SAM.gov</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              );
            })()}
            <span className="text-xs text-slate-400 font-mono hidden lg:inline">
              Notice ID: {opportunity.noticeId}
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={handlePrint}
              title="Print RFP Synopsis"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsMaximized(!isMaximized)}
              title={isMaximized ? "Restore window size (Minimize to standard dialog)" : "Expand window to full screen (Maximize)"}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
            >
              {isMaximized ? <Minimize2 className="w-4 h-4 text-blue-400" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              title="Close window"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feature Sub-Navigation Tabs */}
        <div className="bg-slate-800 border-b border-slate-700 px-6 flex items-center justify-between gap-4 overflow-x-auto">
          <div className="flex items-center gap-1.5 py-2">
            <button
              type="button"
              onClick={() => setActiveModalTab('overview')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-2 cursor-pointer ${
                activeModalTab === 'overview'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>RFP Synopsis & Requirements</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveModalTab('sow_strategy')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-2 cursor-pointer relative ${
                activeModalTab === 'sow_strategy'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>⚡ SOW Resources & Execution Strategy</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold uppercase bg-amber-400 text-slate-950 tracking-wider">
                AI SOW Engine
              </span>
            </button>
          </div>

          <span className="text-[11px] text-slate-400 hidden md:inline">
            {activeModalTab === 'overview' ? 'Solicitation & SOW Overview' : 'Solutions, Pathways & Proposal Generator'}
          </span>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          {activeModalTab === 'sow_strategy' ? (
            <SowExecutionStrategyView
              opportunity={opportunity}
              currentProfile={currentProfile}
              initialPlan={sowPlan}
              onPlanUpdated={setSowPlan}
              onViewAttachment={(att) => setPreviewAttachment(att)}
              customLaborItems={localCustomLabor}
              onAddLaborCategory={handleAddCustomLabor}
              onRemoveLaborCategory={handleRemoveCustomLabor}
            />
          ) : (
            <>
              {/* Main Title & Agency Header */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {/* Notice Status Badge */}
              {opportunity.status === 'awarded' ? (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5">
                  <span>🏆 Contract Awarded</span>
                </span>
              ) : opportunity.status === 'inactive' ? (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-200 text-slate-700 border border-slate-300 flex items-center gap-1.5">
                  <span>⚪ Inactive / Closed Notice</span>
                </span>
              ) : (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>🟢 Active Open Solicitation</span>
                </span>
              )}

              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                {opportunity.type}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                {opportunity.setAside}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                {opportunity.contractType}
              </span>
            </div>

            {opportunity.awardeeInfo && (
              <div className="mb-4 bg-amber-50 border border-amber-300 rounded-xl p-4 text-xs text-amber-950">
                <div className="flex items-center gap-2 font-bold text-sm mb-1.5 text-amber-900">
                  <span>🏆 Official Award Announcement</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white/80 p-3 rounded-lg border border-amber-200">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Awardee Contractor</span>
                    <strong className="text-slate-900 text-xs">{opportunity.awardeeInfo.vendorName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Awarded Amount</span>
                    <strong className="text-emerald-700 text-xs font-mono">{opportunity.awardeeInfo.awardAmount}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Award Date & Contract #</span>
                    <span className="text-slate-700 text-xs font-mono">{opportunity.awardeeInfo.awardDate} ({opportunity.awardeeInfo.contractNumber})</span>
                  </div>
                </div>
              </div>
            )}

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug mb-2">
              {(() => {
                let t = opportunity.title || '';
                const subTier = opportunity.subTier || '';
                const dept = opportunity.department || '';
                if (subTier && t.toLowerCase().startsWith(subTier.toLowerCase() + ':')) {
                  t = t.slice(subTier.length + 1).trim();
                } else if (dept && t.toLowerCase().startsWith(dept.toLowerCase() + ':')) {
                  t = t.slice(dept.length + 1).trim();
                }
                return t;
              })()}
            </h2>
          </div>

          {/* Federal Organization Hierarchy Intelligence Card */}
            <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3.5 mb-3 text-xs">
              <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-200">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Federal Organization & Buying Command Hierarchy:</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{opportunity.placeOfPerformance.city}, {opportunity.placeOfPerformance.state}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Department / Ind. Agency</span>
                  <span className="font-bold text-slate-900 block truncate" title={opportunity.department}>{opportunity.department}</span>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Sub-tier Agency</span>
                  <span className="font-semibold text-slate-800 block truncate" title={opportunity.subTier}>{opportunity.subTier}</span>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500 block">Major Command / Activity</span>
                  <span className="font-semibold text-blue-900 block truncate" title={opportunity.majorCommand || 'Standard Command Authority'}>
                    {opportunity.majorCommand || 'Headquarters / Command Authority'}
                  </span>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 block">Contracting Office & Sub-Cmd</span>
                  <span className="font-mono text-[11px] text-slate-700 block truncate" title={opportunity.office}>
                    {opportunity.subCommand ? `${opportunity.subCommand} • ` : ''}{opportunity.office}
                  </span>
                </div>
              </div>

              {opportunity.hierarchyPath && opportunity.hierarchyPath.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-slate-200/70 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-600">Command Chain:</span>
                  {opportunity.hierarchyPath.map((node, nIdx) => (
                    <React.Fragment key={nIdx}>
                      <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-medium text-slate-700">{node}</span>
                      {nIdx < (opportunity.hierarchyPath?.length || 0) - 1 && (
                        <ChevronRight className="w-3 h-3 text-slate-400" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>

            {/* Direct Verified Action & SAM Reference Bar */}
            {(() => {
              const directUUID = extractSamNoticeUUID(opportunity);
              const officialLiveUrl = getSafeSamGovUrl(opportunity);
              return (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-4 shadow-2xs">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <Shield className="w-4 h-4 text-blue-600" />
                        <span>Solicitation:</span>
                      </span>
                      <a
                        href={officialLiveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono font-bold text-blue-700 hover:text-blue-900 bg-white px-2.5 py-1 rounded-md border border-slate-200 hover:border-blue-400 inline-flex items-center gap-1.5 transition shadow-2xs"
                        title="Open verified solicitation page on SAM.gov"
                      >
                        <span>{opportunity.solicitationNumber}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                      {directUUID && (
                        <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-medium">
                          UUID: {directUUID.slice(0, 8)}...
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <button
                        type="button"
                        onClick={handleValidateNotice}
                        disabled={isValidatingSam}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-60 shadow-2xs"
                        title="Validate status against live SAM.gov API"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isValidatingSam ? 'animate-spin' : ''}`} />
                        <span>{isValidatingSam ? 'Validating...' : 'Validate Status'}</span>
                      </button>
                      <a
                        href={officialLiveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                        title="Open official notice on SAM.gov"
                      >
                        <span>View on SAM.gov</span>
                        <ExternalLink className="w-3.5 h-3.5 text-blue-200" />
                      </a>
                    </div>
                  </div>

                  {/* Validation Feedback Strip (Clean toast card) */}
                  {liveValidation && (
                    <div className={`mt-3 p-3 rounded-lg border text-xs space-y-2 animate-in fade-in duration-150 ${
                      liveValidation.isValidOnLiveSam
                        ? 'bg-emerald-50 text-emerald-950 border-emerald-300'
                        : liveValidation.isCuratedBenchmark
                        ? 'bg-blue-50 text-blue-950 border-blue-300'
                        : 'bg-amber-50 text-amber-950 border-amber-300'
                    }`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="font-semibold flex items-center gap-1.5">
                            {liveValidation.isValidOnLiveSam ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : liveValidation.isCuratedBenchmark ? (
                              <Shield className="w-4 h-4 text-blue-600 shrink-0" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            )}
                            <span>{liveValidation.status}: {liveValidation.message}</span>
                          </div>
                          {liveValidation.officialNoticeId && (
                            <div className="text-[11px] text-slate-600 font-mono">
                              Notice ID: <strong>{liveValidation.officialNoticeId}</strong>
                              {liveValidation.postedDate && <span> • Date: {liveValidation.postedDate}</span>}
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setLiveValidation(null)}
                          className="text-slate-400 hover:text-slate-600 text-xs px-1 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>

                      {liveValidation.isCuratedBenchmark && (
                        <div className="bg-white/80 p-2.5 rounded border border-blue-200/80 text-[11px] text-slate-600 leading-relaxed">
                          <strong>Benchmark Scenario:</strong> Notice "{liveValidation.solicitationNumber}" is part of the pre-loaded federal contracting benchmark catalog for proposal strategy simulation. For live notices published today by federal agencies, configure a free API key in the top bar.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}
          {/* Fit Score & Compatibility Analysis Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <h4 className="text-sm font-bold text-slate-900">
                  SBA Match Analysis for {currentProfile.companyName}
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Fit Score:</span>
                <span className="font-mono text-sm font-bold px-2.5 py-0.5 rounded-full bg-blue-600 text-white">
                  {fit.overallScore}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <p className="font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Competitive Strengths:</span>
                </p>
                <ul className="space-y-1 text-slate-600">
                  {fit.matchHighlights.map((hl, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{hl}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {fit.riskWarnings.length > 0 && (
                <div>
                  <p className="font-semibold text-amber-800 mb-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Risk Factors & Qualification Gaps:</span>
                  </p>
                  <ul className="space-y-1 text-slate-600">
                    {fit.riskWarnings.map((rw, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>{rw}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Key Procurement Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-200 flex flex-col justify-between">
              <span className="text-slate-500 font-medium block text-[11px]">Estimated Ceiling</span>
              <span className="font-bold text-slate-900 text-sm mt-0.5">{opportunity.estimatedValue}</span>
            </div>
            <div className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-200 flex flex-col justify-between">
              <span className="text-slate-500 font-medium block text-[11px]">Response Due Date</span>
              <span className="font-bold text-red-600 text-sm mt-0.5">
                {new Date(opportunity.responseDeadLine).toLocaleDateString()}
              </span>
            </div>
            <div className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-200 flex flex-col justify-between">
              <span className="text-slate-500 font-medium block text-[11px]">NAICS Code</span>
              <span className="font-bold font-mono text-slate-900 text-sm mt-0.5">{opportunity.naicsCode}</span>
            </div>
            <div className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-200 flex flex-col justify-between">
              <span className="text-slate-500 font-medium block text-[11px]">Clearance Required</span>
              <span className="font-bold text-slate-900 text-sm mt-0.5">{opportunity.requiredClearance}</span>
            </div>
          </div>

          {/* Highlight Banner for SOW Strategy */}
          <div className="bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-xl p-4 shadow-sm border border-blue-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span className="font-bold text-sm text-white">SOW Solutions, Pathways & Resources Ready</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-slate-950 uppercase tracking-wide">
                  Win Strategy
                </span>
              </div>
              <p className="text-xs text-blue-200 leading-relaxed">
                Deconstruct this SOW description into concrete technical solutions, multi-phase execution pathways, Key Personnel staffing, and publication-ready proposal responses.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveModalTab('sow_strategy')}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold rounded-lg shadow-sm transition shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Open SOW Strategy & Pathways</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Statement of Work (SOW) & Requirements Summary (Basis for Proposal Generation) */}
          <div className="bg-slate-50/90 rounded-2xl p-4.5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div className="space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                    <FileText className="w-3 h-3 text-blue-600" />
                    <span>Summary of Requirements</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Ready for Proposal Generation
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 pt-1">
                  <span>Authoritative SOW & Technical Requirements Baseline</span>
                </h4>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyRequirements}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  title="Copy summarized Statement of Work requirements for proposal drafting"
                >
                  {copiedRequirements ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{copiedRequirements ? 'Requirements Copied!' : 'Copy Summary'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onGeneratePlan(opportunity)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                  title="Generate compliant Shipley proposal volumes and win strategy using these requirements"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Generate Proposal</span>
                </button>
              </div>
            </div>

            {/* Distilled Requirements Summary Box */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed font-sans space-y-2">
              <div className="text-slate-700 whitespace-pre-line bg-slate-50/60 p-3 rounded-lg border border-slate-150 font-mono text-[11px] leading-relaxed">
                {opportunity.requirementsSummary || `REQUIREMENTS & STATEMENT OF WORK SUMMARY (FOR PROPOSAL GENERATION):
• Project Title: ${opportunity.title}
• Solicitation Number: ${opportunity.solicitationNumber}
• Customer Agency: ${opportunity.department} | ${opportunity.subTier}${opportunity.majorCommand ? ` | ${opportunity.majorCommand}` : ''} | ${opportunity.office}
• Primary Industry NAICS: ${opportunity.naicsCode} (${opportunity.naicsTitle})
• Small Business Program: ${opportunity.setAside}
• Scope of Work:
  ${opportunity.description}
• Core Technical Deliverables:
${(opportunity.scopeBullets || []).map((b, i) => `  ${i + 1}. ${b}`).join('\n')}
• Proposal Response Priorities:
  - Technical Volume: Methodical solution response mapping to PWS deliverables, staffing matrix, and risk mitigation plan.
  - Management Volume: Compliant Quality Control Plan and FAR 52.219-14 prime work-share compliance (>50%).
  - Pricing Volume: Transparent CLIN breakdown and substantiated Basis of Estimate (BOE).`}
              </div>
            </div>
          </div>

          {/* Deep Attachment & Internal SOW Extraction Intelligence Hub */}
          {attIntel && attIntel.totalFiles > 0 && (
            <div className="bg-slate-50/90 rounded-2xl p-4.5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div className="space-y-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                      <FileCheck className="w-3 h-3 text-emerald-600" />
                      <span>Attachment Deep Extraction Intelligence</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                      {attIntel.totalFiles} Internal Files • {attIntel.totalWordCount.toLocaleString()} Words Synthesized
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 pt-1">
                    <span>Synthesized PWS, Section L/M, CDRLs & Pricing Directives</span>
                  </h4>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleRunDeepAiAnalysis}
                    disabled={loadingDeepAi}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                    title="Synthesize all internal PDF attachments with Gemini AI into executive briefing"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${loadingDeepAi ? 'animate-spin' : 'text-amber-300'}`} />
                    <span>{loadingDeepAi ? 'Analyzing Attachments...' : 'Synthesize Attachments with AI'}</span>
                  </button>
                </div>
              </div>

              {/* Sub-tabs for Attachment Intelligence */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs">
                <button
                  type="button"
                  onClick={() => setActiveIntelTab('pws')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    activeIntelTab === 'pws' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>PWS Specific Tasks & Scope</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveIntelTab('section_l_m')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    activeIntelTab === 'section_l_m' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Section L (Instructions) & Section M (Evaluation)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveIntelTab('cdrl')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    activeIntelTab === 'cdrl' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
                  }`}
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>CDRL Deliverables Tracking</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveIntelTab('pricing')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    activeIntelTab === 'pricing' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>CLIN Breakdown & SCA Wages</span>
                </button>
              </div>

              {/* Sub-tab 1: PWS Scope & Deliverables */}
              {activeIntelTab === 'pws' && (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-blue-50/60 border border-blue-200 rounded-xl text-xs">
                    <div>
                      <strong className="text-blue-900 block">Performance Work Statement (PWS / SOW) Deconstruction:</strong>
                      <span className="text-slate-600 text-[11px]">
                        Extracted directly from internal solicitation documents and technical specifications.
                      </span>
                    </div>
                    {(() => {
                      const pwsAtt = opportunity.attachments?.find(
                        (a) => a.name.toLowerCase().includes('pws') || a.name.toLowerCase().includes('sow')
                      );
                      if (pwsAtt) {
                        return (
                          <button
                            type="button"
                            onClick={() => setPreviewAttachment(pwsAtt)}
                            className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-700 border border-blue-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer self-start sm:self-auto shrink-0"
                          >
                            <Eye className="w-3 h-3 text-blue-600" />
                            <span>View PWS in Native PDF Viewer</span>
                          </button>
                        );
                      }
                      return null;
                    })()}
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {(opportunity.scopeBullets || []).map((bullet, idx) => (
                      <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl text-xs flex items-start gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div className="space-y-0.5">
                          <p className="font-semibold text-slate-900">PWS Task 3.{idx + 1}: Deliverable 0{idx + 1}</p>
                          <p className="text-slate-700 leading-normal">{bullet}</p>
                          <p className="text-[10px] text-slate-500 pt-0.5">
                            Governed by QASP Acceptable Quality Level (AQL): 98% first-pass acceptance rate.
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-tab 2: Section L & M Instructions */}
              {activeIntelTab === 'section_l_m' && (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-purple-50/60 border border-purple-200 rounded-xl text-xs">
                    <div>
                      <strong className="text-purple-950 block">Section L (Proposal Preparation) & Section M (Evaluation Factors):</strong>
                      <span className="text-slate-600 text-[11px]">
                        Mandatory volume page limits, formats, and FAR 15.101-1 Best Value Tradeoff scoring rules.
                      </span>
                    </div>
                    {(() => {
                      const secLAtt = opportunity.attachments?.find(
                        (a) => a.name.toLowerCase().includes('section_l') || a.name.toLowerCase().includes('section_m')
                      );
                      if (secLAtt) {
                        return (
                          <button
                            type="button"
                            onClick={() => setPreviewAttachment(secLAtt)}
                            className="px-2.5 py-1 bg-white hover:bg-purple-50 text-purple-700 border border-purple-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer self-start sm:self-auto shrink-0"
                          >
                            <Eye className="w-3 h-3 text-purple-600" />
                            <span>View Section L/M in Native Viewer</span>
                          </button>
                        );
                      }
                      return null;
                    })()}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                    {attIntel.sectionLVolumes.map((vol, vIdx) => (
                      <div key={vIdx} className="p-3 bg-white border border-slate-200 rounded-xl text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <strong className="text-blue-900 font-bold">{vol.volume}</strong>
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-semibold border border-blue-200">
                            {vol.pageLimit}
                          </span>
                        </div>
                        <p className="font-semibold text-slate-800 text-[11px]">{vol.title}</p>
                        <p className="text-[10px] text-slate-500 font-mono">Format: {vol.format}</p>
                        <p className="text-slate-600 text-[11px] pt-1 border-t border-slate-100">{vol.focus}</p>
                      </div>
                    ))}
                  </div>

                  {/* Section M Evaluation Matrix */}
                  <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2 text-xs">
                    <span className="font-bold text-slate-900 block text-xs">Section M Evaluation Factors (In Order of Importance):</span>
                    <div className="space-y-1.5">
                      {attIntel.sectionMEvaluationFactors.map((fact, fIdx) => (
                        <div key={fIdx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <span className="font-bold text-slate-900 block">{fact.factor}</span>
                            <span className="text-[11px] text-slate-600">{fact.description}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold self-start sm:self-auto shrink-0 ${
                            fact.weightTier === 'Highest'
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : fact.weightTier === 'Pass/Fail'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-slate-200 text-slate-700'
                          }`}>
                            {fact.importance}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-tab 3: CDRL Deliverables Tracking */}
              {activeIntelTab === 'cdrl' && (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl text-xs">
                    <div>
                      <strong className="text-emerald-950 block">Contract Data Requirements List (CDRL):</strong>
                      <span className="text-slate-600 text-[11px]">
                        Authoritative formal deliverables schedule extracted from internal CDRL attachment.
                      </span>
                    </div>
                    {(() => {
                      const cdrlAtt = opportunity.attachments?.find(
                        (a) => a.name.toLowerCase().includes('cdrl') || a.name.toLowerCase().includes('deliverable')
                      );
                      if (cdrlAtt) {
                        return (
                          <button
                            type="button"
                            onClick={() => setPreviewAttachment(cdrlAtt)}
                            className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer self-start sm:self-auto shrink-0"
                          >
                            <Eye className="w-3 h-3 text-emerald-600" />
                            <span>View CDRL in Native Viewer</span>
                          </button>
                        );
                      }
                      return null;
                    })()}
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                          <th className="py-2.5 px-3">CDRL #</th>
                          <th className="py-2.5 px-3">DID Number</th>
                          <th className="py-2.5 px-4">Title</th>
                          <th className="py-2.5 px-4">Frequency</th>
                          <th className="py-2.5 px-3">Recipient</th>
                          <th className="py-2.5 px-3">Format</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {attIntel.cdrlSchedule.map((cdrl, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/70 transition">
                            <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{cdrl.cdrlNumber}</td>
                            <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">{cdrl.didNumber}</td>
                            <td className="py-2.5 px-4 font-semibold text-slate-900">{cdrl.title}</td>
                            <td className="py-2.5 px-4 text-slate-700">{cdrl.frequency}</td>
                            <td className="py-2.5 px-3 text-slate-600">{cdrl.recipient}</td>
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
              )}

              {/* Sub-tab 4: Pricing CLINs & SCA Wages */}
              {activeIntelTab === 'pricing' && (
                <div className="space-y-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-emerald-950 font-bold text-xs sm:text-sm">
                          Contract Line Item Numbers (CLINs) & SCA Wage Determination
                        </strong>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {attIntel.clinPricingSummary.length + localCustomLabor.length} Positions Configured
                        </span>
                      </div>
                      <span className="text-slate-600 text-[11px] block mt-0.5">
                        Benchmarked against GSA CALC 25th-90th percentiles and Department of Labor Service Contract Act (SCA) Wage Determination for {opportunity.placeOfPerformance.city}, {opportunity.placeOfPerformance.state}.
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setIsAddLaborModalOpen(true)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                        title="Search benchmark database and add labor categories with min/max rate limits"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Labor Category from Matrix</span>
                      </button>

                      {(() => {
                        const pricingAtt = opportunity.attachments?.find(
                          (a) => a.name.toLowerCase().includes('rate') || a.name.toLowerCase().includes('pricing') || a.name.toLowerCase().includes('xlsx')
                        );
                        if (pricingAtt) {
                          return (
                            <button
                              type="button"
                              onClick={() => setPreviewAttachment(pricingAtt)}
                              className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer self-start sm:self-auto shrink-0"
                            >
                              <FileSpreadsheet className="w-3 h-3 text-emerald-600" />
                              <span>View Pricing Spreadsheet</span>
                            </button>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>

                  {/* CLIN Table with Benchmarked Limits & Custom Items */}
                  <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-2xs">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                          <th className="py-2.5 px-3">CLIN #</th>
                          <th className="py-2.5 px-4">Labor Category / Position</th>
                          <th className="py-2.5 px-3">Rate Benchmark & Limits</th>
                          <th className="py-2.5 px-3 text-right">Est. Hours</th>
                          <th className="py-2.5 px-3 text-right">Billable Rate</th>
                          <th className="py-2.5 px-3 text-right">Total Price</th>
                          <th className="py-2.5 px-3 text-center">Performer</th>
                          <th className="py-2.5 px-2 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {/* 1. Baseline Extracted CLINs from Attachment */}
                        {attIntel.clinPricingSummary.map((item, idx) => (
                          <tr key={`base-${idx}`} className="hover:bg-slate-50/70 transition">
                            <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{item.clin}</td>
                            <td className="py-2.5 px-4 font-semibold text-slate-900">
                              <span>{item.laborCategory}</span>
                            </td>
                            <td className="py-2.5 px-3 text-[11px] text-slate-500 font-mono">
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[10px]">
                                Solicitation Attachment Rate
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-700">{item.hours.toLocaleString()} hrs</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">{item.rate}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{item.total}</td>
                            <td className="py-2.5 px-3 text-center">
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                                Prime
                              </span>
                            </td>
                            <td className="py-2.5 px-2 text-center text-[10px] text-slate-400">
                              Default
                            </td>
                          </tr>
                        ))}

                        {/* 2. User-Added / Customized Labor Positions */}
                        {localCustomLabor.map((item) => {
                          const totalVal = (item.rate || 0) * (item.hours || 0);
                          const isPrime = item.performerType === 'Prime Contractor';
                          return (
                            <tr key={item.id} className="hover:bg-emerald-50/40 bg-emerald-50/20 transition">
                              <td className="py-2.5 px-3 font-mono font-bold text-emerald-800 flex items-center gap-1">
                                <span>{item.clinNumber}</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              </td>
                              <td className="py-2.5 px-4 font-semibold text-slate-900">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <span>{item.roleTitle}</span>
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                      Custom Added
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-slate-500 block">
                                    {item.category} • Clearance: {item.clearance}
                                  </span>
                                </div>
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="space-y-0.5">
                                  <span className="font-mono text-[10px] text-slate-700 block">
                                    Limits: <strong>${item.minRateLimit.toFixed(0)} - ${item.maxRateLimit.toFixed(0)}</strong>/hr
                                  </span>
                                  <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                    <div className="bg-emerald-500 h-full w-full"></div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono text-slate-800 font-semibold">
                                {item.hours.toLocaleString()} hrs
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                                ${item.rate.toFixed(2)}/hr
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                                ${totalVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  isPrime
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                }`}>
                                  {isPrime ? 'Prime Small Business' : 'Teaming Sub'}
                                </span>
                              </td>
                              <td className="py-2.5 px-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveCustomLabor(item.id)}
                                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                                  title="Remove this position from solicitation"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Pricing & FAR 52.219-14 Work-Share Rollup Box */}
                  {(() => {
                    // Compute totals across baseline + custom
                    let totalHours = attIntel.clinPricingSummary.reduce((acc, c) => acc + c.hours, 0) +
                      localCustomLabor.reduce((acc, c) => acc + (c.hours || 0), 0);

                    let baseCost = attIntel.clinPricingSummary.reduce((acc, c) => {
                      const num = parseFloat(c.total.replace(/[^0-9.]/g, '')) || 0;
                      return acc + num;
                    }, 0);

                    let customCost = localCustomLabor.reduce((acc, c) => {
                      return acc + ((c.rate || 0) * (c.hours || 0));
                    }, 0);

                    let grandTotal = baseCost + customCost;

                    let primeLaborCost = baseCost + localCustomLabor.filter(c => c.performerType === 'Prime Contractor').reduce((acc, c) => acc + ((c.rate || 0) * (c.hours || 0)), 0);
                    let subLaborCost = localCustomLabor.filter(c => c.performerType !== 'Prime Contractor').reduce((acc, c) => acc + ((c.rate || 0) * (c.hours || 0)), 0);

                    let primePercentage = grandTotal > 0 ? Math.round((primeLaborCost / grandTotal) * 100) : 100;
                    let isFarCompliant = primePercentage >= 50;

                    return (
                      <div className="bg-slate-900 text-white p-4 rounded-xl shadow-xs space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">
                              Total Contract Estimated CLIN Ceiling (BOE):
                            </span>
                            <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
                              ${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <span className="text-[11px] text-slate-300">
                              Based on {totalHours.toLocaleString()} total labor hours across {attIntel.clinPricingSummary.length + localCustomLabor.length} CLIN items
                            </span>
                          </div>

                          {/* FAR 52.219-14 Work-share status */}
                          <div className="text-left sm:text-right space-y-1">
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">
                              FAR 52.219-14 Small Business Work-Share:
                            </span>
                            <div className="flex items-center gap-2 justify-start sm:justify-end">
                              <span className="font-mono text-base font-bold text-white">
                                Prime: {primePercentage}% | Sub: {100 - primePercentage}%
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                isFarCompliant
                                  ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/40'
                                  : 'bg-red-500/30 text-red-300 border border-red-400/40'
                              }`}>
                                {isFarCompliant ? '✓ 50% Rule Compliant' : '⚠ Non-Compliant (<50%)'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                          <span className="text-[11px] text-slate-300">
                            Custom labor categories configured here are automatically ingested into the SOW execution strategy and technical proposal generation.
                          </span>

                          <button
                            type="button"
                            onClick={() => setActiveModalTab('sow_strategy')}
                            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            <span>View in SOW Strategy & Proposal Draft →</span>
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  {attIntel.wageDetermination && (
                    <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs space-y-1.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <strong className="text-amber-950">
                          SCA Wage Determination No: {attIntel.wageDetermination.code}
                        </strong>
                        <span className="text-[11px] text-amber-900 font-semibold">
                          Health & Welfare: <strong>{attIntel.wageDetermination.healthWelfareRate}</strong>
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                        {attIntel.wageDetermination.topRoles.map((r, rIdx) => (
                          <div key={rIdx} className="bg-white p-2 rounded-lg border border-amber-200">
                            <span className="text-[10px] text-slate-500 block truncate">{r.title}</span>
                            <span className="text-xs font-mono font-bold text-emerald-700">{r.minWage}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Live AI Analysis Results Strip */}
              {deepAiAnalysis && (
                <div className="p-4 bg-indigo-50/80 border border-indigo-200 rounded-xl text-xs space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-indigo-200/80 pb-2">
                    <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <span>Gemini AI Strategic Attachment Briefing & Compliance Watchlist</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setDeepAiAnalysis(null)}
                      className="text-slate-400 hover:text-slate-600 text-xs"
                    >
                      ✕
                    </button>
                  </div>

                  <p className="text-slate-700 whitespace-pre-line leading-relaxed">
                    {deepAiAnalysis.executiveSummary}
                  </p>

                  {deepAiAnalysis.complianceWatchlist && deepAiAnalysis.complianceWatchlist.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <strong className="text-indigo-950 block">Critical Compliance Watchlist & Risk Gates:</strong>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {deepAiAnalysis.complianceWatchlist.map((cw: any, cwIdx: number) => (
                          <div key={cwIdx} className="bg-white p-2.5 rounded-lg border border-indigo-200/80 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-bold text-indigo-900">{cw.clauseOrMandate}</span>
                              <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                cw.riskLevel === 'Critical' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {cw.riskLevel} Risk
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-700">{cw.actionRequired}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Scope Tasks & Milestones */}
          {opportunity.scopeBullets && opportunity.scopeBullets.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Core Performance Deliverables & Scope</span>
              </h4>
              <ul className="grid grid-cols-1 gap-2">
                {opportunity.scopeBullets.map((task, idx) => (
                  <li key={idx} className="flex items-start gap-2 p-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{task}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Key FAR Clauses (FAR 52.219-14, etc.) */}
          {opportunity.keyFarClauses && opportunity.keyFarClauses.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-blue-600" />
                <span>Mandatory FAR / DFARS Clauses & Subcontracting Rules</span>
              </h4>
              <div className="space-y-2">
                {opportunity.keyFarClauses.map((clause, idx) => (
                  <div key={idx} className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-lg text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-amber-900">{clause.clause}</span>
                      <span className="font-semibold text-slate-800">{clause.title}</span>
                    </div>
                    <p className="text-slate-700 leading-normal">{clause.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attachments & Solicitations Files */}
          {opportunity.attachments && opportunity.attachments.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-blue-600" />
                    <span>Solicitation Packages & RFP Attachments ({opportunity.attachments.length})</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Verify attachment availability and privacy access status below before preparing proposal volumes.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadAll}
                  disabled={downloadingPackage}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto disabled:opacity-50"
                  title="Download all unrestricted attachments in this solicitation package"
                >
                  <FolderDown className="w-3.5 h-3.5" />
                  <span>{downloadingPackage ? 'Downloading Package...' : 'Download Available Files'}</span>
                </button>
              </div>

              {/* Attachment Access & SOW Security Protocol Banner */}
              <div className={`p-3.5 rounded-xl border text-xs ${
                opportunity.attachmentsAccessStatus === 'Access Request Required' || opportunity.hasControlledAttachments
                  ? 'bg-amber-50/80 border-amber-300 text-amber-950'
                  : opportunity.attachmentsAccessStatus === 'Mixed / Some Restricted'
                    ? 'bg-indigo-50/80 border-indigo-200 text-indigo-950'
                    : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
              }`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-bold">
                      {opportunity.hasControlledAttachments || opportunity.attachmentsAccessStatus === 'Access Request Required' ? (
                        <>
                          <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                          <span>Controlled SOW Attachments: Explicit Access Request Required on SAM.gov</span>
                        </>
                      ) : opportunity.attachmentsAccessStatus === 'Mixed / Some Restricted' ? (
                        <>
                          <Shield className="w-4 h-4 text-indigo-700 shrink-0" />
                          <span>Mixed Attachment Accessibility: Public Synopsis + Controlled SOW Details</span>
                        </>
                      ) : (
                        <>
                          <Unlock className="w-4 h-4 text-emerald-700 shrink-0" />
                          <span>Public Solicitation Package: All RFP & SOW Documents Unrestricted</span>
                        </>
                      )}
                    </div>
                    <p className="text-[11px] leading-relaxed opacity-90">
                      {opportunity.hasControlledAttachments || opportunity.attachmentsAccessStatus === 'Access Request Required' || opportunity.attachmentsAccessStatus === 'Mixed / Some Restricted'
                        ? 'Certain technical specifications, drawings, or Statements of Work (SOW) require an explicit SAM.gov Access Request under your authenticated contractor account (active CAGE Code & verified MPIN). Contracting Officer approval is required before downloading.'
                        : 'All posted solicitation attachments, wage determinations, and statement of work documents are public and immediately available for direct download.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowAccessGuideModal(!showAccessGuideModal)}
                      className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-[11px] font-semibold transition cursor-pointer"
                    >
                      {showAccessGuideModal ? 'Hide Instructions' : 'Access Request Guide'}
                    </button>
                    <a
                      href={getSafeSamGovUrl(opportunity)}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 transition"
                    >
                      <span>Open on SAM.gov</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {showAccessGuideModal && (
                  <div className="mt-3 pt-3 border-t border-amber-200/80 bg-white/70 p-3 rounded-lg text-[11px] text-slate-800 space-y-1.5">
                    <span className="font-bold text-slate-900 block">How to Request Access for Controlled SOWs on SAM.gov:</span>
                    <ol className="list-decimal list-inside space-y-1 text-slate-700 pl-1">
                      <li>Log in to official <strong>SAM.gov</strong> using your company's authenticated entity administrator profile.</li>
                      <li>Navigate to Solicitation <code className="font-bold text-slate-900">{opportunity.solicitationNumber}</code> using the direct link above.</li>
                      <li>In the <strong>Attachments / Links</strong> section of the notice, locate the controlled SOW or technical package.</li>
                      <li>Click the <strong>"Request Access"</strong> button next to the file. Enter your company's active CAGE Code: <span className="font-mono font-bold text-blue-700">{currentProfile.cageCode}</span>.</li>
                      <li>The Contracting Officer ({opportunity.poc.name}) will verify your entity eligibility and approve electronic access.</li>
                    </ol>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {opportunity.attachments.map((att) => {
                  const isDownloaded = Boolean(downloadedIds[att.id]);
                  const isSpreadsheet = att.name.toLowerCase().includes('xlsx') || att.name.toLowerCase().includes('rate');
                  const isControlled = att.isPublic === false || att.accessLevel?.includes('Controlled') || att.accessLevel?.includes('CUI');

                  return (
                    <div
                      key={att.id}
                      className={`p-3 bg-white border rounded-xl hover:border-slate-300 shadow-xs flex flex-col justify-between gap-2.5 text-xs transition ${
                        isControlled ? 'border-amber-200/90 bg-amber-50/20' : 'border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isSpreadsheet ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : isControlled ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {isSpreadsheet ? <FileSpreadsheet className="w-4 h-4" /> : isControlled ? <Lock className="w-4 h-4 text-amber-600" /> : <FileText className="w-4 h-4" />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate" title={att.name}>{att.name}</p>
                            <p className="text-[10px] text-slate-500 truncate">
                              {att.type} • {att.size}
                            </p>
                          </div>
                        </div>

                        {isControlled ? (
                          <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5 text-amber-700" />
                            <span>Controlled</span>
                          </span>
                        ) : (
                          <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <Unlock className="w-2.5 h-2.5 text-emerald-600" />
                            <span>Public</span>
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-600 leading-normal border-t border-slate-100 pt-1.5">
                        <p className="line-clamp-2">{att.description}</p>
                        {isControlled && (
                          <p className="text-[10px] text-amber-800 font-medium mt-1 flex items-center gap-1">
                            <span>⚠️ {att.accessInstructions || 'Access Request Required on SAM.gov.'}</span>
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-slate-100">
                        {isControlled && (
                          <a
                            href={getSafeSamGovUrl(opportunity)}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-[11px] font-semibold flex items-center gap-1 transition"
                            title="Open SAM.gov notice to request access to this file"
                          >
                            <span>Request Access on SAM</span>
                            <ExternalLink className="w-3 h-3 text-amber-700" />
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => setPreviewAttachment(att)}
                          className="px-2 py-1 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg border border-slate-200 transition cursor-pointer flex items-center gap-1 text-[11px] font-medium"
                          title="View Attachment in Native Format (PDF Plug-in, Formatted Doc, or Spreadsheet)"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-600" />
                          <span>View Contents</span>
                        </button>

                        {!isControlled && (
                          <button
                            type="button"
                            onClick={() => handleDownloadSingle(att)}
                            className={`p-1.5 rounded-lg border transition cursor-pointer flex items-center gap-1 text-[11px] font-medium ${
                              isDownloaded
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                : 'text-blue-600 hover:bg-blue-50 border-blue-200'
                            }`}
                            title="Download this RFP file"
                          >
                            {isDownloaded ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="hidden sm:inline text-[10px]">Saved</span>
                              </>
                            ) : (
                              <Download className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Incumbent Information (if available) */}
          {opportunity.incumbentInfo && opportunity.incumbentInfo.hasIncumbent && (
            <div className="p-3.5 bg-slate-100 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-900 block mb-1">Incumbent Contractor Intelligence:</span>
              <p className="text-slate-700 mb-1">
                <strong>Current Contractor:</strong> {opportunity.incumbentInfo.incumbentName}
              </p>
              <div className="flex gap-4 text-slate-600">
                <span>Contract #: <code>{opportunity.incumbentInfo.contractNumber}</code></span>
                {opportunity.incumbentInfo.estimatedOriginalValue && (
                  <span>Award Value: {opportunity.incumbentInfo.estimatedOriginalValue}</span>
                )}
              </div>
            </div>
          )}

          {/* Contracting Officer POC */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-slate-500 font-medium block">Contracting Officer / Point of Contact</span>
              <p className="font-bold text-slate-900 text-sm">{opportunity.poc.name}</p>
              <p className="text-slate-600">{opportunity.poc.title} • {opportunity.office}</p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={`mailto:${opportunity.poc.email}?subject=Question on Solicitation ${opportunity.solicitationNumber}`}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 font-medium transition"
              >
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                <span>{opportunity.poc.email}</span>
              </a>
              <span className="text-slate-400 font-mono hidden md:inline">{opportunity.poc.phone}</span>
            </div>
          </div>
        </>
      )}
    </div>

    {/* Footer Actions */}
    <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onTogglePipeline(opportunity)}
          className={`px-4 py-2 text-xs font-semibold rounded-lg border transition cursor-pointer flex items-center gap-1.5 ${
            isInPipeline
              ? 'bg-amber-100 text-amber-900 border-amber-300'
              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
          }`}
        >
          {isInPipeline ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-amber-600" />
              <span>Tracked in Pipeline</span>
            </>
          ) : (
            <span>+ Add to Bid Pipeline</span>
          )}
        </button>

        <a
          href={getSafeSamGovUrl(opportunity)}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1"
        >
          <span>View on SAM.gov</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="flex items-center gap-2.5">
        {activeModalTab === 'overview' ? (
          <button
            type="button"
            onClick={() => setActiveModalTab('sow_strategy')}
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md rounded-lg flex items-center gap-1.5 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>⚡ SOW Strategy & Resources</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setActiveModalTab('overview')}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-200 border border-slate-300 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>View SOW Synopsis</span>
          </button>
        )}

        <button
          onClick={() => {
            onClose();
            onGeneratePlan(opportunity);
          }}
          className="px-4 py-2 text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 shadow-xs rounded-lg flex items-center gap-1.5 transition cursor-pointer"
          title="Open Shipley Federal Proposal Plan and generated color team review artifacts"
        >
          <Briefcase className="w-3.5 h-3.5 text-blue-600" />
          <span>Shipley Plan & Artifacts</span>
        </button>

        <button
          onClick={onClose}
          className="px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  </div>

      {/* NATIVE ATTACHMENT & DOCUMENT VIEWER */}
      {previewAttachment && (
        <NativeAttachmentViewer
          attachment={previewAttachment}
          opportunity={opportunity}
          onClose={() => setPreviewAttachment(null)}
          onDownloadSingle={handleDownloadSingle}
        />
      )}

      {/* ADD LABOR CATEGORY & RATE LIMITS MODAL */}
      {isAddLaborModalOpen && opportunity && (
        <AddLaborCategoryModal
          isOpen={isAddLaborModalOpen}
          onClose={() => setIsAddLaborModalOpen(false)}
          targetOpportunity={opportunity}
          onAddLaborCategory={handleAddCustomLabor}
          existingItems={localCustomLabor}
        />
      )}
    </div>
  );
};
