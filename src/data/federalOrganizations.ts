import type { SAMOpportunity } from '../types/contract.ts';

export interface FederalOrganization {
  name: string; // Canonical name matching SAM.gov API / FPDS
  code: string; // Official 3-digit Federal CGAC Agency Code (e.g. '097', '047', '012')
  displayName: string; // User-facing name with acronym and 3-digit CGAC code
  acronym: string;
  category: 'Cabinet Departments' | 'Military & Defense' | 'Independent Agencies' | 'Major Bureaus & Commands' | 'Legislative & Judicial';
  parentDepartment?: string;
  aliases: string[];
}

export const FEDERAL_ORGANIZATIONS: FederalOrganization[] = [
  // ==========================================
  // 1. EXECUTIVE CABINET DEPARTMENTS (15)
  // ==========================================
  {
    name: 'DEPARTMENT OF AGRICULTURE',
    code: '012',
    displayName: 'Department of Agriculture (USDA) [Code: 012]',
    acronym: 'USDA',
    category: 'Cabinet Departments',
    aliases: ['usda', 'agriculture', 'farming', 'forestry', '012', '12', '1200'],
  },
  {
    name: 'DEPARTMENT OF COMMERCE',
    code: '013',
    displayName: 'Department of Commerce (DOC) [Code: 013]',
    acronym: 'DOC',
    category: 'Cabinet Departments',
    aliases: ['doc', 'commerce', 'trade', 'census', 'noaa', 'nist', '013', '13', '1300'],
  },
  {
    name: 'DEPARTMENT OF DEFENSE',
    code: '097',
    displayName: 'Department of Defense (DOD) [Code: 097]',
    acronym: 'DOD',
    category: 'Cabinet Departments',
    aliases: ['dod', 'defense', 'pentagon', 'military', 'war', '097', '97', '9700'],
  },
  {
    name: 'DEPARTMENT OF EDUCATION',
    code: '091',
    displayName: 'Department of Education (ED) [Code: 091]',
    acronym: 'ED',
    category: 'Cabinet Departments',
    aliases: ['ed', 'education', 'schools', 'student aid', '091', '91', '9100'],
  },
  {
    name: 'DEPARTMENT OF ENERGY',
    code: '089',
    displayName: 'Department of Energy (DOE) [Code: 089]',
    acronym: 'DOE',
    category: 'Cabinet Departments',
    aliases: ['doe', 'energy', 'nuke', 'nnsa', 'national labs', 'clean energy', '089', '89', '8900'],
  },
  {
    name: 'DEPARTMENT OF HEALTH AND HUMAN SERVICES',
    code: '075',
    displayName: 'Department of Health & Human Services (HHS) [Code: 075]',
    acronym: 'HHS',
    category: 'Cabinet Departments',
    aliases: ['hhs', 'health', 'human services', 'nih', 'cdc', 'fda', 'cms', '075', '75', '7500'],
  },
  {
    name: 'DEPARTMENT OF HOMELAND SECURITY',
    code: '070',
    displayName: 'Department of Homeland Security (DHS) [Code: 070]',
    acronym: 'DHS',
    category: 'Cabinet Departments',
    aliases: ['dhs', 'homeland', 'security', 'fema', 'cisa', 'cbp', 'tsa', 'uscg', '070', '70', '7000'],
  },
  {
    name: 'DEPARTMENT OF HOUSING AND URBAN DEVELOPMENT',
    code: '086',
    displayName: 'Department of Housing & Urban Development (HUD) [Code: 086]',
    acronym: 'HUD',
    category: 'Cabinet Departments',
    aliases: ['hud', 'housing', 'urban', 'mortgage', 'fha', '086', '86', '8600'],
  },
  {
    name: 'DEPARTMENT OF THE INTERIOR',
    code: '014',
    displayName: 'Department of the Interior (DOI) [Code: 014]',
    acronym: 'DOI',
    category: 'Cabinet Departments',
    aliases: ['doi', 'interior', 'national parks', 'blm', 'usgs', 'fish and wildlife', '014', '14', '1400'],
  },
  {
    name: 'DEPARTMENT OF JUSTICE',
    code: '015',
    displayName: 'Department of Justice (DOJ) [Code: 015]',
    acronym: 'DOJ',
    category: 'Cabinet Departments',
    aliases: ['doj', 'justice', 'fbi', 'dea', 'atf', 'bop', 'marshals', 'law enforcement', '015', '15', '1500'],
  },
  {
    name: 'DEPARTMENT OF LABOR',
    code: '016',
    displayName: 'Department of Labor (DOL) [Code: 016]',
    acronym: 'DOL',
    category: 'Cabinet Departments',
    aliases: ['dol', 'labor', 'workforce', 'osha', 'bls', 'employment', '016', '16', '1600'],
  },
  {
    name: 'DEPARTMENT OF STATE',
    code: '019',
    displayName: 'Department of State (DOS) [Code: 019]',
    acronym: 'DOS',
    category: 'Cabinet Departments',
    aliases: ['dos', 'state', 'diplomacy', 'embassy', 'foreign affairs', 'usaid', '019', '19', '1900'],
  },
  {
    name: 'DEPARTMENT OF TRANSPORTATION',
    code: '069',
    displayName: 'Department of Transportation (DOT) [Code: 069]',
    acronym: 'DOT',
    category: 'Cabinet Departments',
    aliases: ['dot', 'transportation', 'faa', 'fhwa', 'transit', 'aviation', 'highways', '069', '69', '6900'],
  },
  {
    name: 'DEPARTMENT OF THE TREASURY',
    code: '020',
    displayName: 'Department of the Treasury (USDT) [Code: 020]',
    acronym: 'TREAS',
    category: 'Cabinet Departments',
    aliases: ['treasury', 'treas', 'irs', 'mint', 'fiscal service', 'finance', '020', '20', '2000'],
  },
  {
    name: 'DEPARTMENT OF VETERANS AFFAIRS',
    code: '036',
    displayName: 'Department of Veterans Affairs (VA) [Code: 036]',
    acronym: 'VA',
    category: 'Cabinet Departments',
    aliases: ['va', 'veterans', 'vha', 'vba', 'veteran affairs', 'medical center', '036', '36', '3600'],
  },

  // ==========================================
  // 2. MILITARY DEPARTMENTS & DEFENSE COMPONENTS
  // ==========================================
  {
    name: 'DEPT OF THE ARMY',
    code: '021',
    displayName: 'Department of the Army (USA) [Code: 021]',
    acronym: 'USA',
    category: 'Military & Defense',
    parentDepartment: 'DEPARTMENT OF DEFENSE',
    aliases: ['army', 'dept of the army', 'us army', 'soldiers', '021', '21', '2100'],
  },
  {
    name: 'DEPT OF THE NAVY',
    code: '017',
    displayName: 'Department of the Navy (USN / USMC) [Code: 017]',
    acronym: 'USN',
    category: 'Military & Defense',
    parentDepartment: 'DEPARTMENT OF DEFENSE',
    aliases: ['navy', 'dept of the navy', 'us navy', 'marine corps', 'usmc', 'marines', '017', '17', '1700'],
  },
  {
    name: 'DEPARTMENT OF THE AIR FORCE',
    code: '057',
    displayName: 'Department of the Air Force (USAF / USSF) [Code: 057]',
    acronym: 'USAF',
    category: 'Military & Defense',
    parentDepartment: 'DEPARTMENT OF DEFENSE',
    aliases: ['air force', 'usaf', 'space force', 'ussf', 'aerospace', '057', '57', '5700'],
  },
  {
    name: 'DEFENSE LOGISTICS AGENCY',
    code: '097',
    displayName: 'Defense Logistics Agency (DLA) [Code: 097]',
    acronym: 'DLA',
    category: 'Military & Defense',
    parentDepartment: 'DEPARTMENT OF DEFENSE',
    aliases: ['dla', 'defense logistics', 'supply chain', 'troop support', '097', '97as', '97ak'],
  },
  {
    name: 'DEFENSE INFORMATION SYSTEMS AGENCY',
    code: '097',
    displayName: 'Defense Information Systems Agency (DISA) [Code: 097]',
    acronym: 'DISA',
    category: 'Military & Defense',
    parentDepartment: 'DEPARTMENT OF DEFENSE',
    aliases: ['disa', 'defense information systems', 'jedi', 'dod cloud', 'cyber defense', '097', '97aq'],
  },
  {
    name: 'DEFENSE HEALTH AGENCY',
    code: '097',
    displayName: 'Defense Health Agency (DHA) [Code: 097]',
    acronym: 'DHA',
    category: 'Military & Defense',
    parentDepartment: 'DEPARTMENT OF DEFENSE',
    aliases: ['dha', 'defense health', 'military medicine', 'tricare', '097', '97jc'],
  },
  {
    name: 'DEFENSE ADVANCED RESEARCH PROJECTS AGENCY',
    code: '097',
    displayName: 'Defense Advanced Research Projects Agency (DARPA) [Code: 097]',
    acronym: 'DARPA',
    category: 'Military & Defense',
    parentDepartment: 'DEPARTMENT OF DEFENSE',
    aliases: ['darpa', 'research projects', 'defense r&d', 'breakthrough', '097', '9763'],
  },
  {
    name: 'DEFENSE THREAT REDUCTION AGENCY',
    code: '097',
    displayName: 'Defense Threat Reduction Agency (DTRA) [Code: 097]',
    acronym: 'DTRA',
    category: 'Military & Defense',
    parentDepartment: 'DEPARTMENT OF DEFENSE',
    aliases: ['dtra', 'threat reduction', 'wmd', 'counter-wmd', '097', '97az'],
  },
  {
    name: 'DEFENSE CONTRACT MANAGEMENT AGENCY',
    code: '097',
    displayName: 'Defense Contract Management Agency (DCMA) [Code: 097]',
    acronym: 'DCMA',
    category: 'Military & Defense',
    parentDepartment: 'DEPARTMENT OF DEFENSE',
    aliases: ['dcma', 'contract management', 'procurement administration', '097', '97cg'],
  },
  {
    name: 'DEFENSE INTELLIGENCE AGENCY',
    code: '097',
    displayName: 'Defense Intelligence Agency (DIA) [Code: 097]',
    acronym: 'DIA',
    category: 'Military & Defense',
    parentDepartment: 'DEPARTMENT OF DEFENSE',
    aliases: ['dia', 'defense intelligence', 'military intelligence', '097', '9761'],
  },
  {
    name: 'DEFENSE SECURITY COOPERATION AGENCY',
    code: '097',
    displayName: 'Defense Security Cooperation Agency (DSCA) [Code: 097]',
    acronym: 'DSCA',
    category: 'Military & Defense',
    parentDepartment: 'DEPARTMENT OF DEFENSE',
    aliases: ['dsca', 'foreign military sales', 'fms', 'security cooperation', '097', '9780'],
  },
  {
    name: 'NATIONAL GEOSPATIAL-INTELLIGENCE AGENCY',
    code: '097',
    displayName: 'National Geospatial-Intelligence Agency (NGA) [Code: 097]',
    acronym: 'NGA',
    category: 'Military & Defense',
    parentDepartment: 'DEPARTMENT OF DEFENSE',
    aliases: ['nga', 'geospatial', 'mapping', 'imagery intelligence', '097', '97cg'],
  },
  {
    name: 'NATIONAL SECURITY AGENCY',
    code: '097',
    displayName: 'National Security Agency / CSS (NSA) [Code: 097]',
    acronym: 'NSA',
    category: 'Military & Defense',
    parentDepartment: 'DEPARTMENT OF DEFENSE',
    aliases: ['nsa', 'national security agency', 'cryptology', 'sigint', '097', '9740'],
  },
  {
    name: 'MISSILE DEFENSE AGENCY',
    code: '097',
    displayName: 'Missile Defense Agency (MDA) [Code: 097]',
    acronym: 'MDA',
    category: 'Military & Defense',
    parentDepartment: 'DEPARTMENT OF DEFENSE',
    aliases: ['mda', 'missile defense', 'ballistic missile', '097', '9764'],
  },
  {
    name: 'SPACE DEVELOPMENT AGENCY',
    code: '097',
    displayName: 'Space Development Agency (SDA) [Code: 097]',
    acronym: 'SDA',
    category: 'Military & Defense',
    parentDepartment: 'DEPARTMENT OF DEFENSE',
    aliases: ['sda', 'space development', 'satellite constellation', 'proliferated warfighter', '097', '97ab'],
  },
  {
    name: 'US ARMY CORPS OF ENGINEERS',
    code: '096',
    displayName: 'U.S. Army Corps of Engineers (USACE) [Code: 096]',
    acronym: 'USACE',
    category: 'Military & Defense',
    parentDepartment: 'DEPARTMENT OF DEFENSE',
    aliases: ['usace', 'corps of engineers', 'civil works', 'army engineers', 'dredging', '096', '96ce', '021'],
  },
  {
    name: 'NAVAL FACILITIES ENGINEERING SYSTEMS COMMAND',
    code: '017',
    displayName: 'Naval Facilities Engineering Systems Command (NAVFAC) [Code: 017]',
    acronym: 'NAVFAC',
    category: 'Military & Defense',
    parentDepartment: 'DEPARTMENT OF DEFENSE',
    aliases: ['navfac', 'naval facilities', 'navy construction', 'public works', '017', '1724', '1700'],
  },
  {
    name: 'NAVAL SEA SYSTEMS COMMAND',
    code: '017',
    displayName: 'Naval Sea Systems Command (NAVSEA) [Code: 017]',
    acronym: 'NAVSEA',
    category: 'Military & Defense',
    parentDepartment: 'DEPARTMENT OF DEFENSE',
    aliases: ['navsea', 'naval sea', 'shipbuilding', 'shipyard', '017', '1722'],
  },
  {
    name: 'NAVAL AIR SYSTEMS COMMAND',
    code: '017',
    displayName: 'Naval Air Systems Command (NAVAIR) [Code: 017]',
    acronym: 'NAVAIR',
    category: 'Military & Defense',
    parentDepartment: 'DEPARTMENT OF DEFENSE',
    aliases: ['navair', 'naval air', 'naval aviation', '017', '1721'],
  },
  {
    name: 'AIR FORCE MATERIEL COMMAND',
    code: '057',
    displayName: 'Air Force Materiel Command (AFMC) [Code: 057]',
    acronym: 'AFMC',
    category: 'Military & Defense',
    parentDepartment: 'DEPARTMENT OF DEFENSE',
    aliases: ['afmc', 'air force materiel', 'aflcmc', 'afmc wpafb', '057', '5700'],
  },

  // ==========================================
  // 3. MAJOR INDEPENDENT AGENCIES & COMMISSIONS
  // ==========================================
  {
    name: 'GENERAL SERVICES ADMINISTRATION',
    code: '047',
    displayName: 'General Services Administration (GSA) [Code: 047]',
    acronym: 'GSA',
    category: 'Independent Agencies',
    aliases: ['gsa', 'general services', 'fas', 'pbs', 'federal supply schedule', 'mas', '047', '47', '4700'],
  },
  {
    name: 'NATIONAL AERONAUTICS AND SPACE ADMINISTRATION',
    code: '080',
    displayName: 'NASA [Code: 080]',
    acronym: 'NASA',
    category: 'Independent Agencies',
    aliases: ['nasa', 'space', 'aeronautics', 'artemis', 'kennedy', 'johnson', 'goddard', '080', '80', '8000'],
  },
  {
    name: 'SMALL BUSINESS ADMINISTRATION',
    code: '073',
    displayName: 'Small Business Administration (SBA) [Code: 073]',
    acronym: 'SBA',
    category: 'Independent Agencies',
    aliases: ['sba', 'small business', '8a', 'hubzone', 'wosb', 'sdvosb', 'sbir', '073', '73', '7300'],
  },
  {
    name: 'ENVIRONMENTAL PROTECTION AGENCY',
    code: '068',
    displayName: 'Environmental Protection Agency (EPA) [Code: 068]',
    acronym: 'EPA',
    category: 'Independent Agencies',
    aliases: ['epa', 'environment', 'pollution', 'water', 'superfund', 'clean air', '068', '68', '6800'],
  },
  {
    name: 'SOCIAL SECURITY ADMINISTRATION',
    code: '028',
    displayName: 'Social Security Administration (SSA) [Code: 028]',
    acronym: 'SSA',
    category: 'Independent Agencies',
    aliases: ['ssa', 'social security', 'disability', 'retirement benefits', '028', '28', '2800'],
  },
  {
    name: 'NATIONAL SCIENCE FOUNDATION',
    code: '049',
    displayName: 'National Science Foundation (NSF) [Code: 049]',
    acronym: 'NSF',
    category: 'Independent Agencies',
    aliases: ['nsf', 'science foundation', 'scientific research', 'stem', '049', '49', '4900'],
  },
  {
    name: 'NUCLEAR REGULATORY COMMISSION',
    code: '031',
    displayName: 'Nuclear Regulatory Commission (NRC) [Code: 031]',
    acronym: 'NRC',
    category: 'Independent Agencies',
    aliases: ['nrc', 'nuclear regulatory', 'nuclear safety', 'reactors', '031', '31', '3100'],
  },
  {
    name: 'AGENCY FOR INTERNATIONAL DEVELOPMENT',
    code: '072',
    displayName: 'U.S. Agency for Int\'l Development (USAID) [Code: 072]',
    acronym: 'USAID',
    category: 'Independent Agencies',
    aliases: ['usaid', 'international development', 'foreign assistance', 'global aid', '072', '72', '7200'],
  },
  {
    name: 'OFFICE OF PERSONNEL MANAGEMENT',
    code: '024',
    displayName: 'Office of Personnel Management (OPM) [Code: 024]',
    acronym: 'OPM',
    category: 'Independent Agencies',
    aliases: ['opm', 'personnel', 'civil service', 'federal hiring', 'usajobs', '024', '24', '2400'],
  },
  {
    name: 'NATIONAL ARCHIVES AND RECORDS ADMINISTRATION',
    code: '088',
    displayName: 'National Archives & Records Admin (NARA) [Code: 088]',
    acronym: 'NARA',
    category: 'Independent Agencies',
    aliases: ['nara', 'national archives', 'federal records', 'presidential libraries', '088', '88', '8800'],
  },
  {
    name: 'FEDERAL COMMUNICATIONS COMMISSION',
    code: '027',
    displayName: 'Federal Communications Commission (FCC) [Code: 027]',
    acronym: 'FCC',
    category: 'Independent Agencies',
    aliases: ['fcc', 'communications', 'telecom', 'spectrum', 'broadband', '027', '27', '2700'],
  },
  {
    name: 'FEDERAL TRADE COMMISSION',
    code: '029',
    displayName: 'Federal Trade Commission (FTC) [Code: 029]',
    acronym: 'FTC',
    category: 'Independent Agencies',
    aliases: ['ftc', 'trade commission', 'antitrust', 'consumer protection', '029', '29', '2900'],
  },
  {
    name: 'EQUAL EMPLOYMENT OPPORTUNITY COMMISSION',
    code: '045',
    displayName: 'Equal Employment Opportunity Commission (EEOC) [Code: 045]',
    acronym: 'EEOC',
    category: 'Independent Agencies',
    aliases: ['eeoc', 'equal employment', 'workplace discrimination', '045', '45', '4500'],
  },
  {
    name: 'SECURITIES AND EXCHANGE COMMISSION',
    code: '050',
    displayName: 'Securities and Exchange Commission (SEC) [Code: 050]',
    acronym: 'SEC',
    category: 'Independent Agencies',
    aliases: ['sec', 'securities', 'financial regulation', 'wall street', 'edgar', '050', '50', '5000'],
  },
  {
    name: 'COMMODITY FUTURES TRADING COMMISSION',
    code: '339',
    displayName: 'Commodity Futures Trading Commission (CFTC) [Code: 339]',
    acronym: 'CFTC',
    category: 'Independent Agencies',
    aliases: ['cftc', 'derivatives', 'commodities', 'futures', '339', '9507'],
  },
  {
    name: 'CONSUMER PRODUCT SAFETY COMMISSION',
    code: '061',
    displayName: 'Consumer Product Safety Commission (CPSC) [Code: 061]',
    acronym: 'CPSC',
    category: 'Independent Agencies',
    aliases: ['cpsc', 'product safety', 'recalls', 'consumer safety', '061', '61', '6100'],
  },
  {
    name: 'CONSUMER FINANCIAL PROTECTION BUREAU',
    code: '581',
    displayName: 'Consumer Financial Protection Bureau (CFPB) [Code: 581]',
    acronym: 'CFPB',
    category: 'Independent Agencies',
    aliases: ['cfpb', 'consumer finance', 'banking protection', 'lending', '581', '9559'],
  },
  {
    name: 'FEDERAL ENERGY REGULATORY COMMISSION',
    code: '089',
    displayName: 'Federal Energy Regulatory Commission (FERC) [Code: 089]',
    acronym: 'FERC',
    category: 'Independent Agencies',
    aliases: ['ferc', 'energy regulatory', 'pipeline', 'electric grid', '089', '8990'],
  },
  {
    name: 'FEDERAL RESERVE SYSTEM',
    code: '095',
    displayName: 'Federal Reserve System (FRB) [Code: 095]',
    acronym: 'FRB',
    category: 'Independent Agencies',
    aliases: ['fed', 'federal reserve', 'central bank', 'monetary policy', '095', '9558'],
  },
  {
    name: 'NATIONAL TRANSPORTATION SAFETY BOARD',
    code: '063',
    displayName: 'National Transportation Safety Board (NTSB) [Code: 063]',
    acronym: 'NTSB',
    category: 'Independent Agencies',
    aliases: ['ntsb', 'transportation safety', 'crash investigations', '063', '63', '6300'],
  },
  {
    name: 'SMITHSONIAN INSTITUTION',
    code: '033',
    displayName: 'Smithsonian Institution [Code: 033]',
    acronym: 'SI',
    category: 'Independent Agencies',
    aliases: ['smithsonian', 'museums', 'national zoo', 'cultural heritage', '033', '33', '3300'],
  },
  {
    name: 'PEACE CORPS',
    code: '011',
    displayName: 'Peace Corps [Code: 011]',
    acronym: 'PC',
    category: 'Independent Agencies',
    aliases: ['peace corps', 'international volunteer', '011', '11', '1145'],
  },
  {
    name: 'TENNESSEE VALLEY AUTHORITY',
    code: '064',
    displayName: 'Tennessee Valley Authority (TVA) [Code: 064]',
    acronym: 'TVA',
    category: 'Independent Agencies',
    aliases: ['tva', 'tennessee valley', 'hydroelectric', 'public power', '064', '64', '6400'],
  },
  {
    name: 'CORPORATION FOR NATIONAL AND COMMUNITY SERVICE',
    code: '085',
    displayName: 'AmeriCorps / CNCS [Code: 085]',
    acronym: 'CNCS',
    category: 'Independent Agencies',
    aliases: ['americorps', 'cncs', 'national service', 'community service', '085', '85', '9543'],
  },
  {
    name: 'EXPORT-IMPORT BANK OF THE UNITED STATES',
    code: '083',
    displayName: 'Export-Import Bank of the U.S. (EXIM) [Code: 083]',
    acronym: 'EXIM',
    category: 'Independent Agencies',
    aliases: ['exim', 'export import bank', 'trade finance', '083', '83', '8300'],
  },
  {
    name: 'RAILROAD RETIREMENT BOARD',
    code: '060',
    displayName: 'Railroad Retirement Board (RRB) [Code: 060]',
    acronym: 'RRB',
    category: 'Independent Agencies',
    aliases: ['rrb', 'railroad retirement', '060', '60', '6000'],
  },
  {
    name: 'U.S. INTERNATIONAL DEVELOPMENT FINANCE CORPORATION',
    code: '071',
    displayName: 'U.S. Int\'l Development Finance Corp (DFC) [Code: 071]',
    acronym: 'DFC',
    category: 'Independent Agencies',
    aliases: ['dfc', 'opic', 'development finance', 'private investment', '071', '71', '9568'],
  },
  {
    name: 'MILLENNIUM CHALLENGE CORPORATION',
    code: '524',
    displayName: 'Millennium Challenge Corporation (MCC) [Code: 524]',
    acronym: 'MCC',
    category: 'Independent Agencies',
    aliases: ['mcc', 'millennium challenge', 'poverty reduction grants', '524', '9544'],
  },
  {
    name: 'COURT SERVICES AND OFFENDER SUPERVISION AGENCY',
    code: '512',
    displayName: 'Court Services & Offender Supervision (CSOSA) [Code: 512]',
    acronym: 'CSOSA',
    category: 'Independent Agencies',
    aliases: ['csosa', 'court services', 'offender supervision', '512', '9542'],
  },
  {
    name: 'U.S. AGENCY FOR GLOBAL MEDIA',
    code: '514',
    displayName: 'U.S. Agency for Global Media (USAGM) [Code: 514]',
    acronym: 'USAGM',
    category: 'Independent Agencies',
    aliases: ['usagm', 'voa', 'voice of america', 'broadcasting board', '514', '9537'],
  },
  {
    name: 'SELECTIVE SERVICE SYSTEM',
    code: '090',
    displayName: 'Selective Service System (SSS) [Code: 090]',
    acronym: 'SSS',
    category: 'Independent Agencies',
    aliases: ['sss', 'selective service', 'military draft', '090', '90', '9000'],
  },
  {
    name: 'FARM CREDIT ADMINISTRATION',
    code: '078',
    displayName: 'Farm Credit Administration (FCA) [Code: 078]',
    acronym: 'FCA',
    category: 'Independent Agencies',
    aliases: ['fca', 'farm credit', '078', '78', '7800'],
  },
  {
    name: 'NATIONAL ENDOWMENT FOR THE ARTS',
    code: '059',
    displayName: 'National Endowment for the Arts (NEA) [Code: 059]',
    acronym: 'NEA',
    category: 'Independent Agencies',
    aliases: ['nea', 'arts endowment', 'cultural funding', '059', '59', '5900'],
  },
  {
    name: 'NATIONAL ENDOWMENT FOR THE HUMANITIES',
    code: '059',
    displayName: 'National Endowment for the Humanities (NEH) [Code: 059]',
    acronym: 'NEH',
    category: 'Independent Agencies',
    aliases: ['neh', 'humanities endowment', '059', '59', '5900'],
  },
  {
    name: 'OFFICE OF THE DIRECTOR OF NATIONAL INTELLIGENCE',
    code: '474',
    displayName: 'Office of the Director of Nat\'l Intel (ODNI) [Code: 474]',
    acronym: 'ODNI',
    category: 'Independent Agencies',
    aliases: ['odni', 'national intelligence', 'intelligence community', '474', '9547'],
  },
  {
    name: 'FEDERAL RETIREMENT THRIFT INVESTMENT BOARD',
    code: '026',
    displayName: 'Federal Retirement Thrift Investment (FRTIB) [Code: 026]',
    acronym: 'FRTIB',
    category: 'Independent Agencies',
    aliases: ['frtib', 'tsp', 'thrift savings plan', '026', '26', '9541'],
  },
  {
    name: 'NATIONAL LABOR RELATIONS BOARD',
    code: '063',
    displayName: 'National Labor Relations Board (NLRB) [Code: 063]',
    acronym: 'NLRB',
    category: 'Independent Agencies',
    aliases: ['nlrb', 'labor relations', 'unions', '063', '63'],
  },
  {
    name: 'OCCUPATIONAL SAFETY AND HEALTH REVIEW COMMISSION',
    code: '347',
    displayName: 'Occupational Safety & Health Review (OSHRC) [Code: 347]',
    acronym: 'OSHRC',
    category: 'Independent Agencies',
    aliases: ['oshrc', 'occupational safety review', '347', '9524'],
  },
  {
    name: 'MERIT SYSTEMS PROTECTION BOARD',
    code: '041',
    displayName: 'Merit Systems Protection Board (MSPB) [Code: 041]',
    acronym: 'MSPB',
    category: 'Independent Agencies',
    aliases: ['mspb', 'merit systems', 'federal civil service appeal', '041', '41', '4100'],
  },
  {
    name: 'OFFICE OF GOVERNMENT ETHICS',
    code: '350',
    displayName: 'Office of Government Ethics (OGE) [Code: 350]',
    acronym: 'OGE',
    category: 'Independent Agencies',
    aliases: ['oge', 'ethics', 'conflict of interest', '350', '9535'],
  },
  {
    name: 'FEDERAL ELECTION COMMISSION',
    code: '334',
    displayName: 'Federal Election Commission (FEC) [Code: 334]',
    acronym: 'FEC',
    category: 'Independent Agencies',
    aliases: ['fec', 'election commission', 'campaign finance', '334', '9506'],
  },
  {
    name: 'FEDERAL MARITIME COMMISSION',
    code: '065',
    displayName: 'Federal Maritime Commission (FMC) [Code: 065]',
    acronym: 'FMC',
    category: 'Independent Agencies',
    aliases: ['fmc', 'maritime commission', 'ocean commerce', 'shipping', '065', '65', '6500'],
  },
  {
    name: 'POSTAL REGULATORY COMMISSION',
    code: '372',
    displayName: 'Postal Regulatory Commission (PRC) [Code: 372]',
    acronym: 'PRC',
    category: 'Independent Agencies',
    aliases: ['prc', 'postal regulatory', 'postal rates', '372', '9504'],
  },
  {
    name: 'UNITED STATES POSTAL SERVICE',
    code: '018',
    displayName: 'United States Postal Service (USPS) [Code: 018]',
    acronym: 'USPS',
    category: 'Independent Agencies',
    aliases: ['usps', 'postal service', 'post office', 'mail', '018', '18', '1800'],
  },
  {
    name: 'FEDERAL DEPOSIT INSURANCE CORPORATION',
    code: '051',
    displayName: 'Federal Deposit Insurance Corp (FDIC) [Code: 051]',
    acronym: 'FDIC',
    category: 'Independent Agencies',
    aliases: ['fdic', 'bank insurance', 'bank receivership', '051', '51', '5100'],
  },
  {
    name: 'NATIONAL CREDIT UNION ADMINISTRATION',
    code: '025',
    displayName: 'National Credit Union Admin (NCUA) [Code: 025]',
    acronym: 'NCUA',
    category: 'Independent Agencies',
    aliases: ['ncua', 'credit unions', 'credit union insurance', '025', '25', '2500'],
  },

  // ==========================================
  // 4. MAJOR CIVILIAN FEDERAL BUREAUS & PROCURING COMMANDS
  // ==========================================
  {
    name: 'FEDERAL AVIATION ADMINISTRATION',
    code: '069',
    displayName: 'Federal Aviation Administration (FAA) [Code: 069]',
    acronym: 'FAA',
    category: 'Major Bureaus & Commands',
    parentDepartment: 'DEPARTMENT OF TRANSPORTATION',
    aliases: ['faa', 'aviation', 'air traffic control', 'airports', 'nextgen', '069', '6920'],
  },
  {
    name: 'FEDERAL HIGHWAY ADMINISTRATION',
    code: '069',
    displayName: 'Federal Highway Administration (FHWA) [Code: 069]',
    acronym: 'FHWA',
    category: 'Major Bureaus & Commands',
    parentDepartment: 'DEPARTMENT OF TRANSPORTATION',
    aliases: ['fhwa', 'highways', 'roads', 'bridges', '069', '6925'],
  },
  {
    name: 'FEDERAL TRANSIT ADMINISTRATION',
    code: '069',
    displayName: 'Federal Transit Administration (FTA) [Code: 069]',
    acronym: 'FTA',
    category: 'Major Bureaus & Commands',
    parentDepartment: 'DEPARTMENT OF TRANSPORTATION',
    aliases: ['fta', 'transit', 'buses', 'subway', 'public transportation', '069', '6930'],
  },
  {
    name: 'FEDERAL RAILROAD ADMINISTRATION',
    code: '069',
    displayName: 'Federal Railroad Administration (FRA) [Code: 069]',
    acronym: 'FRA',
    category: 'Major Bureaus & Commands',
    parentDepartment: 'DEPARTMENT OF TRANSPORTATION',
    aliases: ['fra', 'railroads', 'trains', 'rail safety', 'amtrak', '069', '6915'],
  },
  {
    name: 'MARITIME ADMINISTRATION',
    code: '069',
    displayName: 'Maritime Administration (MARAD) [Code: 069]',
    acronym: 'MARAD',
    category: 'Major Bureaus & Commands',
    parentDepartment: 'DEPARTMENT OF TRANSPORTATION',
    aliases: ['marad', 'maritime', 'merchant marine', 'sealift', '069', '6938'],
  },
  {
    name: 'FEDERAL EMERGENCY MANAGEMENT AGENCY',
    code: '070',
    displayName: 'Federal Emergency Management Agency (FEMA) [Code: 070]',
    acronym: 'FEMA',
    category: 'Major Bureaus & Commands',
    parentDepartment: 'DEPARTMENT OF HOMELAND SECURITY',
    aliases: ['fema', 'disaster relief', 'emergency management', 'flood insurance', '070', '7022'],
  },
  {
    name: 'CYBERSECURITY AND INFRASTRUCTURE SECURITY AGENCY',
    code: '070',
    displayName: 'Cybersecurity & Infrastructure Security (CISA) [Code: 070]',
    acronym: 'CISA',
    category: 'Major Bureaus & Commands',
    parentDepartment: 'DEPARTMENT OF HOMELAND SECURITY',
    aliases: ['cisa', 'cybersecurity', 'critical infrastructure', 'zero trust', '070', '7008'],
  },
  {
    name: 'CUSTOMS AND BORDER PROTECTION',
    code: '070',
    displayName: 'U.S. Customs & Border Protection (CBP) [Code: 070]',
    acronym: 'CBP',
    category: 'Major Bureaus & Commands',
    parentDepartment: 'DEPARTMENT OF HOMELAND SECURITY',
    aliases: ['cbp', 'customs', 'border patrol', 'ports of entry', '070', '7014'],
  },
  {
    name: 'IMMIGRATION AND CUSTOMS ENFORCEMENT',
    code: '070',
    displayName: 'U.S. Immigration & Customs Enforcement (ICE) [Code: 070]',
    acronym: 'ICE',
    category: 'Major Bureaus & Commands',
    parentDepartment: 'DEPARTMENT OF HOMELAND SECURITY',
    aliases: ['ice', 'immigration', 'homeland security investigations', 'hsi', '070', '7012'],
  },
  {
    name: 'TRANSPORTATION SECURITY ADMINISTRATION',
    code: '070',
    displayName: 'Transportation Security Administration (TSA) [Code: 070]',
    acronym: 'TSA',
    category: 'Major Bureaus & Commands',
    parentDepartment: 'DEPARTMENT OF HOMELAND SECURITY',
    aliases: ['tsa', 'airport security', 'transportation security', '070', '7013'],
  },
  {
    name: 'UNITED STATES COAST GUARD',
    code: '070',
    displayName: 'U.S. Coast Guard (USCG) [Code: 070]',
    acronym: 'USCG',
    category: 'Major Bureaus & Commands',
    parentDepartment: 'DEPARTMENT OF HOMELAND SECURITY',
    aliases: ['uscg', 'coast guard', 'cutters', 'search and rescue', '070', '7008'],
  },
  {
    name: 'UNITED STATES SECRET SERVICE',
    code: '070',
    displayName: 'United States Secret Service (USSS) [Code: 070]',
    acronym: 'USSS',
    category: 'Major Bureaus & Commands',
    parentDepartment: 'DEPARTMENT OF HOMELAND SECURITY',
    aliases: ['usss', 'secret service', 'presidential protection', '070', '7040'],
  },
  {
    name: 'INTERNAL REVENUE SERVICE',
    code: '020',
    displayName: 'Internal Revenue Service (IRS) [Code: 020]',
    acronym: 'IRS',
    category: 'Major Bureaus & Commands',
    parentDepartment: 'DEPARTMENT OF THE TREASURY',
    aliases: ['irs', 'taxes', 'tax collection', 'internal revenue', '020', '2050'],
  },
  {
    name: 'BUREAU OF THE FISCAL SERVICE',
    code: '020',
    displayName: 'Bureau of the Fiscal Service [Code: 020]',
    acronym: 'BFS',
    category: 'Major Bureaus & Commands',
    parentDepartment: 'DEPARTMENT OF THE TREASURY',
    aliases: ['fiscal service', 'treasury payments', 'public debt', '020', '2052'],
  },
  {
    name: 'OFFICE OF THE COMPTROLLER OF THE CURRENCY',
    code: '020',
    displayName: 'Office of the Comptroller of the Currency (OCC) [Code: 020]',
    acronym: 'OCC',
    category: 'Major Bureaus & Commands',
    parentDepartment: 'DEPARTMENT OF THE TREASURY',
    aliases: ['occ', 'national bank regulator', '020', '2046'],
  },
  {
    name: 'FEDERAL BUREAU OF INVESTIGATION',
    code: '015',
    displayName: 'Federal Bureau of Investigation (FBI) [Code: 015]',
    acronym: 'FBI',
    category: 'Major Bureaus & Commands',
    parentDepartment: 'DEPARTMENT OF JUSTICE',
    aliases: ['fbi', 'investigation', 'counterterrorism', 'cyber crime', '015', '1549'],
  },
  {
    name: 'DRUG ENFORCEMENT ADMINISTRATION',
    code: '015',
    displayName: 'Drug Enforcement Administration (DEA) [Code: 015]',
    acronym: 'DEA',
    category: 'Major Bureaus & Commands',
    parentDepartment: 'DEPARTMENT OF JUSTICE',
    aliases: ['dea', 'narcotics', 'drug enforcement', '015', '1544'],
  },
  {
    name: 'BUREAU OF ALCOHOL TOBACCO FIREARMS AND EXPLOSIVES',
    code: '015',
    displayName: 'Bureau of Alcohol, Tobacco & Firearms (ATF) [Code: 015]',
    acronym: 'ATF',
    category: 'Major Bureaus & Commands',
    parentDepartment: 'DEPARTMENT OF JUSTICE',
    aliases: ['atf', 'firearms', 'explosives', 'arson', '015', '1501'],
  },
  {
    name: 'FEDERAL BUREAU OF PRISONS',
    code: '015',
    displayName: 'Federal Bureau of Prisons (BOP) [Code: 015]',
    acronym: 'BOP',
    category: 'Major Bureaus & Commands',
    parentDepartment: 'DEPARTMENT OF JUSTICE',
    aliases: ['bop', 'prisons', 'correctional facilities', '015', '1540'],
  },
  {
    name: 'UNITED STATES MARSHALS SERVICE',
    code: '015',
    displayName: 'United States Marshals Service (USMS) [Code: 015]',
    acronym: 'USMS',
    category: 'Major Bureaus & Commands',
    parentDepartment: 'DEPARTMENT OF JUSTICE',
    aliases: ['usms', 'marshals', 'fugitive recovery', 'judicial security', '015', '1504'],
  },
  {
    name: 'NATIONAL INSTITUTES OF HEALTH',
    code: '075',
    displayName: 'National Institutes of Health (NIH) [Code: 075]',
    acronym: 'NIH',
    category: 'Major Bureaus & Commands',
    parentDepartment: 'DEPARTMENT OF HEALTH AND HUMAN SERVICES',
    aliases: ['nih', 'biomedical research', 'cancer institute', 'clinical center', '075', '7529'],
  },
  {
    name: 'CENTERS FOR DISEASE CONTROL AND PREVENTION',
    code: '075',
    displayName: 'Centers for Disease Control (CDC) [Code: 075]',
    acronym: 'CDC',
    category: 'Major Bureaus & Commands',
    parentDepartment: 'DEPARTMENT OF HEALTH AND HUMAN SERVICES',
    aliases: ['cdc', 'public health', 'epidemiology', 'vaccines', '075', '7523'],
  },
  {
    name: 'FOOD AND DRUG ADMINISTRATION',
    code: '075',
    displayName: 'Food and Drug Administration (FDA) [Code: 075]',
    acronym: 'FDA',
    category: 'Major Bureaus & Commands',
    parentDepartment: 'DEPARTMENT OF HEALTH AND HUMAN SERVICES',
    aliases: ['fda', 'food safety', 'drug approval', 'medical devices', '075', '7524'],
  },
  {
    name: 'CENTERS FOR MEDICARE AND MEDICAID SERVICES',
    code: '075',
    displayName: 'Centers for Medicare & Medicaid (CMS) [Code: 075]',
    acronym: 'CMS',
    category: 'Major Bureaus & Commands',
    parentDepartment: 'DEPARTMENT OF HEALTH AND HUMAN SERVICES',
    aliases: ['cms', 'medicare', 'medicaid', 'healthcare coverage', '075', '7530'],
  },
  {
    name: 'INDIAN HEALTH SERVICE',
    code: '075',
    displayName: 'Indian Health Service (IHS) [Code: 075]',
    acronym: 'IHS',
    category: 'Major Bureaus & Commands',
    parentDepartment: 'DEPARTMENT OF HEALTH AND HUMAN SERVICES',
    aliases: ['ihs', 'tribal healthcare', 'native health', '075', '7527'],
  },
  {
    name: 'NATIONAL OCEANIC AND ATMOSPHERIC ADMINISTRATION',
    code: '013',
    displayName: 'National Oceanic & Atmospheric Admin (NOAA) [Code: 013]',
    acronym: 'NOAA',
    category: 'Major Bureaus & Commands',
    parentDepartment: 'DEPARTMENT OF COMMERCE',
    aliases: ['noaa', 'weather service', 'oceans', 'climate', 'fisheries', '013', '1330'],
  },
  {
    name: 'NATIONAL INSTITUTE OF STANDARDS AND TECHNOLOGY',
    code: '013',
    displayName: 'National Institute of Standards & Tech (NIST) [Code: 013]',
    acronym: 'NIST',
    category: 'Major Bureaus & Commands',
    parentDepartment: 'DEPARTMENT OF COMMERCE',
    aliases: ['nist', 'standards', 'cybersecurity framework', 'measurement', '013', '1341'],
  },
  {
    name: 'U.S. CENSUS BUREAU',
    code: '013',
    displayName: 'U.S. Census Bureau [Code: 013]',
    acronym: 'USCB',
    category: 'Major Bureaus & Commands',
    parentDepartment: 'DEPARTMENT OF COMMERCE',
    aliases: ['census', 'demographics', 'decennial census', '013', '1323'],
  },
  {
    name: 'UNITED STATES PATENT AND TRADEMARK OFFICE',
    code: '013',
    displayName: 'U.S. Patent & Trademark Office (USPTO) [Code: 013]',
    acronym: 'USPTO',
    category: 'Major Bureaus & Commands',
    parentDepartment: 'DEPARTMENT OF COMMERCE',
    aliases: ['uspto', 'patents', 'trademarks', 'intellectual property', '013', '1344'],
  },
  {
    name: 'FOREST SERVICE',
    code: '012',
    displayName: 'U.S. Forest Service (USFS) [Code: 012]',
    acronym: 'USFS',
    category: 'Major Bureaus & Commands',
    parentDepartment: 'DEPARTMENT OF AGRICULTURE',
    aliases: ['usfs', 'forest service', 'wildfire', 'national forests', '012', '12c2', '1200'],
  },
  {
    name: 'AGRICULTURAL RESEARCH SERVICE',
    code: '012',
    displayName: 'Agricultural Research Service (ARS) [Code: 012]',
    acronym: 'ARS',
    category: 'Major Bureaus & Commands',
    parentDepartment: 'DEPARTMENT OF AGRICULTURE',
    aliases: ['ars', 'ag research', 'crop science', '012', '1231'],
  },
  {
    name: 'FOOD SAFETY AND INSPECTION SERVICE',
    code: '012',
    displayName: 'Food Safety & Inspection Service (FSIS) [Code: 012]',
    acronym: 'FSIS',
    category: 'Major Bureaus & Commands',
    parentDepartment: 'DEPARTMENT OF AGRICULTURE',
    aliases: ['fsis', 'meat inspection', 'poultry inspection', '012', '1237'],
  },
  {
    name: 'NATURAL RESOURCES CONSERVATION SERVICE',
    code: '012',
    displayName: 'Natural Resources Conservation (NRCS) [Code: 012]',
    acronym: 'NRCS',
    category: 'Major Bureaus & Commands',
    parentDepartment: 'DEPARTMENT OF AGRICULTURE',
    aliases: ['nrcs', 'conservation', 'soil conservation', '012', '12f2'],
  },
  {
    name: 'NATIONAL PARK SERVICE',
    code: '014',
    displayName: 'National Park Service (NPS) [Code: 014]',
    acronym: 'NPS',
    category: 'Major Bureaus & Commands',
    parentDepartment: 'DEPARTMENT OF THE INTERIOR',
    aliases: ['nps', 'national parks', 'park rangers', 'yellowstone', '014', '1443'],
  },
  {
    name: 'U.S. GEOLOGICAL SURVEY',
    code: '014',
    displayName: 'U.S. Geological Survey (USGS) [Code: 014]',
    acronym: 'USGS',
    category: 'Major Bureaus & Commands',
    parentDepartment: 'DEPARTMENT OF THE INTERIOR',
    aliases: ['usgs', 'geology', 'earthquakes', 'water resources', 'topography', '014', '1434'],
  },
  {
    name: 'BUREAU OF LAND MANAGEMENT',
    code: '014',
    displayName: 'Bureau of Land Management (BLM) [Code: 014]',
    acronym: 'BLM',
    category: 'Major Bureaus & Commands',
    parentDepartment: 'DEPARTMENT OF THE INTERIOR',
    aliases: ['blm', 'public lands', 'grazing', 'mining leases', '014', '1422'],
  },
  {
    name: 'BUREAU OF RECLAMATION',
    code: '014',
    displayName: 'Bureau of Reclamation (USBR) [Code: 014]',
    acronym: 'USBR',
    category: 'Major Bureaus & Commands',
    parentDepartment: 'DEPARTMENT OF THE INTERIOR',
    aliases: ['usbr', 'reclamation', 'dams', 'water projects', 'hoover dam', '014', '1425'],
  },
  {
    name: 'BUREAU OF INDIAN AFFAIRS',
    code: '014',
    displayName: 'Bureau of Indian Affairs (BIA) [Code: 014]',
    acronym: 'BIA',
    category: 'Major Bureaus & Commands',
    parentDepartment: 'DEPARTMENT OF THE INTERIOR',
    aliases: ['bia', 'indian affairs', 'tribal programs', '014', '1450'],
  },
  {
    name: 'U.S. FISH AND WILDLIFE SERVICE',
    code: '014',
    displayName: 'U.S. Fish & Wildlife Service (USFWS) [Code: 014]',
    acronym: 'USFWS',
    category: 'Major Bureaus & Commands',
    parentDepartment: 'DEPARTMENT OF THE INTERIOR',
    aliases: ['usfws', 'fish and wildlife', 'endangered species', 'refuges', '014', '1448'],
  },
  {
    name: 'OCCUPATIONAL SAFETY AND HEALTH ADMINISTRATION',
    code: '016',
    displayName: 'Occupational Safety & Health (OSHA) [Code: 016]',
    acronym: 'OSHA',
    category: 'Major Bureaus & Commands',
    parentDepartment: 'DEPARTMENT OF LABOR',
    aliases: ['osha', 'workplace safety', 'safety standards', '016', '1635'],
  },
  {
    name: 'BUREAU OF LABOR STATISTICS',
    code: '016',
    displayName: 'Bureau of Labor Statistics (BLS) [Code: 016]',
    acronym: 'BLS',
    category: 'Major Bureaus & Commands',
    parentDepartment: 'DEPARTMENT OF LABOR',
    aliases: ['bls', 'labor statistics', 'cpi', 'unemployment rate', 'wages', '016', '1625'],
  },
  {
    name: 'VETERANS HEALTH ADMINISTRATION',
    code: '036',
    displayName: 'Veterans Health Administration (VHA) [Code: 036]',
    acronym: 'VHA',
    category: 'Major Bureaus & Commands',
    parentDepartment: 'DEPARTMENT OF VETERANS AFFAIRS',
    aliases: ['vha', 'va hospitals', 'va medical centers', 'veterans health', '036', '3600'],
  },
  {
    name: 'VETERANS BENEFITS ADMINISTRATION',
    code: '036',
    displayName: 'Veterans Benefits Administration (VBA) [Code: 036]',
    acronym: 'VBA',
    category: 'Major Bureaus & Commands',
    parentDepartment: 'DEPARTMENT OF VETERANS AFFAIRS',
    aliases: ['vba', 'va benefits', 'gi bill', 'va disability', '036', '3600'],
  },
  {
    name: 'FEDERAL ACQUISITION SERVICE',
    code: '047',
    displayName: 'Federal Acquisition Service (FAS - GSA) [Code: 047]',
    acronym: 'FAS',
    category: 'Major Bureaus & Commands',
    parentDepartment: 'GENERAL SERVICES ADMINISTRATION',
    aliases: ['fas', 'gsa schedules', 'mas', 'it-70', 'oasis', 'stars iii', '047', '4732'],
  },
  {
    name: 'PUBLIC BUILDINGS SERVICE',
    code: '047',
    displayName: 'Public Buildings Service (PBS - GSA) [Code: 047]',
    acronym: 'PBS',
    category: 'Major Bureaus & Commands',
    parentDepartment: 'GENERAL SERVICES ADMINISTRATION',
    aliases: ['pbs', 'federal courthouses', 'federal buildings', 'gsa leasing', '047', '4740'],
  },
  {
    name: 'NATIONAL NUCLEAR SECURITY ADMINISTRATION',
    code: '089',
    displayName: 'National Nuclear Security Admin (NNSA) [Code: 089]',
    acronym: 'NNSA',
    category: 'Major Bureaus & Commands',
    parentDepartment: 'DEPARTMENT OF ENERGY',
    aliases: ['nnsa', 'nuclear security', 'nuclear stockpile', 'los alamos', '089', '8930'],
  },

  // ==========================================
  // 5. LEGISLATIVE & JUDICIAL BRANCH
  // ==========================================
  {
    name: 'LIBRARY OF CONGRESS',
    code: '003',
    displayName: 'Library of Congress (LOC) [Code: 003]',
    acronym: 'LOC',
    category: 'Legislative & Judicial',
    aliases: ['loc', 'library of congress', 'copyright office', '003', '03', '0300'],
  },
  {
    name: 'GOVERNMENT ACCOUNTABILITY OFFICE',
    code: '005',
    displayName: 'Government Accountability Office (GAO) [Code: 005]',
    acronym: 'GAO',
    category: 'Legislative & Judicial',
    aliases: ['gao', 'audit', 'bid protest', 'comptroller general', '005', '05', '0500'],
  },
  {
    name: 'GOVERNMENT PUBLISHING OFFICE',
    code: '004',
    displayName: 'Government Publishing Office (GPO) [Code: 004]',
    acronym: 'GPO',
    category: 'Legislative & Judicial',
    aliases: ['gpo', 'government printing', 'federal register', 'passports', '004', '04', '0400'],
  },
  {
    name: 'ARCHITECT OF THE CAPITOL',
    code: '001',
    displayName: 'Architect of the Capitol (AOC) [Code: 001]',
    acronym: 'AOC',
    category: 'Legislative & Judicial',
    aliases: ['aoc', 'capitol building', 'capitol grounds', 'congressional office buildings', '001', '01', '0100'],
  },
  {
    name: 'CONGRESSIONAL BUDGET OFFICE',
    code: '008',
    displayName: 'Congressional Budget Office (CBO) [Code: 008]',
    acronym: 'CBO',
    category: 'Legislative & Judicial',
    aliases: ['cbo', 'congressional budget', 'cost estimates', '008', '08', '0800'],
  },
  {
    name: 'ADMINISTRATIVE OFFICE OF THE U.S. COURTS',
    code: '010',
    displayName: 'Admin Office of the U.S. Courts (AOUSC) [Code: 010]',
    acronym: 'AOUSC',
    category: 'Legislative & Judicial',
    aliases: ['aousc', 'federal courts', 'pacer', 'judiciary', '010', '10', '1000'],
  },
  {
    name: 'FEDERAL JUDICIAL CENTER',
    code: '010',
    displayName: 'Federal Judicial Center (FJC) [Code: 010]',
    acronym: 'FJC',
    category: 'Legislative & Judicial',
    aliases: ['fjc', 'judicial education', 'federal judges', '010', '10'],
  },
];

