// Complete U.S. States, Federal District, and U.S. Territories Catalog for Federal Procurement
// Compliant with SAM.gov, GSA, FAR Part 19, and USPS Jurisdiction Standards

export interface UsJurisdiction {
  code: string;
  name: string;
  type: 'state' | 'district' | 'territory' | 'military';
  region?: string;
  popularCities: string[];
}

export const US_TERRITORIES: UsJurisdiction[] = [
  {
    code: 'PR',
    name: 'Puerto Rico (Commonwealth of Puerto Rico)',
    type: 'territory',
    region: 'Caribbean / Atlantic',
    popularCities: ['San Juan', 'Guaynabo', 'Bayamón', 'Ponce', 'Aguadilla', 'Ceiba'],
  },
  {
    code: 'GU',
    name: 'Guam',
    type: 'territory',
    region: 'Western Pacific / Marianas',
    popularCities: ['Santa Rita', 'Yigo', 'Hagåtña', 'Tamuning', 'Dededo', 'Asan'],
  },
  {
    code: 'VI',
    name: 'U.S. Virgin Islands',
    type: 'territory',
    region: 'Caribbean / Atlantic',
    popularCities: ['St. Thomas', 'St. Croix', 'Charlotte Amalie', 'Christiansted', 'St. John'],
  },
  {
    code: 'AS',
    name: 'American Samoa',
    type: 'territory',
    region: 'South Pacific',
    popularCities: ['Pago Pago', 'Tafuna', 'Fagatogo', 'Utulei'],
  },
  {
    code: 'MP',
    name: 'Northern Mariana Islands (CNMI)',
    type: 'territory',
    region: 'Western Pacific / Marianas',
    popularCities: ['Saipan', 'Tinian', 'Rota', 'Garapan', 'San Jose'],
  },
  {
    code: 'UM',
    name: 'U.S. Minor Outlying Islands (Wake / Midway / Johnston)',
    type: 'territory',
    region: 'Pacific Islands / DoD Military Range',
    popularCities: ['Wake Island', 'Midway Atoll', 'Palmyra Atoll'],
  },
];

export const US_MILITARY_OVERSEAS: UsJurisdiction[] = [
  {
    code: 'AP',
    name: 'Armed Forces Pacific (AP - Japan, Korea, Guam ranges)',
    type: 'military',
    region: 'Indo-Pacific Command',
    popularCities: ['Yokosuka', 'Okinawa', 'Kadena', 'Camp Humphreys', 'Osan'],
  },
  {
    code: 'AE',
    name: 'Armed Forces Europe / Middle East / Africa (AE)',
    type: 'military',
    region: 'EUCOM / CENTCOM / AFRICOM',
    popularCities: ['Ramstein', 'Stuttgart', 'Wiesbaden', 'Naples', 'Rota Naval Base'],
  },
  {
    code: 'AA',
    name: 'Armed Forces Americas (AA - Caribbean / Latin America)',
    type: 'military',
    region: 'SOUTHCOM',
    popularCities: ['Guantanamo Bay', 'Soto Cano', 'Key West Forward'],
  },
];

