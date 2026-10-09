/**
 * Official NAICS (North American Industry Classification System) Database
 * Direct standard alignment with NAICS.com Industry Directory (https://www.naics.com/search-naics-codes-by-industry/)
 * and U.S. Small Business Administration (SBA.gov) Size Standards & DSBS Registries.
 */

export interface NaicsDefinition {
  code: string;
  title: string; // Canonical NAICS.com / U.S. Census Bureau Title
  censusTitle: string; // Official NAICS.com / Census Title
  sbaTitle: string; // SBA procurement designation / common solicitation descriptor
  sectorCode: string; // 2-digit NAICS Sector (e.g. '54')
  sectorTitle: string; // Sector Name (e.g. 'Professional, Scientific, and Technical Services')
  category: string;
  sizeStandard: string; // SBA small business size standard ($M or employees)
  description: string;
  sbaAlias?: string;
}

export interface NaicsSectorGroup {
  sectorCode: string;
  sectorTitle: string;
  codes: NaicsDefinition[];
}

export const OFFICIAL_NAICS_DATABASE: Record<string, NaicsDefinition> = {
  // Sector 54: Professional, Scientific, and Technical Services
  '541512': {
    code: '541512',
    title: 'Computer Systems Design Services',
    censusTitle: 'Computer Systems Design Services',
    sbaTitle: 'Computer Systems Design Services (Commercial & Government Specialized Services)',
    sbaAlias: 'Commercial & Government Specialized Services',
    sectorCode: '54',
    sectorTitle: 'Professional, Scientific, and Technical Services',
    category: 'Information Technology & Specialized Systems',
    sizeStandard: '$34.0M',
    description: 'Official 2022 NAICS (NAICS.com & U.S. Census): Computer Systems Design Services. In SBA.gov and federal procurement registries, frequently designated for Commercial & Government Specialized Services, zero-trust cloud infrastructure, enterprise software systems integration, and cybersecurity defense architectures.',
  },
  '541511': {
    code: '541511',
    title: 'Custom Computer Programming Services',
    censusTitle: 'Custom Computer Programming Services',
    sbaTitle: 'Custom Computer Programming Services',
    sectorCode: '54',
    sectorTitle: 'Professional, Scientific, and Technical Services',
    category: 'Information Technology',
    sizeStandard: '$34.0M',
    description: 'Writing, modifying, testing, and supporting custom software and mission application code across civilian and defense agencies.',
  },
  '541519': {
    code: '541519',
    title: 'Other Computer Related Services',
    censusTitle: 'Other Computer Related Services',
    sbaTitle: 'Other Computer Related Services (including IT VAR)',
    sectorCode: '54',
    sectorTitle: 'Professional, Scientific, and Technical Services',
    category: 'Information Technology',
    sizeStandard: '$34.0M (150 Employees for IT VAR)',
    description: 'Specialized computer services, IT disaster recovery, software installation, and IT Value-Added Reseller (VAR) federal procurement.',
  },
  '541513': {
    code: '541513',
    title: 'Computer Facilities Management Services',
    censusTitle: 'Computer Facilities Management Services',
    sbaTitle: 'Computer Facilities Management Services',
    sectorCode: '54',
    sectorTitle: 'Professional, Scientific, and Technical Services',
    category: 'Information Technology',
    sizeStandard: '$37.0M',
    description: 'Providing on-site management and operation of clients’ computer systems and data processing facilities.',
  },
  '541330': {
    code: '541330',
    title: 'Engineering Services',
    censusTitle: 'Engineering Services',
    sbaTitle: 'Engineering Services',
    sectorCode: '54',
    sectorTitle: 'Professional, Scientific, and Technical Services',
    category: 'Engineering & Sciences',
    sizeStandard: '$25.5M / $47.0M (Military & Aerospace)',
    description: 'Applying physical laws and principles of engineering in the design, development, and utilization of machines, materials, defense systems, and public infrastructure.',
  },
  '541611': {
    code: '541611',
    title: 'Administrative Management and General Management Consulting Services',
    censusTitle: 'Administrative Management and General Management Consulting Services',
    sbaTitle: 'Administrative Management and General Consulting',
    sectorCode: '54',
    sectorTitle: 'Professional, Scientific, and Technical Services',
    category: 'Management & Strategy Consulting',
    sizeStandard: '$24.5M',
    description: 'Providing operating advice and assistance on administrative management, financial planning, budgeting, strategic planning, human resources, and business process re-engineering.',
  },
  '541620': {
    code: '541620',
    title: 'Environmental Consulting Services',
    censusTitle: 'Environmental Consulting Services',
    sbaTitle: 'Environmental Consulting Services',
    sectorCode: '54',
    sectorTitle: 'Professional, Scientific, and Technical Services',
    category: 'Environmental & Scientific',
    sizeStandard: '$19.0M',
    description: 'Providing advice and assistance on environmental regulations, environmental site assessments, climate resilience, and compliance audits.',
  },
  '541690': {
    code: '541690',
    title: 'Other Scientific and Technical Consulting Services',
    censusTitle: 'Other Scientific and Technical Consulting Services',
    sbaTitle: 'Other Scientific and Technical Consulting Services',
    sectorCode: '54',
    sectorTitle: 'Professional, Scientific, and Technical Services',
    category: 'Scientific & Technical Consulting',
    sizeStandard: '$19.0M',
    description: 'Providing specialized advice and assistance on scientific and technical disciplines including acoustics, chemistry, physics, and agricultural engineering.',
  },
  '541715': {
    code: '541715',
    title: 'Research and Development in the Physical, Engineering, and Life Sciences',
    censusTitle: 'Research and Development in the Physical, Engineering, and Life Sciences (except Nanotechnology and Biotechnology)',
    sbaTitle: 'R&D in the Physical, Engineering, and Life Sciences',
    sectorCode: '54',
    sectorTitle: 'Professional, Scientific, and Technical Services',
    category: 'Defense & Aerospace R&D',
    sizeStandard: '1,000 Employees',
    description: 'Conducting research and experimental development in physical, engineering, and life sciences such as defense electronics, ballistics, hypersonic testing, and aerospace propulsion.',
  },
  '541990': {
    code: '541990',
    title: 'All Other Professional, Scientific, and Technical Services',
    censusTitle: 'All Other Professional, Scientific, and Technical Services',
    sbaTitle: 'All Other Professional, Scientific, and Technical Services',
    sectorCode: '54',
    sectorTitle: 'Professional, Scientific, and Technical Services',
    category: 'Specialized Professional Services',
    sizeStandard: '$19.5M',
    description: 'Professional, scientific, and technical services not classified elsewhere, including meteorology, appraisal, marine surveying, and expert witness testimony.',
  },

  // Sector 23: Construction
  '236220': {
    code: '236220',
    title: 'Commercial and Institutional Building Construction',
    censusTitle: 'Commercial and Institutional Building Construction',
    sbaTitle: 'Commercial and Institutional Building Construction',
    sectorCode: '23',
    sectorTitle: 'Construction',
    category: 'Vertical Construction',
    sizeStandard: '$45.0M',
    description: 'General contractors responsible for the construction of commercial and institutional buildings including hospitals, schools, federal courthouses, and military barracks.',
  },
  '237310': {
    code: '237310',
    title: 'Highway, Street, and Bridge Construction',
    censusTitle: 'Highway, Street, and Bridge Construction',
    sbaTitle: 'Highway, Street, and Bridge Construction',
    sectorCode: '23',
    sectorTitle: 'Construction',
    category: 'Civil Infrastructure',
    sizeStandard: '$45.0M',
    description: 'Construction of highways, streets, roads, airport runways, bridges, elevated highways, and guardrails.',
  },
  '237990': {
    code: '237990',
    title: 'Other Heavy and Civil Engineering Construction',
    censusTitle: 'Other Heavy and Civil Engineering Construction',
    sbaTitle: 'Other Heavy and Civil Engineering Construction',
    sectorCode: '23',
    sectorTitle: 'Construction',
    category: 'Heavy Infrastructure',
    sizeStandard: '$45.0M',
    description: 'Heavy civil engineering including dredging, marine construction, dam construction, trench digging, and flood control levees.',
  },
  '238210': {
    code: '238210',
    title: 'Electrical Contractors and Other Wiring Installation',
    censusTitle: 'Electrical Contractors and Other Wiring Installation Contractors',
    sbaTitle: 'Electrical Contractors and Other Wiring Installation',
    sectorCode: '23',
    sectorTitle: 'Construction',
    category: 'Specialty Trade Contractors',
    sizeStandard: '$19.0M',
    description: 'Installation of electrical wiring, power generation backup systems, telecommunications wiring, security systems, and airfield lighting.',
  },
  '238220': {
    code: '238220',
    title: 'Plumbing, Heating, and Air-Conditioning Contractors',
    censusTitle: 'Plumbing, Heating, and Air-Conditioning Contractors',
    sbaTitle: 'Plumbing, Heating, and Air-Conditioning Contractors',
    sectorCode: '23',
    sectorTitle: 'Construction',
    category: 'Specialty Trade Contractors',
    sizeStandard: '$19.0M',
    description: 'Installation, servicing, and repair of plumbing, HVAC (heating, ventilation, and air conditioning), and refrigeration systems.',
  },

  // Sector 56: Administrative and Support and Waste Management and Remediation Services
  '561210': {
    code: '561210',
    title: 'Facilities Support Services',
    censusTitle: 'Facilities Support Services',
    sbaTitle: 'Facilities Support Services (Base Operations Support / BOS)',
    sectorCode: '56',
    sectorTitle: 'Administrative & Facilities Support Services',
    category: 'Facilities & Logistics Operations',
    sizeStandard: '$47.0M',
    description: 'Providing operating staff to perform a full combination of support services within military bases, federal courthouses, and healthcare complexes (BOS contracts).',
  },
  '561720': {
    code: '561720',
    title: 'Janitorial Services',
    censusTitle: 'Janitorial Services',
    sbaTitle: 'Janitorial Services',
    sectorCode: '56',
    sectorTitle: 'Administrative & Facilities Support Services',
    category: 'Custodial & Sanitization',
    sizeStandard: '$22.0M',
    description: 'Cleaning building interiors, cleanrooms, medical facilities, passenger terminals, or industrial machinery.',
  },
  '562910': {
    code: '562910',
    title: 'Remediation Services',
    censusTitle: 'Remediation Services',
    sbaTitle: 'Remediation Services (Environmental & Unexploded Ordnance)',
    sectorCode: '56',
    sectorTitle: 'Administrative & Facilities Support Services',
    category: 'Environmental Remediation',
    sizeStandard: '$25.0M / 1,000 Employees (Environmental Remediation)',
    description: 'Remediation and cleanup of contaminated buildings, superfund sites, soil, or ground water, including asbestos and lead abatement.',
  },
  '561612': {
    code: '561612',
    title: 'Security Guards and Patrol Services',
    censusTitle: 'Security Guards and Patrol Services',
    sbaTitle: 'Security Guards and Patrol Services',
    sectorCode: '56',
    sectorTitle: 'Administrative & Facilities Support Services',
    category: 'Protective & Guard Services',
    sizeStandard: '$29.0M',
    description: 'Armed and unarmed security guards, access control, perimeter security, and escort services for government installations.',
  },

  // Sector 51: Information
  '518210': {
    code: '518210',
    title: 'Computing Infrastructure Providers, Data Processing, Web Hosting, and Related Services',
    censusTitle: 'Computing Infrastructure Providers, Data Processing, Web Hosting, and Related Services',
    sbaTitle: 'Data Processing, FedRAMP Cloud Hosting, and Related Services',
    sectorCode: '51',
    sectorTitle: 'Information',
    category: 'Cloud Infrastructure & Hosting',
    sizeStandard: '$40.0M',
    description: 'Infrastructure as a Service (IaaS), FedRAMP-authorized cloud hosting, colocation services, and government compute processing.',
  },
  '513210': {
    code: '513210',
    title: 'Software Publishers',
    censusTitle: 'Software Publishers',
    sbaTitle: 'Software Publishers',
    sectorCode: '51',
    sectorTitle: 'Information',
    category: 'Software & Technology Platforms',
    sizeStandard: '$47.0M',
    description: 'Publishing and licensing proprietary commercial software packages, SaaS platforms, and enterprise cybersecurity tool suites.',
  },

  // Sector 62: Health Care and Social Assistance
  '621111': {
    code: '621111',
    title: 'Offices of Physicians (except Mental Health Specialists)',
    censusTitle: 'Offices of Physicians (except Mental Health Specialists)',
    sbaTitle: 'Offices of Physicians & Medical Staffing',
    sectorCode: '62',
    sectorTitle: 'Health Care and Social Assistance',
    category: 'Clinical & Medical Staffing',
    sizeStandard: '$16.0M',
    description: 'Clinical medical staffing, VA healthcare coverage, physician services, and military troop medical readiness examinations.',
  },
  '621610': {
    code: '621610',
    title: 'Home Health Care Services',
    censusTitle: 'Home Health Care Services',
    sbaTitle: 'Home Health Care & Veteran In-Home Nursing',
    sectorCode: '62',
    sectorTitle: 'Health Care and Social Assistance',
    category: 'Medical Services',
    sizeStandard: '$19.0M',
    description: 'Providing skilled nursing care, physical therapy, and home health aide services directly to veterans and federal beneficiaries.',
  },

  // Sector 48-49: Transportation and Warehousing
  '488190': {
    code: '488190',
    title: 'Other Support Activities for Air Transportation',
    censusTitle: 'Other Support Activities for Air Transportation',
    sbaTitle: 'Other Support Activities for Air Transportation',
    sectorCode: '48-49',
    sectorTitle: 'Transportation and Warehousing',
    category: 'Aviation & Defense Logistics',
    sizeStandard: '$40.0M',
    description: 'Aircraft maintenance and overhaul (MRO), avionics inspections, airfield servicing, and aerospace repair support.',
  },
  '493110': {
    code: '493110',
    title: 'General Warehousing and Storage',
    censusTitle: 'General Warehousing and Storage',
    sbaTitle: 'General Warehousing and Storage',
    sectorCode: '48-49',
    sectorTitle: 'Transportation and Warehousing',
    category: 'Supply Chain & Warehousing',
    sizeStandard: '$34.0M',
    description: 'Operating general merchandise warehouses, military prepositioned stock facilities, and automated depot storage.',
  },

  // Sector 11: Agriculture, Forestry, Fishing and Hunting
  '115310': {
    code: '115310',
    title: 'Support Activities for Forestry',
    censusTitle: 'Support Activities for Forestry',
    sbaTitle: 'Support Activities for Forestry & Wildland Fire Fighting',
    sectorCode: '11',
    sectorTitle: 'Agriculture, Forestry, Fishing and Hunting',
    category: 'Forestry & Wildland Defense',
    sizeStandard: '$11.5M / $34.0M (Forest Fire Suppression)',
    description: 'Timber cruising, firefighting support, wildfire mitigation, reforestation, and federal national forest management.',
  },

  // Sector 31-33: Manufacturing
  '334111': {
    code: '334111',
    title: 'Electronic Computer Manufacturing',
    censusTitle: 'Electronic Computer Manufacturing',
    sbaTitle: 'Electronic Computer Manufacturing',
    sectorCode: '31-33',
    sectorTitle: 'Manufacturing',
    category: 'Hardware & Microelectronics',
    sizeStandard: '1,250 Employees',
    description: 'Manufacturing mainframes, secure servers, ruggedized laptops, and high-performance computing hardware for defense systems.',
  },
  '334220': {
    code: '334220',
    title: 'Radio and Television Broadcasting and Wireless Communications Equipment Manufacturing',
    censusTitle: 'Radio and Television Broadcasting and Wireless Communications Equipment Manufacturing',
    sbaTitle: 'Wireless Communications & Defense Tactical Radio Equipment',
    sectorCode: '31-33',
    sectorTitle: 'Manufacturing',
    category: 'Tactical Communications',
    sizeStandard: '1,250 Employees',
    description: 'Manufacturing tactical communications equipment, airborne transceivers, radar systems, and secure satellite communications gear.',
  },
  '336413': {
    code: '336413',
    title: 'Other Aircraft Parts and Auxiliary Equipment Manufacturing',
    censusTitle: 'Other Aircraft Parts and Auxiliary Equipment Manufacturing',
    sbaTitle: 'Other Aircraft Parts and Auxiliary Equipment Manufacturing',
    sectorCode: '31-33',
    sectorTitle: 'Manufacturing',
    category: 'Aerospace & Defense Components',
    sizeStandard: '1,250 Employees',
    description: 'Manufacturing aircraft components, landing gear, de-icing equipment, avionics brackets, and auxiliary power units.',
  },
};

