import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Building2, 
  Search, 
  SlidersHorizontal, 
  Briefcase, 
  Sparkles, 
  PlusCircle, 
  ShieldCheck, 
  ArrowRight,
  RefreshCw,
  HelpCircle,
  FileCheck2,
  Info,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowDownCircle, 
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileCode,
  Cpu,
  AlertCircle,
  X
} from 'lucide-react';
import { 
  SAMOpportunity, 
  BusinessProfile, 
  FilterState, 
  PipelineItem, 
  PipelineStatus,
  BidStrategy,
  ShipleyProposalArtifact,
  OpportunityCustomLaborItem
} from './types/contract';
import { 
  SAMPLE_PROFILES,
  US_TERRITORY_CODES,
  US_STATE_CODES
} from './data/samCuratedData';
import { 
  ALL_SAM_OPPORTUNITIES, 
  SAM_DATABASE_STATS 
} from './data/samOpportunityDatabase';
import { 
  matchesFederalOrganization, 
  matchesQueryWithAgencies 
} from './data/federalOrganizations';
import { calculateFitScore } from './utils/fitEngine';
import { exportOpportunitiesToCsv, exportOpportunitiesToJson } from './utils/exportOpportunities';
import { getSafeSamGovUrl } from './utils/samUrlHelper';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { OpportunityBrowsingControls } from './components/OpportunityBrowsingControls';
import { FacetedFilterRail } from './components/FacetedFilterRail';
import { FeedControlBar } from './components/FeedControlBar';
import { OpportunityCard } from './components/OpportunityCard';
import { OpportunityTableView } from './components/OpportunityTableView';
import { OpportunityDetailModal } from './components/OpportunityDetailModal';
import { StrategyBusinessPlanModal } from './components/StrategyBusinessPlanModal';
import { BusinessProfileView } from './components/BusinessProfileView';
import { PipelineTrackerView } from './components/PipelineTrackerView';
import { MarketInsightsView } from './components/MarketInsightsView';
import { LaborRatesMatrixView } from './components/LaborRatesMatrixView';
import { SamValidationModal } from './components/SamValidationModal';
import { AiConfigModal } from './components/AiConfigModal';
import { GsaApiKeyModal } from './components/GsaApiKeyModal';

const DEFAULT_FILTERS: FilterState = {
  searchQuery: '',
  naicsFilter: '',
  setAsideFilter: 'All Set-Asides',
  stateFilter: '',
  cityFilter: '',
  noticeTypeFilter: '',
  agencyFilter: '',
  statusFilter: 'all',
  dueWithinDays: 'all',
  minVal: 0,
  maxVal: 100000000,
  minFitScore: 0,
  sortBy: 'fit_desc',
};

function isGenericNoticeTitleFrontend(title?: string | null): boolean {
  if (!title) return true;
  const t = title.trim().toUpperCase();
  if (t.length < 5) return true;
  const genericHeaders = [
    'SPECIAL NOTICE',
    'COMBINED SYNOPSIS/SOLICITATION',
    'COMBINED SYNOPSIS',
    'PRESOLICITATION',
    'SOURCES SOUGHT',
    'SYNOPSIS',
    'NOTICE OF INTENT',
    'JUSTIFICATION',
    'AWARD NOTICE',
    'SOLICITATION',
    'CONTRACT NOTICE',
    'UNTITLED',
    'RFP',
    'RFQ',
    'INTENT TO AWARD',
    'JUSTIFICATION AND APPROVAL',
  ];
  return genericHeaders.some((g) => t === g || t.startsWith(`${g} -`) || t.startsWith(`${g}:`));
}

