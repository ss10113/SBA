/**
 * Safe SAM.gov URL and Link Resolution Utility
 * 
 * Rules for SAM.gov URLs:
 * 1. SAM.gov only recognizes 32-character hexadecimal alphanumeric UUIDs in `/opp/:id/view`.
 *    If an ID is NOT 32 hex chars (such as a solicitation number like W912P826R0042 or HT003826SC005),
 *    navigating to `/opp/:id/view` results in an immediate HTTP 404 Error on SAM.gov.
 * 2. SAM.gov internal workspace links (`https://sam.gov/workspace/contract/opp/.../view`) require
 *    an active SAM login session and return 404 or a redirect wall to public visitors.
 * 3. The canonical, guaranteed non-404 public search endpoint on SAM.gov is:
 *    `https://sam.gov/search/?index=opp&page=1&sort=-modifiedDate&size=25&q=${encodeURIComponent(query)}`
 *    which immediately displays the live notice package and attachments.
 */

export function isDirectSamGovNoticeId(id?: string | null): boolean {
  if (!id) return false;
  return /^[a-f0-9]{32}$/i.test(id.trim());
}

export function extractSamNoticeUUID(opp?: {
  noticeId?: string;
  sourceLink?: string;
} | null): string | null {
  if (!opp) return null;
  if (opp.noticeId) {
    const match = opp.noticeId.match(/([a-f0-9]{32})/i);
    if (match) return match[1];
  }
  if (opp.sourceLink) {
    const match = opp.sourceLink.match(/(?:opp|contract\/opp)\/([a-f0-9]{32})\/view/i);
    if (match) return match[1];
  }
  return null;
}

export function getSafeSamGovUrl(opp: {
  noticeId?: string;
  solicitationNumber?: string;
  title?: string;
  sourceLink?: string;
}): string {
  // If a direct 32-character hex SAM UUID exists, link directly to the official notice
  const directUUID = extractSamNoticeUUID(opp);
  if (directUUID) {
    return `https://sam.gov/opp/${directUUID}/view`;
  }

  // Fall back safely to live SAM.gov search to prevent 404 error
  const sol = opp.solicitationNumber || '';
  const baseSol = sol.split('-AOI')[0].split('_AOI')[0].trim();
  const query = baseSol || sol || opp.title || opp.noticeId || '';
  return `https://sam.gov/search/?index=opp&page=1&sort=-modifiedDate&size=25&q=${encodeURIComponent(query.trim())}`;
}

export function getSamSearchUrl(query: string): string {
  const clean = query.trim();
  const baseSol = clean.split('-AOI')[0].split('_AOI')[0].trim();
  return `https://sam.gov/search/?index=opp&page=1&sort=-modifiedDate&size=25&q=${encodeURIComponent(baseSol || clean)}`;
}
