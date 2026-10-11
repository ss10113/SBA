import { SAMOpportunity, FilterState } from '../types/contract.ts';

// Helper to escape CSV cell content
function escapeCsvCell(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

export interface ExportResult {
  success: boolean;
  count: number;
  filename: string;
  error?: string;
}

/**
 * Export filtered opportunities to CSV format for Excel/Spreadsheets
 */
export function exportOpportunitiesToCsv(
  opportunities: SAMOpportunity[],
  filenamePrefix = 'SAM_Federal_Opportunities_Export'
): ExportResult {
  if (!opportunities || opportunities.length === 0) {
    return {
      success: false,
      count: 0,
      filename: '',
      error: 'No solicitations match current filters to export.',
    };
  }

  const headers = [
    'Solicitation Number',
    'Notice ID',
    'Notice Title',
    'Notice Status',
    'Federal Department',
    'Sub-Tier Agency',
    'Contracting Office',
    'NAICS Code',
    'NAICS Title',
    'SBA Set-Aside',
    'Notice Type',
    'Contract Type',
    'Estimated Value',
    'Numeric Value ($)',
    'Posted Date',
    'Response Deadline',
    'Performance Start Date',
    'Performance End Date',
    'Place of Performance City',
    'Place of Performance State',
    'Place of Performance Zip',
    'Required Security Clearance',
    'POC Name',
    'POC Email',
    'POC Phone',
    'Awardee Vendor',
    'Awarded Amount',
    'Award Date',
    'Award Contract Number',
    'Official SAM.gov Link',
    'Description Summary',
  ];

  const now = new Date('2026-10-01T08:36:33-07:00');

  const rows = opportunities.map((opp) => {
    const isClosed = new Date(opp.responseDeadLine).getTime() <= now.getTime();
    const effectiveStatus = opp.status || (isClosed ? 'inactive' : 'active');
    const statusLabel = effectiveStatus === 'awarded' 
      ? 'Awarded' 
      : effectiveStatus === 'inactive' 
      ? 'Inactive / Closed' 
      : 'Active';

    return [
      escapeCsvCell(opp.solicitationNumber),
      escapeCsvCell(opp.noticeId),
      escapeCsvCell(opp.title),
      escapeCsvCell(statusLabel),
      escapeCsvCell(opp.department),
      escapeCsvCell(opp.subTier || ''),
      escapeCsvCell(opp.office || ''),
      escapeCsvCell(opp.naicsCode),
      escapeCsvCell(opp.naicsTitle),
      escapeCsvCell(opp.setAside),
      escapeCsvCell(opp.type),
      escapeCsvCell(opp.contractType),
      escapeCsvCell(opp.estimatedValue),
      escapeCsvCell(opp.valueMagnitude),
      escapeCsvCell(opp.postedDate),
      escapeCsvCell(opp.responseDeadLine),
      escapeCsvCell(opp.performanceStartDate),
      escapeCsvCell(opp.performanceEndDate),
      escapeCsvCell(opp.placeOfPerformance?.city || ''),
      escapeCsvCell(opp.placeOfPerformance?.state || ''),
      escapeCsvCell(opp.placeOfPerformance?.zip || ''),
      escapeCsvCell(opp.requiredClearance),
      escapeCsvCell(opp.poc?.name || ''),
      escapeCsvCell(opp.poc?.email || ''),
      escapeCsvCell(opp.poc?.phone || ''),
      escapeCsvCell(opp.awardeeInfo?.vendorName || ''),
      escapeCsvCell(opp.awardeeInfo?.awardAmount || ''),
      escapeCsvCell(opp.awardeeInfo?.awardDate || ''),
      escapeCsvCell(opp.awardeeInfo?.contractNumber || ''),
      escapeCsvCell(opp.sourceLink || `https://sam.gov/opp/${opp.solicitationNumber}/view`),
      escapeCsvCell((opp.description || '').replace(/\n+/g, ' ').substring(0, 500)),
    ].join(',');
  });

  // UTF-8 BOM so Excel opens UTF-8 encoded text seamlessly
  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const nowStr = new Date().toISOString().substring(0, 10);
  const filename = `${filenamePrefix}_${nowStr}.csv`;
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return {
    success: true,
    count: opportunities.length,
    filename,
  };
}

/**
 * Export filtered opportunities to JSON format
 */
export function exportOpportunitiesToJson(
  opportunities: SAMOpportunity[],
  filterState?: FilterState,
  filenamePrefix = 'SAM_Federal_Opportunities_Export'
): ExportResult {
  if (!opportunities || opportunities.length === 0) {
    return {
      success: false,
      count: 0,
      filename: '',
      error: 'No solicitations match current filters to export.',
    };
  }

  const exportPayload = {
    metadata: {
      exportedAt: new Date().toISOString(),
      exportVersion: '2.0.0',
      system: 'SBA GovWin Federal Procurement Intelligence',
      totalRecords: opportunities.length,
      activeFilters: filterState || null,
    },
    opportunities,
  };

  const jsonString = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const nowStr = new Date().toISOString().substring(0, 10);
  const filename = `${filenamePrefix}_${nowStr}.json`;
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return {
    success: true,
    count: opportunities.length,
    filename,
  };
}
