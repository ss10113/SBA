import { SAMOpportunity, BusinessProfile, FitScore } from '../types/contract';

const CLEARANCE_LEVELS: Record<string, number> = {
  'None': 0,
  'Public Trust': 1,
  'Secret': 2,
  'Top Secret': 3,
  'TS/SCI': 4,
};

export function calculateFitScore(opportunity: SAMOpportunity, profile: BusinessProfile): FitScore {
  let score = 0;
  const matchHighlights: string[] = [];
  const riskWarnings: string[] = [];

  // 1. NAICS Code Matching (Up to 35 pts)
  let naicsMatch = false;
  const oppNaics = String(opportunity?.naicsCode || '541512').trim();
  const naicsTitle = opportunity?.naicsTitle || 'Commercial & Government Services';
  const profilePrimary = String(profile?.primaryNaics || '541512').trim();
  const profileSecondaries = (profile?.secondaryNaics || []).map((s) => String(s.code || '').trim());

  if (profilePrimary === oppNaics) {
    score += 35;
    naicsMatch = true;
    matchHighlights.push(`Direct Primary NAICS Match: ${oppNaics} (${naicsTitle})`);
  } else if (profileSecondaries.includes(oppNaics)) {
    score += 28;
    naicsMatch = true;
    matchHighlights.push(`Secondary NAICS Code Alignment: ${oppNaics} (${naicsTitle})`);
  } else if (profilePrimary.substring(0, 4) === oppNaics.substring(0, 4)) {
    score += 18;
    naicsMatch = true;
    matchHighlights.push(`Related 4-Digit Industry Subsector (${oppNaics.substring(0, 4)}XX)`);
  } else {
    riskWarnings.push(`NAICS ${oppNaics} is outside your registered primary & secondary codes`);
  }

  // 2. Set-Aside Matching (Up to 30 pts)
  let setAsideMatch = false;
  const oppSetAside = String(opportunity?.setAside || 'Full and Open / Unrestricted');
  const certs = (profile?.certifications || []).map((c) => String(c).toLowerCase());

  if (oppSetAside === 'Full and Open / Unrestricted') {
    score += 15;
    setAsideMatch = true;
    matchHighlights.push('Open Competition (Large and small firms compete)');
  } else if (oppSetAside === 'Total Small Business') {
    score += 28;
    setAsideMatch = true;
    matchHighlights.push('Total Small Business Set-Aside: Immediate eligibility under FAR 19.5');
  } else if (
    (oppSetAside.includes('8(a)') && certs.some((c) => c.includes('8(a)') || c.includes('8a'))) ||
    (oppSetAside.includes('SDVOSB') && certs.some((c) => c.includes('sdvosb') || c.includes('service-disabled'))) ||
    (oppSetAside.includes('WOSB') && certs.some((c) => c.includes('wosb') || c.includes('women'))) ||
    (oppSetAside.includes('HUBZone') && certs.some((c) => c.includes('hubzone'))) ||
    (oppSetAside.includes('VOSB') && certs.some((c) => c.includes('vosb') || c.includes('veteran')))
  ) {
    score += 30;
    setAsideMatch = true;
    matchHighlights.push(`Direct Socioeconomic Advantage: Qualified for ${oppSetAside}`);
  } else {
    riskWarnings.push(`Restricted Set-Aside: ${oppSetAside} (Requires qualification or joint venture)`);
  }

  // 3. Location / Target States (Up to 15 pts)
  let locationMatch = false;
  const oppState = String(opportunity?.placeOfPerformance?.state || '').toUpperCase();
  const profileState = String(profile?.state || '').toUpperCase();
  const targetStates = (profile?.targetStates || []).map((s) => String(s).toUpperCase());

  if (profileState && profileState === oppState) {
    score += 15;
    locationMatch = true;
    matchHighlights.push(`Home State Advantage: Performance in ${oppState} matches headquarters`);
  } else if (oppState && targetStates.includes(oppState)) {
    score += 12;
    locationMatch = true;
    matchHighlights.push(`Target Territory: Performance in ${oppState} matches your target list`);
  } else if (!oppState) {
    score += 10;
    locationMatch = true;
  } else {
    score += 5;
    riskWarnings.push(`Place of performance (${oppState}) is outside current primary state footprint`);
  }

  // 4. Security Clearance (Up to 10 pts)
  let clearanceMatch = true;
  const requiredClearance = opportunity?.requiredClearance || 'None';
  const profileClearance = profile?.securityClearance || 'None';
  const oppClearanceVal = CLEARANCE_LEVELS[requiredClearance] || 0;
  const profileClearanceVal = CLEARANCE_LEVELS[profileClearance] || 0;

  if (profileClearanceVal >= oppClearanceVal) {
    score += 10;
    matchHighlights.push(`Clearance Validated: Profile holds ${profileClearance} (Required: ${requiredClearance})`);
  } else {
    clearanceMatch = false;
    riskWarnings.push(`Clearance Gap: Requires ${requiredClearance}, profile holds ${profileClearance}`);
  }

  // 5. Capability Overlap & Keyword Synergy (Up to 10 pts)
  let capabilityOverlapCount = 0;
  const combinedOppText = `${opportunity?.title || ''} ${opportunity?.description || ''} ${(opportunity?.scopeBullets || []).join(' ')}`.toLowerCase();

  (profile?.coreCapabilities || []).forEach((cap) => {
    const keywords = String(cap).toLowerCase().split(/[\s,&/()]+/);
    const hasMatch = keywords.some((kw) => kw.length > 3 && combinedOppText.includes(kw));
    if (hasMatch) {
      capabilityOverlapCount++;
    }
  });

  const capPoints = Math.min(10, capabilityOverlapCount * 3);
  score += capPoints;
  if (capabilityOverlapCount > 0) {
    matchHighlights.push(`Identified ${capabilityOverlapCount} relevant capability intersections with SOW`);
  }

  // 6. Bonding Check (Warning for high value construction)
  const valMag = Number(opportunity?.valueMagnitude) || 0;
  const bondingSingle = Number(profile?.bondingCapacitySingle) || 0;
  if (oppNaics.startsWith('23') && bondingSingle > 0) {
    if (valMag > bondingSingle) {
      riskWarnings.push(`Bonding Threshold: Contract ceiling ($${(valMag / 1000000).toFixed(1)}M) exceeds single project bonding ($${(bondingSingle / 1000000).toFixed(1)}M)`);
    }
  }

  const finalScore = Math.min(100, Math.max(0, Math.round(score)));

  return {
    overallScore: finalScore,
    naicsMatch,
    setAsideMatch,
    locationMatch,
    clearanceMatch,
    capabilityOverlapCount,
    matchHighlights,
    riskWarnings,
  };
}