/**
 * NAICS Sector Groups organized in accordance with NAICS.com Search By Industry hierarchy
 * (https://www.naics.com/search-naics-codes-by-industry/)
 */
export const NAICS_SECTORS: { code: string; title: string; description: string }[] = [
  { code: '54', title: 'Professional, Scientific, and Technical Services', description: 'Legal, accounting, architecture, engineering, IT systems, and consulting.' },
  { code: '23', title: 'Construction', description: 'Building, highway, heavy civil, and specialty trade contractors.' },
  { code: '56', title: 'Administrative & Facilities Support Services', description: 'Facilities operations (BOS), security, remediation, and custodial.' },
  { code: '51', title: 'Information', description: 'Cloud infrastructure, data processing, web hosting, and software publishers.' },
  { code: '62', title: 'Health Care and Social Assistance', description: 'Medical staffing, physician services, clinics, and in-home care.' },
  { code: '48-49', title: 'Transportation and Warehousing', description: 'Air support, aviation MRO, freight, and general warehousing.' },
  { code: '31-33', title: 'Manufacturing', description: 'Defense hardware, tactical radios, aerospace parts, and microelectronics.' },
  { code: '11', title: 'Agriculture, Forestry, Fishing and Hunting', description: 'Forestry support, wildland fire suppression, and conservation.' },
];

