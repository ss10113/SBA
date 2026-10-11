import { jsPDF } from 'jspdf';
import { OpportunityAttachment, SAMOpportunity } from '../types/contract.ts';
import { generateAttachmentContent } from './attachmentDownloader.ts';

/**
 * Generates an authentic, publication-quality Federal Procurement PDF Blob
 * for any opportunity attachment (PWS, Section L, Section M, Wage Determinations, etc.)
 */
export function generateAttachmentPdfBlob(
  att: OpportunityAttachment,
  opp: SAMOpportunity
): Blob {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'letter', // 612 x 792 pt
  });

  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 45;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin - 30) {
      doc.addPage();
      y = margin + 20;
      drawPageHeader();
    }
  };

  const drawPageHeader = () => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(`SOLICITATION: ${opp.solicitationNumber}`, margin, margin);
    doc.text(
      `ATTACHMENT: ${att.name}`,
      pageWidth - margin,
      margin,
      { align: 'right' }
    );
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.75);
    doc.line(margin, margin + 6, pageWidth - margin, margin + 6);
    y = Math.max(y, margin + 24);
  };

  // --- COVER / HEADER BANNER (PAGE 1) ---
  // Top Banner background
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(margin, y, contentWidth, 54, 'F');

  // Agency & Federal seal bar
  doc.setFillColor(37, 99, 235); // blue-600 accent stripe
  doc.rect(margin, y, 6, 54, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('UNITED STATES FEDERAL ACQUISITION SYSTEM • SAM.GOV', margin + 16, y + 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225); // slate-300
  const agencyText = `${opp.department || 'FEDERAL AGENCY'}${opp.subTier ? ` - ${opp.subTier}` : ''}`;
  doc.text(agencyText.length > 70 ? agencyText.substring(0, 68) + '...' : agencyText, margin + 16, y + 33);
  doc.text(`Contracting Office: ${opp.office || 'Federal Procurement Office'}`, margin + 16, y + 45);

  y += 68;

  // Document Title & Metadata Box
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(1);
  doc.roundedRect(margin, y, contentWidth, 76, 4, 4, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42); // slate-900
  const titleText = att.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
  doc.text(titleText.substring(0, 52), margin + 14, y + 22);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text(`Solicitation Number: ${opp.solicitationNumber}`, margin + 14, y + 38);
  doc.text(`Classification: ${att.accessLevel || (att.isPublic ? 'Public / Unrestricted' : 'Controlled CUI')}`, margin + 14, y + 51);
  doc.text(`Estimated Value: ${opp.estimatedValue || 'Not Disclosed'} | NAICS: ${opp.naicsCode}`, margin + 14, y + 64);

  // Right-side badge
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  if (att.isPublic) {
    doc.setFillColor(220, 252, 231); // emerald-100
    doc.setDrawColor(134, 239, 172); // emerald-300
    doc.roundedRect(pageWidth - margin - 110, y + 12, 98, 20, 3, 3, 'FD');
    doc.setTextColor(22, 101, 52); // emerald-800
    doc.text('PUBLIC NOTICE', pageWidth - margin - 61, y + 25, { align: 'center' });
  } else {
    doc.setFillColor(254, 243, 199); // amber-100
    doc.setDrawColor(252, 211, 77); // amber-300
    doc.roundedRect(pageWidth - margin - 120, y + 12, 108, 20, 3, 3, 'FD');
    doc.setTextColor(146, 64, 14); // amber-800
    doc.text('CONTROLLED SOW', pageWidth - margin - 66, y + 25, { align: 'center' });
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Deadline: ${new Date(opp.responseDeadLine).toLocaleDateString()}`, pageWidth - margin - 14, y + 48, { align: 'right' });
  doc.text(`Set-Aside: ${opp.setAside || 'None'}`, pageWidth - margin - 14, y + 62, { align: 'right' });

  y += 92;

  // --- BODY CONTENT ---
  const isPWS = att.name.toLowerCase().includes('pws') || att.name.toLowerCase().includes('sow') || att.name.toLowerCase().includes('spec');
  const isSectionL = att.name.toLowerCase().includes('section_l') || att.name.toLowerCase().includes('proposal_prep');
  const isSectionM = att.name.toLowerCase().includes('section_m') || att.name.toLowerCase().includes('evaluation');
  const isPricing = att.name.toLowerCase().includes('rate') || att.name.toLowerCase().includes('pricing') || att.name.toLowerCase().includes('xlsx');
  const isWage = att.name.toLowerCase().includes('wage') || att.name.toLowerCase().includes('sca');

  const printSectionHeader = (title: string) => {
    checkPageBreak(36);
    doc.setFillColor(241, 245, 249); // slate-100
    doc.roundedRect(margin, y, contentWidth, 20, 2, 2, 'F');
    doc.setFillColor(37, 99, 235); // blue-600 indicator
    doc.rect(margin, y, 4, 20, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(title, margin + 12, y + 14);
    y += 28;
  };

  const printParagraph = (text: string, indent = 0) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85); // slate-700
    const lines = doc.splitTextToSize(text, contentWidth - indent);
    checkPageBreak(lines.length * 13 + 6);
    doc.text(lines, margin + indent, y);
    y += lines.length * 13 + 8;
  };

  if (isPWS) {
    printSectionHeader('1.0 MISSION OBJECTIVE & SCOPE OF CONTRACT');
    printParagraph(
      `The Contractor shall provide all personnel, equipment, supplies, facilities, transportation, tools, materials, supervision, and non-personal services necessary to execute ${opp.title} in accordance with all standards and conditions set forth herein.`
    );

    printSectionHeader('2.0 STATEMENT OF WORK OVERVIEW');
    printParagraph(opp.description);

    if (opp.scopeBullets && opp.scopeBullets.length > 0) {
      printSectionHeader('3.0 PERFORMANCE DELIVERABLES & WORK BREAKDOWN');
      opp.scopeBullets.forEach((bullet, idx) => {
        checkPageBreak(24);
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(margin, y, contentWidth, 22, 2, 2, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(30, 41, 59);
        doc.text(`Deliverable 3.${idx + 1}:`, margin + 10, y + 14);
        doc.setFont('helvetica', 'normal');
        doc.text(bullet, margin + 85, y + 14);
        y += 28;
      });
    }

    printSectionHeader('4.0 CONTRACT LINE ITEM NUMBERS (CLIN STRUCTURE)');
    const clins = [
      { clin: '0001', desc: 'Base Period Operational Execution (12 Months)', type: 'Firm-Fixed-Price (FFP)' },
      { clin: '0002', desc: 'Program Management & Quality Assurance Deliverables', type: 'Firm-Fixed-Price (FFP)' },
      { clin: '0003', desc: 'Other Direct Costs (ODCs) & Travel Provisions', type: 'Cost-Reimbursable (CR)' },
      { clin: '1001', desc: 'Option Year 1 Follow-on Execution (12 Months)', type: 'Firm-Fixed-Price (FFP)' },
      { clin: '2001', desc: 'Option Year 2 Follow-on Execution (12 Months)', type: 'Firm-Fixed-Price (FFP)' },
      { clin: '3001', desc: 'Option Year 3 Follow-on Execution (12 Months)', type: 'Firm-Fixed-Price (FFP)' },
    ];
    clins.forEach((item) => {
      checkPageBreak(18);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`CLIN ${item.clin}`, margin + 8, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(item.desc, margin + 65, y);
      doc.setTextColor(37, 99, 235);
      doc.text(item.type, pageWidth - margin - 8, y, { align: 'right' });
      y += 16;
    });

    y += 10;
    printSectionHeader('5.0 MANDATORY SECURITY & CLEARANCE PROVISIONS');
    printParagraph(
      `All Contractor personnel performing under this contract must possess an active ${opp.requiredClearance || 'Secret'} clearance prior to start of performance and maintain compliance with DoD/Agency Industrial Security Guidelines throughout the period of performance.`
    );

    printSectionHeader('6.0 GOVERNMENT POINT OF CONTACT');
    printParagraph(`Contracting Officer: ${opp.poc.name} | Title: ${opp.poc.title || 'Contracting Officer'}`);
    printParagraph(`Email: ${opp.poc.email || 'N/A'} | Phone: ${opp.poc.phone || 'N/A'}`);
  } else if (isSectionL) {
    printSectionHeader('1.0 PROPOSAL PREPARATION & SUBMISSION INSTRUCTIONS');
    printParagraph(
      `Offerors shall submit complete, conforming proposals electronically via the official SAM.gov procurement portal no later than ${new Date(opp.responseDeadLine).toLocaleString()}. Hard copy submissions will not be accepted.`
    );

    printSectionHeader('2.0 PROPOSAL VOLUMES AND PAGE LIMITATIONS');
    const volumes = [
      { vol: 'Volume I', title: 'Technical Approach & Management Plan', limit: '35 Pages Maximum', copies: '1 Electronic (PDF)' },
      { vol: 'Volume II', title: 'Past Performance Questionnaires (PPQs)', limit: '15 Pages Maximum', copies: '1 Electronic (PDF)' },
      { vol: 'Volume III', title: 'Price / Cost Volume (BOE / CLIN Rates)', limit: 'No Page Limit', copies: '1 Electronic (.xlsx)' },
    ];
    volumes.forEach((v) => {
      checkPageBreak(24);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, y, contentWidth, 22, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text(v.vol, margin + 8, y + 14);
      doc.setFont('helvetica', 'normal');
      doc.text(v.title, margin + 65, y + 14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(37, 99, 235);
      doc.text(v.limit, pageWidth - margin - 110, y + 14);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(v.copies, pageWidth - margin - 8, y + 14, { align: 'right' });
      y += 28;
    });

    y += 8;
    printSectionHeader('3.0 COMPLIANCE GUIDELINES & RESTRICTIONS');
    printParagraph('• Page Margins: Minimum 1.0 inch on all borders.');
    printParagraph('• Font Size: 11-point minimum (Calibri, Arial, or Times New Roman). Tables and graphics may use 9-point.');
    printParagraph('• Small Business Subcontracting Rule (FAR 52.219-14): Prime contractor must perform at least 50% of personnel costs.');
  } else if (isSectionM) {
    printSectionHeader('1.0 EVALUATION BASIS & BEST VALUE TRADEOFF');
    printParagraph(
      'Award will be made to the responsible offeror whose proposal conforms to the solicitation requirements and is evaluated as providing the Best Value to the Government, utilizing the Tradeoff Process in accordance with FAR 15.101-1.'
    );

    printSectionHeader('2.0 RELATIVE IMPORTANCE OF EVALUATION FACTORS');
    const factors = [
      { num: 'Factor 1', title: 'Technical & Management Approach', weight: 'Most Important (Significantly outweighs Price)' },
      { num: 'Factor 2', title: 'Past Performance Confidence', weight: 'Substantial Importance' },
      { num: 'Factor 3', title: 'Small Business Utilization & FAR Compliance', weight: 'Pass / Fail Mandatory Gate' },
      { num: 'Factor 4', title: 'Price / Cost Reasonableness & Realism', weight: 'Evaluated for Fair & Reasonable Rate' },
    ];
    factors.forEach((f) => {
      checkPageBreak(22);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text(f.num, margin + 8, y);
      doc.setFont('helvetica', 'normal');
      doc.text(f.title, margin + 65, y);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(37, 99, 235);
      doc.text(f.weight, pageWidth - margin - 8, y, { align: 'right' });
      y += 18;
    });

    y += 8;
    printSectionHeader('3.0 ADJECTIVAL RATING SCALE (FACTORS 1 & 2)');
    const ratings = [
      { rating: 'OUTSTANDING', desc: 'Proposal demonstrates exceptional approach; strengths significantly outweigh weaknesses; very low risk.', color: [37, 99, 235] },
      { rating: 'GOOD', desc: 'Proposal demonstrates thorough approach; strengths outweigh weaknesses; low risk of unsuccessful performance.', color: [16, 185, 129] },
      { rating: 'ACCEPTABLE', desc: 'Proposal meets requirements; weaknesses balanced by strengths; moderate risk of performance.', color: [245, 158, 11] },
      { rating: 'MARGINAL', desc: 'Proposal contains deficiencies requiring significant clarification; high risk to government.', color: [239, 68, 68] },
    ];
    ratings.forEach((r) => {
      checkPageBreak(28);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'F');
      doc.setFillColor(r.color[0], r.color[1], r.color[2]);
      doc.rect(margin, y, 4, 24, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(r.color[0], r.color[1], r.color[2]);
      doc.text(r.rating, margin + 10, y + 15);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      const split = doc.splitTextToSize(r.desc, contentWidth - 110);
      doc.text(split, margin + 105, y + 14);
      y += 30;
    });
  } else if (isPricing) {
    printSectionHeader('GOVERNMENT ESTIMATED LABOR RATE SCHEDULE');
    const rows = [
      { clin: '0001', cat: 'Senior Project Manager / Lead', hrs: '1,920', rate: '$115.00', total: '$220,800.00' },
      { clin: '0002', cat: 'Lead Systems Engineer', hrs: '1,920', rate: '$105.00', total: '$201,600.00' },
      { clin: '0003', cat: 'Senior Technical Specialist', hrs: '1,920', rate: '$95.00', total: '$182,400.00' },
      { clin: '0004', cat: 'Quality Assurance & Compliance Lead', hrs: '1,920', rate: '$85.00', total: '$163,200.00' },
      { clin: '0005', cat: 'Operations Support Analyst', hrs: '1,920', rate: '$65.00', total: '$124,800.00' },
      { clin: '1001', cat: 'Option Year 1 Technical Execution', hrs: '9,600', rate: '$98.50', total: '$945,600.00' },
      { clin: '2001', cat: 'Option Year 2 Technical Execution', hrs: '9,600', rate: '$101.45', total: '$973,920.00' },
      { clin: '3001', cat: 'Option Year 3 Technical Execution', hrs: '9,600', rate: '$104.50', total: '$1,003,200.00' },
    ];

    // Table Header
    doc.setFillColor(15, 23, 42);
    doc.rect(margin, y, contentWidth, 18, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('CLIN', margin + 6, y + 12);
    doc.text('Labor Category', margin + 45, y + 12);
    doc.text('Est. Hours', margin + 260, y + 12);
    doc.text('Hourly Rate', margin + 340, y + 12);
    doc.text('Total Price', pageWidth - margin - 8, y + 12, { align: 'right' });
    y += 22;

    rows.forEach((r, idx) => {
      checkPageBreak(18);
      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, y - 4, contentWidth, 16, 'F');
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text(r.clin, margin + 6, y + 8);
      doc.setFont('helvetica', 'normal');
      doc.text(r.cat, margin + 45, y + 8);
      doc.text(r.hrs, margin + 260, y + 8);
      doc.text(r.rate, margin + 340, y + 8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(37, 99, 235);
      doc.text(r.total, pageWidth - margin - 8, y + 8, { align: 'right' });
      y += 18;
    });

    y += 12;
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('TOTAL ESTIMATED CONTRACT CEILING:', margin + 12, y + 16);
    doc.setTextColor(22, 101, 52);
    doc.text(opp.estimatedValue || '$3,691,720.00', pageWidth - margin - 12, y + 16, { align: 'right' });
    y += 32;
  } else if (isWage) {
    printSectionHeader('SERVICE CONTRACT ACT (SCA) WAGE DETERMINATION');
    printParagraph(`State: ${opp.placeOfPerformance.state || 'National'} | Area: ${opp.placeOfPerformance.city || 'Standard Metro'}`);
    printParagraph('Department of Labor Wage Determination No: 2026-0045 (Rev 14)');

    const wageList = [
      { code: '01020', title: 'Administrative Assistant', rate: '$28.45 / hr' },
      { code: '01111', title: 'General Clerk I', rate: '$18.50 / hr' },
      { code: '14041', title: 'Computer Systems Analyst I', rate: '$42.15 / hr' },
      { code: '14042', title: 'Computer Systems Analyst II', rate: '$48.90 / hr' },
      { code: '14071', title: 'Computer Programmer I', rate: '$34.20 / hr' },
      { code: '14072', title: 'Computer Programmer II', rate: '$41.60 / hr' },
      { code: '23050', title: 'Aircraft / Systems Mechanic', rate: '$38.70 / hr' },
      { code: '23410', title: 'HVAC Specialist', rate: '$34.10 / hr' },
    ];
    wageList.forEach((w) => {
      checkPageBreak(16);
      doc.setFont('helvetica', 'mono');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(w.code, margin + 8, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      doc.text(w.title, margin + 60, y);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(22, 101, 52);
      doc.text(w.rate, pageWidth - margin - 8, y, { align: 'right' });
      y += 16;
    });

    y += 8;
    printSectionHeader('MANDATORY HEALTH & WELFARE FRINGE BENEFITS');
    printParagraph('• Health & Welfare: $5.36 per hour, up to 40 hours per week ($214.40 / wk).');
    printParagraph('• Paid Vacation: Two (2) weeks paid annual leave after 1 continuous year of service.');
    printParagraph('• Federal Holidays: A minimum of eleven (11) paid government holidays per calendar year.');
  } else {
    // Standard RFP Document / SF 1449 Format
    printSectionHeader('FEDERAL SOLICITATION SYNOPSIS & ATTACHMENT PROVISIONS');
    printParagraph(att.description || 'Official technical attachment and Statement of Work for federal solicitation.');
    printParagraph(
      `This document constitutes an official procurement artifact under Federal Solicitation ${opp.solicitationNumber}. Offerors are advised to carefully review all clauses, requirements, and compliance metrics prior to final submission.`
    );
    printSectionHeader('PROJECT OVERVIEW');
    printParagraph(opp.description);
    printSectionHeader('CONTRACTING OFFICER DETAILS');
    printParagraph(`Point of Contact: ${opp.poc.name} (${opp.poc.title || 'Contracting Officer'})`);
    printParagraph(`Email: ${opp.poc.email || 'N/A'} | Phone: ${opp.poc.phone || 'N/A'}`);
  }

  // Draw Footers on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.75);
    doc.line(margin, pageHeight - margin + 6, pageWidth - margin, pageHeight - margin + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(
      `Official SAM.gov Procurement Artifact • Solicitation ${opp.solicitationNumber}`,
      margin,
      pageHeight - margin + 18
    );
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - margin,
      pageHeight - margin + 18,
      { align: 'right' }
    );
  }

  return doc.output('blob');
}
