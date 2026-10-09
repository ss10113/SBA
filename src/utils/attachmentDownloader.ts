import { OpportunityAttachment, SAMOpportunity } from '../types/contract';

export function generateAttachmentContent(att: OpportunityAttachment, opp: SAMOpportunity): string {
  const isPWS = att.name.toLowerCase().includes('pws') || att.name.toLowerCase().includes('sow') || att.name.toLowerCase().includes('spec');
  const isSectionL = att.name.toLowerCase().includes('section_l') || att.name.toLowerCase().includes('proposal_prep');
  const isSectionM = att.name.toLowerCase().includes('section_m') || att.name.toLowerCase().includes('evaluation');
  const isPricing = att.name.toLowerCase().includes('rate') || att.name.toLowerCase().includes('pricing') || att.name.toLowerCase().includes('xlsx');
  const isWage = att.name.toLowerCase().includes('wage') || att.name.toLowerCase().includes('sca');
  const isSF1449 = att.name.toLowerCase().includes('sf1449') || att.name.toLowerCase().includes('solicitation');

  if (isPWS) {
    return `================================================================================
FEDERAL ACQUISITION PERFORMANCE WORK STATEMENT (PWS)
SOLICITATION NUMBER: ${opp.solicitationNumber}
TITLE: ${opp.title}
DEPARTMENT / AGENCY: ${opp.department} - ${opp.subTier}
OFFICE: ${opp.office}
PLACE OF PERFORMANCE: ${opp.placeOfPerformance.city}, ${opp.placeOfPerformance.state} ${opp.placeOfPerformance.zip}
NAICS CODE: ${opp.naicsCode} - ${opp.naicsTitle}
SET-ASIDE: ${opp.setAside}
================================================================================

1.0 MISSION & OBJECTIVE
The Contractor shall provide all personnel, equipment, supplies, facilities,
transportation, tools, materials, supervision, and other items and non-personal
services necessary to perform ${opp.title} as defined in this Performance Work
Statement, except for those items specified as government-furnished property and
services.

2.0 STATEMENT OF WORK OVERVIEW
${opp.description}

3.0 SPECIFIC TASKS & PERFORMANCE DELIVERABLES
${(opp.scopeBullets || []).map((bullet, idx) => `3.${idx + 1} Deliverable ${idx + 1}: ${bullet}`).join('\n')}

4.0 CONTRACT LINE ITEM NUMBERS (CLINs)
  - CLIN 0001: Base Period Operational Execution (12 Months) - FFP
  - CLIN 0002: Program Management & Quality Assurance Reports - FFP
  - CLIN 0003: Other Direct Costs (ODCs) & Travel (Not-to-Exceed) - Cost Reimbursable
  - CLIN 1001: Option Period 1 Performance (12 Months) - FFP
  - CLIN 2001: Option Period 2 Performance (12 Months) - FFP
  - CLIN 3001: Option Period 3 Performance (12 Months) - FFP
  - CLIN 4001: Option Period 4 Performance (12 Months) - FFP

5.0 PERIOD OF PERFORMANCE
The period of performance shall be from ${opp.performanceStartDate} through ${opp.performanceEndDate}.

6.0 SECURITY & CLEARANCE REQUIREMENTS
Contractor personnel performing under this contract must possess an active
${opp.requiredClearance} security clearance at time of proposal submission and
maintain eligibility throughout the period of performance.

7.0 APPLICABLE MANDATORY FAR CLAUSES
${(opp.keyFarClauses || []).map((c) => `- ${c.clause}: ${c.title}\n  Requirements: ${c.explanation}`).join('\n\n')}

8.0 GOVERNMENT POINT OF CONTACT
Contracting Officer: ${opp.poc.name} (${opp.poc.title})
Email: ${opp.poc.email} | Phone: ${opp.poc.phone}
`;
  }

  if (isSectionL) {
    return `================================================================================
SECTION L: INSTRUCTIONS, CONDITIONS, AND NOTICES TO OFFERORS
SOLICITATION: ${opp.solicitationNumber}
================================================================================

1.0 GENERAL PROPOSAL PREPARATION INSTRUCTIONS
Offerors shall submit proposals in three (3) distinct, separate volumes as
outlined below. Proposals must be submitted electronically via SAM.gov portal
no later than ${new Date(opp.responseDeadLine).toLocaleString()}.

2.0 PROPOSAL VOLUMES AND PAGE LIMITATIONS
--------------------------------------------------------------------------------
Volume   Title                                Page Limit     Copies
--------------------------------------------------------------------------------
Vol I    Technical Approach & Management Plan 35 Pages       1 Electronic
Vol II   Past Performance Information         15 Pages       1 Electronic
Vol III  Price / Cost Volume (BOE / CLINs)    No Page Limit  1 Electronic (.xlsx)
--------------------------------------------------------------------------------

3.0 VOLUME I - TECHNICAL APPROACH
3.1 Narrative must directly map to every subparagraph in Section 3.0 of the PWS.
3.2 Staffing & Key Personnel: Resumes and letters of commitment required for
    all designated Key Personnel roles.
3.3 Quality Control Plan (QCP) and Risk Mitigation Matrix.

4.0 VOLUME II - PAST PERFORMANCE
4.1 Offerors shall submit up to three (3) relevant past performance citations
    completed within the last three (3) years of similar scope and magnitude.
4.2 Past Performance Questionnaires (PPQs) must be submitted directly by the
    cognizant Contracting Officer / COR.

5.0 VOLUME III - PRICE PROPOSAL
5.1 Fully burdened labor rates with breakdown of Direct Labor, Fringe, Overhead,
    G&A, and Fee / Profit.
5.2 Small Business Subcontracting: Under FAR 52.219-14, the prime small business
    must perform at least 50% of the cost of contract performance for personnel.
`;
  }

  if (isSectionM) {
    return `================================================================================
SECTION M: EVALUATION FACTORS FOR AWARD (BEST VALUE TRADEOFF)
SOLICITATION: ${opp.solicitationNumber}
================================================================================

1.0 BASIS FOR AWARD
Award will be made to the responsible offeror whose proposal conforms to the
solicitation requirements and is evaluated as providing the Best Value to the
Government, using a Tradeoff Process in accordance with FAR 15.101-1.

2.0 EVALUATION FACTORS IN ORDER OF RELATIVE IMPORTANCE
  - Factor 1: Technical & Management Approach (Significantly more important than Price)
  - Factor 2: Past Performance Confidence (Substantial importance)
  - Factor 3: Small Business Utilization (FAR 52.219-14 Compliance) (Pass/Fail)
  - Factor 4: Price / Cost Reasonableness & Realism

3.0 ADJECTIVAL SCORING DEFINITIONS (FACTORS 1 & 2)
  - OUTSTANDING (BLUE): Proposal indicates exceptional understanding of requirements;
    multiple significant strengths that benefit the government; risk of unsuccessful
    performance is very low.
  - GOOD (PURPLE): Proposal meets requirements and indicates a thorough understanding;
    strengths outweigh weaknesses; risk is low.
  - ACCEPTABLE (GREEN): Proposal meets minimum requirements; risk is moderate.
  - MARGINAL (YELLOW): Proposal contains weaknesses that require significant revision.
  - UNACCEPTABLE (RED): Proposal fails to meet requirements.
`;
  }

  if (isPricing) {
    return `CLIN,Labor Category,Government Estimated Hours,Hourly Fully Burdened Rate,Total Evaluated Price
0001,Senior Project Manager / Lead,1920,$115.00,$220800.00
0002,Lead Systems Engineer,1920,$105.00,$201600.00
0003,Senior Technical Specialist,1920,$95.00,$182400.00
0004,Quality Assurance & Compliance Lead,1920,$85.00,$163200.00
0005,Operations Support Analyst,1920,$65.00,$124800.00
1001,Option Year 1 Technical Execution,9600,$98.50,$945600.00
2001,Option Year 2 Technical Execution,9600,$101.45,$973920.00
3001,Option Year 3 Technical Execution,9600,$104.50,$1003200.00
4001,Option Year 4 Technical Execution,9600,$107.63,$1033248.00
TOTAL ESTIMATED CONTRACT VALUE: ${opp.estimatedValue}
`;
  }

  if (isWage) {
    return `================================================================================
U.S. DEPARTMENT OF LABOR - EMPLOYMENT STANDARDS ADMINISTRATION
WAGE DETERMINATION NO: 2026-0045 (REVISION NO: 14)
STATE: ${opp.placeOfPerformance.state} | COUNTY/AREA: ${opp.placeOfPerformance.city}
REGISTER OF WAGE DETERMINATIONS UNDER THE SERVICE CONTRACT ACT
================================================================================

OCCUPATION CODE & TITLE                                MINIMUM HOURLY WAGE
01000 - Administrative Support and Clerical
  01020 - Administrative Assistant                    $28.45/hr
  01111 - General Clerk I                             $18.50/hr
14000 - Information and Arts
  14041 - Computer Systems Analyst I                  $42.15/hr
  14042 - Computer Systems Analyst II                 $48.90/hr
  14043 - Computer Systems Analyst III                $55.75/hr
  14071 - Computer Programmer I                       $34.20/hr
  14072 - Computer Programmer II                      $41.60/hr
23000 - Mechanics and Maintenance
  23050 - Aircraft Mechanic                           $38.70/hr
  23410 - Heating, Ventilation, Air Conditioning      $34.10/hr
  23810 - Plumber, Maintenance                        $33.80/hr
99000 - Miscellaneous Occupations
  99050 - Desk Clerk                                  $19.25/hr

HEALTH & WELFARE: $5.36 per hour, up to 40 hours per week.
VACATION: 2 weeks paid after 1 year of service.
HOLIDAYS: 11 paid federal holidays per year.
`;
  }

  // Default Standard RFP Packet
  return `================================================================================
STANDARD FORM 1449 / SOLICITATION AMENDMENT
SOLICITATION NO: ${opp.solicitationNumber}
PROJECT: ${opp.title}
ISSUED BY: ${opp.department} - ${opp.subTier} (${opp.office})
DATE ISSUED: ${opp.postedDate}
RESPONSE DEADLINE: ${opp.responseDeadLine}
================================================================================

ATTACHMENT: ${att.name}
DESCRIPTION: ${att.description}
FILE SIZE: ${att.size}
REQUIRED SUBMISSION FORMAT: ${att.type}

This document constitutes an official attachment to Federal Solicitation
${opp.solicitationNumber}. Offerors are advised to inspect all provisions and
subparagraphs prior to proposal finalization.

POINT OF CONTACT:
${opp.poc.name}, ${opp.poc.title}
Email: ${opp.poc.email} | Phone: ${opp.poc.phone}
Office: ${opp.contractingOfficeAddress.city}, ${opp.contractingOfficeAddress.state}
`;
}

export function downloadAttachment(att: OpportunityAttachment, opp: SAMOpportunity): void {
  const content = generateAttachmentContent(att, opp);
  const isPricing = att.name.toLowerCase().includes('xlsx') || att.name.toLowerCase().includes('rate');
  const mimeType = isPricing ? 'text/csv;charset=utf-8' : 'text/plain;charset=utf-8';
  
  // Format filename cleanly
  let filename = att.name;
  if (!filename.includes('.')) {
    filename += isPricing ? '.csv' : '.txt';
  } else if (filename.endsWith('.pdf') || filename.endsWith('.docx')) {
    // Save as standard readable text document with clear extension
    filename = filename.replace(/\.(pdf|docx)$/, '.txt');
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadCompleteRfpPackage(opp: SAMOpportunity): void {
  if (!opp.attachments || opp.attachments.length === 0) return;

  // Download each attachment sequentially with brief delay to avoid browser popup blocks
  opp.attachments.forEach((att, index) => {
    setTimeout(() => {
      downloadAttachment(att, opp);
    }, index * 250);
  });
}
