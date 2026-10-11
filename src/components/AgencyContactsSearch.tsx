import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  ExternalLink, 
  ShieldCheck, 
  UserCheck, 
  Send, 
  Copy, 
  Check, 
  Filter, 
  Building,
  Tag,
  Briefcase
} from 'lucide-react';
import { FEDERAL_ORGANIZATIONS, getFederalOrgDisplayName } from '../data/federalOrganizations.ts';

export interface AgencyContactRecord {
  id: string;
  name: string;
  role: 'Contracting Officer (CO)' | 'Contracting Officer Representative (COR)' | 'Small Business Specialist (OSDBU)' | 'Head of Contracting Activity (HCA)' | 'Contract Specialist';
  department: string;
  subTier?: string;
  office: string;
  email: string;
  phone: string;
  address: string;
  specializationNaics: string[];
  activeSolicitationCount: number;
}

const SAMPLE_AGENCY_CONTACTS: AgencyContactRecord[] = [
  {
    id: 'poc-001',
    name: 'Sarah Jenkins',
    role: 'Small Business Specialist (OSDBU)',
    department: 'DEPARTMENT OF DEFENSE',
    subTier: 'Defense Information Systems Agency (DISA)',
    office: 'DISA / Defense Information Technology Contracting Organization (DITCO)',
    email: 'disa.osdbu@mail.mil',
    phone: '(301) 225-6000',
    address: 'Fort Meade, MD 20755',
    specializationNaics: ['541512', '541519', '541511'],
    activeSolicitationCount: 14,
  },
  {
    id: 'poc-002',
    name: 'Lt. Col. Marcus Vance',
    role: 'Contracting Officer (CO)',
    department: 'DEPT OF THE ARMY',
    subTier: 'U.S. Army Contracting Command (ACC)',
    office: 'ACC - Aberdeen Proving Ground (APG) C5ISR',
    email: 'marcus.vance.civ@army.mil',
    phone: '(443) 861-1200',
    address: 'Aberdeen Proving Ground, MD 21005',
    specializationNaics: ['541330', '541512', '334511'],
    activeSolicitationCount: 8,
  },
  {
    id: 'poc-003',
    name: 'Elena Rostova',
    role: 'Contract Specialist',
    department: 'DEPARTMENT OF VETERANS AFFAIRS',
    subTier: 'Veterans Health Administration (VHA)',
    office: 'VA Technology Acquisition Center (TAC)',
    email: 'elena.rostova@va.gov',
    phone: '(732) 795-1000',
    address: 'Eatontown, NJ 07724',
    specializationNaics: ['541512', '518210', '541611'],
    activeSolicitationCount: 12,
  },
  {
    id: 'poc-004',
    name: 'David K. Miller',
    role: 'Small Business Specialist (OSDBU)',
    department: 'DEPARTMENT OF HOMELAND SECURITY',
    subTier: 'Cybersecurity and Infrastructure Security Agency (CISA)',
    office: 'DHS / CISA Office of Small and Disadvantaged Business Utilization',
    email: 'cisa.osdbu@cisa.dhs.gov',
    phone: '(202) 282-8000',
    address: 'Arlington, VA 20598',
    specializationNaics: ['541512', '541519', '541690'],
    activeSolicitationCount: 19,
  },
  {
    id: 'poc-005',
    name: 'Cmdr. James Redding',
    role: 'Head of Contracting Activity (HCA)',
    department: 'DEPT OF THE NAVY',
    subTier: 'Naval Sea Systems Command (NAVSEA)',
    office: 'NAVSEA HQ Contracting Directorate (SEA 02)',
    email: 'james.redding.navy@navy.mil',
    phone: '(202) 781-0000',
    address: 'Washington Navy Yard, DC 20376',
    specializationNaics: ['541330', '336611', '541512'],
    activeSolicitationCount: 22,
  },
  {
    id: 'poc-006',
    name: 'Patricia Thorne',
    role: 'Small Business Specialist (OSDBU)',
    department: 'GENERAL SERVICES ADMINISTRATION',
    subTier: 'Federal Acquisition Service (FAS)',
    office: 'GSA FAS Office of Small Business Utilization',
    email: 'patricia.thorne@gsa.gov',
    phone: '(202) 501-1021',
    address: '1800 F Street NW, Washington, DC 20405',
    specializationNaics: ['541512', '541611', '518210'],
    activeSolicitationCount: 31,
  },
  {
    id: 'poc-007',
    name: 'Dr. Robert Lawson',
    role: 'Contracting Officer Representative (COR)',
    department: 'NATIONAL AERONAUTICS AND SPACE ADMINISTRATION',
    subTier: 'Goddard Space Flight Center (GSFC)',
    office: 'NASA GSFC Procurement Operations Office',
    email: 'robert.lawson@nasa.gov',
    phone: '(301) 286-2000',
    address: 'Greenbelt, MD 20771',
    specializationNaics: ['541715', '541512', '541330'],
    activeSolicitationCount: 6,
  },
  {
    id: 'poc-008',
    name: 'Amanda Brooks',
    role: 'Small Business Specialist (OSDBU)',
    department: 'DEPARTMENT OF HEALTH AND HUMAN SERVICES',
    subTier: 'National Institutes of Health (NIH)',
    office: 'NIH Office of Acquisition and Logistics Management (OALM)',
    email: 'amanda.brooks@nih.gov',
    phone: '(301) 496-4000',
    address: 'Bethesda, MD 20892',
    specializationNaics: ['541512', '541714', '541611'],
    activeSolicitationCount: 15,
  }
];

