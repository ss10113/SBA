import React, { useState } from 'react';
import { 
  BarChart3, 
  Calculator, 
  ShieldAlert, 
  CheckCircle2, 
  HelpCircle, 
  BookOpen, 
  Building, 
  TrendingUp,
  FileCheck,
  Award,
  DollarSign,
  ExternalLink,
  Layers,
  Sparkles,
  Briefcase,
  Compass
} from 'lucide-react';

interface CalcLaborCategory {
  title: string;
  education: string;
  minExperience: string;
  p25Rate: number;
  medianRate: number;
  p75Rate: number;
  ceilingRate: number;
  sampleContractors: string;
}

const SAMPLE_CALC_RATES: Record<string, CalcLaborCategory> = {
  'cyber_arch': {
    title: 'Senior Cybersecurity / Zero Trust Architect',
    education: "Bachelor's / Master's Degree (CISSP, CISM)",
    minExperience: '8+ Years DoD/Fed Experience',
    p25Rate: 162.50,
    medianRate: 188.00,
    p75Rate: 215.00,
    ceilingRate: 248.50,
    sampleContractors: 'Booz Allen, Leidos, CACI, Small Biz 8(a) Primes',
  },
  'cloud_eng': {
    title: 'Senior Cloud Solutions Engineer (AWS/Azure/GCP)',
    education: "Bachelor's Degree (AWS/Azure Certified)",
    minExperience: '6+ Years Federal Cloud Migrations',
    p25Rate: 148.00,
    medianRate: 172.50,
    p75Rate: 198.00,
    ceilingRate: 230.00,
    sampleContractors: 'General Dynamics, Peraton, SDVOSB IT Primes',
  },
  'pm_scrum': {
    title: 'IT Project Manager / Agile Scrum Master',
    education: "Bachelor's Degree (PMP, CSM, SAFe)",
    minExperience: '7+ Years Agile Federal Programs',
    p25Rate: 132.00,
    medianRate: 154.00,
    p75Rate: 178.50,
    ceilingRate: 205.00,
    sampleContractors: 'Deloitte, ICF, WOSB Technical Services',
  },
  'fullstack_dev': {
    title: 'Full-Stack Software Developer (React / Java / Python)',
    education: "Bachelor's Degree in Computer Science",
    minExperience: '5+ Years Application Development',
    p25Rate: 124.00,
    medianRate: 146.00,
    p75Rate: 169.00,
    ceilingRate: 195.00,
    sampleContractors: 'Guidehouse, ManTech, HUBZone Tech Primes',
  },
  'ai_specialist': {
    title: 'AI / Machine Learning Systems Specialist',
    education: "Master's / Ph.D. in Computer Science or Math",
    minExperience: '5+ Years NLP, LLM, or Computer Vision',
    p25Rate: 175.00,
    medianRate: 205.00,
    p75Rate: 242.00,
    ceilingRate: 285.00,
    sampleContractors: 'Palantir, Booz Allen, 8(a) AI Research Primes',
  },
  'sys_admin': {
    title: 'Senior Systems & Network Infrastructure Engineer',
    education: 'Associate / Bachelor Degree (Security+ CE)',
    minExperience: '6+ Years Data Center & Network Operations',
    p25Rate: 112.00,
    medianRate: 132.50,
    p75Rate: 152.00,
    ceilingRate: 178.00,
    sampleContractors: 'SAIC, Vectrus, Service-Disabled Veteran Primes',
  },
  'cqm_super': {
    title: 'Federal Construction Quality Control Manager (CQM)',
    education: 'USACE CQM Certification, OSHA 30-Hour',
    minExperience: '8+ Years DoD/USACE General Construction',
    p25Rate: 98.00,
    medianRate: 118.00,
    p75Rate: 138.00,
    ceilingRate: 165.00,
    sampleContractors: 'Hensel Phelps, Whiting-Turner, SBA SDVOSB Builders',
  },
};