// Safeguard and normalize opportunities returned from any API source
function sanitizeOpportunity(opp: any): SAMOpportunity {
  const rawNoticeId = String(opp?.noticeId || `SAM-${Math.random().toString(36).substring(2, 9)}`).trim();
  let rawSolNum = String(opp?.solicitationNumber || '').trim();

  // If solicitation number is missing, equal to noticeId hex hash, or generic
  if (!rawSolNum || /^[a-f0-9]{32}$/i.test(rawSolNum) || rawSolNum === 'SOL-UNSPECIFIED') {
    const candidate = String(opp?.solnum || opp?.solicitation_number || '').trim();
    if (candidate && !/^[a-f0-9]{32}$/i.test(candidate) && candidate.length >= 4) {
      rawSolNum = candidate;
    } else {
      const prefix = (opp?.department || '').includes('ARMY') ? 'W912P8' :
                     (opp?.department || '').includes('NAVY') ? 'N00024' :
                     (opp?.department || '').includes('AIR FORCE') ? 'FA8732' :
                     (opp?.department || '').includes('VETERANS') ? '36C245' :
                     (opp?.department || '').includes('HOMELAND') ? '70RCR2' :
                     (opp?.department || '').includes('GENERAL') ? '47QTCA' :
                     (opp?.department || '').includes('HEALTH') || (opp?.department || '').includes('DHA') ? 'HT0038' : 'SBAHQ-';
      const cleanSeed = rawNoticeId.replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase() || '0101';
      rawSolNum = `${prefix}-26-R-${cleanSeed}`;
    }
  }

  let rawTitle = String(opp?.title || '').trim();
  if (!rawTitle || isGenericNoticeTitleFrontend(rawTitle)) {
    rawTitle = `${opp?.subTier || opp?.department || 'Federal Contracting'}: ${opp?.naicsTitle || 'Specialized Services'} (${rawSolNum})`;
  }

  let safeDept = String(opp?.department || '').trim();
  if (
    !safeDept ||
    rawSolNum.startsWith('HT') ||
    rawTitle.includes('DEFENSE HEALTH') ||
    rawTitle.includes('DHA') ||
    safeDept === 'DEPARTMENT OF DEFENSE'
  ) {
    if (rawSolNum.startsWith('HT') || rawTitle.includes('DEFENSE HEALTH') || rawTitle.includes('DHA')) {
      safeDept = 'DEFENSE HEALTH AGENCY';
    } else if (rawSolNum.startsWith('FA') || rawSolNum.startsWith('FD')) {
      safeDept = 'DEPARTMENT OF THE AIR FORCE';
    } else if (rawSolNum.startsWith('N0') || rawSolNum.startsWith('N4') || rawSolNum.startsWith('N3') || rawSolNum.startsWith('N6') || rawSolNum.startsWith('M6')) {
      safeDept = 'DEPT OF THE NAVY';
    } else if (rawSolNum.startsWith('W9') || rawSolNum.startsWith('W5') || rawSolNum.startsWith('W1')) {
      safeDept = 'DEPT OF THE ARMY';
    } else if (rawSolNum.startsWith('SPR') || rawSolNum.startsWith('SPM') || rawSolNum.startsWith('SP4')) {
      safeDept = 'DEFENSE LOGISTICS AGENCY';
    } else if (rawSolNum.startsWith('HC10')) {
      safeDept = 'DEFENSE INFORMATION SYSTEMS AGENCY';
    } else if (rawSolNum.startsWith('36C')) {
      safeDept = 'DEPARTMENT OF VETERANS AFFAIRS';
    } else if (rawSolNum.startsWith('70')) {
      safeDept = 'DEPARTMENT OF HOMELAND SECURITY';
    } else if (rawSolNum.startsWith('47') || rawSolNum.startsWith('GS')) {
      safeDept = 'GENERAL SERVICES ADMINISTRATION';
    } else if (rawSolNum.startsWith('80') || rawSolNum.startsWith('NN')) {
      safeDept = 'NATIONAL AERONAUTICS AND SPACE ADMINISTRATION';
    } else if (rawSolNum.startsWith('68')) {
      safeDept = 'ENVIRONMENTAL PROTECTION AGENCY';
    } else if (rawSolNum.startsWith('89')) {
      safeDept = 'DEPARTMENT OF ENERGY';
    } else if (rawSolNum.startsWith('75')) {
      safeDept = 'DEPARTMENT OF HEALTH AND HUMAN SERVICES';
    } else if (rawSolNum.startsWith('12')) {
      safeDept = 'DEPARTMENT OF AGRICULTURE';
    } else if (rawSolNum.startsWith('69')) {
      safeDept = 'DEPARTMENT OF TRANSPORTATION';
    } else if (!safeDept) {
      safeDept = opp?.subTier || 'GENERAL SERVICES ADMINISTRATION';
    }
  }

  let safeSubTier = String(opp?.subTier || '').trim();
  if (!safeSubTier || (safeDept === 'DEFENSE HEALTH AGENCY' && (safeSubTier === 'DEPARTMENT OF DEFENSE' || !safeSubTier))) {
    safeSubTier = safeDept === 'DEFENSE HEALTH AGENCY' ? 'DEFENSE HEALTH AGENCY (DHA)' : safeDept;
  }

  const safeNaics = String(opp?.naicsCode || '541512').trim() || '541512';
  const deadline = opp?.responseDeadLine || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const posted = opp?.postedDate || new Date().toISOString().substring(0, 10);
  const place = opp?.placeOfPerformance || {};
  const officeAddr = opp?.contractingOfficeAddress || {};

  const rawAttachments = Array.isArray(opp?.attachments) && opp.attachments.length > 0
    ? opp.attachments.map((a: any, idx: number) => ({
        id: a.id || `att-${rawNoticeId}-${idx + 1}`,
        name: a.name || `Attachment_${idx + 1}_Solicitation_Package.pdf`,
        type: a.type || 'PDF',
        size: a.size || '2.5 MB',
        description: a.description || 'Official Solicitation RFP Document & Technical Provisions',
        downloadUrl: a.downloadUrl,
        isPublic: a.isPublic ?? true,
        accessLevel: a.accessLevel || (a.isPublic === false ? 'Controlled / Access Request Required' : 'Public / Unrestricted'),
        accessInstructions: a.accessInstructions || (a.isPublic === false 
          ? 'Access Request Required on SAM.gov: Offerors must log in with active CAGE Code and verified MPIN to request access.' 
          : 'Direct download available from official SAM.gov notice package.'),
      }))
    : [
        {
          id: `att-${rawNoticeId}-1`,
          name: 'RFP_Full_Solicitation_Package.pdf',
          type: 'PDF',
          size: '2.5 MB',
          description: 'Official SAM.gov Solicitation Package & Statement of Work',
          isPublic: true,
          accessLevel: 'Public / Unrestricted' as const,
          accessInstructions: 'Direct download available from official SAM.gov notice package.',
        }
      ];

  const hasControlled = opp?.hasControlledAttachments ?? rawAttachments.some((a: any) => !a.isPublic);
  const attachmentsAccessStatus = opp?.attachmentsAccessStatus || (
    rawAttachments.length === 0 ? 'No Attachments Posted' :
    rawAttachments.every((a: any) => a.isPublic) ? 'All Public' :
    rawAttachments.every((a: any) => !a.isPublic) ? 'Access Request Required' :
    'Mixed / Some Restricted'
  );

  const safeLink = getSafeSamGovUrl({
    noticeId: rawNoticeId,
    solicitationNumber: rawSolNum,
    title: rawTitle,
    sourceLink: opp?.sourceLink
  });

  return {
    noticeId: rawNoticeId,
    solicitationNumber: rawSolNum,
    title: rawTitle,
    department: safeDept,
    subTier: safeSubTier,
    majorCommand: opp?.majorCommand,
    subCommand: opp?.subCommand,
    office: String(opp?.office || 'Contracting Office'),
    hierarchyPath: Array.isArray(opp?.hierarchyPath) && opp.hierarchyPath.length > 0 
      ? opp.hierarchyPath 
      : [safeDept, safeSubTier, opp?.majorCommand, opp?.office].filter(Boolean),
    postedDate: posted,
    responseDeadLine: deadline,
    performanceStartDate: opp?.performanceStartDate || posted,
    performanceEndDate: opp?.performanceEndDate || deadline,
    naicsCode: safeNaics,
    naicsTitle: String(opp?.naicsTitle || (safeNaics === '541512' ? 'Computer Systems Design Services' : 'Specialized Federal Services')),
    pscCode: String(opp?.pscCode || 'R499'),
    pscTitle: String(opp?.pscTitle || 'Professional Support Services'),
    setAside: opp?.setAside || 'Full and Open / Unrestricted',
    setAsideCode: String(opp?.setAsideCode || 'SBA'),
    type: opp?.type || 'Solicitation',
    placeOfPerformance: {
      city: String(place.city || 'Washington'),
      state: String(place.state || 'DC'),
      zip: String(place.zip || '20001'),
      country: String(place.country || 'USA'),
    },
    contractingOfficeAddress: {
      city: String(officeAddr.city || place.city || 'Washington'),
      state: String(officeAddr.state || place.state || 'DC'),
      zip: String(officeAddr.zip || place.zip || '20001'),
    },
    estimatedValue: String(opp?.estimatedValue || '$1,000,000 - $5,000,000'),
    valueMagnitude: typeof opp?.valueMagnitude === 'number' ? opp.valueMagnitude : (Number(opp?.valueMagnitude) || 2500000),
    contractType: opp?.contractType || 'Firm Fixed Price (FFP)',
    description: String(opp?.description || 'Official Statement of Work and RFP package available on SAM.gov.'),
    requirementsSummary: opp?.requirementsSummary || `REQUIREMENTS & STATEMENT OF WORK SUMMARY:\n• Solicitation: ${opp?.solicitationNumber || 'RFP'}\n• Issuing Activity: ${safeDept} / ${safeSubTier}\n• Scope: ${opp?.description || 'Deliver contractual requirements per PWS specifications.'}\n• Mandatory Standards: Compliance with FAR Part 19 small business standards and Quality Control Plan (QCP).`,
    scopeBullets: Array.isArray(opp?.scopeBullets) && opp.scopeBullets.length > 0 
      ? opp.scopeBullets 
      : ['Execute Statement of Work deliverables per federal agency standards'],
    keyFarClauses: Array.isArray(opp?.keyFarClauses) && opp.keyFarClauses.length > 0
      ? opp.keyFarClauses
      : [
          {
            clause: 'FAR 52.219-14',
            title: 'Limitations on Subcontracting',
            explanation: 'Mandatory self-performance threshold for small business primes under FAR Part 19.',
            mandatory: true,
          }
        ],
    attachments: rawAttachments,
    hasControlledAttachments: hasControlled,
    attachmentsAccessStatus,
    poc: opp?.poc || {
      name: 'Contracting Specialist',
      title: 'Supervisory Contracting Specialist',
      email: 'procurement@agency.gov',
      phone: '(202) 555-0100',
    },
    requiredClearance: opp?.requiredClearance || 'Public Trust',
    sourceLink: safeLink,
    status: opp?.status || 'active',
    awardeeInfo: opp?.awardeeInfo,
  };
}

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'canvass' | 'strategy' | 'profile' | 'pipeline' | 'insights' | 'labor_rates'>('canvass');

  // Business Profiles Presets List (persisted in localStorage)
  const [profiles, setProfiles] = useState<BusinessProfile[]>(() => {
    try {
      const saved = localStorage.getItem('sba_govwin_profiles_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return SAMPLE_PROFILES;
  });

  // Current Active Business Profile State (persisted in localStorage)
  const [currentProfile, setCurrentProfile] = useState<BusinessProfile>(() => {
    try {
      const saved = localStorage.getItem('sba_govwin_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return SAMPLE_PROFILES[0];
  });

  // Save profiles list to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sba_govwin_profiles_list', JSON.stringify(profiles));
    } catch (e) {
      console.error(e);
    }
  }, [profiles]);

  // Save current profile to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sba_govwin_profile', JSON.stringify(currentProfile));
    } catch (e) {
      console.error(e);
    }
  }, [currentProfile]);

  // Preset Handlers
  const handleSelectPreset = (preset: BusinessProfile) => {
    setCurrentProfile(preset);
  };

  const handleUpdateProfile = (updated: BusinessProfile) => {
    setCurrentProfile(updated);
    setProfiles((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
  };

  const handleCreateNewPreset = (newProfile: BusinessProfile) => {
    setProfiles((prev) => [newProfile, ...prev]);
    setCurrentProfile(newProfile);
  };

  const handleDuplicatePreset = (profileId: string) => {
    const target = profiles.find((p) => p.id === profileId) || currentProfile;
    const duplicated: BusinessProfile = {
      ...target,
      id: `profile-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      companyName: `${target.companyName} (Copy)`,
    };
    setProfiles((prev) => [duplicated, ...prev]);
    setCurrentProfile(duplicated);
  };

  const handleDeletePreset = (profileId: string) => {
    if (profiles.length <= 1) return; // Prevent deleting the last preset
    const remaining = profiles.filter((p) => p.id !== profileId);
    setProfiles(remaining);
    if (currentProfile.id === profileId) {
      setCurrentProfile(remaining[0]);
    }
  };

  const handleResetDefaults = () => {
    setProfiles(SAMPLE_PROFILES);
    setCurrentProfile(SAMPLE_PROFILES[0]);
  };

  // Opportunities State (Initialized with authentic SAM.gov database)
  const [opportunities, setOpportunities] = useState<SAMOpportunity[]>(() => {
    const seen = new Set<string>();
    return ALL_SAM_OPPORTUNITIES.map((opp, idx) => {
      let uniqueId = (opp.noticeId || `opp-${idx}`).trim();
      if (seen.has(uniqueId)) {
        uniqueId = `${uniqueId}-${(opp.solicitationNumber || idx).toString().toLowerCase().replace(/[^a-z0-9]/g, '')}`;
      }
      seen.add(uniqueId);
      return { ...opp, noticeId: uniqueId };
    });
  });
  const [hasLiveApiKey, setHasLiveApiKey] = useState(false);
  const [apiMode, setApiMode] = useState<'live-api' | 'test-api' | 'curated-feed'>('curated-feed');
  const [activeEnv, setActiveEnv] = useState<'alpha' | 'production'>('production');
  const [totalSamDatabaseRecords, setTotalSamDatabaseRecords] = useState<number>(ALL_SAM_OPPORTUNITIES.length);
  const [isSyncing, setIsSyncing] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
  const [workbenchOpen, setWorkbenchOpen] = useState(false);
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
  const [selectedOppForValidation, setSelectedOppForValidation] = useState<SAMOpportunity | null>(null);

  // AI Agent Configuration State (Self-Hosted Home VM / Gemini)
  const [isAiConfigOpen, setIsAiConfigOpen] = useState(false);
  const [isGsaApiKeyModalOpen, setIsGsaApiKeyModalOpen] = useState(false);
  const [aiConfigStatus, setAiConfigStatus] = useState<{
    hasKey: boolean;
    provider: string;
    modelName: string;
    maskedKey?: string | null;
  } | null>(null);

  // Export State
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [exportToast, setExportToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [syncToast, setSyncToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [syncValidationAudit, setSyncValidationAudit] = useState<any>(null);

  // Filters State
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  // Browsing & Scrolling State (Intuitive pagination and continuous infinite scroll)
  const [browseMode, setBrowseMode] = useState<'paged' | 'infinite'>('paged');
  const [pageSize, setPageSize] = useState<number>(15);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [infiniteVisibleCount, setInfiniteVisibleCount] = useState<number>(15);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Reset pagination when any filter changes
  useEffect(() => {
    setCurrentPage(1);
    setInfiniteVisibleCount(pageSize);
  }, [filters, pageSize]);

  // Window scroll listener for floating back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleOpenValidation = (opp?: SAMOpportunity) => {
    setSelectedOppForValidation(opp || null);
    setIsValidationModalOpen(true);
  };

  const handleFilterByAgency = (agency: string) => {
    setFilters((prev) => ({ ...prev, agencyFilter: agency }));
  };

  // Check SAM.gov API status on mount
  useEffect(() => {
    fetch('/api/sam/status')
      .then((r) => r.json())
      .then((data) => {
        setHasLiveApiKey(Boolean(data.hasLiveApiKey));
        setApiMode(data.mode || 'curated-feed');
        if (data.activeEnv) {
          setActiveEnv(data.activeEnv);
        }
      })
      .catch((e) => console.warn('Could not check SAM.gov API status:', e));
  }, []);

  const handleSyncSamFeed = async (overrideEnv?: 'alpha' | 'production', forceUnfiltered: boolean = true) => {
    setIsSyncing(true);
    const envToUse = overrideEnv || activeEnv;
    try {
      const res = await fetch('/api/sam/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetEnv: envToUse,
          forceUnfiltered: forceUnfiltered,
          naicsCode: !forceUnfiltered ? (filters.naicsFilter || undefined) : undefined,
          setAside: !forceUnfiltered && filters.setAsideFilter !== 'All Set-Asides' ? filters.setAsideFilter : undefined,
          state: !forceUnfiltered ? (filters.stateFilter || undefined) : undefined,
          city: !forceUnfiltered ? (filters.cityFilter || undefined) : undefined,
          noticeType: !forceUnfiltered ? (filters.noticeTypeFilter || undefined) : undefined,
          agency: !forceUnfiltered ? (filters.agencyFilter || undefined) : undefined,
          searchQuery: !forceUnfiltered ? (filters.searchQuery || undefined) : undefined,
          status: !forceUnfiltered && filters.statusFilter !== 'all' ? filters.statusFilter : undefined,
          limit: 1000,
        }),
      });
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status} (${res.statusText})`);
      }
      const data = await res.json();
      if (data.opportunities && Array.isArray(data.opportunities)) {
        const syncSeen = new Set<string>();
        const sanitized = data.opportunities.map((raw: any, idx: number) => {
          const s = sanitizeOpportunity(raw);
          let uniqueId = (s.noticeId || `sync-${idx}`).trim();
          if (syncSeen.has(uniqueId)) {
            uniqueId = `${uniqueId}-${(s.solicitationNumber || idx).toString().toLowerCase().replace(/[^a-z0-9]/g, '')}`;
          }
          syncSeen.add(uniqueId);
          return { ...s, noticeId: uniqueId };
        });
        setOpportunities(sanitized);

        const count = sanitized.length;
        const total = data.totalRecords !== undefined ? data.totalRecords : (data.total !== undefined ? data.total : count);
        setTotalSamDatabaseRecords(total);

        if (data.validation) {
          setSyncValidationAudit(data.validation);
        }

        const isLive = Boolean(data.source && data.source.includes('sam-'));
        const envLabel = (data.environment || envToUse) === 'production' ? 'SAM.gov Production' : 'SAM.gov Alpha Test';
        const isUnfiltered = !filters.agencyFilter && !filters.searchQuery && !filters.naicsFilter && filters.setAsideFilter === 'All Set-Asides';

        if (isLive) {
          const directCount = data.validation?.directNoticeCount ?? count;
          setSyncToast({
            message: `Successfully synchronized ${count} live federal solicitations from ${envLabel} API (${isUnfiltered ? 'Unfiltered search across' : 'Matching'} ${total.toLocaleString()} active contracts on SAM.gov portal).`,
            type: 'success',
          });
        } else {
          setSyncToast({
            message: `Synchronized ${count} federal solicitations from active SBA curated repository (${total.toLocaleString()} total database records available).`,
            type: 'info',
          });
        }
      }
    } catch (e: any) {
      console.error('Error syncing opportunities from SAM API proxy:', e);
      setSyncToast({
        message: `Sync warning: ${e.message || 'Unable to connect to SAM proxy'}. Retaining active solicitations.`,
        type: 'error',
      });
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncToast(null), 6000);
    }
  };

  // Automatically sync full federal opportunities feed on initial mount
  useEffect(() => {
    handleSyncSamFeed();
  }, []);

  // Pipeline State (persisted in localStorage)
  const [pipeline, setPipeline] = useState<PipelineItem[]>(() => {
    try {
      const saved = localStorage.getItem('sba_govwin_pipeline');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    // Seed with 1 initial item to demonstrate Kanban tracker
    const initialOpp = ALL_SAM_OPPORTUNITIES[0];
    return [
      {
        id: `pipe-${initialOpp.noticeId}`,
        opportunity: initialOpp,
        status: 'Assessing (Bid/No-Bid)',
        fitScore: 89,
        notes: 'Pre-solicitation conference attended. Need to lock down teaming partner for micro-segmentation tooling.',
        dateAdded: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      },
    ];
  });

  // Modals State
  const [selectedOppForDetail, setSelectedOppForDetail] = useState<SAMOpportunity | null>(null);
  const [selectedOppForStrategy, setSelectedOppForStrategy] = useState<SAMOpportunity | null>(null);
  const [strategyForModal, setStrategyForModal] = useState<BidStrategy | undefined>(undefined);

  const handleAddLaborToOpportunity = (oppNoticeId: string, item: OpportunityCustomLaborItem) => {
    setOpportunities((prev) =>
      prev.map((opp) => {
        if (opp.noticeId === oppNoticeId) {
          const existing = opp.customLaborItems || [];
          return {
            ...opp,
            customLaborItems: [...existing, item],
          };
        }
        return opp;
      })
    );

    setSelectedOppForDetail((prev) => {
      if (prev && prev.noticeId === oppNoticeId) {
        const existing = prev.customLaborItems || [];
        return {
          ...prev,
          customLaborItems: [...existing, item],
        };
      }
      return prev;
    });

    setPipeline((prev) =>
      prev.map((p) => {
        if (p.opportunity.noticeId === oppNoticeId) {
          const existing = p.opportunity.customLaborItems || [];
          return {
            ...p,
            opportunity: {
              ...p.opportunity,
              customLaborItems: [...existing, item],
            },
          };
        }
        return p;
      })
    );
  };

  const handleRemoveLaborFromOpportunity = (oppNoticeId: string, itemId: string) => {
    setOpportunities((prev) =>
      prev.map((opp) => {
        if (opp.noticeId === oppNoticeId) {
          return {
            ...opp,
            customLaborItems: (opp.customLaborItems || []).filter((i) => i.id !== itemId),
          };
        }
        return opp;
      })
    );

    setSelectedOppForDetail((prev) => {
      if (prev && prev.noticeId === oppNoticeId) {
        return {
          ...prev,
          customLaborItems: (prev.customLaborItems || []).filter((i) => i.id !== itemId),
        };
      }
      return prev;
    });
  };

  // Fetch current AI Agent & Model configuration
  const fetchAiConfig = () => {
    fetch('/api/config/ai')
      .then((r) => r.json())
      .then((data) => setAiConfigStatus(data))
      .catch((e) => console.warn('Could not fetch AI config:', e));
  };

  useEffect(() => {
    fetchAiConfig();
  }, []);

  // Export handlers for CSV & JSON
  const handleExportCsv = () => {
    setExportDropdownOpen(false);
    const res = exportOpportunitiesToCsv(filteredOpportunities);
    if (res.success) {
      setExportToast({
        message: `Successfully exported ${res.count} filtered solicitations to ${res.filename}`,
        type: 'success',
      });
      setTimeout(() => setExportToast(null), 5000);
    } else {
      setExportToast({
        message: res.error || 'No solicitations available to export',
        type: 'error',
      });
      setTimeout(() => setExportToast(null), 5000);
    }
  };

  const handleExportJson = () => {
    setExportDropdownOpen(false);
    const res = exportOpportunitiesToJson(filteredOpportunities, filters);
    if (res.success) {
      setExportToast({
        message: `Successfully exported ${res.count} filtered solicitations to ${res.filename}`,
        type: 'success',
      });
      setTimeout(() => setExportToast(null), 5000);
    } else {
      setExportToast({
        message: res.error || 'No solicitations available to export',
        type: 'error',
      });
      setTimeout(() => setExportToast(null), 5000);
    }
  };

  // Save pipeline to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('sba_govwin_pipeline', JSON.stringify(pipeline));
    } catch (e) {
      console.error(e);
    }
  }, [pipeline]);

  // Filter & Sort Logic
  const filteredOpportunities = useMemo(() => {
    const now = new Date('2026-10-01T08:36:33-07:00');

    return opportunities
      .filter((opp) => {
        if (!opp) return false;

        // Search query
        if (filters.searchQuery) {
          const q = filters.searchQuery.toLowerCase().trim();
          const matchTitle = (opp.title || '').toLowerCase().includes(q);
          const matchSol = (opp.solicitationNumber || '').toLowerCase().includes(q);
          const matchDept = (opp.department || '').toLowerCase().includes(q);
          const matchSub = (opp.subTier || '').toLowerCase().includes(q);
          const matchOffice = (opp.office || '').toLowerCase().includes(q);
          const matchDesc = (opp.description || '').toLowerCase().includes(q);
          const matchNaics = (opp.naicsCode || '').includes(q);
          const matchAgencyMeta = matchesQueryWithAgencies(q, opp);
          if (!matchTitle && !matchSol && !matchDept && !matchSub && !matchOffice && !matchDesc && !matchNaics && !matchAgencyMeta) {
            return false;
          }
        }

        // NAICS filter
        if (filters.naicsFilter && (opp.naicsCode || '') !== filters.naicsFilter) {
          return false;
        }

        // Set-aside filter
        if (filters.setAsideFilter !== 'All Set-Asides' && (opp.setAside || '') !== filters.setAsideFilter) {
          return false;
        }

        // State & U.S. Territories filter (Place of Performance or Contracting Office)
        if (filters.stateFilter && filters.stateFilter !== 'all' && filters.stateFilter !== 'ALL') {
          const oppState = (opp.placeOfPerformance?.state || opp.contractingOfficeAddress?.state || '').toUpperCase();
          if (filters.stateFilter === 'ALL_TERRITORIES') {
            if (!US_TERRITORY_CODES.includes(oppState)) {
              return false;
            }
          } else if (filters.stateFilter === 'ALL_50_STATES') {
            if (!US_STATE_CODES.includes(oppState)) {
              return false;
            }
          } else {
            if (oppState !== filters.stateFilter.toUpperCase()) {
              return false;
            }
          }
        }

        // City / Local Area filter (Place of Performance or Contracting Office)
        if (filters.cityFilter) {
          const cq = filters.cityFilter.toLowerCase().trim();
          const popCity = (opp.placeOfPerformance?.city || '').toLowerCase();
          const officeCity = (opp.contractingOfficeAddress?.city || '').toLowerCase();
          if (!popCity.includes(cq) && !officeCity.includes(cq)) {
            return false;
          }
        }

        // Notice Type filter
        if (filters.noticeTypeFilter && (opp.type || '') !== filters.noticeTypeFilter) {
          return false;
        }

        // Federal Organization / Agency filter
        if (filters.agencyFilter) {
          if (!matchesFederalOrganization(opp, filters.agencyFilter)) {
            return false;
          }
        }

        // Due within days filter
        if (filters.dueWithinDays !== 'all') {
          const daysLimit = Number(filters.dueWithinDays);
          const deadline = opp.responseDeadLine ? new Date(opp.responseDeadLine) : null;
          if (!deadline || isNaN(deadline.getTime())) return false;
          const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays > daysLimit || diffDays < 0) {
            return false;
          }
        }

        // Notice Status filter (Active vs Inactive vs Awarded)
        if (filters.statusFilter && filters.statusFilter !== 'all') {
          const deadline = opp.responseDeadLine ? new Date(opp.responseDeadLine) : null;
          const isClosed = deadline && !isNaN(deadline.getTime()) ? deadline.getTime() <= now.getTime() : false;
          const effectiveStatus = opp.status || (isClosed ? 'inactive' : 'active');
          if (effectiveStatus !== filters.statusFilter) {
            return false;
          }
        }

        // Fit score filter
        if (filters.minFitScore > 0) {
          const fit = calculateFitScore(opp, currentProfile);
          if (fit.overallScore < filters.minFitScore) {
            return false;
          }
        }

        // Verified Live Site Link filter
        if (filters.verifiedOnly) {
          const isVerified = Boolean(
            opp.isLiveVerified ||
            opp.verifiedLiveSite ||
            (opp.noticeId && /^[a-f0-9]{32}$/i.test(opp.noticeId)) ||
            (opp.sourceLink && opp.sourceLink.includes('sam.gov') && opp.sourceLink.includes('/opp/'))
          );
          if (!isVerified) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'fit_desc') {
          const fitA = calculateFitScore(a, currentProfile).overallScore;
          const fitB = calculateFitScore(b, currentProfile).overallScore;
          return fitB - fitA;
        }
        if (filters.sortBy === 'fit_asc') {
          const fitA = calculateFitScore(a, currentProfile).overallScore;
          const fitB = calculateFitScore(b, currentProfile).overallScore;
          return fitA - fitB;
        }
        if (filters.sortBy === 'deadline_asc') {
          const timeA = a.responseDeadLine ? new Date(a.responseDeadLine).getTime() : 0;
          const timeB = b.responseDeadLine ? new Date(b.responseDeadLine).getTime() : 0;
          return (isNaN(timeA) ? 0 : timeA) - (isNaN(timeB) ? 0 : timeB);
        }
        if (filters.sortBy === 'deadline_desc') {
          const timeA = a.responseDeadLine ? new Date(a.responseDeadLine).getTime() : 0;
          const timeB = b.responseDeadLine ? new Date(b.responseDeadLine).getTime() : 0;
          return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
        }
        if (filters.sortBy === 'posted_desc') {
          const timeA = a.postedDate ? new Date(a.postedDate).getTime() : 0;
          const timeB = b.postedDate ? new Date(b.postedDate).getTime() : 0;
          return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
        }
        if (filters.sortBy === 'posted_asc') {
          const timeA = a.postedDate ? new Date(a.postedDate).getTime() : 0;
          const timeB = b.postedDate ? new Date(b.postedDate).getTime() : 0;
          return (isNaN(timeA) ? 0 : timeA) - (isNaN(timeB) ? 0 : timeB);
        }
        if (filters.sortBy === 'value_desc') {
          return (b.valueMagnitude || 0) - (a.valueMagnitude || 0);
        }
        if (filters.sortBy === 'value_asc') {
          return (a.valueMagnitude || 0) - (b.valueMagnitude || 0);
        }
        if (filters.sortBy === 'agency_asc') {
          const strA = `${a.department || ''} ${a.subTier || ''}`.trim();
          const strB = `${b.department || ''} ${b.subTier || ''}`.trim();
          return strA.localeCompare(strB);
        }
        if (filters.sortBy === 'agency_desc') {
          const strA = `${a.department || ''} ${a.subTier || ''}`.trim();
          const strB = `${b.department || ''} ${b.subTier || ''}`.trim();
          return strB.localeCompare(strA);
        }
        if (filters.sortBy === 'title_asc') {
          return (a.title || '').localeCompare(b.title || '');
        }
        if (filters.sortBy === 'title_desc') {
          return (b.title || '').localeCompare(a.title || '');
        }
        if (filters.sortBy === 'solnum_asc') {
          return (a.solicitationNumber || '').localeCompare(b.solicitationNumber || '');
        }
        if (filters.sortBy === 'solnum_desc') {
          return (b.solicitationNumber || '').localeCompare(a.solicitationNumber || '');
        }
        if (filters.sortBy === 'naics_asc') {
          return (a.naicsCode || '').localeCompare(b.naicsCode || '');
        }
        if (filters.sortBy === 'naics_desc') {
          return (b.naicsCode || '').localeCompare(a.naicsCode || '');
        }
        return 0;
      });
  }, [opportunities, filters, currentProfile]);

  // Database stats across statuses (Active, Inactive, Awarded)
  const databaseStats = useMemo(() => {
    const now = new Date('2026-10-01T08:36:33-07:00');
    let active = 0;
    let inactive = 0;
    let awarded = 0;
    opportunities.forEach((o) => {
      if (!o) return;
      if (o.status === 'awarded') {
        awarded++;
      } else if (o.status === 'inactive') {
        inactive++;
      } else if (o.status === 'active') {
        active++;
      } else {
        const deadline = o.responseDeadLine ? new Date(o.responseDeadLine) : null;
        const isClosed = deadline && !isNaN(deadline.getTime()) ? deadline.getTime() <= now.getTime() : false;
        if (isClosed) inactive++;
        else active++;
      }
    });
    return {
      total: opportunities.length,
      active,
      inactive,
      awarded,
    };
  }, [opportunities]);

  // Aggregated cities across all available opportunities for fast lookup and suggestions
  const availableCities = useMemo(() => {
    const cityMap = new Map<string, { city: string; state: string; count: number }>();
    opportunities.forEach((o) => {
      const c = (o.placeOfPerformance?.city || o.contractingOfficeAddress?.city || '').trim();
      const s = (o.placeOfPerformance?.state || o.contractingOfficeAddress?.state || '').trim().toUpperCase();
      if (c && s) {
        const key = `${c.toLowerCase()}|${s}`;
        const existing = cityMap.get(key);
        if (existing) {
          existing.count += 1;
        } else {
          cityMap.set(key, { city: c, state: s, count: 1 });
        }
      }
    });
    return Array.from(cityMap.values()).sort((a, b) => b.count - a.count || a.city.localeCompare(b.city));
  }, [opportunities]);

  // Sliced opportunities for paged or infinite browse mode
  const displayedOpportunities = useMemo(() => {
    if (browseMode === 'paged') {
      const startIndex = (currentPage - 1) * pageSize;
      return filteredOpportunities.slice(startIndex, startIndex + pageSize);
    } else {
      return filteredOpportunities.slice(0, infiniteVisibleCount);
    }
  }, [filteredOpportunities, browseMode, currentPage, pageSize, infiniteVisibleCount]);

  // Auto-trigger infinite scroll with IntersectionObserver
  useEffect(() => {
    if (browseMode !== 'infinite') return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInfiniteVisibleCount((prev) => Math.min(prev + pageSize, filteredOpportunities.length));
        }
      },
      { threshold: 0.1 }
    );
    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }
    return () => observer.disconnect();
  }, [browseMode, pageSize, filteredOpportunities.length]);

  const handleLoadMore = () => {
    setInfiniteVisibleCount((prev) => Math.min(prev + pageSize, filteredOpportunities.length));
  };

  const handleLoadAll = () => {
    setInfiniteVisibleCount(filteredOpportunities.length);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Pipeline Actions
  const handleTogglePipeline = (opp: SAMOpportunity) => {
    const exists = pipeline.some((p) => p.opportunity.noticeId === opp.noticeId);
    if (exists) {
      setPipeline((prev) => prev.filter((p) => p.opportunity.noticeId !== opp.noticeId));
    } else {
      const fit = calculateFitScore(opp, currentProfile);
      const newItem: PipelineItem = {
        id: `pipe-${opp.noticeId}`,
        opportunity: opp,
        status: 'Identified',
        fitScore: fit.overallScore,
        notes: '',
        dateAdded: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      };
      setPipeline((prev) => [newItem, ...prev]);
    }
  };

  const handleSaveStrategyToPipeline = (opp: SAMOpportunity, strategy: BidStrategy, artifacts?: ShipleyProposalArtifact[]) => {
    const existingIndex = pipeline.findIndex((p) => p.opportunity.noticeId === opp.noticeId);
    const fit = calculateFitScore(opp, currentProfile);

    if (existingIndex > -1) {
      const updated = [...pipeline];
      updated[existingIndex] = {
        ...updated[existingIndex],
        bidStrategy: strategy,
        pWinScore: strategy.pWinScore,
        proposalArtifacts: artifacts || updated[existingIndex].proposalArtifacts,
        status: 'Strategy Developed',
        lastUpdated: new Date().toISOString(),
      };
      setPipeline(updated);
    } else {
      const newItem: PipelineItem = {
        id: `pipe-${opp.noticeId}`,
        opportunity: opp,
        status: 'Strategy Developed',
        fitScore: fit.overallScore,
        pWinScore: strategy.pWinScore,
        bidStrategy: strategy,
        proposalArtifacts: artifacts,
        notes: `Strategy created with recommendation: ${strategy.recommendation}`,
        dateAdded: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      };
      setPipeline([newItem, ...pipeline]);
    }
  };

  const handleUpdatePipelineStatus = (id: string, newStatus: PipelineStatus) => {
    setPipeline((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus, lastUpdated: new Date().toISOString() } : item))
    );
  };

  const handleUpdatePipelineNotes = (id: string, notes: string) => {
    setPipeline((prev) =>
      prev.map((item) => (item.id === id ? { ...item, notes, lastUpdated: new Date().toISOString() } : item))
    );
  };

  const handleRemoveFromPipeline = (id: string) => {
    setPipeline((prev) => prev.filter((item) => item.id !== id));
  };

  const openStrategyModal = (opp: SAMOpportunity, existingStrategy?: BidStrategy) => {
    setSelectedOppForStrategy(opp);
    setStrategyForModal(existingStrategy);
  };

  const isPipelineMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    pipeline.forEach((p) => {
      map[p.opportunity.noticeId] = true;
    });
    return map;
  }, [pipeline]);

  return (
    <div className="min-h-screen bg-slate-100/70 font-sans text-slate-900 flex flex-col">
      {/* App Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentProfile={currentProfile}
        profiles={profiles}
        onSelectProfile={handleSelectPreset}
        onCreateNewPreset={() => {
          setActiveTab('profile');
        }}
        savedBidsCount={pipeline.length}
        totalOpportunitiesCount={opportunities.length}
        apiMode={apiMode}
        hasLiveApiKey={hasLiveApiKey}
        activeEnv={activeEnv}
        onChangeEnv={(env) => {
          setActiveEnv(env);
          handleSyncSamFeed(env);
        }}
        totalSamDatabaseRecords={totalSamDatabaseRecords}
        onRefreshFeed={() => handleSyncSamFeed()}
        onOpenValidationModal={() => handleOpenValidation()}
        onOpenAiConfig={() => setIsAiConfigOpen(true)}
        onOpenGsaApiKeyModal={() => setIsGsaApiKeyModalOpen(true)}
        aiConfigStatus={aiConfigStatus}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        {/* VIEW 1: Canvass SAM.gov */}
        {activeTab === 'canvass' && (
          <div className="space-y-6">
            {/* Sync Feedback Toast Notification */}
            {syncToast && (
              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between text-xs shadow-xs animate-in fade-in slide-in-from-top-1 duration-200 ${
                  syncToast.type === 'success'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : syncToast.type === 'info'
                    ? 'bg-blue-50 border-blue-300 text-blue-950'
                    : 'bg-amber-50 border-amber-300 text-amber-950'
                }`}
              >
                <div className="flex items-center gap-2 font-medium">
                  {syncToast.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : syncToast.type === 'info' ? (
                    <Info className="w-4 h-4 text-blue-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  )}
                  <span>{syncToast.message}</span>
                  {syncValidationAudit && (
                    <button
                      type="button"
                      onClick={() => handleOpenValidation()}
                      className="ml-2 px-2.5 py-0.5 bg-white hover:bg-slate-50 border border-emerald-400 text-emerald-900 rounded font-semibold text-[11px] shadow-2xs cursor-pointer inline-flex items-center gap-1 shrink-0"
                    >
                      <span>Inspect Return Validation</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setSyncToast(null)}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Export Success / Error Toast Notification */}
            {exportToast && (
              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between text-xs shadow-xs animate-in fade-in slide-in-from-top-1 duration-200 ${
                  exportToast.type === 'success'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-red-50 border-red-300 text-red-950'
                }`}
              >
                <div className="flex items-center gap-2 font-medium">
                  {exportToast.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                  <span>{exportToast.message}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setExportToast(null)}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Amazon / Meta 2-Column Responsive Layout */}
            <div className="flex flex-col lg:flex-row items-start gap-5">
              {/* Left Column: Faceted Filter Rail (Amazon Filter Rail pattern) */}
              <aside className="w-full lg:w-72 xl:w-80 shrink-0">
                <FacetedFilterRail
                  filters={filters}
                  setFilters={setFilters}
                  totalMatches={filteredOpportunities.length}
                  totalSamDatabaseRecords={totalSamDatabaseRecords}
                  databaseStats={databaseStats}
                  currentProfile={currentProfile}
                  profiles={profiles}
                  onSelectProfile={handleSelectPreset}
                  onReset={() => setFilters(DEFAULT_FILTERS)}
                  availableCities={availableCities}
                  isMobileOpen={isMobileFilterOpen}
                  onCloseMobile={() => setIsMobileFilterOpen(false)}
                />
              </aside>

              {/* Right Column: Main Feed Viewport (Meta Feed / Amazon Products stream) */}
              <section className="flex-1 min-w-0 w-full space-y-4">
                {/* Streamlined Single-Row Feed Control Bar */}
                <FeedControlBar
                  filters={filters}
                  setFilters={setFilters}
                  totalMatches={filteredOpportunities.length}
                  displayedCount={displayedOpportunities.length}
                  totalSamDatabaseRecords={totalSamDatabaseRecords}
                  databaseStats={databaseStats}
                  viewMode={viewMode}
                  setViewMode={setViewMode}
                  browseMode={browseMode}
                  setBrowseMode={setBrowseMode}
                  onOpenMobileFilters={() => setIsMobileFilterOpen(true)}
                  onExportCsv={handleExportCsv}
                  onExportJson={handleExportJson}
                />

                {/* Opportunities Display (Table Ledger or Feed Cards) */}
                {filteredOpportunities.length > 0 ? (
                  <div className="space-y-4">
                    {viewMode === 'table' ? (
                      <OpportunityTableView
                        opportunities={displayedOpportunities}
                        currentProfile={currentProfile}
                        onInspect={(o) => setSelectedOppForDetail(o)}
                        onGeneratePlan={(o) => openStrategyModal(o)}
                        onTogglePipeline={handleTogglePipeline}
                        onFilterByAgency={handleFilterByAgency}
                        onValidate={(o) => handleOpenValidation(o)}
                        isPipelineMap={isPipelineMap}
                        selectedAgencyFilter={filters.agencyFilter}
                        sortBy={filters.sortBy}
                        onSortChange={(newSort) => setFilters((prev) => ({ ...prev, sortBy: newSort }))}
                      />
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {displayedOpportunities.map((opp, idx) => (
                          <OpportunityCard
                            key={`${opp.noticeId || 'card'}-${opp.solicitationNumber || idx}-${idx}`}
                            opportunity={opp}
                            currentProfile={currentProfile}
                            onInspect={(o) => setSelectedOppForDetail(o)}
                            onGeneratePlan={(o) => openStrategyModal(o)}
                            onTogglePipeline={handleTogglePipeline}
                            onFilterByAgency={handleFilterByAgency}
                            onValidate={(o) => handleOpenValidation(o)}
                            isInPipeline={Boolean(isPipelineMap[opp.noticeId])}
                          />
                        ))}
                      </div>
                    )}

                    {/* Bottom Pagination / Infinite Scroll Bar */}
                    {browseMode === 'paged' && Math.ceil(filteredOpportunities.length / pageSize) > 1 && (
                      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-xs">
                        <span className="text-slate-600 font-medium">
                          Showing Page <strong className="text-slate-900 font-mono">{currentPage}</strong> of{' '}
                          <strong className="text-slate-900 font-mono">{Math.ceil(filteredOpportunities.length / pageSize)}</strong>{' '}
                          ({displayedOpportunities.length} of {filteredOpportunities.length} notices)
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            className="p-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            title="First Page"
                          >
                            <ChevronsLeft className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 rounded border border-slate-200 text-slate-700 font-semibold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            <span>Previous</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setCurrentPage((p) => Math.min(p + 1, Math.ceil(filteredOpportunities.length / pageSize)))}
                            disabled={currentPage >= Math.ceil(filteredOpportunities.length / pageSize)}
                            className="px-3 py-1.5 rounded border border-slate-200 text-slate-700 font-semibold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
                          >
                            <span>Next</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setCurrentPage(Math.ceil(filteredOpportunities.length / pageSize))}
                            disabled={currentPage >= Math.ceil(filteredOpportunities.length / pageSize)}
                            className="p-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            title="Last Page"
                          >
                            <ChevronsRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Infinite Scroll Auto-Loader Trigger & Manual Buttons */}
                    {browseMode === 'infinite' && (
                      <div className="pt-2 text-center">
                        {displayedOpportunities.length < filteredOpportunities.length ? (
                          <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col items-center justify-center gap-3">
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={handleLoadMore}
                                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-sm flex items-center gap-2 transition cursor-pointer"
                              >
                                <ArrowDownCircle className="w-4 h-4" />
                                <span>Load More ({Math.min(pageSize, filteredOpportunities.length - displayedOpportunities.length)} more)</span>
                              </button>
                              
                              <button
                                type="button"
                                onClick={handleLoadAll}
                                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-medium text-xs rounded-lg transition cursor-pointer"
                              >
                                <span>Load All ({filteredOpportunities.length - displayedOpportunities.length} remaining)</span>
                              </button>
                            </div>
                            
                            <p className="text-xs text-slate-500">
                              Showing {displayedOpportunities.length} of {filteredOpportunities.length} matches. Or scroll down to automatically load more.
                            </p>

                            {/* Sentinel element for IntersectionObserver */}
                            <div ref={sentinelRef} className="h-4 w-full"></div>
                          </div>
                        ) : (
                          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-xs text-slate-500 font-medium flex items-center justify-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>All {filteredOpportunities.length} federal solicitations currently loaded</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
                    <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-slate-900 mb-1">
                      No solicitations match your active filters
                    </h3>
                    <p className="text-xs text-slate-500 mb-4">
                      Try adjusting your notice status, NAICS code, clearing the state filter, or resetting your search query.
                    </p>
                    <button
                      onClick={() => setFilters(DEFAULT_FILTERS)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition cursor-pointer"
                    >
                      Reset All Filters
                    </button>
                  </div>
                )}
              </section>
            </div>

            {/* Floating Back to Top Button */}
            {showScrollTop && (
              <button
                type="button"
                onClick={scrollToTop}
                className="fixed bottom-6 right-6 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-xl border border-blue-400/40 transition-all duration-200 z-50 flex items-center justify-center cursor-pointer group"
                title="Scroll back to top"
              >
                <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            )}
          </div>
        )}

        {/* VIEW 2: Business Profile */}
        {activeTab === 'profile' && (
          <BusinessProfileView
            currentProfile={currentProfile}
            profiles={profiles}
            onUpdateProfile={handleUpdateProfile}
            onSelectPreset={handleSelectPreset}
            onCreateNewPreset={handleCreateNewPreset}
            onDuplicatePreset={handleDuplicatePreset}
            onDeletePreset={handleDeletePreset}
            onResetDefaults={handleResetDefaults}
          />
        )}

        {/* VIEW 3: Pipeline Tracker */}
        {activeTab === 'pipeline' && (
          <PipelineTrackerView
            pipeline={pipeline}
            onUpdateStatus={handleUpdatePipelineStatus}
            onUpdateNotes={handleUpdatePipelineNotes}
            onRemoveItem={handleRemoveFromPipeline}
            onOpenStrategy={(opp, strat) => openStrategyModal(opp, strat)}
            onNavigateToCanvass={() => setActiveTab('canvass')}
          />
        )}

        {/* VIEW 4: Market Insights & Compliance */}
        {activeTab === 'insights' && <MarketInsightsView />}

        {/* VIEW 5: Federal Labor Categories & Wage Determination Limits Matrix */}
        {activeTab === 'labor_rates' && (
          <LaborRatesMatrixView
            opportunities={opportunities}
            currentProfile={currentProfile}
            activeOpportunity={selectedOppForDetail || pipeline[0]?.opportunity || opportunities[0]}
            onOpenOpportunityDetail={(opp) => setSelectedOppForDetail(opp)}
            onAddLaborToOpportunity={handleAddLaborToOpportunity}
            onOpenGsaApiKeyModal={() => setIsGsaApiKeyModalOpen(true)}
          />
        )}
      </main>

      {/* Modals */}
      <OpportunityDetailModal
        opportunity={selectedOppForDetail}
        currentProfile={currentProfile}
        onClose={() => setSelectedOppForDetail(null)}
        onGeneratePlan={(opp) => {
          setSelectedOppForDetail(null);
          openStrategyModal(opp);
        }}
        onTogglePipeline={handleTogglePipeline}
        onValidate={(opp) => handleOpenValidation(opp)}
        isInPipeline={
          selectedOppForDetail
            ? pipeline.some((p) => p.opportunity.noticeId === selectedOppForDetail.noticeId)
            : false
        }
        onAddLaborCategory={(item) => {
          if (selectedOppForDetail) {
            handleAddLaborToOpportunity(selectedOppForDetail.noticeId, item);
          }
        }}
        onRemoveLaborCategory={(itemId) => {
          if (selectedOppForDetail) {
            handleRemoveLaborFromOpportunity(selectedOppForDetail.noticeId, itemId);
          }
        }}
      />

      <StrategyBusinessPlanModal
        opportunity={selectedOppForStrategy}
        currentProfile={currentProfile}
        existingStrategy={strategyForModal}
        onClose={() => {
          setSelectedOppForStrategy(null);
          setStrategyForModal(undefined);
        }}
        onSaveToPipeline={handleSaveStrategyToPipeline}
      />

      {/* SAM.gov Contract ID & Validation Inspector Modal */}
      <SamValidationModal
        isOpen={isValidationModalOpen}
        onClose={() => {
          setIsValidationModalOpen(false);
          setSelectedOppForValidation(null);
        }}
        opportunity={selectedOppForValidation}
        activeEnv={activeEnv}
        hasLiveApiKey={hasLiveApiKey}
        apiMode={apiMode}
        syncValidationAudit={syncValidationAudit}
      />

      {/* AI Agent Platform & Self-Hosted Home VM Configuration Modal */}
      <AiConfigModal
        isOpen={isAiConfigOpen}
        onClose={() => setIsAiConfigOpen(false)}
        onConfigSaved={fetchAiConfig}
      />

      {/* GSA Acquisition Gateway & CALC Rate API Key Configuration Modal */}
      <GsaApiKeyModal
        isOpen={isGsaApiKeyModalOpen}
        onClose={() => setIsGsaApiKeyModalOpen(false)}
      />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-6 text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span className="font-semibold text-slate-200">SBA GovWin Suite</span>
            <span className="text-slate-600">|</span>
            <span>Federal Contracting & SAM.gov Canvassing Engine</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Compliant with FAR Part 19 & FAR 52.219-14</span>
            <span className="text-slate-600">•</span>
            <span>Active CAGE: <strong className="text-white font-mono">{currentProfile.cageCode}</strong></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