export const US_STATES_LIST: UsJurisdiction[] = [
  { code: 'AL', name: 'Alabama', type: 'state', popularCities: ['Huntsville', 'Redstone Arsenal', 'Birmingham', 'Mobile', 'Montgomery'] },
  { code: 'AK', name: 'Alaska', type: 'state', popularCities: ['Anchorage', 'Elmendorf AFB', 'Fairbanks', 'Juneau', 'Fort Wainwright'] },
  { code: 'AZ', name: 'Arizona', type: 'state', popularCities: ['Phoenix', 'Tucson', 'Flagstaff', 'Fort Huachuca', 'Yuma'] },
  { code: 'AR', name: 'Arkansas', type: 'state', popularCities: ['Little Rock', 'Pine Bluff', 'Fayetteville', 'Fort Smith'] },
  { code: 'CA', name: 'California', type: 'state', popularCities: ['San Diego', 'Los Angeles', 'San Francisco', 'Sacramento', 'El Segundo', 'Edwards AFB'] },
  { code: 'CO', name: 'Colorado', type: 'state', popularCities: ['Denver', 'Colorado Springs', 'Aurora', 'Peterson SFB', 'Schriever SFB', 'Boulder'] },
  { code: 'CT', name: 'Connecticut', type: 'state', popularCities: ['Groton', 'Hartford', 'New London', 'New Haven', 'Bridgeport'] },
  { code: 'DE', name: 'Delaware', type: 'state', popularCities: ['Dover', 'Dover AFB', 'Wilmington', 'Newark'] },
  { code: 'FL', name: 'Florida', type: 'state', popularCities: ['Tampa', 'Jacksonville', 'Orlando', 'Kennedy Space Center', 'Pensacola', 'Miami', 'Eglin AFB'] },
  { code: 'GA', name: 'Georgia', type: 'state', popularCities: ['Atlanta', 'Fort Eisenhower', 'Augusta', 'Savannah', 'Robins AFB', 'Marietta'] },
  { code: 'HI', name: 'Hawaii', type: 'state', popularCities: ['Honolulu', 'Pearl Harbor', 'JBPHH', 'Kaneohe', 'Kailua', 'Hilo'] },
  { code: 'ID', name: 'Idaho', type: 'state', popularCities: ['Boise', 'Idaho Falls', 'Mountain Home AFB', 'Pocatello'] },
  { code: 'IL', name: 'Illinois', type: 'state', popularCities: ['Chicago', 'Great Lakes', 'Scott AFB', 'Springfield', 'Rock Island'] },
  { code: 'IN', name: 'Indiana', type: 'state', popularCities: ['Indianapolis', 'Crane', 'Fort Wayne', 'South Bend'] },
  { code: 'IA', name: 'Iowa', type: 'state', popularCities: ['Des Moines', 'Cedar Rapids', 'Davenport', 'Iowa City'] },
  { code: 'KS', name: 'Kansas', type: 'state', popularCities: ['Wichita', 'Fort Leavenworth', 'Overland Park', 'Topeka'] },
  { code: 'KY', name: 'Kentucky', type: 'state', popularCities: ['Louisville', 'Lexington', 'Fort Knox', 'Fort Campbell'] },
  { code: 'LA', name: 'Louisiana', type: 'state', popularCities: ['New Orleans', 'Barksdale AFB', 'Baton Rouge', 'Fort Johnson'] },
  { code: 'ME', name: 'Maine', type: 'state', popularCities: ['Kittery', 'Portsmouth Naval Shipyard', 'Portland', 'Bangor', 'Augusta'] },
  { code: 'MD', name: 'Maryland', type: 'state', popularCities: ['Bethesda', 'Baltimore', 'Patuxent River', 'Fort Meade', 'Greenbelt', 'Silver Spring', 'Rockville', 'Lanham'] },
  { code: 'MA', name: 'Massachusetts', type: 'state', popularCities: ['Boston', 'Hanscom AFB', 'Cambridge', 'Natick', 'Bedford'] },
  { code: 'MI', name: 'Michigan', type: 'state', popularCities: ['Detroit', 'Warren', 'Ann Arbor', 'Grand Rapids', 'Lansing'] },
  { code: 'MN', name: 'Minnesota', type: 'state', popularCities: ['Minneapolis', 'Saint Paul', 'Rochester', 'Duluth'] },
  { code: 'MS', name: 'Mississippi', type: 'state', popularCities: ['Stennis Space Center', 'Jackson', 'Biloxi', 'Keesler AFB', 'Gulfport'] },
  { code: 'MO', name: 'Missouri', type: 'state', popularCities: ['St. Louis', 'Kansas City', 'Fort Leonard Wood', 'Whiteman AFB'] },
  { code: 'MT', name: 'Montana', type: 'state', popularCities: ['Helena', 'Great Falls', 'Malmstrom AFB', 'Billings', 'Bozeman'] },
  { code: 'NE', name: 'Nebraska', type: 'state', popularCities: ['Omaha', 'Offutt AFB', 'Lincoln', 'Bellevue'] },
  { code: 'NV', name: 'Nevada', type: 'state', popularCities: ['Las Vegas', 'Nellis AFB', 'Reno', 'Carson City', 'Fallon'] },
  { code: 'NH', name: 'New Hampshire', type: 'state', popularCities: ['Manchester', 'Nashua', 'Concord', 'Portsmouth'] },
  { code: 'NJ', name: 'New Jersey', type: 'state', popularCities: ['Picatinny Arsenal', 'Fort Dix', 'Newark', 'Trenton', 'Atlantic City'] },
  { code: 'NM', name: 'New Mexico', type: 'state', popularCities: ['Albuquerque', 'Kirtland AFB', 'Los Alamos', 'White Sands', 'Santa Fe'] },
  { code: 'NY', name: 'New York', type: 'state', popularCities: ['New York City', 'Albany', 'Buffalo', 'Fort Drum', 'Rome', 'West Point'] },
  { code: 'NC', name: 'North Carolina', type: 'state', popularCities: ['Raleigh', 'Durham', 'Research Triangle Park', 'Fort Liberty', 'Camp Lejeune', 'Charlotte'] },
  { code: 'ND', name: 'North Dakota', type: 'state', popularCities: ['Fargo', 'Grand Forks AFB', 'Minot AFB', 'Bismarck'] },
  { code: 'OH', name: 'Ohio', type: 'state', popularCities: ['Wright-Patterson AFB', 'Dayton', 'Columbus', 'Cleveland', 'Cincinnati'] },
  { code: 'OK', name: 'Oklahoma', type: 'state', popularCities: ['Oklahoma City', 'Tinker AFB', 'Tulsa', 'Fort Sill', 'Norman'] },
  { code: 'OR', name: 'Oregon', type: 'state', popularCities: ['Portland', 'Salem', 'Eugene', 'Corvallis'] },
  { code: 'PA', name: 'Pennsylvania', type: 'state', popularCities: ['Philadelphia', 'Pittsburgh', 'Harrisburg', 'Mechanicsburg', 'Carlisle'] },
  { code: 'RI', name: 'Rhode Island', type: 'state', popularCities: ['Newport', 'Naval Undersea Warfare Center', 'Providence', 'Warwick'] },
  { code: 'SC', name: 'South Carolina', type: 'state', popularCities: ['Charleston', 'Columbia', 'Fort Jackson', 'Shaw AFB', 'Greenville'] },
  { code: 'SD', name: 'South Dakota', type: 'state', popularCities: ['Sioux Falls', 'Rapid City', 'Ellsworth AFB', 'Pierre'] },
  { code: 'TN', name: 'Tennessee', type: 'state', popularCities: ['Oak Ridge', 'Nashville', 'Memphis', 'Knoxville', 'Arnold AFB'] },
  { code: 'TX', name: 'Texas', type: 'state', popularCities: ['San Antonio', 'JBSA', 'Dallas', 'Austin', 'Houston', 'Fort Cavazos', 'Fort Bliss', 'El Paso'] },
  { code: 'UT', name: 'Utah', type: 'state', popularCities: ['Hill AFB', 'Salt Lake City', 'Ogden', 'Provo', 'Dugway Proving Ground'] },
  { code: 'VT', name: 'Vermont', type: 'state', popularCities: ['Burlington', 'Montpelier', 'Rutland', 'South Burlington'] },
  { code: 'VA', name: 'Virginia', type: 'state', popularCities: ['Arlington', 'Alexandria', 'Falls Church', 'McLean', 'Norfolk', 'Reston', 'Chantilly', 'Richmond', 'Quantico', 'Dahlgren'] },
  { code: 'WA', name: 'Washington', type: 'state', popularCities: ['Seattle', 'JBLM', 'Tacoma', 'Bremerton', 'Spokane', 'Richland / Hanford'] },
  { code: 'WV', name: 'West Virginia', type: 'state', popularCities: ['Charleston', 'Clarksburg', 'Morgantown', 'Martinsburg'] },
  { code: 'WI', name: 'Wisconsin', type: 'state', popularCities: ['Milwaukee', 'Madison', 'Green Bay', 'Fort McCoy'] },
  { code: 'WY', name: 'Wyoming', type: 'state', popularCities: ['Cheyenne', 'F.E. Warren AFB', 'Casper', 'Laramie'] },
  { code: 'DC', name: 'District of Columbia', type: 'district', popularCities: ['Washington', 'Joint Base Anacostia-Bolling', 'Navy Yard', 'Fort McNair'] },
];

export const ALL_US_JURISDICTIONS: UsJurisdiction[] = [
  ...US_STATES_LIST,
  ...US_TERRITORIES,
  ...US_MILITARY_OVERSEAS,
];

export const US_TERRITORY_CODES = US_TERRITORIES.map((t) => t.code);
export const US_STATE_CODES = US_STATES_LIST.map((s) => s.code);
export const US_MILITARY_CODES = US_MILITARY_OVERSEAS.map((m) => m.code);

export const ALL_JURISDICTION_CODES = ALL_US_JURISDICTIONS.map((j) => j.code);

// Legacy string array for backward compatibility
export const US_STATES = ALL_JURISDICTION_CODES;

export function getJurisdictionName(code: string): string {
  const found = ALL_US_JURISDICTIONS.find((j) => j.code.toUpperCase() === (code || '').toUpperCase());
  return found ? found.name : code;
}

export function isTerritory(code: string): boolean {
  return US_TERRITORY_CODES.includes((code || '').toUpperCase());
}

export function getPopularCitiesForJurisdiction(code: string): string[] {
  const found = ALL_US_JURISDICTIONS.find((j) => j.code.toUpperCase() === (code || '').toUpperCase());
  return found?.popularCities || [];
}