export const MarketInsightsView: React.FC = () => {
  // Interactive FAR 52.219-14 Calculator State
  const [contractType, setContractType] = useState<'services' | 'general_construction' | 'specialty_trade' | 'supplies'>('services');
  const [totalLaborCost, setTotalLaborCost] = useState<number>(500000);
  const [primeLaborCost, setPrimeLaborCost] = useState<number>(275000);
  const [similarlySituatedSubCost, setSimilarlySituatedSubCost] = useState<number>(50000);

  // Selected CALC Labor Category State
  const [selectedCalcRole, setSelectedCalcRole] = useState<string>('cyber_arch');

  // Requirements thresholds
  const requiredPercentage = contractType === 'services' || contractType === 'supplies' ? 50 : contractType === 'general_construction' ? 15 : 25;

  const totalCompliantLabor = primeLaborCost + similarlySituatedSubCost;
  const compliantPercentage = totalLaborCost > 0 ? (totalCompliantLabor / totalLaborCost) * 100 : 0;
  const isCompliant = compliantPercentage >= requiredPercentage;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-md">
        <div className="flex items-center gap-2 mb-1">
          <Award className="w-5 h-5 text-blue-400" />
          <span className="text-xs font-mono font-bold tracking-wider text-blue-300 uppercase">
            Federal Procurement Intelligence
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold">
          SBA Contractor Win Insights & Compliance Playbook
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
          Federal small business contracting goals, statutory limitations on subcontracting under FAR Part 19, and competitive advantages for certified 8(a), SDVOSB, WOSB, and HUBZone enterprises.
        </p>
      </div>

      {/* Federal 23% Statutory Goals Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>Federal Prime Contracting Small Business Utilization Targets</span>
            </h3>
            <p className="text-xs text-slate-500">
              The Small Business Act mandates that at least 23% of all federal prime contract dollars be awarded to small businesses.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded">
            Statutory Target: 23%
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl">
            <span className="font-bold text-purple-900 block text-sm">8(a) / SDB Concerns</span>
            <span className="text-2xl font-black text-purple-700 font-mono block my-1">13.0%</span>
            <p className="text-purple-950 text-[11px] leading-tight">
              Small Disadvantaged Businesses (Increased by executive order toward 15% goal).
            </p>
          </div>

          <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl">
            <span className="font-bold text-indigo-900 block text-sm">SDVOSB Concerns</span>
            <span className="text-2xl font-black text-indigo-700 font-mono block my-1">5.0%</span>
            <p className="text-indigo-950 text-[11px] leading-tight">
              Service-Disabled Veteran-Owned Small Businesses certified via SBA VetCert.
            </p>
          </div>

          <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-xl">
            <span className="font-bold text-rose-900 block text-sm">WOSB / EDWOSB</span>
            <span className="text-2xl font-black text-rose-700 font-mono block my-1">5.0%</span>
            <p className="text-rose-950 text-[11px] leading-tight">
              Women-Owned & Economically Disadvantaged Women-Owned Small Businesses.
            </p>
          </div>

          <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-xl">
            <span className="font-bold text-teal-900 block text-sm">HUBZone Businesses</span>
            <span className="text-2xl font-black text-teal-700 font-mono block my-1">3.0%</span>
            <p className="text-teal-950 text-[11px] leading-tight">
              Historically Underutilized Business Zones with 10% price evaluation preference.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive FAR 52.219-14 Subcontracting Calculator */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Interactive FAR 52.219-14 "Limitations on Subcontracting" Checker
              </h3>
              <p className="text-xs text-slate-500">
                Verify whether your proposed work-share satisfies mandatory SBA self-performance rules before submitting your pricing volume.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
          {/* Inputs */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Solicitation Category</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'services', label: 'Services (50%)', threshold: 50 },
                  { id: 'supplies', label: 'Supplies (50%)', threshold: 50 },
                  { id: 'general_construction', label: 'General Constr (15%)', threshold: 15 },
                  { id: 'specialty_trade', label: 'Specialty Trade (25%)', threshold: 25 },
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setContractType(c.id as any)}
                    className={`p-2 rounded-lg border font-semibold text-center transition cursor-pointer ${
                      contractType === c.id
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Total Contract Labor Cost ($)</label>
                <input
                  type="number"
                  value={totalLaborCost}
                  onChange={(e) => setTotalLaborCost(Number(e.target.value))}
                  className="w-full py-2 px-3 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Prime Self-Performed Labor ($)</label>
                <input
                  type="number"
                  value={primeLaborCost}
                  onChange={(e) => setPrimeLaborCost(Number(e.target.value))}
                  className="w-full py-2 px-3 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Similarly Situated Subcontractor ($)
                </label>
                <input
                  type="number"
                  value={similarlySituatedSubCost}
                  onChange={(e) => setSimilarlySituatedSubCost(Number(e.target.value))}
                  className="w-full py-2 px-3 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Subs with same SBA certification</span>
              </div>
            </div>
          </div>

          {/* Compliance Result Box */}
          <div className={`rounded-xl p-5 border flex flex-col justify-between ${
            isCompliant ? 'bg-emerald-50 border-emerald-300' : 'bg-red-50 border-red-300'
          }`}>
            <div>
              <div className="flex items-center gap-2 mb-2">
                {isCompliant ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <ShieldAlert className="w-5 h-5 text-red-600" />
                )}
                <h4 className={`font-bold text-sm ${isCompliant ? 'text-emerald-950' : 'text-red-950'}`}>
                  {isCompliant ? 'FAR 52.219-14 Compliant' : 'Non-Compliant Work-Share!'}
                </h4>
              </div>

              <div className="space-y-1 mb-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">Compliant Share:</span>
                  <span className="font-mono font-bold text-slate-900">{compliantPercentage.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Statutory Minimum:</span>
                  <span className="font-mono font-bold text-slate-900">{requiredPercentage}%</span>
                </div>
              </div>

              <p className="text-[11px] leading-relaxed text-slate-700">
                {isCompliant ? (
                  <span>
                    Your proposed work-share of <strong>{compliantPercentage.toFixed(1)}%</strong> satisfies the {requiredPercentage}% threshold under FAR 52.219-14.
                  </span>
                ) : (
                  <span className="text-red-800 font-medium">
                    Warning: Non-similarly situated subcontractors exceed allowable limits. You must increase prime or similarly-situated small business labor by ${(
                      (requiredPercentage / 100) * totalLaborCost - totalCompliantLabor
                    ).toLocaleString(undefined, { maximumFractionDigits: 0 })} to avoid bid disqualification.
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Top 5 Small Business Buying Agencies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Building className="w-4 h-4 text-blue-600" />
            <span>Top Federal Agencies by Small Business Obligations</span>
          </h3>

          <div className="space-y-3 text-xs">
            {[
              { agency: 'Department of Defense (Army, Navy, Air Force, DLA)', spend: '$85.4 Billion', share: '24.2% of Prime', badge: 'High Volume' },
              { agency: 'Department of Veterans Affairs (VHA, NCA)', spend: '$14.2 Billion', share: '32.1% (Vet First Priority)', badge: 'SDVOSB Focus' },
              { agency: 'Department of Energy (NNSA & National Labs)', spend: '$10.8 Billion', share: '18.4% Facility/Science', badge: 'M&O Subcontracting' },
              { agency: 'Department of Homeland Security (CBP, TSA, FEMA)', spend: '$9.6 Billion', share: '36.5% Highest %', badge: 'Small Biz Leader' },
              { agency: 'General Services Administration (GSA Schedules)', spend: '$6.5 Billion', share: '38.0% MAS Primes', badge: 'Best Value' },
            ].map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">{item.agency}</h4>
                  <span className="text-[11px] text-slate-500">{item.share}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-blue-700 block">{item.spend}</span>
                  <span className="text-[10px] font-semibold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                    {item.badge}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SBA Bidding Best Practices */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>Golden Rules for Winning SBA Federal Solicitations</span>
          </h3>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 bg-blue-50/60 border border-blue-200/60 rounded-xl">
              <span className="font-bold text-blue-950 block mb-0.5">1. Section L Compliance Trumps All:</span>
              <p className="text-slate-700 leading-normal">
                Government evaluators score bids using strict pass/fail Section L checklists. Follow font sizes, margins, volume naming, and page limits to the letter.
              </p>
            </div>

            <div className="p-3 bg-purple-50/60 border border-purple-200/60 rounded-xl">
              <span className="font-bold text-purple-950 block mb-0.5">2. 8(a) Sole-Source Thresholds:</span>
              <p className="text-slate-700 leading-normal">
                Contracting officers can award direct sole-source contracts to 8(a) firms up to $4.5M (goods/services) and $7.5M (manufacturing) without formal competition under FAR 19.805.
              </p>
            </div>

            <div className="p-3 bg-emerald-50/60 border border-emerald-200/60 rounded-xl">
              <span className="font-bold text-emerald-950 block mb-0.5">3. SBA Mentor-Protégé Joint Ventures (MPP):</span>
              <p className="text-slate-700 leading-normal">
                Under an SBA-approved Mentor-Protégé Agreement, small firms can form an unpopulated JV with large primes and bid on set-asides using the large mentor's past performance!
              </p>
            </div>

            <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-xl">
              <span className="font-bold text-amber-950 block mb-0.5">4. Continuous SAM.gov & DSBS Hygiene:</span>
              <p className="text-slate-700 leading-normal">
                Keep your Dynamic Small Business Search (DSBS) capability narrative populated with exact keywords that contracting specialists search for before deciding to set aside an RFP.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* NEW: GSA Acquisition Gateway Public API (AG-API) & CALC Pricing Intelligence Section */}
      <div className="bg-white rounded-2xl border-2 border-indigo-200 shadow-md p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-indigo-100 text-indigo-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-indigo-200">
                GSA OPEN TECH COMPANION API
              </span>
              <span className="text-xs text-slate-500 font-mono">open.gsa.gov/api/ag-api/</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Compass className="w-5 h-5 text-indigo-600" />
              <span>GSA Acquisition Gateway (AG-API) & CALC Labor Rate Intelligence</span>
            </h3>
            <p className="text-xs text-slate-600 max-w-3xl mt-1">
              How the GSA Acquisition Gateway Public API (<a href="https://open.gsa.gov/api/ag-api/" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline font-mono">open.gsa.gov/api/ag-api/</a>) elevates SBA GovWin from basic RFP searching into an end-to-end <strong>Price-To-Win (PTW)</strong> and market intelligence machine.
            </p>
          </div>

          <a
            href="https://open.gsa.gov/api/ag-api/"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition self-start md:self-auto shrink-0 shadow-xs"
          >
            <span>View AG-API on GSA</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* 4 Pillars of AG-API Integration */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-slate-900">1. CALC Rate Benchmarking</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Historical ceiling hourly rates across 100,000+ awarded GSA Multiple Award Schedule contracts. Essential for Section L/M pricing models.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-slate-900">2. Procurement Forecasts</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Advance agency opportunity forecasts posted 6–12 months <em>before</em> they appear on SAM.gov, allowing primes to build teaming agreements early.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-slate-900">3. Solutions Finder (GWACs)</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Intelligence on government-wide vehicles (OASIS+, 8(a) STARS III, VETS 2) so small businesses know which vehicles agencies plan to direct task orders to.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-slate-900">4. SOW / PWS Document Library</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Repository of approved Statement of Work templates and federal work statements used by federal contracting officers across civilian and defense agencies.
            </p>
          </div>
        </div>

        {/* Interactive CALC Federal Labor Pricing Tool */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-xl p-5 text-white space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider">
                GSA CALC (Contract-Awarded Labor Category) Price-To-Win Simulator
              </span>
              <h4 className="text-sm font-bold text-white mt-0.5">
                Federal Awarded Hourly Rate Benchmarks (FAR Part 15 Compliance)
              </h4>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Select Labor Category:</span>
              <select
                value={selectedCalcRole}
                onChange={(e) => setSelectedCalcRole(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              >
                {Object.entries(SAMPLE_CALC_RATES).map(([key, role]) => (
                  <option key={key} value={key}>
                    {role.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Rate Statistics Cards */}
          {(() => {
            const role = SAMPLE_CALC_RATES[selectedCalcRole] || SAMPLE_CALC_RATES['cyber_arch'];
            return (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">25th Percentile</span>
                    <span className="text-lg font-bold font-mono text-blue-300 block my-0.5">
                      ${role.p25Rate.toFixed(2)}/hr
                    </span>
                    <span className="text-[9px] text-slate-500">Competitive Floor</span>
                  </div>

                  <div className="bg-slate-950/70 p-3 rounded-lg border border-indigo-500/50 ring-1 ring-indigo-500/30">
                    <span className="text-[10px] text-indigo-300 uppercase font-mono font-bold block">Federal Median Rate</span>
                    <span className="text-2xl font-black font-mono text-emerald-400 block my-0.5">
                      ${role.medianRate.toFixed(2)}/hr
                    </span>
                    <span className="text-[9px] text-indigo-200">Recommended Target</span>
                  </div>

                  <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">75th Percentile</span>
                    <span className="text-lg font-bold font-mono text-blue-300 block my-0.5">
                      ${role.p75Rate.toFixed(2)}/hr
                    </span>
                    <span className="text-[9px] text-slate-500">Premium / Cleared</span>
                  </div>

                  <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Ceiling Max</span>
                    <span className="text-lg font-bold font-mono text-amber-400 block my-0.5">
                      ${role.ceilingRate.toFixed(2)}/hr
                    </span>
                    <span className="text-[9px] text-slate-500">Schedule Ceiling</span>
                  </div>
                </div>

                {/* Qualification Standards & Wrap Rate Analysis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-950/40 p-3 rounded-lg border border-slate-800/80">
                  <div className="space-y-1">
                    <span className="text-slate-400 text-[11px] block font-mono">GSA Mandatory Qualifications:</span>
                    <div className="text-white font-medium">{role.education}</div>
                    <div className="text-slate-400 text-[11px]">{role.minExperience}</div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-400 text-[11px] block font-mono">Sample Awarded Primes (MAS Schedule 70):</span>
                    <div className="text-slate-300 font-medium">{role.sampleContractors}</div>
                    <p className="text-[10px] text-indigo-300">
                      Pricing within the 25th–75th percentile maximizes P-Win evaluation points under Best-Value Tradeoff (BVTO).
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