export const AgencyContactsSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const filteredContacts = useMemo(() => {
    return SAMPLE_AGENCY_CONTACTS.filter((poc) => {
      if (roleFilter !== 'all' && poc.role !== roleFilter) return false;
      if (deptFilter !== 'all' && poc.department !== deptFilter) return false;
      if (!searchTerm.trim()) return true;

      const q = searchTerm.toLowerCase().trim();
      return (
        poc.name.toLowerCase().includes(q) ||
        poc.department.toLowerCase().includes(q) ||
        (poc.subTier && poc.subTier.toLowerCase().includes(q)) ||
        poc.office.toLowerCase().includes(q) ||
        poc.email.toLowerCase().includes(q) ||
        poc.specializationNaics.some((n) => n.includes(q))
      );
    });
  }, [searchTerm, roleFilter, deptFilter]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <UserCheck className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">
              Agency Contacts & Contracting Officer Directory
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Search Small Business Specialists (OSDBU), Contracting Officers (CO), and CORs across 115+ federal organizations for pre-bid outreach and market research.
          </p>
        </div>

        <span className="bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold px-3 py-1 rounded-full font-mono shrink-0">
          {filteredContacts.length} Contacts Found
        </span>
      </div>

      {/* Search & Filter Controls Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search contact name, office, email, NAICS..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
          />
        </div>

        {/* Role Select */}
        <div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
          >
            <option value="all">👤 All Contact Roles</option>
            <option value="Small Business Specialist (OSDBU)">Small Business Specialist (OSDBU)</option>
            <option value="Contracting Officer (CO)">Contracting Officer (CO)</option>
            <option value="Contracting Officer Representative (COR)">Contracting Officer Representative (COR)</option>
            <option value="Head of Contracting Activity (HCA)">Head of Contracting Activity (HCA)</option>
            <option value="Contract Specialist">Contract Specialist</option>
          </select>
        </div>

        {/* Department Select */}
        <div>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
          >
            <option value="all">🏛️ All Departments & Agencies</option>
            {FEDERAL_ORGANIZATIONS.map((org) => (
              <option key={org.name} value={org.name}>
                {org.acronym ? `[${org.acronym}] ${org.name}` : org.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Contacts Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredContacts.map((poc) => (
          <div key={poc.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 hover:bg-white hover:border-blue-300 transition-all duration-200 space-y-3 shadow-2xs">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-slate-900">{poc.name}</h4>
                  <span className="bg-blue-100 text-blue-900 border border-blue-200 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    {poc.role}
                  </span>
                </div>
                <p className="text-xs font-semibold text-blue-700 mt-0.5">{poc.department}</p>
                {poc.subTier && <p className="text-[11px] text-slate-600 font-medium">{poc.subTier}</p>}
              </div>

              <span className="bg-slate-200/80 text-slate-700 font-mono text-[11px] font-bold px-2 py-0.5 rounded shrink-0">
                {poc.activeSolicitationCount} Active RFPs
              </span>
            </div>

            <p className="text-xs text-slate-500 bg-white border border-slate-200 p-2 rounded-lg font-mono text-[11px]">
              🏛️ {poc.office}
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <button
                onClick={() => handleCopyEmail(poc.email)}
                className="flex items-center gap-1.5 p-2 bg-white hover:bg-blue-50 border border-slate-200 rounded-lg text-slate-700 hover:text-blue-700 transition cursor-pointer truncate"
                title="Click to copy email address"
              >
                {copiedEmail === poc.email ? <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                <span className="truncate">{poc.email}</span>
              </button>

              <div className="flex items-center gap-1.5 p-2 bg-white border border-slate-200 rounded-lg text-slate-700 truncate">
                <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{poc.phone}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/80 text-[11px]">
              <div className="flex items-center gap-1 text-slate-500">
                <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                <span>{poc.address}</span>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-slate-400 font-bold mr-1">NAICS:</span>
                {poc.specializationNaics.map((code) => (
                  <span key={code} className="bg-slate-200 text-slate-800 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded">
                    {code}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