// String list for backward-compatibility with older arrays
export const FEDERAL_DEPARTMENTS: string[] = [
  'All Federal Organizations',
  ...FEDERAL_ORGANIZATIONS.map((org) => org.name),
];

export const FEDERAL_ORGANIZATION_CATEGORIES = [
  { id: 'Cabinet Departments', label: '🏛️ Cabinet Departments (15 Executive Depts)' },
  { id: 'Military & Defense', label: '⚔️ Military Departments & Defense Agencies' },
  { id: 'Independent Agencies', label: '🏢 Major Independent Agencies & Commissions' },
  { id: 'Major Bureaus & Commands', label: '🎯 Major Federal Bureaus & Procuring Commands' },
  { id: 'Legislative & Judicial', label: '⚖️ Legislative & Judicial Branch Entities' },
] as const;

/**
 * Returns formatted display name with acronym and CGAC code for a given agency string or code
 */
export function getFederalOrgDisplayName(nameOrValue: string): string {
  if (!nameOrValue || nameOrValue === 'All Federal Organizations') {
    return 'All Federal Organizations';
  }
  const match = FEDERAL_ORGANIZATIONS.find(
    (o) => o.name.toLowerCase() === nameOrValue.toLowerCase() || 
           o.acronym.toLowerCase() === nameOrValue.toLowerCase() ||
           o.code.toLowerCase() === nameOrValue.toLowerCase()
  );
  return match ? match.displayName : nameOrValue;
}

