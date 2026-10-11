import { OpportunityCustomLaborItem, LaborCategoryBenchmark } from '../data/federalLaborCategories.ts';
export type { OpportunityCustomLaborItem, LaborCategoryBenchmark };

export type OpportunityStatus = 'active' | 'inactive' | 'awarded';

export interface AwardeeInfo {
  vendorName: string;
  awardAmount: string;
  awardDate: string;
  contractNumber: string;
}

export type SetAsideType =
  | 'Total Small Business'
  | '8(a) Sole Source & Competitive'
  | 'Service-Disabled Veteran-Owned (SDVOSB)'
  | 'Women-Owned Small Business (WOSB/EDWOSB)'
  | 'HUBZone Small Business'
  | 'Veteran-Owned Small Business (VOSB)'
  | 'Indian Small Business Economic Enterprise (ISBEE)'
  | 'Small Disadvantaged Business (SDB)'
  | 'Full and Open / Unrestricted';

export type NoticeType =
  | 'Solicitation'
  | 'Presolicitation'
  | 'Sources Sought'
  | 'Combined Synopsis/Solicitation'
  | 'Special Notice';

export interface PlaceOfPerformance {
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface FarClause {
  clause: string;
  title: string;
  explanation: string;
  mandatory: boolean;
}

export interface OpportunityAttachment {
  id: string;
  name: string;
  type: string;
  size: string;
  description: string;
  downloadUrl?: string;
  isPublic?: boolean; // true = directly downloadable; false = access request required on SAM.gov
  accessLevel?: 'Public / Unrestricted' | 'Controlled / Access Request Required' | 'CUI / ITAR (Explicit CAGE Approval Required)';
  accessInstructions?: string;
}

export interface PointOfContact {
  name: string;
  title: string;
  email: string;
  phone: string;
}

export interface SAMOpportunity {
  noticeId: string;
  solicitationNumber: string;
  title: string;
  department: string; // Department / Independent Agency
  subTier: string; // Sub-Tier Agency
  majorCommand?: string; // Major Command (MAJCOM / Bureau / Buying Activity)
  subCommand?: string; // Sub Command (Sub-command / Center / Directorate)
  office: string; // Contracting Office
  hierarchyPath?: string[]; // Complete hierarchical chain
  postedDate: string; // YYYY-MM-DD
  responseDeadLine: string; // YYYY-MM-DDTHH:MM:SS
  performanceStartDate: string; // YYYY-MM-DD
  performanceEndDate: string; // YYYY-MM-DD
  naicsCode: string;
  naicsTitle: string;
  pscCode: string;
  pscTitle: string;
  setAside: SetAsideType;
  setAsideCode: string;
  type: NoticeType;
  placeOfPerformance: PlaceOfPerformance;
  contractingOfficeAddress: {
    city: string;
    state: string;
    zip: string;
  };
  estimatedValue: string;
  valueMagnitude: number; // For sorting
  contractType: 'Firm Fixed Price (FFP)' | 'Time & Materials (T&M)' | 'Cost Plus Fixed Fee (CPFF)' | 'IDIQ / BPA Task Order' | 'Commercial Solutions Opening (CSO) / Firm Fixed Price';
  description: string; // Statement of Work / Summary of Requirements
  requirementsSummary?: string; // Distilled requirement summary for win strategy & proposal generation
  scopeBullets: string[];
  keyFarClauses: FarClause[];
  attachments: OpportunityAttachment[];
  hasControlledAttachments?: boolean;
  attachmentsAccessStatus?: 'All Public' | 'Access Request Required' | 'Mixed / Some Restricted' | 'No Attachments Posted';
  poc: PointOfContact;
  incumbentInfo?: {
    hasIncumbent: boolean;
    incumbentName?: string;
    contractNumber?: string;
    estimatedOriginalValue?: string;
  };
  requiredClearance: 'None' | 'Public Trust' | 'Secret' | 'Top Secret' | 'TS/SCI' | 'Secret / IT-II';
  sourceLink: string;
  status?: OpportunityStatus;
  awardeeInfo?: AwardeeInfo;
  customLaborItems?: OpportunityCustomLaborItem[];
  isLiveVerified?: boolean;
  verifiedLiveSite?: boolean;
}

export interface BusinessProfile {
  id: string;
  companyName: string;
  uei: string;
  cageCode: string;
  primaryNaics: string;
  primaryNaicsTitle: string;
  secondaryNaics: { code: string; title: string }[];
  certifications: string[]; // e.g., '8(a)', 'SDVOSB', 'WOSB', 'HUBZone', 'SDB'
  state: string;
  targetStates: string[];
  bondingCapacitySingle: number;
  bondingCapacityAggregate: number;
  securityClearance: 'None' | 'Public Trust' | 'Secret' | 'Top Secret' | 'TS/SCI';
  coreCapabilities: string[];
  pastPerformanceSummary: string;
  yearsInBusiness: number;
  staffCount: number;
  annualRevenue: string;
  website?: string;
  contactEmail: string;
  contactPhone: string;
}

export interface FitScore {
  overallScore: number; // 0 - 100
  naicsMatch: boolean;
  setAsideMatch: boolean;
  locationMatch: boolean;
  clearanceMatch: boolean;
  capabilityOverlapCount: number;
  matchHighlights: string[];
  riskWarnings: string[];
}

export interface LaborCategorySuggestion {
  role: string;
  rateRange: string;
  clearance: string;
}

export interface SectionLCompliance {
  section: string;
  requirements: string;
  strategy: string;
}

export interface SectionMEvaluation {
  factor: string;
  weight: string;
  scoringTactic: string;
}

export interface RiskItem {
  risk: string;
  impact: 'High' | 'Medium' | 'Low';
  mitigation: string;
}

export interface TimelinePhase {
  phase: string;
  daysBeforeDue: number;
  deliverables: string[];
}

export interface BidStrategy {
  pWinScore: number;
  recommendation: 'BID - PRIME' | 'BID - TEAM / JV' | 'BID - SUBCONTRACTOR' | 'NO-BID / MONITOR';
  recommendationRationale: string;
  executiveSummary: string;
  winThemes: string[];
  discriminators: string[];
  sectionLComplianceOutline: SectionLCompliance[];
  sectionMEvaluationStrategy: SectionMEvaluation[];
  teamingStrategy: {
    recommendedRole: string;
    far52_219_14_Compliance: string;
    recommendedPartnerProfiles: string[];
    teamingActionPlan: string;
  };
  priceToWinStrategy: {
    recommendedPricingModel: string;
    laborCategorySuggestions: LaborCategorySuggestion[];
    marginRecommendation: string;
    costDrivers: string[];
  };
  riskMatrix: RiskItem[];
  timelinePlan: TimelinePhase[];
}

export interface SowExecutionPathwayPhase {
  phase: string;
  timelineDays: string;
  steps: string[];
  deliverables: string[];
}

export interface SowRequirementSolution {
  id: string;
  requirementTitle: string;
  sourceExcerpt: string;
  solutionSummary: string;
  executionPathways: SowExecutionPathwayPhase[];
  standardsCompliance: string[];
  riskAndMitigation: {
    risk: string;
    mitigation: string;
  };
  proposalSnippet: string;
}

export interface ResourceAllocationItem {
  role: string;
  count: number;
  clearance: string;
  qualifications: string[];
  keyResponsibilities: string[];
  billableRateEstimate: string;
}

export interface ToolingAndTechStack {
  category: string;
  tools: string[];
  purpose: string;
}

export interface PartnerTeamingNeed {
  capabilityArea: string;
  partnerType: string;
  far52_219_14_Impact: string;
  recommendation: string;
}

export interface SowResourceStrategy {
  overview: string;
  technicalApproachSummary: string;
  sowRequirements: SowRequirementSolution[];
  resourceAllocation: ResourceAllocationItem[];
  toolingAndTechStack: ToolingAndTechStack[];
  partnerTeamingNeeds: PartnerTeamingNeed[];
  keySuccessMetrics: {
    metric: string;
    target: string;
    trackingMethod: string;
  }[];
  proposalVolumeDraft: {
    sectionTitle: string;
    fullText: string;
  };
  attachmentGrounding?: {
    totalAttachmentsAnalyzed: number;
    attachmentsList: {
      name: string;
      type: string;
      category: 'PWS/SOW' | 'Section L' | 'Section M' | 'CDRL' | 'Pricing/CLIN' | 'Wage Determination' | 'Solicitation';
      size?: string;
    }[];
    extractedDeliverablesCount?: number;
    cdrlSchedule?: {
      cdrlNumber: string;
      title: string;
      frequency: string;
      format: string;
    }[];
    sectionLVolumes?: {
      volume: string;
      title: string;
      pageLimit: string;
      focus: string;
    }[];
    sectionMEvaluationFactors?: {
      factor: string;
      importance: string;
      description: string;
    }[];
    clinPricingSummary?: {
      clin: string;
      laborCategory: string;
      hours: number;
      rate: string;
      total: string;
    }[];
  };
  customLaborCategories?: OpportunityCustomLaborItem[];
  generatedAt?: string;
  sourceTag?: string;
}

export type ProposalArtifactStatus = 'Not Started' | 'Draft Ready' | 'Under Review' | 'Approved & Signed';

export type ProposalArtifactType = 
  | 'Compliance Matrix' 
  | 'Proposal Volume' 
  | 'Legal & Teaming' 
  | 'Pricing & BOE' 
  | 'Staffing & Resumes' 
  | 'Executive Approval' 
  | 'Submission Package' 
  | 'Operational Checklist';

export interface ShipleyProposalArtifact {
  id: string;
  deliverableName: string;
  phase: string;
  daysBeforeDue: number;
  documentType: ProposalArtifactType;
  filename: string;
  title: string;
  summary: string;
  content: string;
  status: ProposalArtifactStatus;
  lastUpdated: string;
  wordCount: number;
}

export type PipelineStatus =
  | 'Identified'
  | 'Assessing (Bid/No-Bid)'
  | 'Strategy Developed'
  | 'Proposal In Progress'
  | 'Submitted'
  | 'Won'
  | 'Lost';

export interface PipelineItem {
  id: string;
  opportunity: SAMOpportunity;
  status: PipelineStatus;
  fitScore: number;
  pWinScore?: number;
  bidStrategy?: BidStrategy;
  sowStrategy?: SowResourceStrategy;
  proposalArtifacts?: ShipleyProposalArtifact[];
  notes: string;
  dateAdded: string;
  lastUpdated: string;
  targetSubmissionDate?: string;
}

export interface FilterState {
  searchQuery: string;
  naicsFilter: string;
  setAsideFilter: string;
  stateFilter: string;
  cityFilter?: string;
  noticeTypeFilter: string;
  agencyFilter: string;
  statusFilter?: 'all' | 'active' | 'inactive' | 'awarded';
  dueWithinDays: string;
  minVal: number;
  maxVal: number;
  minFitScore: number;
  verifiedOnly?: boolean;
  sortBy:
    | 'deadline_asc'
    | 'deadline_desc'
    | 'posted_desc'
    | 'posted_asc'
    | 'fit_desc'
    | 'fit_asc'
    | 'value_desc'
    | 'value_asc'
    | 'agency_asc'
    | 'agency_desc'
    | 'title_asc'
    | 'title_desc'
    | 'solnum_asc'
    | 'solnum_desc'
    | 'naics_asc'
    | 'naics_desc';
}
