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
  Layers,
  Bookmark
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
  const now = new Date('2026-10-01T08:36:33-07:00');
  const deadline = new Date(opportunity.responseDeadLine);
  const diffTime = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const isUrgent = diffDays <= 14 && diffDays > 0;
  const isExpired = diffDays <= 0;

  const isLiveVerified = Boolean(
    opportunity.isLiveVerified ||
    opportunity.verifiedLiveSite ||
    (opportunity.noticeId && /^[a-f0-9]{32}$/i.test(opportunity.noticeId))
  );

  return (
    <article className="bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      {/* Top Header: Agency Wordmark & Natural Metadata */}
      <div className="p-4 sm:p-5 pb-3">
        {/* Row 1: Issuing Agency + Status Dot + Fit Score */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-0.5">
              <span className="font-semibold text-slate-900 truncate">
                {opportunity.department}
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="truncate text-slate-600">
                {opportunity.subTier || opportunity.office}
              </span>
            </div>

            {/* Natural Unboxed Metadata (Zero-Pill discipline) */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
              <span className="font-mono text-slate-700 font-semibold">
                {opportunity.type}
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>{opportunity.setAside}</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="font-mono">NAICS {opportunity.naicsCode}</span>
            </div>
          </div>

          {/* Right Status Dot & Fit Score */}
          <div className="flex items-center gap-2 shrink-0">
            {opportunity.status === 'awarded' ? (
              <span className="text-[11px] font-semibold text-amber-800 flex items-center gap-1">
                <span>🏆 Awarded</span>
              </span>
            ) : opportunity.status === 'inactive' || isExpired ? (
              <span className="text-[11px] font-medium text-slate-400">
                Closed
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Active</span>
              </span>
            )}

            <div 
              title={fit.matchHighlights.join(' • ')}
              className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border tabular-nums ${
                fit.overallScore >= 80 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                  : fit.overallScore >= 60 
                  ? 'bg-blue-50 text-blue-800 border-blue-200' 
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              {fit.overallScore}% Fit
            </div>
          </div>
        </div>

        {/* Row 2: Title and Solicitation Number */}
        <div className="mb-2">
          <div className="flex items-center gap-2 mb-1">
            <button
              type="button"
              onClick={handleCopySol}
              className="text-[11px] font-mono font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1 transition cursor-pointer"
              title="Copy official solicitation number"
            >
              <span className="text-slate-500 font-sans text-[10px]">SOL#</span>
              <span>{opportunity.solicitationNumber}</span>
              {copiedSol ? (
                <Check className="w-3 h-3 text-emerald-600" />
              ) : (
                <Copy className="w-3 h-3 text-slate-400" />
              )}
            </button>

            {isLiveVerified && (
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                <span>Verified SAM Link</span>
              </span>
            )}
          </div>

          <h3 
            onClick={() => onInspect(opportunity)}
            className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-700 transition cursor-pointer line-clamp-2 leading-snug"
          >
            {opportunity.title}
          </h3>
        </div>

        {/* Scope Snippet */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
          {opportunity.description}
        </p>

        {/* Financial & Location Telemetry (Tabular figures) */}
        <div className="grid grid-cols-2 gap-2 text-xs py-2 px-2.5 bg-slate-50/80 rounded-lg border border-slate-150 mb-2 font-medium">
          <div className="flex items-center gap-1.5 text-slate-700">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="font-mono tabular-nums font-semibold truncate text-[11px] sm:text-xs">
              {opportunity.estimatedValue}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-700">
            <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="truncate text-[11px]">
              {opportunity.placeOfPerformance?.city || 'Washington'}, {opportunity.placeOfPerformance?.state || 'DC'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-600">
            <Clock className={`w-3.5 h-3.5 shrink-0 ${isUrgent ? 'text-amber-600' : 'text-slate-400'}`} />
            <span className={`text-[11px] truncate font-mono tabular-nums ${isUrgent ? 'text-amber-700 font-bold' : ''}`}>
              {isExpired ? 'Expired' : `${diffDays}d remaining`}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-600">
            {opportunity.attachmentsAccessStatus === 'Access Request Required' ? (
              <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            ) : (
              <Unlock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            )}
            <span className="text-[11px] truncate">
              {opportunity.attachmentsAccessStatus === 'Access Request Required' ? 'Controlled SOW' : 'Public SOW'}
            </span>
          </div>
        </div>

        {/* Fit Engine Match highlight */}
        {fit.matchHighlights.length > 0 && (
          <div className="text-[11px] text-slate-600 flex items-center gap-1.5 truncate">
            <span className="text-emerald-500 font-bold">✓</span>
            <span className="truncate">{fit.matchHighlights[0]}</span>
          </div>
        )}
      </div>

      {/* Social Action Bar (Meta / LinkedIn style bottom row) */}
      <div className="p-2.5 px-4 bg-slate-50 border-t border-slate-150 flex items-center justify-between gap-2 text-xs">
        {/* Bookmark / Pipeline button */}
        <button
          type="button"
          onClick={() => onTogglePipeline(opportunity)}
          className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 transition cursor-pointer font-medium ${
            isInPipeline
              ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
          }`}
          title={isInPipeline ? 'Remove from Bid Pipeline' : 'Track in Bid Pipeline'}
        >
          <Bookmark className={`w-3.5 h-3.5 ${isInPipeline ? 'text-amber-700 fill-amber-700' : 'text-slate-500'}`} />
          <span className="hidden sm:inline">{isInPipeline ? 'Saved' : 'Save'}</span>
        </button>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* SAM.gov Direct External Link */}
          <a
            href={getSafeSamGovUrl(opportunity)}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 sm:px-2 sm:py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition flex items-center gap-1 text-[11px] font-medium"
            title="Open official notice on SAM.gov"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">SAM.gov</span>
          </a>

          {/* SOW & Attachments Inspect */}
          <button
            type="button"
            onClick={() => onInspect(opportunity)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition flex items-center gap-1 text-[11px] font-medium cursor-pointer"
            title="Inspect full Statement of Work, attachments, and labor categories"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>SOW & Files</span>
          </button>

          {/* AI Win Strategy / Proposal Button */}
          <button
            type="button"
            onClick={() => onGeneratePlan(opportunity)}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-1 shadow-2xs transition cursor-pointer text-[11px]"
            title="Generate Shipley proposal volumes and win strategy"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Proposal</span>
          </button>
        </div>
      </div>
    </article>
  );
};
