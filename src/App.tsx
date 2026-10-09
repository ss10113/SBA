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
  ShipleyProposalArtifact
} from './types/contract';
import { 
  SAMPLE_PROFILES 
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
import { OpportunityCard } from './components/OpportunityCard';
import { OpportunityTableView } from './components/OpportunityTableView';
import { OpportunityDetailModal } from './components/OpportunityDetailModal';
import { StrategyBusinessPlanModal } from './components/StrategyBusinessPlanModal';
import { BusinessProfileView } from './components/BusinessProfileView';
import { PipelineTrackerView } from './components/PipelineTrackerView';
import { MarketInsightsView } from './components/MarketInsightsView';
import { SamValidationModal } from './components/SamValidationModal';
import { AiConfigModal } from './components/AiConfigModal';

const DEFAULT_FILTERS: FilterState = {
  searchQuery: '',
  naicsFilter: '',
  setAsideFilter: 'All Set-Asides',
  stateFilter: '',
  noticeTypeFilter: '',
  agencyFilter: '',
  statusFilter: 'all',
  dueWithinDays: 'all',
  minVal: 0,
  maxVal: 100000000,
  minFitScore: 0,
  sortBy: 'fit_desc',
};

// Safeguard and normalize opportunities returned from any API source
function sanitizeOpportunity(opp: any): SAMOpportunity {
  const solNum = String(opp?.solicitationNumber || opp?.noticeId || '').toUpperCase();
  const title = String(opp?.title || '').toUpperCase();

  let safeDept = String(opp?.department || '').trim();
  if (
    !safeDept ||
    solNum.startsWith('HT') ||
    title.includes('DEFENSE HEALTH') ||
    title.includes('DHA') ||
    safeDept === 'DEPARTMENT OF DEFENSE'
  ) {
    if (solNum.startsWith('HT') || title.includes('DEFENSE HEALTH') || title.includes('DHA')) {
      safeDept = 'DEFENSE HEALTH AGENCY';
    } else if (solNum.startsWith('FA') || solNum.startsWith('FD')) {
      safeDept = 'DEPARTMENT OF THE AIR FORCE';
    } else if (solNum.startsWith('N0') || solNum.startsWith('N4') || solNum.startsWith('N3') || solNum.startsWith('N6') || solNum.startsWith('M6')) {
      safeDept = 'DEPT OF THE NAVY';
    } else if (solNum.startsWith('W9') || solNum.startsWith('W5') || solNum.startsWith('W1')) {
      safeDept = 'DEPT OF THE ARMY';
    } else if (solNum.startsWith('SPR') || solNum.startsWith('SPM') || solNum.startsWith('SP4')) {
      safeDept = 'DEFENSE LOGISTICS AGENCY';
    } else if (solNum.startsWith('HC10')) {
      safeDept = 'DEFENSE INFORMATION SYSTEMS AGENCY';
    } else if (solNum.startsWith('36C')) {
      safeDept = 'DEPARTMENT OF VETERANS AFFAIRS';
    } else if (solNum.startsWith('70')) {
      safeDept = 'DEPARTMENT OF HOMELAND SECURITY';
    } else if (solNum.startsWith('47') || solNum.startsWith('GS')) {
      safeDept = 'GENERAL SERVICES ADMINISTRATION';
    } else if (solNum.startsWith('80') || solNum.startsWith('NN')) {
      safeDept = 'NATIONAL AERONAUTICS AND SPACE ADMINISTRATION';
    } else if (solNum.startsWith('68')) {
      safeDept = 'ENVIRONMENTAL PROTECTION AGENCY';
    } else if (solNum.startsWith('89')) {
      safeDept = 'DEPARTMENT OF ENERGY';
    } else if (solNum.startsWith('75')) {
      safeDept = 'DEPARTMENT OF HEALTH AND HUMAN SERVICES';
    } else if (solNum.startsWith('12')) {
      safeDept = 'DEPARTMENT OF AGRICULTURE';
    } else if (solNum.startsWith('69')) {
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
        id: a.id || `att-${opp?.noticeId || 'live'}-${idx + 1}`,
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
          id: `att-${opp?.noticeId || 'live'}-1`,
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
    noticeId: opp?.noticeId,
    solicitationNumber: opp?.solicitationNumber,
    title: opp?.title,
    sourceLink: opp?.sourceLink
  });

  return {
    noticeId: String(opp?.noticeId || `SAM-${Math.random().toString(36).substring(2, 9)}`),
    solicitationNumber: String(opp?.solicitationNumber || opp?.noticeId || 'SOL-UNSPECIFIED'),
    title: String(opp?.title || 'Untitled Federal Opportunity'),
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
  const [activeTab, setActiveTab] = useState<'canvass' | 'strategy' | 'profile' | 'pipeline' | 'insights'>('canvass');

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

  const handleSyncSamFeed = async (overrideEnv?: 'alpha' | 'production') => {
    setIsSyncing(true);
    const envToUse = overrideEnv || activeEnv;
    try {
      const res = await fetch('/api/sam/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetEnv: envToUse,
          naicsCode: filters.naicsFilter || undefined,
          setAside: filters.setAsideFilter !== 'All Set-Asides' ? filters.setAsideFilter : undefined,
          state: filters.stateFilter || undefined,
          noticeType: filters.noticeTypeFilter || undefined,
          agency: filters.agencyFilter || undefined,
          searchQuery: filters.searchQuery || undefined,
          status: filters.statusFilter !== 'all' ? filters.statusFilter : undefined,
          limit: 100,
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

        if (isLive) {
          const directCount = data.validation?.directNoticeCount ?? count;
          setSyncToast({
            message: `Successfully synchronized ${count} live federal solicitations from ${envLabel} API (${directCount} direct notice links verified).`,
            type: 'success',
          });
        } else {
          setSyncToast({
            message: `Synchronized ${count} federal solicitations from active SBA curated repository (${total.toLocaleString()} total records).`,
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

        // State filter (place of performance)
        if (filters.stateFilter && (opp.placeOfPerformance?.state || '').toUpperCase() !== filters.stateFilter.toUpperCase()) {
          return false;
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
        aiConfigStatus={aiConfigStatus}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        {/* VIEW 1: Canvass SAM.gov */}
        {activeTab === 'canvass' && (
          <div className="space-y-6">
            {/* Top Intro Bar */}
            <div className="bg-gradient-to-r from-slate-900 to-blue-950 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="bg-blue-600 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                    SAM.GOV ACTIVE SOLICITATIONS
                  </span>
                  
                  {/* Environment Switcher Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const nextEnv = activeEnv === 'alpha' ? 'production' : 'alpha';
                      setActiveEnv(nextEnv);
                      handleSyncSamFeed(nextEnv);
                    }}
                    className={`text-[10px] font-mono px-2.5 py-0.5 rounded font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                      activeEnv === 'alpha'
                        ? 'bg-amber-950/80 text-amber-300 border-amber-600/80 hover:bg-amber-900'
                        : 'bg-emerald-950/80 text-emerald-300 border-emerald-600/80 hover:bg-emerald-900'
                    }`}
                    title="Toggle between Alpha Test API (api-alpha.sam.gov) and Production (api.sam.gov)"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${activeEnv === 'alpha' ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                    <span>ENV: {activeEnv === 'alpha' ? '🧪 Alpha Test API' : '🟢 Production API'}</span>
                    <span className="text-slate-400 text-[9px] font-normal hover:text-white">⇄ Switch</span>
                  </button>

                  {totalSamDatabaseRecords > 0 && (
                    <span className="bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-0.5 rounded font-mono text-[10px] flex items-center gap-1.5">
                      <span>SAM.gov Database:</span>
                      <strong className="text-white font-bold">{totalSamDatabaseRecords.toLocaleString()} Total Records</strong>
                      <span className="text-slate-400 hidden sm:inline">({databaseStats.active} Active • {databaseStats.inactive} Inactive • {databaseStats.awarded} Awarded)</span>
                    </span>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                  Federal Contract Opportunity Canvassing
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
                  Active federal opportunities synced per GSA Open Technology v2 specifications. Filter by primary NAICS <strong className="text-white font-mono">{currentProfile.primaryNaics}</strong>, SBA set-asides, and performance locations.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
                {/* Export Solicitations Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                    title={`Export ${filteredOpportunities.length} filtered opportunities for offline record-keeping`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export ({filteredOpportunities.length})</span>
                    <span className="text-[10px] opacity-80">▾</span>
                  </button>

                  {exportDropdownOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-left text-xs"
                      onMouseLeave={() => setExportDropdownOpen(false)}
                    >
                      <div className="px-2.5 py-1.5 border-b border-slate-800 flex items-center justify-between text-[11px] font-semibold text-slate-400">
                        <span>Offline Record-Keeping</span>
                        <span className="font-mono text-emerald-400">{filteredOpportunities.length} notices</span>
                      </div>
                      <div className="py-1 space-y-1">
                        <button
                          type="button"
                          onClick={handleExportCsv}
                          className="w-full text-left px-2.5 py-2 rounded-lg text-slate-200 hover:bg-slate-800 hover:text-white flex items-center gap-2.5 transition cursor-pointer"
                        >
                          <div className="p-1.5 rounded bg-emerald-500/20 text-emerald-400 shrink-0">
                            <FileSpreadsheet className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-white">Spreadsheet (CSV)</p>
                            <p className="text-[10px] text-slate-400">Excel / Google Sheets compatible</p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={handleExportJson}
                          className="w-full text-left px-2.5 py-2 rounded-lg text-slate-200 hover:bg-slate-800 hover:text-white flex items-center gap-2.5 transition cursor-pointer"
                        >
                          <div className="p-1.5 rounded bg-blue-500/20 text-blue-400 shrink-0">
                            <FileCode className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-white">Full Structured Data (JSON)</p>
                            <p className="text-[10px] text-slate-400">Complete solicitation & agency metadata</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setIsAiConfigOpen(true)}
                  className="px-3.5 py-2 bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 border border-indigo-500/60 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                  title="Configure Google Gemini API keys or Home VM Ollama model"
                >
                  <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                  <span>AI Agent & VM</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${aiConfigStatus?.hasKey ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                </button>

                <button
                  onClick={() => handleSyncSamFeed()}
                  disabled={isSyncing}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-60 shadow-xs"
                  title="Query latest opportunities from backend SAM.gov proxy"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Syncing SAM...' : `Sync ${activeEnv === 'alpha' ? 'Alpha API' : 'SAM.gov'}`}</span>
                </button>

                <button
                  onClick={() => setActiveTab('profile')}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Building2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>SBA Profile</span>
                </button>
              </div>
            </div>

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
                      title="Inspect quality and direct link audit for current sync return"
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

            {/* Filter Bar Component */}
            <FilterBar
              filters={filters}
              setFilters={setFilters}
              totalMatches={filteredOpportunities.length}
              displayedCount={displayedOpportunities.length}
              currentPage={browseMode === 'paged' ? currentPage : undefined}
              totalPages={browseMode === 'paged' ? Math.ceil(filteredOpportunities.length / pageSize) || 1 : undefined}
              totalSamDatabaseRecords={totalSamDatabaseRecords}
              onReset={() => setFilters(DEFAULT_FILTERS)}
              primaryNaics={currentProfile.primaryNaics}
              viewMode={viewMode}
              setViewMode={setViewMode}
            />

            {/* Informative Explanation of Active vs Inactive vs Awarded Database Records */}
            <div className="bg-gradient-to-r from-blue-50/90 to-indigo-50/90 border border-blue-200/90 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-xs">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-600 text-white rounded-lg shrink-0 mt-0.5 md:mt-0">
                  <Info className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm flex flex-wrap items-center gap-2">
                    <span>SAM.gov Database Ledger: {databaseStats.total} Total Records</span>
                    <span className="text-[11px] font-normal text-slate-500 font-sans">
                      (All active, inactive, and awarded opportunities)
                    </span>
                  </div>
                  <p className="text-slate-600 mt-1 leading-relaxed">
                    The database contains <strong className="text-slate-900 font-mono font-bold">{databaseStats.total}</strong> authentic federal opportunities across all departments: 
                    <strong className="text-emerald-700 font-semibold font-mono"> {databaseStats.active} Active Solicitations</strong> currently open for bidding, 
                    <strong className="text-slate-700 font-semibold font-mono"> {databaseStats.inactive} Inactive / Closed notices</strong> whose deadlines passed, and 
                    <strong className="text-amber-800 font-semibold font-mono"> {databaseStats.awarded} Historical Awarded contracts</strong>.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-slate-600 font-medium">
                    <span>Intuitive Scrolling & Browsing:</span>
                    <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-700 font-semibold">
                      📄 Page Navigation ({pageSize} per page)
                    </span>
                    <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-700 font-semibold">
                      📜 Continuous Infinite Scroll
                    </span>
                    <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-700 font-semibold">
                      ⚡ Quick Status Filters
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0 self-start md:self-center">
                <button
                  type="button"
                  onClick={() => setFilters((prev) => ({ ...prev, statusFilter: 'active' }))}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition cursor-pointer flex items-center gap-1.5 ${
                    filters.statusFilter === 'active'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                      : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Active Only ({databaseStats.active})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFilters((prev) => ({ ...prev, statusFilter: 'all' }))}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition cursor-pointer flex items-center gap-1.5 ${
                    filters.statusFilter === 'all'
                      ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                      : 'bg-white text-blue-800 border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <span>Show All ({databaseStats.total})</span>
                </button>
              </div>
            </div>

            {/* Opportunity Browsing Controls (Status Filter Tabs, Paging, Infinite Scroll Toggle, and Offline Export) */}
            <OpportunityBrowsingControls
              totalCount={databaseStats.total}
              activeCount={databaseStats.active}
              inactiveCount={databaseStats.inactive}
              awardedCount={databaseStats.awarded}
              filteredCount={filteredOpportunities.length}
              currentStatusFilter={filters.statusFilter || 'all'}
              onStatusFilterChange={(st) => setFilters((prev) => ({ ...prev, statusFilter: st }))}
              browseMode={browseMode}
              onBrowseModeChange={setBrowseMode}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              infiniteVisibleCount={infiniteVisibleCount}
              onLoadMore={handleLoadMore}
              onLoadAll={handleLoadAll}
              onExportCsv={handleExportCsv}
              onExportJson={handleExportJson}
            />

            {/* Opportunities Display (Table Ledger with Federal Org column or Card Grid) */}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
                >
                  Reset All Filters
                </button>
              </div>
            )}

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