/**
 * Returns clean 3-digit CGAC code for a given organization name
 */
export function getFederalOrgCode(nameOrValue: string): string | null {
  if (!nameOrValue || nameOrValue === 'All Federal Organizations') return null;
  const match = FEDERAL_ORGANIZATIONS.find(
    (o) => o.name.toLowerCase() === nameOrValue.toLowerCase() || 
           o.acronym.toLowerCase() === nameOrValue.toLowerCase()
  );
  return match ? match.code : null;
}

/**
 * Smart matching for a contract notice against an agency filter
 */
export function matchesFederalOrganization(opp: SAMOpportunity, selectedOrgName: string): boolean {
  if (!opp) return false;
  if (!selectedOrgName || selectedOrgName === 'All Federal Organizations') {
    return true;
  }

  const needle = selectedOrgName.trim().toLowerCase();
  const orgMeta = FEDERAL_ORGANIZATIONS.find(
    (o) => o.name.toLowerCase() === needle || 
           o.displayName.toLowerCase() === needle || 
           o.acronym.toLowerCase() === needle ||
           o.code.toLowerCase() === needle
  );

  const dept = (opp.department || '').toLowerCase();
  const subTier = (opp.subTier || '').toLowerCase();
  const office = (opp.office || '').toLowerCase();

  // 1. Exact or partial match on canonical name, display name, or code
  if (dept.includes(needle) || subTier.includes(needle) || office.includes(needle)) {
    return true;
  }

  // 2. If organization metadata is recognized, match against aliases & parent/child relationships
  if (orgMeta) {
    const canonicalNameLower = orgMeta.name.toLowerCase();
    if (dept.includes(canonicalNameLower) || subTier.includes(canonicalNameLower) || office.includes(canonicalNameLower)) {
      return true;
    }

    // Match acronym
    const acronymLower = orgMeta.acronym.toLowerCase();
    if (office.includes(acronymLower) || subTier.includes(acronymLower) || dept.includes(acronymLower)) {
      return true;
    }

    // Match code (e.g. 097, 047, 012)
    const codeLower = orgMeta.code.toLowerCase();
    if (office.includes(codeLower) || subTier.includes(codeLower) || dept.includes(codeLower)) {
      return true;
    }

    // If this is a parent department (e.g. Department of Defense), match sub-tier agencies belonging to it
    if (!orgMeta.parentDepartment) {
      const childOrgs = FEDERAL_ORGANIZATIONS.filter((o) => o.parentDepartment === orgMeta.name);
      for (const child of childOrgs) {
        if (subTier.includes(child.name.toLowerCase()) || office.includes(child.name.toLowerCase())) {
          return true;
        }
      }
    }

    // If this is a child sub-tier (e.g. US Army Corps of Engineers, DHA, or FAA)
    if (orgMeta.parentDepartment) {
      // Direct alias match inside dept, subTier, or office
      for (const alias of orgMeta.aliases) {
        if (dept.includes(alias) || subTier.includes(alias) || office.includes(alias)) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Searches if user query references an agency acronym, code, or name, matching against the opportunity
 */
export function matchesQueryWithAgencies(query: string, opp: SAMOpportunity): boolean {
  if (!query || !opp) return false;
  const q = query.trim().toLowerCase();
  
  // Quick test: is the query a known agency acronym or code? (e.g. "dod", "097", "va", "036", "gsa", "047")
  const matchingOrgs = FEDERAL_ORGANIZATIONS.filter(
    (o) => o.acronym.toLowerCase() === q || o.code.toLowerCase() === q || o.aliases.some((a) => a === q)
  );

  for (const org of matchingOrgs) {
    if (matchesFederalOrganization(opp, org.name)) {
      return true;
    }
  }

  return false;
}
