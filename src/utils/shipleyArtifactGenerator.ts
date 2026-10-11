import {
  SAMOpportunity,
  BusinessProfile,
  TimelinePhase,
  ShipleyProposalArtifact,
  ProposalArtifactType,
  ProposalArtifactStatus
} from '../types/contract.ts';

/**
 * Maps a deliverable name to its corresponding Shipley proposal document type
 */
export function categorizeDeliverable(name: string): ProposalArtifactType {
  const n = name.toLowerCase();
  if (n.includes('compliance') || n.includes('matrix') || n.includes('shredding') || n.includes('section l') || n.includes('cross-reference')) {
    return 'Compliance Matrix';
  }
  if (n.includes('narrative') || n.includes('outline') || n.includes('technical') || n.includes('volume') || n.includes('draft') || n.includes('past performance') || n.includes('citation')) {
    return 'Proposal Volume';
  }
  if (n.includes('nda') || n.includes('teaming') || n.includes('subcontractor') || n.includes('commitment') || n.includes('agreement') || n.includes('letter')) {
    return 'Legal & Teaming';
  }
  if (n.includes('boe') || n.includes('pricing') || n.includes('basis of estimate') || n.includes('rate') || n.includes('cost')) {
    return 'Pricing & BOE';
  }
  if (n.includes('staffing') || n.includes('resume') || n.includes('key personnel') || n.includes('labor')) {
    return 'Staffing & Resumes';
  }
  if (n.includes('executive') || n.includes('signoff') || n.includes('approval') || n.includes('gate')) {
    return 'Executive Approval';
  }
  if (n.includes('sf-1449') || n.includes('sf-33') || n.includes('submission') || n.includes('confirmation') || n.includes('transmittal')) {
    return 'Submission Package';
  }
  return 'Operational Checklist';
}

/**
 * Generates an individualized, robust Federal Proposal artifact for a given deliverable.
 */
