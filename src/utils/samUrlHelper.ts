/**
 * Safe SAM.gov URL and Link Resolution Utility
 * 
 * Rules for SAM.gov URLs:
 * 1. SAM.gov only recognizes 32-character hexadecimal alphanumeric UUIDs in `/opp/:id/view`.
 *    If an ID is NOT 32 hex chars (such as a solicitation number like W912P826R0042 or 70RCR2-26-R-1505),
 *    navigating to `/opp/:id/view` results in an immediate HTTP 404 Error on SAM.gov.
 * 2. Direct website reference links append the official solicitation number to the hyperlink query string
 *    `https://sam.gov/opp/${directUUID}/view?solicitationNumber=${encodeURIComponent(sol)}`
 *    so the solicitation number is explicitly carried and visible in the hyperlink.
 * 3. The canonical, guaranteed non-404 public search endpoint on SAM.gov is:
 *    `https://sam.gov/search/?index=opp&page=1&sort=-modifiedDate&size=25&q=${encodeURIComponent(query)}`
 *    which populates SAM.gov's primary search query without conflicting parameters or status filters.
 */

export function isDirectSamGovNoticeId(id?: string | null): boolean {
  if (!id) return false;
  return /^[a-f0-9]{32}$/i.test(id.trim());
}

export function cleanSolicitationNumber(solicitationNumber?: string | null): string {
  if (!solicitationNumber) return '';
  let clean = solicitationNumber.trim();
  // Strip sub-call or internal tags like -AOI0002, _AOI0001, etc.
  clean = clean.split('-AOI')[0].split('_AOI')[0].split('_000')[0].trim();
  return clean;
}

export function extractSamNoticeUUID(opp?: {
  noticeId?: string;
  sourceLink?: string;
  samUrl?: string;
  uiLink?: string;
} | null): string | null {
  if (!opp) return null;
  if (opp.noticeId) {
    const match = opp.noticeId.match(/([a-f0-9]{32})/i);
    if (match) return match[1];
  }
  if (opp.sourceLink) {
    const match = opp.sourceLink.match(/(?:opp|contract\/opp)\/([a-f0-9]{32})/i);
    if (match) return match[1];
  }
  if ((opp as any).samUrl) {
    const match = (opp as any).samUrl.match(/(?:opp|contract\/opp)\/([a-f0-9]{32})/i);
    if (match) return match[1];
  }
  if ((opp as any).uiLink) {
    const match = (opp as any).uiLink.match(/(?:opp|contract\/opp)\/([a-f0-9]{32})/i);
    if (match) return match[1];
  }
  return null;
}

export function getSafeSamGovUrl(opp: {
  noticeId?: string;
  solicitationNumber?: string;
  title?: string;
  sourceLink?: string;
  samUrl?: string;
}): string {
  const sol = cleanSolicitationNumber(opp.solicitationNumber);
  const directUUID = extractSamNoticeUUID(opp);

  if (directUUID) {
    // Appends official solicitation number to direct SAM.gov notice link
    return sol
      ? `https://sam.gov/opp/${directUUID}/view?solicitationNumber=${encodeURIComponent(sol)}`
      : `https://sam.gov/opp/${directUUID}/view`;
  }

  // Canonical SAM.gov web search link without conflicting filters or status flags
  const query = sol || opp.title || opp.noticeId || '';
  return `https://sam.gov/search/?index=opp&page=1&sort=-modifiedDate&size=25&q=${encodeURIComponent(query)}`;
}

export function getSamSearchUrl(query: string, solicitationNumber?: string): string {
  const cleanQuery = (query || '').trim();
  const sol = cleanSolicitationNumber(solicitationNumber || cleanQuery);
  const searchTerm = sol || cleanQuery;
  return `https://sam.gov/search/?index=opp&page=1&sort=-modifiedDate&size=25&q=${encodeURIComponent(searchTerm)}`;
}

export function getDirectSolicitationUrl(solicitationNumber: string): string {
  const sol = cleanSolicitationNumber(solicitationNumber);
  return `https://sam.gov/search/?index=opp&page=1&sort=-modifiedDate&size=25&q=${encodeURIComponent(sol)}`;
}