/**
 * Grouped array of NAICS codes categorized under official NAICS Industry Sectors
 * Suitable for rendering structured <optgroup> dropdown menus
 */
export const NAICS_BY_SECTOR: NaicsSectorGroup[] = NAICS_SECTORS.map((sector) => {
  const codes = Object.values(OFFICIAL_NAICS_DATABASE).filter((n) => n.sectorCode === sector.code);
  return {
    sectorCode: sector.code,
    sectorTitle: sector.title,
    codes,
  };
}).filter((group) => group.codes.length > 0);

/**
 * Returns the official NAICS definition or generates a standard fallback
 */
export function getNaicsDefinition(code?: string): NaicsDefinition {
  const cleanCode = String(code || '541512').trim();
  if (OFFICIAL_NAICS_DATABASE[cleanCode]) {
    return OFFICIAL_NAICS_DATABASE[cleanCode];
  }

  // Fallback for codes not in static top list
  return {
    code: cleanCode,
    title: cleanCode === '541512' ? 'Computer Systems Design Services' : `Industry Classification ${cleanCode}`,
    censusTitle: cleanCode === '541512' ? 'Computer Systems Design Services' : `Industry Classification ${cleanCode}`,
    sbaTitle: cleanCode === '541512' ? 'Computer Systems Design Services (Commercial & Government Specialized Services)' : `Specialized Federal Industry (${cleanCode})`,
    sbaAlias: cleanCode === '541512' ? 'Commercial & Government Specialized Services' : undefined,
    sectorCode: cleanCode.slice(0, 2),
    sectorTitle: 'Federal Contracting Classification',
    category: 'Federal Contractor Services',
    sizeStandard: '$30.0M',
    description: `Official NAICS Code ${cleanCode} aligned with federal acquisition and Census classification tables.`,
  };
}

/**
 * Returns formatted title for a given NAICS code
 */
export function getNaicsTitle(code?: string, preferredSource: 'census' | 'sba' | 'both' = 'census'): string {
  const def = getNaicsDefinition(code);
  if (preferredSource === 'both' && def.sbaAlias) {
    return `${def.censusTitle} / ${def.sbaAlias}`;
  }
  if (preferredSource === 'sba' && def.sbaTitle) {
    return def.sbaTitle;
  }
  return def.censusTitle;
}