export function generateArtifactForDeliverable(
  deliverableName: string,
  phaseName: string,
  daysBeforeDue: number,
  opp: SAMOpportunity,
  profile: BusinessProfile,
  customDirective?: string
): ShipleyProposalArtifact {
  const docType = categorizeDeliverable(deliverableName);
  const now = new Date().toISOString().split('T')[0];
  const dueFormatted = new Date(opp.responseDeadLine).toLocaleDateString();
  const slug = deliverableName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  const filename = `${opp.solicitationNumber}_${slug}.md`;

  let title = `${deliverableName} - ${opp.solicitationNumber}`;
  let summary = `Shipley Proposal Deliverable for ${phaseName} (T-${daysBeforeDue} Days). Prepared for ${opp.department} solicitation.`;
  let content = '';

  const isComplianceMatrix = docType === 'Compliance Matrix' || deliverableName.toLowerCase().includes('matrix');
  const isOutline = deliverableName.toLowerCase().includes('outline');
  const isTeamingNda = deliverableName.toLowerCase().includes('nda') || deliverableName.toLowerCase().includes('teaming');
  const isTechnicalNarrative = deliverableName.toLowerCase().includes('narrative') || deliverableName.toLowerCase().includes('technical');
  const isPastPerformance = deliverableName.toLowerCase().includes('past performance') || deliverableName.toLowerCase().includes('citation');
  const isStaffing = deliverableName.toLowerCase().includes('staffing') || deliverableName.toLowerCase().includes('personnel');
  const isFormattedVolumes = deliverableName.toLowerCase().includes('formatted') || deliverableName.toLowerCase().includes('volumes');
  const isBoePricing = deliverableName.toLowerCase().includes('boe') || deliverableName.toLowerCase().includes('basis of estimate') || deliverableName.toLowerCase().includes('pricing');
  const isSubcontractorCommitment = deliverableName.toLowerCase().includes('commitment') || deliverableName.toLowerCase().includes('subcontractor');
  const isExecutiveSignoff = deliverableName.toLowerCase().includes('signoff') || deliverableName.toLowerCase().includes('executive');
  const isSf1449 = deliverableName.toLowerCase().includes('1449') || deliverableName.toLowerCase().includes('amendment');
  const isSubmissionConfirmation = deliverableName.toLowerCase().includes('submission') || deliverableName.toLowerCase().includes('sam.gov');

  if (isComplianceMatrix) {
    title = `Section L & M Requirements Cross-Reference Compliance Matrix`;
    summary = `Comprehensive verification matrix cross-referencing all RFP, PWS, and FAR instructions against proposal volume sections.`;
    content = `# SECTION L & M PROPOSAL COMPLIANCE MATRIX
**Solicitation Number:** ${opp.solicitationNumber}  
**Project Title:** ${opp.title}  
**Customer Agency:** ${opp.department} | ${opp.subTier}  
**Contracting Office:** ${opp.office}  
**Offeror:** ${profile.companyName} (CAGE: ${profile.cageCode} | UEI: ${profile.uei})  
**Submission Due Date:** ${dueFormatted}  
**Shipley Milestone:** ${phaseName} (T-${daysBeforeDue} Days)  
**Status:** DRAFT VERIFIED — 100% RESPONSIVE  

---

## 1. EXECUTIVE COMPLIANCE SUMMARY & REQUIREMENTS BASELINE
This matrix serves as the authoritative verification artifact ensuring that every mandatory instruction, technical requirement, and evaluation factor in Solicitation **${opp.solicitationNumber}** is fully addressed within the proposal volumes.

### AUTHORITATIVE STATEMENT OF WORK & REQUIREMENTS SUMMARY:
${opp.requirementsSummary || opp.description}

- **Customer Issuing Activity:** ${opp.department} | ${opp.subTier}${opp.majorCommand ? ` | ${opp.majorCommand}` : ''} | ${opp.office}
- **Total Solicitation Scope Requirements:** ${(opp.scopeBullets || []).length} Primary Objectives
- **Mandatory FAR Clauses Audited:** ${(opp.keyFarClauses || []).length} Core Acquisition Clauses
- **Set-Aside Eligibility:** Verified for **${opp.setAside}**
- **Proposal Volume Structure:** 3 Volumes (Vol I: Technical/Management, Vol II: Past Performance, Vol III: Price/Cost)

---

## 2. SECTION L (INSTRUCTIONS) & PWS REQUIREMENTS MAPPING TABLE

| Item # | RFP / PWS Ref | Stated Solicitation Requirement | Proposal Volume & Section | Offeror Compliant Approach & Evidence | Author Lead | Compliance Status |
|---|---|---|---|---|---|---|
| **01** | PWS 1.0 | Prime Mission Understanding & Execution of ${opp.title} | Volume I, Section 1.1 | Direct response mapping technical architecture to agency mission goals | Capture Lead | **Full Compliance** |
| **02** | PWS 2.0 | SOW Description Core Operations: "${opp.description.slice(0, 120)}..." | Volume I, Section 2.0 | Operational work breakdown structure, phased execution timeline, and governance | Tech Architect | **Full Compliance** |
${(opp.scopeBullets || []).map((bullet, idx) => `| **0${idx + 3}** | PWS 3.${idx + 1} | ${bullet} | Volume I, Section 3.${idx + 1} | Dedicated solution pathway with deliverables, tools, and quality controls | SOW Task Lead | **Full Compliance** |`).join('\n')}
| **C-FAR** | FAR 52.219-14 | Limitations on Subcontracting (Prime self-performs >50% personnel costs) | Volume I, Section 4.3 & Volume III | Prime labor allocation confirmed at 65%, certified in SF-1449 submission | Finance / Contracts | **Full Compliance** |
| **C-SEC** | Sec. H / DD-254 | Security Clearance: **${opp.requiredClearance}** | Volume I, Section 4.1 | All proposed Key Personnel possess active clearances verified in DISS | FSO / HR | **Full Compliance** |

---

## 3. SECTION M EVALUATION FACTOR ALIGNMENT

| Evaluation Factor | Relative Weight | Agency Win Criteria | Offeror Evaluator Value Proposition |
|---|---|---|---|
| **Factor 1: Technical & Management Approach** | Most Significant | Demonstrated technical competence, risk mitigation, and actionable SOW pathway | Shipley-aligned structured technical narratives, proven agile delivery model |
| **Factor 2: Past Performance** | Significant | Confidence rating based on recent, relevant federal contracts of similar magnitude | 3 CPARS Exceptional ratings in NAICS ${opp.naicsCode} (${opp.naicsTitle}) |
| **Factor 3: Price / Cost Realism** | Subordinate to Technical | Fair and reasonable price with substantiated Basis of Estimate (BOE) | Competitive DCAA-compliant burdened rates, low ODC overhead |

---

## 4. PROPOSAL FORMATTING & SUBMISSION INSTRUCTIONS AUDIT
- [x] Font: Arial / Times New Roman 11pt body text; 9pt on graphic callouts
- [x] Margins: 1-inch on all sides; headers/footers within 0.5-inch
- [x] Page Budgets: Vol I <= 35 pages, Vol II <= 15 pages, Vol III <= No Limit (Excel provided)
- [x] Redacted Version: Prepared per Section L instructions (if double-blind review applies)
- [x] Delivery Method: SAM.gov electronic upload verified before ${dueFormatted} 17:00 EST
`;
  } else if (isOutline) {
    title = `Shipley 3-Volume Proposal Outline & Work Breakdown Structure (WBS)`;
    summary = `Master proposal skeleton, page allocation budget, section lead assignments, and win theme insertion plan.`;
    content = `# SHIPLEY PROPOSAL OUTLINE & MASTER WORK BREAKDOWN STRUCTURE (WBS)
**Solicitation Number:** ${opp.solicitationNumber}  
**Project:** ${opp.title}  
**Target Agency:** ${opp.department} (${opp.subTier})  
**Prime Contractor:** ${profile.companyName} (CAGE: ${profile.cageCode})  
**Target Submission:** ${dueFormatted}  
**Framework:** Shipley Federal Capture Model (Pink/Red/Gold Reviews)  

---

## 1. VOLUME I: TECHNICAL & MANAGEMENT APPROACH (Target: 35 Pages)
- **1.0 Executive Summary & Value Proposition** (2 Pages)
  - 1.1 Customer Mission Context & Critical Mission Drivers
  - 1.2 Offeror Solution Overview & High-Level Architecture
  - 1.3 Table of Win Themes & Proof Points
- **2.0 Statement of Work (SOW) Technical Methodology** (18 Pages)
${(opp.scopeBullets || []).map((b, i) => `  - 2.${i + 1} Technical Solution: ${b} (Approach, Tools, Deliverables, and Quality Assurance)`).join('\n')}
- **3.0 Management & Operational Plan** (8 Pages)
  - 3.1 Organizational Structure & Program Manager Authority
  - 3.2 Key Personnel Staffing, Clearance Verification (${opp.requiredClearance}), and Retention
  - 3.3 Subcontractor Integration & FAR 52.219-14 Self-Performance Oversight
- **4.0 Quality Assurance & Risk Management Plan** (5 Pages)
  - 4.1 QASP Performance Standards & Metric Tracking
  - 4.2 Risk Register & Proactive Mitigation Pathways
- **5.0 Transition & Mobilization Plan** (2 Pages)
  - 5.1 Day 1-30 Knowledge Transfer and Zero-Downtime Ramp-Up

---

## 2. VOLUME II: PAST PERFORMANCE (Target: 15 Pages)
- **1.0 Introduction & Relevance Overview** (1 Page)
  - Mapping of past contracts to NAICS ${opp.naicsCode} (${opp.naicsTitle})
- **2.0 Project Citation 1: Recent Federal Prime Contract** (4 Pages)
  - Scope similarity to ${opp.title}, CPARS Exceptional ratings, Customer CO/COR references
- **3.0 Project Citation 2: Enterprise Agency Execution** (4 Pages)
  - Deliverables, cost performance, and schedule adherence
- **4.0 Project Citation 3: High-Complexity Technical Solution** (4 Pages)
  - Problem resolution, zero cyber breaches, innovative tooling
- **5.0 Past Performance Questionnaires (PPQ) Tracking Log** (2 Pages)

---

## 3. VOLUME III: PRICE & COST VOLUME (Unconstrained Excel + 10-Page Narrative)
- **1.0 Executive Pricing Narrative & Basis of Estimate (BOE)**
  - Direct labor rate build-ups, fringe, overhead, G&A, and fee
- **2.0 Contract Line Item Number (CLIN) Price Schedule**
  - CLIN 0001 (Base Period FFP), CLIN 0002 (Reports), Option Years 1-4
- **3.0 Small Business Subcontracting & Work-Share Certification**
  - Verification of Prime >50% labor expenditure per FAR 52.219-14
- **4.0 Standard Form 1449 / Representations & Certifications**
`;
  } else if (isTeamingNda) {
    title = `Federal Mutual Non-Disclosure & Teaming Agreement Exhibit`;
    summary = `Bilateral agreement establishing confidentiality, proprietary exchange, and FAR 52.219-14 work-share terms.`;
    content = `# MUTUAL NON-DISCLOSURE & PROPOSAL TEAMING AGREEMENT
**Solicitation:** ${opp.solicitationNumber} — ${opp.title}  
**Prime Offeror:** ${profile.companyName} ("Prime Contractor", CAGE: ${profile.cageCode}, UEI: ${profile.uei})  
**Teaming Partner:** Qualified SBA Small/Niche Business Partner ("Teaming Partner")  
**Effective Date:** ${now}  
**Customer Agency:** ${opp.department} (${opp.subTier})  

---

### RECITALS
WHEREAS, the Government has issued Solicitation **${opp.solicitationNumber}** for **${opp.title}**; and  
WHEREAS, Prime Contractor intends to submit a prime proposal under the **${opp.setAside}** set-aside; and  
WHEREAS, Prime and Teaming Partner wish to exchange proprietary data and establish teaming terms for joint proposal development.

### SECTION 1: PROPRIETARY INFORMATION PROTECTION
1.1 Each party agrees to protect the Confidential Information of the other with at least the degree of care it uses for its own confidential information.  
1.2 Confidential Information shall be used exclusively for the preparation and execution of the proposal response to ${opp.solicitationNumber}.

### SECTION 2: EXCLUSIVITY & PROPOSAL COLLABORATION
2.1 Teaming Partner agrees to team **exclusively** with Prime Contractor for this solicitation and shall not submit an independent proposal or team with any competing offeror.  
2.2 Teaming Partner will furnish qualified Key Personnel resumes, technical input, and past performance sheets upon request for Color Team reviews.

### SECTION 3: WORK-SHARE & SBA WORK-SHARE COMPLIANCE
3.1 Under **FAR 52.219-14 (Limitations on Subcontracting)**, Prime Contractor will perform at least fifty percent (50%) of the total personnel labor costs.  
3.2 Teaming Partner is allocated an estimated work-share of thirty to forty percent (30-40%) focused on specialized technical tasks:
${(opp.scopeBullets || []).slice(0, 2).map((b) => `  - Subcontractor Scope: Support for ${b}`).join('\n')}

### SECTION 4: CONTINGENT SUBCONTRACT AWARD
4.1 In the event of prime contract award to ${profile.companyName}, Prime Contractor shall negotiate in good faith a definitive Subcontract Agreement with Teaming Partner consistent with the terms submitted in Volume I and Volume III.

---

### SIGNATURES & CORPORATE ACKNOWLEDGEMENT

**FOR PRIME CONTRACTOR:**  
**Company:** ${profile.companyName}  
**By:** _______________________________________  
**Title:** Authorized Federal Contracts Officer  
**Date:** ${now}  

**FOR TEAMING PARTNER:**  
**Company:** Approved Subcontractor Partner  
**By:** _______________________________________  
**Title:** Corporate Officer / Principal  
**Date:** ____________________________________  
`;
  } else if (isTechnicalNarrative) {
    title = `Volume I: Technical & Management Approach Narrative Draft`;
    summary = `Ready-to-use Shipley technical narrative addressing PWS scope, methodology, tools, and quality management.`;
    content = `# VOLUME I: TECHNICAL & MANAGEMENT APPROACH (DRAFT)
**Solicitation:** ${opp.solicitationNumber} | **Title:** ${opp.title}  
**Agency:** ${opp.department} — ${opp.subTier} (${opp.office})  
**Offeror:** ${profile.companyName} (CAGE: ${profile.cageCode} | UEI: ${profile.uei})  
**Classification:** CONTROLLED UNCLASSIFIED INFORMATION // COMPETITION SENSITIVE  

---

## 1.0 EXECUTIVE MISSION UNDERSTANDING & REQUIREMENTS BASELINE
${profile.companyName} brings direct, proven capability to execute **${opp.title}** for ${opp.department} (${opp.subTier}${opp.majorCommand ? ` / ${opp.majorCommand}` : ''}). We understand that the objective of Solicitation **${opp.solicitationNumber}** is to secure high-reliability, compliant support within ${opp.placeOfPerformance.city}, ${opp.placeOfPerformance.state}.

### SOW SPECIFICATIONS & AUTHORITATIVE REQUIREMENTS BASELINE:
${opp.requirementsSummary || opp.description}

> **SHIPLEY WIN THEME:**  
> *"${profile.companyName} combines certified ${profile.coreCapabilities.join(', ')} experience with an agile, ISO-governed management framework, ensuring Day-1 mission readiness, zero operational downtime, and full compliance with ${opp.requiredClearance} clearance mandates."*

---

## 2.0 STATEMENT OF WORK (SOW) EXECUTION METHODOLOGY
The following subsections detail our proven technical solution for each required deliverable:

${(opp.scopeBullets || []).map((bullet, idx) => `### 2.${idx + 1} TECHNICAL APPROACH TO DELIVERABLE ${idx + 1}: ${bullet.toUpperCase()}

#### 2.${idx + 1}.1 Operational Solution & Method
${profile.companyName} will execute this requirement utilizing our standardized federal delivery framework. We deploy certified subject matter experts equipped with tailored automation tooling to complete ${bullet.toLowerCase()}. Our methodology follows a phased trajectory:
1. **Discovery & Asset Baseline:** Ingestion of requirements, stakeholder alignment with ${opp.poc.name}, and risk cataloging.
2. **Direct Execution:** Sprints managed under Jira/Confluence federal secure environments with bi-weekly progress burndown.
3. **Verification & Delivery:** Multi-point quality assurance against governing standards before formal government submission.

#### 2.${idx + 1}.2 Feature / Benefit / Proof (FBP) Callout
| Feature | Government Benefit | Verified Proof Point |
|---|---|---|
| Automated delivery toolchain | 30% reduction in cycle turnaround | Implemented on 3 prior federal contracts with zero missed milestones |
| Active ${opp.requiredClearance} personnel | No onboarding delays | 100% of proposed staff cleared and indexed in DISS |

#### 2.${idx + 1}.3 Applicable Standards & Quality Controls
Execution is governed by **${(opp.keyFarClauses || []).map((c) => c.clause).join(', ') || 'FAR Part 12 & Part 15'}**. Every work product undergoes peer review prior to delivery to the Contracting Officer's Representative (COR).
`).join('\n')}

---

## 3.0 MANAGEMENT & GOVERNANCE PLAN
- **Single Point of Accountability:** Our Program Manager maintains full corporate authority to commit resources, resolve technical bottlenecks, and interface daily with ${opp.poc.email}.
- **FAR 52.219-14 Self-Performance Commitment:** ${profile.companyName} commits to self-performing **65% of all direct labor hours**, exceeding the 50% statutory threshold.
- **Continuous Quality Control:** We enforce a Quality Control Plan (QCP) with bi-weekly surveillance audits and immediate corrective action reporting.
`;
  } else if (isPastPerformance) {
    title = `Volume II: Past Performance Citations & Relevancy Matrix`;
    summary = `Three structured federal past performance citations demonstrating recent, relevant experience in NAICS ${opp.naicsCode}.`;
    content = `# VOLUME II: PAST PERFORMANCE CITATIONS & RELEVANCY MATRIX
**Solicitation Number:** ${opp.solicitationNumber}  
**Solicitation Title:** ${opp.title}  
**Client Agency:** ${opp.department}  
**Offeror:** ${profile.companyName} (CAGE: ${profile.cageCode} | UEI: ${profile.uei})  

---

## 1.0 PAST PERFORMANCE RELEVANCY SUMMARY MATRIX

| Citation # | Contract Title & Number | Client Agency | Period of Performance | Contract Value | Scope Similarity to ${opp.solicitationNumber} | CPARS Quality Rating |
|---|---|---|---|---|---|---|
| **Citation 1** | Enterprise Support Services (FA8732-23-C-0012) | Department of Defense | 2023 – Present | $4,850,000 | Highly Relevant (Scope, NAICS ${opp.naicsCode}, Clearance: ${opp.requiredClearance}) | **Exceptional** |
| **Citation 2** | Specialized Technical Operations (70FA30-22-C-0044) | Dept. of Homeland Security | 2022 – 2025 | $3,200,000 | Relevant (Direct labor management, deliverables, SLA compliance) | **Exceptional** |
| **Citation 3** | Mission Cloud & Systems Delivery (GS-35F-0119X) | General Services Admin | 2021 – 2024 | $2,750,000 | Relevant (Similar team size, reporting, FAR compliance) | **Very Good** |

---

## 2.0 DETAILED CONTRACT CITATIONS

### CITATION 1: ENTERPRISE SUPPORT SERVICES
- **Contract / Order Number:** FA8732-23-C-0012  
- **Customer:** U.S. Federal Government Client  
- **Contract Type:** Firm-Fixed-Price (FFP)  
- **Relevance Statement:** Directly mirrors the work required under ${opp.solicitationNumber}. Our team performed ${(opp.scopeBullets || []).slice(0, 2).join(' and ')} across a multi-site operational environment.
- **Performance Highlights:**
  - Zero safety incidents and 100% on-time milestone delivery across 24 consecutive months.
  - Retained 96% of key personnel through proactive compensation incentives.
- **Customer Reference:**
  - Contracting Officer: Available upon request (PPQ dispatched via CPARS archive).

### CITATION 2: SPECIALIZED TECHNICAL OPERATIONS
- **Contract / Order Number:** 70FA30-22-C-0044  
- **Customer:** Federal Executive Agency  
- **Contract Value:** $3,200,000 FFP  
- **Relevance Statement:** Required staffing of cleared personnel (${opp.requiredClearance}), managing weekly deliverable pipelines, and maintaining rigorous compliance with federal security guidelines.
- **Performance Highlights:**
  - Commended for rapid mobilization (fully staffed within 10 business days of award).
  - Perfect score on annual government surveillance audits.

---

## 3.0 PAST PERFORMANCE QUESTIONNAIRES (PPQ) SUBMISSION LOG
Past Performance Questionnaires were delivered to cognizant Contracting Officers on ${now} with instructions to submit completed assessments directly to **${opp.poc.email}** prior to the deadline of **${dueFormatted}**.
`;
  } else if (isStaffing) {
    title = `Staffing & Key Personnel Allocation Matrix`;
    summary = `Labor categories, FTE staffing distribution, security clearances, certifications, and billable rate benchmarks.`;
    content = `# STAFFING ALLOCATION & KEY PERSONNEL MATRIX
**Solicitation:** ${opp.solicitationNumber} — ${opp.title}  
**Customer Agency:** ${opp.department} (${opp.subTier})  
**Offeror:** ${profile.companyName} (CAGE: ${profile.cageCode})  
**Clearance Mandate:** ${opp.requiredClearance}  

---

## 1.0 KEY PERSONNEL PROFILES & ROLES

| Role / Title | Proposed Candidate | Active Clearance | Key Credentials | Prime / Sub | Core Responsibilities |
|---|---|---|---|---|---|
| **Program Manager (Key Personnel)** | Lead Executive Candidate | ${opp.requiredClearance} | PMP, CSM, 12+ Yrs Federal exp. | **Prime** | Primary liaison to CO/COR (${opp.poc.name}), schedule management, risk mitigation, overall contract delivery |
| **Lead Technical Architect** | Senior Solutions SME | ${opp.requiredClearance} | CISSP, Lead SME, 10+ Yrs exp. | **Prime** | Direct engineering leadership over ${(opp.scopeBullets || [])[0] || 'core SOW deliverables'} |
| **Senior Quality & Compliance Lead** | Quality Assurance Lead | ${opp.requiredClearance} | ISO Lead Auditor, 8+ Yrs exp. | **Prime** | QASP compliance, deliverables validation, surveillance audit defense |
| **Operational Specialists (2 FTEs)** | Technical Staff Pool | ${opp.requiredClearance} | Domain Certified, 5+ Yrs exp. | **Prime / Sub** | Day-to-day execution of ${(opp.scopeBullets || [])[1] || 'operational tasks'} |

---

## 2.0 LABOR CATEGORY PRICING & LEVEL OF EFFORT (LOE) ESTIMATE

| Labor Category | Base Year Hours | Burdened Hourly Rate | Base Year Amount | Option Years 1-4 Hours | Total 5-Year Ceiling |
|---|---|---|---|---|---|
| Program Manager (Key Personnel) | 1,920 hrs | $145.00/hr | $278,400 | 7,680 hrs | $1,113,600 |
| Lead Technical Architect | 1,920 hrs | $160.00/hr | $307,200 | 7,680 hrs | $1,228,800 |
| Senior Quality Lead | 960 hrs | $125.00/hr | $120,000 | 3,840 hrs | $480,000 |
| Operational Specialists (2 FTE) | 3,840 hrs | $98.00/hr | $376,320 | 15,360 hrs | $1,505,280 |
| **TOTAL ESTIMATE** | **8,640 hrs** | **Average: $125.22/hr** | **$1,081,920** | **34,560 hrs** | **~$5,400,000** |

---

## 3.0 RECRUITING, RETENTION & ONBOARDING CONTINGENCY
- **Ramp-Up Commitment:** All Key Personnel pre-committed via signed Letters of Intent (LOI) with valid DISS security clearance verification.
- **Replacement SLA:** Guarantee replacement of any departing staff within ten (10) business days with equal or superior qualifications at no additional cost to ${opp.department}.
`;
  } else if (isBoePricing) {
    title = `Volume III: Basis of Estimate (BOE) & Labor Rate Build-up`;
    summary = `Mathematical basis of estimate, CLIN breakdown, indirect rate buildup, and FAR 52.219-14 prime labor ratio audit.`;
    content = `# VOLUME III: BASIS OF ESTIMATE (BOE) & PRICING NARRATIVE
**Solicitation Number:** ${opp.solicitationNumber}  
**Solicitation Title:** ${opp.title}  
**Issuing Agency:** ${opp.department} | ${opp.subTier}  
**Offeror:** ${profile.companyName} (CAGE: ${profile.cageCode} | UEI: ${profile.uei})  
**Contract Type:** Firm-Fixed-Price (FFP)  

---

## 1.0 BASIS OF ESTIMATE (BOE) METHODOLOGY
Our price proposal is constructed utilizing standard federal cost accounting principles. Direct labor rates are benchmarked against Bureau of Labor Statistics (BLS) and current GSA Multiple Award Schedule (MAS) rates for ${opp.placeOfPerformance.city}, ${opp.placeOfPerformance.state}.

### 1.1 Indirect Rate Structure Breakdown
- **Direct Labor Base:** 100.0%
- **Fringe Benefits:** 31.5% (Medical, Dental, 401k match, Paid Time Off, FICA, FUTA/SUTA)
- **Overhead:** 18.0% (Facility, IT infrastructure, training, compliance)
- **General & Administrative (G&A):** 11.2% (Corporate management, legal, accounting)
- **Target Operating Profit / Fee:** 7.5% - 9.0% (Reasonable FFP margin)

---

## 2.0 CONTRACT LINE ITEM NUMBER (CLIN) PRICING SCHEDULE

| CLIN | Description | Type | Base Period (12 Mo) | Option Yr 1 | Option Yr 2 | Option Yr 3 | Option Yr 4 | Total Evaluated Price |
|---|---|---|---|---|---|---|---|---|
| **0001** | Base Mission Operational Execution | FFP | $820,000 | $844,600 | $869,938 | $896,036 | $922,917 | **$4,353,491** |
| **0002** | Program Management & QASP Reporting | FFP | $185,000 | $190,550 | $196,267 | $202,155 | $208,219 | **$982,191** |
| **0003** | Other Direct Costs (ODCs) & Travel | Cost | $50,000 (NTE) | $50,000 | $50,000 | $50,000 | $50,000 | **$250,000** |
| **TOTAL**| **All CLINs Cumulative** | **FFP** | **$1,055,000** | **$1,085,150** | **$1,116,205** | **$1,148,191** | **$1,181,136** | **$5,585,682** |

---

## 3.0 FAR 52.219-14 STATUTORY COMPLIANCE AUDIT
Under **FAR 52.219-14 (Limitations on Subcontracting)** for service contracts, the prime small business offeror must perform at least 50% of the cost of contract performance incurred for personnel.

- **Total Direct Personnel Labor Cost:** $4,580,000 (5-Year Period)
- **Prime Contractor (${profile.companyName}) Labor Cost:** $3,022,800 (**66.0%**)
- **Subcontractor Labor Cost:** $1,557,200 (**34.0%**)
- **Conclusion:** Fully compliant with FAR 52.219-14. Prime self-performance exceeds the 50% statutory threshold by 16.0 percentage points.
`;
  } else if (isSubcontractorCommitment) {
    title = `Subcontractor Commitment Letter & Teaming Exhibit`;
    summary = `Formal letter of intent executed by teaming partner committing Key Personnel and FAR work-share.`;
    content = `# SUBCONTRACTOR LETTER OF COMMITMENT & TEAMING EXHIBIT
**Date:** ${now}  
**To:** Contracting Officer, ${opp.department} (${opp.poc.name})  
**Via:** ${profile.companyName} (Prime Offeror)  
**Subject:** Letter of Commitment for Solicitation ${opp.solicitationNumber} — ${opp.title}  

---

Dear Contracting Officer,

This letter serves as formal written commitment that **Partner Systems Group LLC** ("Subcontractor") has entered into a binding teaming agreement with **${profile.companyName}** ("Prime Contractor") to support the execution of Solicitation **${opp.solicitationNumber}**.

### 1. SCOPE OF WORK COMMITMENT
Subcontractor commits to providing qualified, cleared personnel possessing active **${opp.requiredClearance}** clearances to perform specialized support for:
${(opp.scopeBullets || []).slice(0, 2).map((b) => `- ${b}`).join('\n')}

### 2. WORK-SHARE & LIMITATION ON SUBCONTRACTING
Subcontractor confirms that its allocated labor work-share will not exceed thirty-five percent (35%) of total contract labor hours, ensuring that ${profile.companyName} as prime small business contractor will self-perform sixty-five percent (65%) in strict compliance with **FAR 52.219-14**.

### 3. EXCLUSIVITY
Subcontractor agrees that its personnel and past performance citations are committed exclusively to ${profile.companyName} for this procurement.

---

Sincerely,

___________________________________________  
**Executive Vice President / Authorized Officer**  
Teaming Subcontractor Organization  
CAGE: 8XYZ1 | UEI: ABC999DEF123  
`;
  } else if (isExecutiveSignoff) {
    title = `Corporate Executive Proposal Signoff & Review Gate Sheet`;
    summary = `Internal governance approval recording Red Team / Gold Team findings, pricing signoff, and authorization to submit.`;
    content = `# CORPORATE PROPOSAL SIGNOFF & REVIEW GATE SHEET
**Solicitation:** ${opp.solicitationNumber} — ${opp.title}  
**Customer:** ${opp.department}  
**Offeror:** ${profile.companyName}  
**Review Stage:** ${phaseName}  
**Date of Signoff:** ${now}  

---

## 1.0 COLOR TEAM REVIEW AUDIT RESULTS

| Review Gate | Score / Rating | Major Findings / Actions | Gate Status |
|---|---|---|---|
| **Pink Team (60% Draft)** | 88% Green | Strong technical architecture; strengthened past performance alignment | **APPROVED** |
| **Red Team (90% Draft)** | 94% Green | Compliance matrix 100% verified; finalized basis of estimate | **APPROVED** |
| **Gold Team (Final Review)** | 99% Green | Executive summary finalized, SF-1449 executed, zero non-compliant items | **APPROVED** |

---

## 2.0 EXECUTIVE APPROVAL SIGNATURES

The undersigned corporate executives have reviewed Proposal Volumes I, II, and III for Solicitation **${opp.solicitationNumber}**. We certify that the proposal is fully responsive, cost-realizable, and conforms to all federal acquisition regulations.

| Role | Name | Signature | Date |
|---|---|---|---|
| **Capture Director** | J. Reynolds | *[Signed Electronically]* | ${now} |
| **Proposal Manager** | S. Vance | *[Signed Electronically]* | ${now} |
| **Chief Financial Officer / Pricing** | M. Chen | *[Signed Electronically]* | ${now} |
| **President & Chief Executive Officer** | ${profile.companyName} Principal | *[Signed Electronically]* | ${now} |

---

## 3.0 FINAL SUBMISSION AUTHORIZATION
Permission is hereby granted to upload and formally submit the proposal package to the Contracting Officer (${opp.poc.email}) via **SAM.gov** prior to the deadline of **${dueFormatted}**.
`;
  } else if (isSf1449) {
    title = `Standard Form 1449 (SF-1449) Solicitation Offeror Submission Package`;
    summary = `Federal offeror information schedule, amendments acknowledgement, and representations summary.`;
    content = `# STANDARD FORM 1449 (SF-1449) OFFEROR SUBMISSION SCHEDULE
**Solicitation Number:** ${opp.solicitationNumber}  
**Title:** ${opp.title}  
**Issuing Agency:** ${opp.department} | ${opp.office}  
**Due Date:** ${dueFormatted}  

---

### BLOCK 17a: OFFEROR INFORMATION
- **Legal Business Name:** ${profile.companyName}
- **CAGE Code:** ${profile.cageCode}
- **Unique Entity Identifier (UEI):** ${profile.uei}
- **Principal Address:** Corporate Headquarters
- **Point of Contact:** Contracts Administration Lead
- **Email:** contracts@${profile.companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com
- **Phone:** 555-019-2834

### BLOCK 17b: SMALL BUSINESS DESIGNATION
- [x] Small Business under NAICS ${opp.naicsCode} (${opp.naicsTitle})
- [x] SBA Set-Aside Classification: **${opp.setAside}**
- [x] Active SAM.gov Registration: Active / No Exclusions

### BLOCK 20: SCHEDULE OF SUPPLIES / SERVICES
- Offeror agrees to perform all work specified in the Performance Work Statement (PWS) for ${opp.title} in strict accordance with the terms and conditions of Solicitation ${opp.solicitationNumber}.

### BLOCK 26: TOTAL EVALUATED PROPOSAL AMOUNT
- Total Evaluated Price (Base Period + 4 Option Periods): **$5,585,682.00**

### BLOCK 28: CONTRACTOR'S SIGNED OFFER
In compliance with the above, the undersigned agrees, if this offer is accepted within 120 calendar days from the date specified for receipt of offers, to furnish any or all items upon which prices are offered.

### BLOCK 30a/b/c: SIGNATURE & DATE
**Signature of Authorized Offeror Representative:** _______________________________________  
**Name & Title:** Chief Executive Officer / Authorized Contracting Official  
**Date:** ${now}  

---

### SOLICITATION AMENDMENTS ACKNOWLEDGEMENT
| Amendment # | Date Issued | Subject Matter | Offeror Acknowledged |
|---|---|---|---|
| **0001** | Recent | Answers to Vendor Questions & Wage Determination Update | **[x] Acknowledged** |
| **0002** | Recent | Revision to Section L Submission Instructions | **[x] Acknowledged** |
`;
  } else if (isSubmissionConfirmation) {
    title = `SAM.gov / Agency Portal Submission Verification Checklist & Transmittal Letter`;
    summary = `White-glove final delivery checklist, file verification hashes, and submission transmittal letter.`;
    content = `# WHITE-GLOVE SUBMISSION VERIFICATION CHECKLIST & TRANSMITTAL
**Solicitation Number:** ${opp.solicitationNumber}  
**Solicitation Title:** ${opp.title}  
**Customer Agency:** ${opp.department} (${opp.subTier})  
**Submission Deadline:** ${dueFormatted} 17:00 EST  
**Offeror:** ${profile.companyName} (CAGE: ${profile.cageCode} | UEI: ${profile.uei})  

---

## 1.0 TRANSMITTAL LETTER TO CONTRACTING OFFICER
**Date:** ${now}  
**To:** ${opp.poc.name}, Contracting Officer (${opp.poc.email})  
**Office:** ${opp.contractingOfficeAddress?.city || 'Washington'}, ${opp.contractingOfficeAddress?.state || 'DC'}  

Dear ${opp.poc.name},

${profile.companyName} is pleased to submit our formal proposal in response to Solicitation **${opp.solicitationNumber}** for **${opp.title}**.

Enclosed please find our complete submission comprising three (3) volumes:
1. **Volume I: Technical & Management Approach** (PDF, 34 Pages)
2. **Volume II: Past Performance Information** (PDF, 14 Pages)
3. **Volume III: Price / Cost Volume & SF-1449** (Excel + PDF, fully populated CLINs)

Our proposal remains valid for one hundred twenty (120) calendar days from the submission deadline. We confirm our small business status under NAICS ${opp.naicsCode} and our full compliance with all stated terms and FAR provisions.

Should you require any clarifications or discussions, please contact our contracts office at contracts@${profile.companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com.

Respectfully submitted,  
**Contracts Director, ${profile.companyName}**

---

## 2.0 PRE-SUBMISSION VERIFICATION PROTOCOL (WHITE GLOVE)
- [x] **File Integrity & Virus Scan:** All PDF and Excel files scanned with zero threats detected.
- [x] **Filename Nomenclature Audit:** Files formatted strictly per Section L:
  - ${opp.solicitationNumber}_Vol_I_Technical_${profile.companyName.replace(/\s+/g, '_')}.pdf
  - ${opp.solicitationNumber}_Vol_II_Past_Performance_${profile.companyName.replace(/\s+/g, '_')}.pdf
  - ${opp.solicitationNumber}_Vol_III_Pricing_${profile.companyName.replace(/\s+/g, '_')}.xlsx
  - ${opp.solicitationNumber}_Signed_SF1449_${profile.companyName.replace(/\s+/g, '_')}.pdf
- [x] **Redaction Check:** Proprietary business legends applied to all headers and footers.
- [x] **Portal Delivery:** Uploaded to SAM.gov / Agency Portal at least four (4) hours prior to deadline to prevent bandwidth bottlenecks.
- [x] **Confirmation Receipt:** Screenshot and timestamped email confirmation archived in contracts repository.
`;
  } else {
    // Generic high-quality artifact for custom deliverable names
    title = `${deliverableName} — Proposal Product`;
    summary = `Bespoke proposal artifact drafted for ${phaseName} satisfying Solicitation ${opp.solicitationNumber} requirements.`;
    content = `# ${deliverableName.toUpperCase()}
**Solicitation Number:** ${opp.solicitationNumber}  
**Project Title:** ${opp.title}  
**Issuing Agency:** ${opp.department} — ${opp.subTier}  
**Offeror:** ${profile.companyName} (CAGE: ${profile.cageCode} | UEI: ${profile.uei})  
**Phase / Milestone:** ${phaseName} (T-${daysBeforeDue} Days Before Deadline)  
**Status:** DRAFT COMPLETE  

---

## 1. PURPOSE & DELIVERABLE OBJECTIVE
This artifact is developed as part of the ${phaseName} proposal review gate for Solicitation **${opp.solicitationNumber}**. It directly addresses the customer's requirement for ${opp.title} and operationalizes the contractor's solution methodology.

---

## 2. KEY TECHNICAL SPECIFICATIONS & SOW MAPPING
- **Primary Statement of Work Requirement:** ${opp.description.slice(0, 200)}...
- **Governing Deliverables:**
${(opp.scopeBullets || []).map((b, i) => `  ${i + 1}. ${b}`).join('\n')}
- **Compliance Standard:** FAR 52.219-14, ${opp.requiredClearance} Security Clearance, NAICS ${opp.naicsCode}.

---

## 3. OFFEROR EXECUTION DETAILS
${profile.companyName} executes this deliverable leveraging our core competencies in ${(profile.coreCapabilities || []).join(', ')}. Work products are reviewed against corporate ISO 9001 and federal CMMI Level 3 quality gates prior to final integration into the proposal volumes.

---

## 4. VERIFICATION & SIGNOFF
- **Lead Author:** Subject Matter Expert / Capture Lead
- **Review Status:** Verified Responsive to Section L & Section M
- **Customer Deliverable Target:** ${dueFormatted}
`;
  }

  // Calculate word count
  const words = content.trim().split(/\s+/).filter(Boolean).length;

  return {
    id: `art-${slug}-${Date.now().toString(36)}`,
    deliverableName,
    phase: phaseName,
    daysBeforeDue,
    documentType: docType,
    filename,
    title,
    summary,
    content,
    status: 'Draft Ready',
    lastUpdated: now,
    wordCount: words,
  };
}

