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
  ArrowRight,
  Shield,
  DollarSign,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  Lock,
  Unlock,
  FileStack,
  Layers
} from 'lucide-react';
import { SAMOpportunity, BusinessProfile, FitScore } from '../types/contract';
import { calculateFitScore } from '../utils/fitEngine';
import { getSafeSamGovUrl } from '../utils/samUrlHelper';

interface OpportunityCardProps {
  opportunity: SAMOpportunity;
  currentProfile: BusinessProfile;
  onInspect: (opp: SAMOpportunity) => void;
  onGeneratePlan: (opp: SAMOpportunity) => void;
  onTogglePipeline: (opp: SAMOpportunity) => void;
  onFilterByAgency?: (agency: string) => void;
  onValidate?: (opp: SAMOpportunity) => void;
  isInPipeline: boolean;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  currentProfile,
  onInspect,
  onGeneratePlan,
  onTogglePipeline,
  onFilterByAgency,
  onValidate,
  isInPipeline,
}) => {
  const [copiedSol, setCopiedSol] = useState(false);
  const fit: FitScore = calculateFitScore(opportunity, currentProfile);

  const handleCopySol = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(opportunity.solicitationNumber);
    setCopiedSol(true);
    setTimeout(() => setCopiedSol(false), 2000);
  };

  // Calculate days remaining until deadline
  const now = new Date('2026-10-01T08:36:33-07:00'); // Consistent reference date
  const deadline = new Date(opportunity.responseDeadLine);
  const diffTime = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const isUrgent = diffDays <= 14 && diffDays > 0;
  const isExpired = diffDays <= 0;

  // Fit Score Colors
  const getFitBadgeStyle = (score: number) => {
    if (score >= 80) return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20';
    if (score >= 60) return 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/20';
    return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20';
  };

  // Set-aside color
  const getSetAsideStyle = (setAside?: string) => {
    const s = String(setAside || '');
    if (s.includes('8(a)')) return 'bg-purple-100 text-purple-800 border-purple-200';
    if (s.includes('SDVOSB') || s.includes('Veteran')) return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    if (s.includes('WOSB')) return 'bg-rose-100 text-rose-800 border-rose-200';
    if (s.includes('HUBZone')) return 'bg-teal-100 text-teal-800 border-teal-200';
    if (s.includes('Total Small Business')) return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-slate-100 text-slate-800 border-slate-200';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      {/* Top Banner: Set-Aside & Fit Score */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={handleCopySol}
              className="text-xs font-mono font-bold bg-slate-900 hover:bg-slate-850 text-white px-2 py-0.5 rounded flex items-center gap-1.5 transition cursor-pointer"
              title="Official Solicitation Number. Click to copy for SAM.gov search"
            >
              <span className="text-[10px] text-blue-300 font-sans font-semibold">SOL #</span>
              <span>{opportunity.solicitationNumber}</span>
              {copiedSol ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3 text-slate-400" />
              )}
            </button>
            {onValidate && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onValidate(opportunity);
                }}
                className="text-[11px] font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded flex items-center gap-1 transition cursor-pointer"
                title="Inspect official identifiers & validate on SAM.gov"
              >
                <span>Validate</span>
                <ExternalLink className="w-3 h-3 text-blue-600" />
              </button>
            )}

            <a
              href={getSafeSamGovUrl(opportunity)}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-[11px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded flex items-center gap-1 transition shadow-2xs hover:shadow-xs cursor-pointer"
              title="Open official solicitation directly on live SAM.gov portal"
            >
              <span>Live SAM.gov</span>
              <ExternalLink className="w-3 h-3 text-emerald-600" />
            </a>

            <span className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
              {opportunity.type}
            </span>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${getSetAsideStyle(opportunity.setAside)}`}>
              {opportunity.setAside}
            </span>

            {/* Status Badge */}
            {opportunity.status === 'awarded' ? (
              <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded flex items-center gap-1">
                <span>🏆 Awarded</span>
              </span>
            ) : opportunity.status === 'inactive' || isExpired ? (
              <span className="text-[10px] font-bold bg-slate-200 text-slate-700 border border-slate-300 px-2 py-0.5 rounded flex items-center gap-1">
                <span>⚪ Inactive</span>
              </span>
            ) : (
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Active</span>
              </span>
            )}
          </div>

          {/* SBA Fit Score Pill */}
          <div 
            title={fit.matchHighlights.join(' • ')}
            className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold ring-1 transition cursor-help ${getFitBadgeStyle(fit.overallScore)}`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{fit.overallScore}% Fit</span>
          </div>
        </div>

        {/* Federal Organization Hierarchy Indicators */}
        <div className="bg-slate-50/80 rounded-lg p-2 border border-slate-150 mb-2 space-y-1">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Dept/Agency:</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onFilterByAgency) onFilterByAgency(opportunity.department);
              }}
              className="font-bold text-slate-800 hover:text-blue-700 hover:underline transition cursor-pointer text-left truncate max-w-[210px]"
              title={`Filter by Federal Organization: ${opportunity.department}`}
            >
              {opportunity.department}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1 text-[11px] text-slate-600">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Sub-tier:</span>
            <span className="font-medium text-slate-700 truncate max-w-[210px]">{opportunity.subTier}</span>
          </div>

          {(opportunity.majorCommand || opportunity.subCommand) && (
            <div className="flex flex-wrap items-center gap-1 text-[10px] text-slate-500">
              {opportunity.majorCommand && (
                <span className="bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.2 rounded font-medium truncate max-w-[170px]" title={`Major Command: ${opportunity.majorCommand}`}>
                  Cmd: {opportunity.majorCommand}
                </span>
              )}
              {opportunity.subCommand && (
                <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.2 rounded font-medium truncate max-w-[170px]" title={`Sub Command: ${opportunity.subCommand}`}>
                  Sub: {opportunity.subCommand}
                </span>
              )}
            </div>
          )}

          <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono truncate">
            <span className="text-[9px] font-sans font-semibold uppercase text-slate-400">Office:</span>
            <span className="truncate">{opportunity.office}</span>
          </div>
        </div>

        {/* Attachment & SOW Accessibility Badge */}
        <div className="flex items-center justify-between gap-2 mb-2 text-[11px]">
          {opportunity.attachmentsAccessStatus === 'Access Request Required' ? (
            <div 
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-medium"
              title="Restricted / Controlled SOW: Additional access request required on SAM.gov under authenticated contractor profile"
            >
              <Lock className="w-3 h-3 text-amber-600 shrink-0" />
              <span>SOW: Access Request Req. ({opportunity.attachments?.length || 1} files)</span>
            </div>
          ) : opportunity.attachmentsAccessStatus === 'Mixed / Some Restricted' ? (
            <div 
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200 font-medium"
              title="Mixed Access: Public RFP synopsis posted; technical SOW / attachments require SAM.gov access request"
            >
              <Shield className="w-3 h-3 text-indigo-600 shrink-0" />
              <span>Mixed Access SOW ({opportunity.attachments?.length || 2} files)</span>
            </div>
          ) : (
            <div 
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium"
              title="All RFP attachments and Statement of Work documents are public and immediately accessible"
            >
              <Unlock className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>Public SOW ({opportunity.attachments?.length || 1} files)</span>
            </div>
          )}

          {opportunity.requirementsSummary && (
            <span className="text-[10px] text-blue-700 bg-blue-50/90 border border-blue-200 px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
              <Layers className="w-2.5 h-2.5 text-blue-600" />
              <span>Reqs Ready</span>
            </span>
          )}
        </div>

        {/* Solicitation Title */}
        <h3 
          onClick={() => onInspect(opportunity)}
          className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition cursor-pointer line-clamp-2 leading-snug mb-2"
        >
          {opportunity.title}
        </h3>

        {/* Description Excerpt */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
          {opportunity.description}
        </p>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs py-2 px-3 bg-slate-50 rounded-lg border border-slate-100 mb-3">
          <div className="flex items-center gap-1.5 text-slate-700">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate font-semibold">{opportunity.estimatedValue}</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-700">
            <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="truncate">
              {opportunity.placeOfPerformance?.city || 'Washington'}, {opportunity.placeOfPerformance?.state || 'DC'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-700">
            <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-mono text-[11px] truncate">
              NAICS: <strong className="text-slate-900">{opportunity.naicsCode || '541512'}</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock className={`w-3.5 h-3.5 shrink-0 ${isUrgent ? 'text-amber-600' : 'text-slate-400'}`} />
            <span className={`text-[11px] font-medium truncate ${isUrgent ? 'text-amber-700 font-bold' : 'text-slate-600'}`}>
              {isExpired ? (
                <span className="text-red-600 font-bold">Closed</span>
              ) : (
                <span>{diffDays} days left ({isNaN(deadline.getTime()) ? 'Open' : deadline.toLocaleDateString()})</span>
              )}
            </span>
          </div>
        </div>

        {/* Awardee Info if awarded */}
        {opportunity.awardeeInfo && (
          <div className="mt-2 text-[11px] bg-amber-50 border border-amber-200 rounded p-2 text-amber-950 space-y-0.5">
            <div className="font-bold flex items-center justify-between">
              <span>🏆 Awardee: {opportunity.awardeeInfo.vendorName}</span>
              <span className="font-mono text-emerald-800 font-bold">{opportunity.awardeeInfo.awardAmount}</span>
            </div>
            <div className="text-[10px] text-amber-800 font-mono flex items-center justify-between">
              <span>Awarded: {opportunity.awardeeInfo.awardDate}</span>
              <span>Contr: {opportunity.awardeeInfo.contractNumber}</span>
            </div>
          </div>
        )}

        {/* Fit Engine Highlight Tag */}
        {fit.matchHighlights.length > 0 && (
          <div className="text-[11px] text-emerald-800 bg-emerald-50/80 px-2.5 py-1 rounded border border-emerald-100 flex items-center gap-1.5 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
            <span className="truncate font-medium">{fit.matchHighlights[0]}</span>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="p-3 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          onClick={() => onTogglePipeline(opportunity)}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg border flex items-center gap-1.5 transition cursor-pointer ${
            isInPipeline
              ? 'bg-amber-50 text-amber-900 border-amber-300 font-semibold'
              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
          }`}
        >
          {isInPipeline ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
              <span>In Pipeline</span>
            </>
          ) : (
            <>
              <PlusCircle className="w-3.5 h-3.5 text-slate-500" />
              <span>Pipeline</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onInspect(opportunity)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-blue-900 bg-white hover:bg-blue-50 border border-slate-300 rounded-lg transition cursor-pointer flex items-center gap-1.5"
            title="Inspect full RFP synopsis, SOW execution strategy, and proposal generator"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>RFP Profile & SOW</span>
          </button>

          <button
            onClick={() => onGeneratePlan(opportunity)}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xs rounded-lg flex items-center gap-1.5 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Create Bid Strategy</span>
          </button>
        </div>
      </div>
    </div>
  );
};