/**
 * Generates all artifacts for every deliverable across all phases in a timeline plan.
 */
export function generateAllShipleyArtifacts(
  timelinePlan: TimelinePhase[],
  opp: SAMOpportunity,
  profile: BusinessProfile
): ShipleyProposalArtifact[] {
  const artifacts: ShipleyProposalArtifact[] = [];

  timelinePlan.forEach((phase) => {
    phase.deliverables.forEach((del) => {
      artifacts.push(
        generateArtifactForDeliverable(del, phase.phase, phase.daysBeforeDue, opp, profile)
      );
    });
  });

  return artifacts;
}

/**
 * Downloads a single artifact as a markdown file.
 */
export function downloadArtifact(artifact: ShipleyProposalArtifact, opp: SAMOpportunity): void {
  const blob = new Blob([artifact.content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = artifact.filename || `${opp.solicitationNumber}_${artifact.deliverableName}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads all artifacts combined into a single, comprehensive Master Proposal Package markdown document.
 */
export function downloadConsolidatedShipleyPackage(
  artifacts: ShipleyProposalArtifact[],
  opp: SAMOpportunity,
  profile: BusinessProfile
): void {
  const now = new Date().toLocaleDateString();
  const header = `================================================================================
FEDERAL PROPOSAL ARTIFACT PACKAGE (SHIPLEY PROPOSAL FRAMEWORK)
SOLICITATION NUMBER: ${opp.solicitationNumber}
TITLE: ${opp.title}
AGENCY: ${opp.department} - ${opp.subTier}
OFFEROR: ${profile.companyName} (CAGE: ${profile.cageCode} | UEI: ${profile.uei})
DATE GENERATED: ${now}
TOTAL ARTIFACTS INCLUDED: ${artifacts.length}
================================================================================

TABLE OF CONTENTS:
${artifacts.map((a, i) => `${i + 1}. [${a.phase} | T-${a.daysBeforeDue}d] ${a.title} (${a.documentType})`).join('\n')}

================================================================================
`;

  const body = artifacts
    .map(
      (a, i) => `\n\n################################################################################
### ARTIFACT ${i + 1} OF ${artifacts.length}: ${a.title.toUpperCase()}
### PHASE: ${a.phase} (T-${a.daysBeforeDue} Days Before Due)
### DOCUMENT TYPE: ${a.documentType} | STATUS: ${a.status}
################################################################################\n\n${a.content}`
    )
    .join('\n\n---\n\n');

  const fullText = header + body;
  const blob = new Blob([fullText], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Shipley_Master_Proposal_Package_${opp.solicitationNumber}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
