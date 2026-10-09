import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  Save, 
  Sparkles, 
  Plus, 
  X, 
  Copy, 
  Trash2, 
  Settings2, 
  RotateCcw,
  Layers,
  Award,
  AlertTriangle,
  FolderPlus,
  Edit3,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { BusinessProfile } from '../types/contract';
import { POPULAR_NAICS, US_STATES } from '../data/samCuratedData';
import { getNaicsDefinition, OFFICIAL_NAICS_DATABASE, NAICS_BY_SECTOR } from '../data/naicsDatabase';

interface BusinessProfileViewProps {
  currentProfile: BusinessProfile;
  profiles: BusinessProfile[];
  onUpdateProfile: (updated: BusinessProfile) => void;
  onSelectPreset: (preset: BusinessProfile) => void;
  onCreateNewPreset: (newProfile: BusinessProfile) => void;
  onDuplicatePreset: (profileId: string) => void;
  onDeletePreset: (profileId: string) => void;
  onResetDefaults: () => void;
  initialOpenCreateModal?: boolean;
}

const ALL_CERTS = [
  '8(a)',
  'HUBZone',
  'Service-Disabled Veteran-Owned (SDVOSB)',
  'Women-Owned Small Business (WOSB/EDWOSB)',
  'Small Disadvantaged Business (SDB)',
  'Veteran-Owned Small Business (VOSB)',
  'Total Small Business',
];

export const BusinessProfileView: React.FC<BusinessProfileViewProps> = ({
  currentProfile,
  profiles,
  onUpdateProfile,
  onSelectPreset,
  onCreateNewPreset,
  onDuplicatePreset,
  onDeletePreset,
  onResetDefaults,
  initialOpenCreateModal = false,
}) => {
  const [profile, setProfile] = useState<BusinessProfile>({ ...currentProfile });
  const [newCapability, setNewCapability] = useState('');
  const [newSecondaryCode, setNewSecondaryCode] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Modals state
  const [showManageModal, setShowManageModal] = useState(false);
  const [isManageMaximized, setIsManageMaximized] = useState(false);
  const [showSaveAsNewModal, setShowSaveAsNewModal] = useState(initialOpenCreateModal);
  const [newPresetName, setNewPresetName] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Sync state if currentProfile prop changes
  useEffect(() => {
    setProfile({ ...currentProfile });
  }, [currentProfile.id, currentProfile.companyName]);

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onUpdateProfile(profile);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSaveAsNew = () => {
    const name = newPresetName.trim() || `${profile.companyName} (New Preset)`;
    const newProfile: BusinessProfile = {
      ...profile,
      id: `profile-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      companyName: name,
    };
    onCreateNewPreset(newProfile);
    setShowSaveAsNewModal(false);
    setNewPresetName('');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleCreateBlank = () => {
    const blankProfile: BusinessProfile = {
      id: `profile-${Date.now()}`,
      companyName: 'New SBA Contractor Entity',
      cageCode: '1A2B3',
      uei: 'ABC123XYZ456',
      primaryNaics: '541512',
      primaryNaicsTitle: 'Computer Systems Design Services',
      secondaryNaics: [],
      certifications: ['Total Small Business'],
      state: 'VA',
      targetStates: ['VA', 'MD', 'DC'],
      bondingCapacitySingle: 1000000,
      bondingCapacityAggregate: 2000000,
      securityClearance: 'None',
      coreCapabilities: ['Federal Technical Services'],
      pastPerformanceSummary: '',
      yearsInBusiness: 3,
      staffCount: 10,
      annualRevenue: '$1.5M',
      contactEmail: 'contact@mycompany.com',
      contactPhone: '(555) 000-0000',
    };
    onCreateNewPreset(blankProfile);
    setShowManageModal(false);
  };

  const toggleCert = (cert: string) => {
    const certs = [...profile.certifications];
    const index = certs.indexOf(cert);
    if (index > -1) {
      certs.splice(index, 1);
    } else {
      certs.push(cert);
    }
    setProfile({ ...profile, certifications: certs });
  };

  const addCapability = () => {
    if (!newCapability.trim()) return;
    setProfile({
      ...profile,
      coreCapabilities: [...profile.coreCapabilities, newCapability.trim()],
    });
    setNewCapability('');
  };

  const removeCapability = (index: number) => {
    const caps = [...profile.coreCapabilities];
    caps.splice(index, 1);
    setProfile({ ...profile, coreCapabilities: caps });
  };

  const addSecondaryNaics = () => {
    if (!newSecondaryCode.trim()) return;
    const def = getNaicsDefinition(newSecondaryCode.trim());
    const title = def.censusTitle;
    setProfile({
      ...profile,
      secondaryNaics: [
        ...profile.secondaryNaics,
        { code: newSecondaryCode.trim(), title },
      ],
    });
    setNewSecondaryCode('');
  };

  const removeSecondaryNaics = (code: string) => {
    setProfile({
      ...profile,
      secondaryNaics: profile.secondaryNaics.filter((s) => s.code !== code),
    });
  };

  // Readiness calculation
  let strength = 20;
  if (profile.cageCode && profile.uei) strength += 20;
  if (profile.certifications.length > 0) strength += 20;
  if (profile.coreCapabilities.length >= 3) strength += 20;
  if (profile.pastPerformanceSummary.length > 30) strength += 20;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Presets Switcher Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Building2 className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Company Profile Quick Presets
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Manage multiple small business entities, 8(a) joint ventures, or subsidiary profiles.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setNewPresetName(`${profile.companyName} (New)`);
                setShowSaveAsNewModal(true);
              }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Preset</span>
            </button>

            <button
              onClick={() => setShowManageModal(true)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Settings2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Manage Presets ({profiles.length})</span>
            </button>
          </div>
        </div>

        {/* Preset Badges Grid */}
        <div className="flex flex-wrap items-center gap-2">
          {profiles.map((p) => {
            const isActive = currentProfile.id === p.id;
            return (
              <div
                key={p.id}
                onClick={() => onSelectPreset(p)}
                className={`px-3 py-2 rounded-xl border text-xs font-medium flex items-center gap-2.5 transition cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-500/20'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-white' : 'bg-slate-400'}`}></div>
                <div className="text-left">
                  <span className="font-bold block truncate max-w-[170px] leading-tight">
                    {p.companyName}
                  </span>
                  <span className={`text-[10px] ${isActive ? 'text-blue-100' : 'text-slate-400'} font-mono`}>
                    NAICS: {p.primaryNaics}
                  </span>
                </div>
                {isActive && (
                  <CheckCircle2 className="w-4 h-4 text-blue-100 shrink-0 ml-1" />
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Actions for Current Preset */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Currently Editing:</span>
            <strong className="text-slate-900 bg-slate-100 px-2 py-0.5 rounded font-semibold">
              {currentProfile.companyName}
            </strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onDuplicatePreset(currentProfile.id)}
              className="px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded border border-slate-200 flex items-center gap-1 transition"
              title="Clone this profile as a starting template"
            >
              <Copy className="w-3 h-3 text-slate-400" />
              <span>Duplicate</span>
            </button>

            <button
              onClick={() => {
                setNewPresetName(`${currentProfile.companyName} JV`);
                setShowSaveAsNewModal(true);
              }}
              className="px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded border border-slate-200 flex items-center gap-1 transition"
              title="Save current modifications into a separate preset"
            >
              <FolderPlus className="w-3 h-3 text-slate-400" />
              <span>Save As New Preset...</span>
            </button>

            {profiles.length > 1 && (
              <button
                onClick={() => setConfirmDeleteId(currentProfile.id)}
                className="px-2.5 py-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded border border-red-200 flex items-center gap-1 transition"
                title="Delete this profile"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Core SAM Entity Identifiers */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Federal Entity Identifiers (SAM.gov & CAGE)</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">
              Preset ID: {profile.id}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company / Entity Legal Name</label>
              <input
                type="text"
                value={profile.companyName}
                onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                className="w-full py-2 px-3 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">CAGE Code (5 Alphanumeric)</label>
              <input
                type="text"
                value={profile.cageCode}
                maxLength={5}
                onChange={(e) => setProfile({ ...profile, cageCode: e.target.value.toUpperCase() })}
                className="w-full py-2 px-3 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Unique Entity ID (UEI)</label>
              <input
                type="text"
                value={profile.uei}
                maxLength={12}
                onChange={(e) => setProfile({ ...profile, uei: e.target.value.toUpperCase() })}
                className="w-full py-2 px-3 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs pt-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Headquarters State</label>
              <select
                value={profile.state}
                onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                className="w-full py-2 px-3 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                {US_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Facility Security Clearance</label>
              <select
                value={profile.securityClearance}
                onChange={(e) => setProfile({ ...profile, securityClearance: e.target.value as any })}
                className="w-full py-2 px-3 border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                <option value="None">None / Commercial</option>
                <option value="Public Trust">Public Trust (Tier 1/2/4)</option>
                <option value="Secret">Secret (Tier 3)</option>
                <option value="Top Secret">Top Secret (Tier 5)</option>
                <option value="TS/SCI">TS / SCI Eligible</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Single Project Bonding ($)</label>
              <input
                type="number"
                value={profile.bondingCapacitySingle}
                onChange={(e) => setProfile({ ...profile, bondingCapacitySingle: Number(e.target.value) })}
                className="w-full py-2 px-3 border border-slate-300 rounded-lg font-mono text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Aggregate Bonding ($)</label>
              <input
                type="number"
                value={profile.bondingCapacityAggregate}
                onChange={(e) => setProfile({ ...profile, bondingCapacityAggregate: Number(e.target.value) })}
                className="w-full py-2 px-3 border border-slate-300 rounded-lg font-mono text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Small Business Certifications */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-4 h-4 text-blue-600" />
            <span>SBA Socioeconomic Certifications (FAR Part 19 Qualification)</span>
          </h3>
          <p className="text-xs text-slate-500">
            Select all verified certifications for this company profile. Solicitations matching these designations will trigger high-priority Fit Scores.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2">
            {ALL_CERTS.map((cert) => {
              const active = profile.certifications.includes(cert);
              return (
                <div
                  key={cert}
                  onClick={() => toggleCert(cert)}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between cursor-pointer transition ${
                    active
                      ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>{cert}</span>
                  <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                    active ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
                  }`}>
                    {active && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* NAICS Code Settings */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>NAICS Codes (Primary & Secondary Industry Alignments)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700">
                  Primary NAICS Code (Anchor for Match Engine)
                </label>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  SBA Size Std: {getNaicsDefinition(profile.primaryNaics).sizeStandard}
                </span>
              </div>
              <select
                value={profile.primaryNaics}
                onChange={(e) => {
                  const code = e.target.value;
                  const def = getNaicsDefinition(code);
                  setProfile({
                    ...profile,
                    primaryNaics: code,
                    primaryNaicsTitle: def.censusTitle,
                  });
                }}
                className="w-full py-2 px-3 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                {NAICS_BY_SECTOR.map((sector) => (
                  <optgroup key={sector.sectorCode} label={`Sector ${sector.sectorCode}: ${sector.sectorTitle}`}>
                    {sector.codes.map((n) => (
                      <option key={n.code} value={n.code}>
                        {n.code} - {n.censusTitle}{n.code === '541512' ? ' (Commercial & Gov)' : ''}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>

              {/* Title editor with quick presets */}
              <div className="mt-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-700">NAICS Title Designation:</span>
                  <span className="text-[10px] text-blue-700 font-medium">NAICS.com & SBA Sync</span>
                </div>
                <input
                  type="text"
                  value={profile.primaryNaicsTitle}
                  onChange={(e) => setProfile({ ...profile, primaryNaicsTitle: e.target.value })}
                  placeholder="Official NAICS Title"
                  className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      const def = getNaicsDefinition(profile.primaryNaics);
                      setProfile({ ...profile, primaryNaicsTitle: def.censusTitle });
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                      profile.primaryNaicsTitle === getNaicsDefinition(profile.primaryNaics).censusTitle
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Census / NAICS.com: {getNaicsDefinition(profile.primaryNaics).censusTitle}
                  </button>
                  {getNaicsDefinition(profile.primaryNaics).sbaAlias && (
                    <button
                      type="button"
                      onClick={() => {
                        const def = getNaicsDefinition(profile.primaryNaics);
                        setProfile({ ...profile, primaryNaicsTitle: def.sbaAlias! });
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                        profile.primaryNaicsTitle === getNaicsDefinition(profile.primaryNaics).sbaAlias
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      SBA Solicitation Alias: {getNaicsDefinition(profile.primaryNaics).sbaAlias}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Add Secondary NAICS</label>
              <div className="flex gap-2">
                <select
                  value={newSecondaryCode}
                  onChange={(e) => setNewSecondaryCode(e.target.value)}
                  className="flex-1 py-2 px-3 border border-slate-300 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="">Select industry code to add...</option>
                  {NAICS_BY_SECTOR.map((sector) => {
                    const availableCodes = sector.codes.filter(
                      (n) =>
                        n.code !== profile.primaryNaics &&
                        !profile.secondaryNaics.some((s) => s.code === n.code)
                    );
                    if (availableCodes.length === 0) return null;
                    return (
                      <optgroup key={sector.sectorCode} label={`Sector ${sector.sectorCode}: ${sector.sectorTitle}`}>
                        {availableCodes.map((n) => (
                          <option key={n.code} value={n.code}>
                            {n.code} - {n.censusTitle}
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>
                <button
                  type="button"
                  onClick={addSecondaryNaics}
                  className="px-3 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 text-xs font-semibold cursor-pointer"
                >
                  Add
                </button>
              </div>

              {/* Informational SBA Alignment Card */}
              <div className="mt-3 p-2.5 bg-blue-50/70 rounded-lg border border-blue-200/80 text-[11px] text-blue-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-blue-950">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>SBA.gov & DSBS Data Pull Verification:</span>
                </div>
                <p className="text-[10px] text-blue-800 leading-relaxed">
                  Serial Code <strong>{profile.primaryNaics}</strong> correctly correlates with <strong>{getNaicsDefinition(profile.primaryNaics).sbaTitle}</strong> in SBA.gov vendor profiles (Census Bureau cross-reference: <em>{getNaicsDefinition(profile.primaryNaics).censusTitle}</em>). All opportunities in this app automatically match both designations.
                </p>
              </div>
            </div>
          </div>

          {/* Active Secondary NAICS Pills */}
          <div>
            <span className="block text-xs font-semibold text-slate-600 mb-2">Registered Secondary Codes:</span>
            <div className="flex flex-wrap gap-2">
              {profile.secondaryNaics.map((sec) => (
                <span
                  key={sec.code}
                  className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-800 px-3 py-1 rounded-lg border border-slate-200 text-xs font-medium"
                >
                  <strong className="font-mono text-blue-700">{sec.code}</strong>
                  <span className="truncate max-w-[200px]">{sec.title}</span>
                  <button
                    type="button"
                    onClick={() => removeSecondaryNaics(sec.code)}
                    className="text-slate-400 hover:text-red-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Core Capabilities Statement */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Core Capabilities & SOW Keyword Synergy</span>
          </h3>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Zero Trust Architecture, Base Operations Support, SCIF ICD 705, Emergency Generator Testing..."
              value={newCapability}
              onChange={(e) => setNewCapability(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCapability();
                }
              }}
              className="flex-1 py-2 px-3 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
            <button
              type="button"
              onClick={addCapability}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {profile.coreCapabilities.map((cap, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-2 bg-blue-50 text-blue-900 border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-medium"
              >
                <span>{cap}</span>
                <button
                  type="button"
                  onClick={() => removeCapability(i)}
                  className="text-blue-400 hover:text-red-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Past Performance Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Past Performance Citation Summary (For Volume II Proposals)
          </h3>
          <textarea
            rows={4}
            value={profile.pastPerformanceSummary}
            onChange={(e) => setProfile({ ...profile, pastPerformanceSummary: e.target.value })}
            className="w-full p-3 border border-slate-300 rounded-xl text-xs text-slate-800 leading-relaxed focus:ring-2 focus:ring-blue-600 focus:outline-none"
            placeholder="Describe past contract performance, scope, customer agencies, and CPARS evaluations..."
          />
        </div>

        {/* Submit & Save Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {saveSuccess ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Preset "{profile.companyName}" successfully saved!</span>
            </div>
          ) : (
            <div className="text-xs text-slate-400">
              Saving updates this preset in your local workspace.
            </div>
          )}

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setNewPresetName(`${profile.companyName} (Copy)`);
                setShowSaveAsNewModal(true);
              }}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl border border-slate-300 flex items-center gap-1.5 transition cursor-pointer"
            >
              <FolderPlus className="w-3.5 h-3.5 text-slate-500" />
              <span>Save As New Preset</span>
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes to Preset</span>
            </button>
          </div>
        </div>
      </form>

      {/* MODAL 1: Save As New Preset Modal */}
      {showSaveAsNewModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[92vh] flex flex-col p-6 border border-slate-200 shadow-2xl space-y-4 overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Create New Company Preset</h3>
              </div>
              <button
                onClick={() => setShowSaveAsNewModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Enter a name for this new company profile preset. It will clone the current details and become selectable across all tabs.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Preset / Entity Name
              </label>
              <input
                type="text"
                autoFocus
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                placeholder="e.g. Apex Cyber Systems - JV Entity or Ironclad Defense South"
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSaveAsNew();
                  }
                }}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 text-xs">
              <button
                type="button"
                onClick={() => setShowSaveAsNewModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAsNew}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs"
              >
                Create Preset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Comprehensive Preset Manager Modal */}
      {showManageModal && (
        <div className={`fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center transition-all ${isManageMaximized ? 'p-0' : 'p-2 sm:p-4 md:p-6'}`}>
          <div className={`bg-white border border-slate-200 shadow-2xl flex flex-col overflow-hidden transition-all duration-150 ${isManageMaximized ? 'w-full h-full max-w-none max-h-none rounded-none' : 'max-w-3xl w-full max-h-[92vh] sm:max-h-[90vh] rounded-2xl animate-in fade-in zoom-in-95'}`}>
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-5 sm:px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold">Manage Company Profile Presets</h3>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsManageMaximized(!isManageMaximized)}
                  title={isManageMaximized ? "Restore window size (Minimize to standard dialog)" : "Expand window to full screen (Maximize)"}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
                >
                  {isManageMaximized ? <Minimize2 className="w-4 h-4 text-blue-400" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setShowManageModal(false)}
                  className="text-slate-400 hover:text-white p-1.5 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                  title="Close window"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Presets List */}
            <div className="p-6 overflow-y-auto space-y-3 flex-1">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span>Total Presets: <strong>{profiles.length}</strong></span>
                <button
                  onClick={handleCreateBlank}
                  className="text-blue-600 hover:underline font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Blank Entity</span>
                </button>
              </div>

              {profiles.map((p) => {
                const isActive = currentProfile.id === p.id;

                return (
                  <div
                    key={p.id}
                    className={`p-4 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                      isActive
                        ? 'bg-blue-50/70 border-blue-300 ring-1 ring-blue-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">{p.companyName}</h4>
                        {isActive && (
                          <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.2 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 text-slate-500 text-[11px]">
                        <span>CAGE: <strong className="font-mono text-slate-700">{p.cageCode}</strong></span>
                        <span>•</span>
                        <span>Primary NAICS: <strong className="font-mono text-slate-700">{p.primaryNaics}</strong></span>
                        <span>•</span>
                        <span>State: <strong>{p.state}</strong></span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {p.certifications.slice(0, 3).map((c, i) => (
                          <span key={i} className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded text-[10px]">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {!isActive && (
                        <button
                          onClick={() => {
                            onSelectPreset(p);
                            setShowManageModal(false);
                          }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
                        >
                          Select
                        </button>
                      )}

                      <button
                        onClick={() => onDuplicatePreset(p.id)}
                        title="Duplicate Preset"
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {profiles.length > 1 && (
                        <button
                          onClick={() => setConfirmDeleteId(p.id)}
                          title="Delete Preset"
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg border border-red-200 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between text-xs">
              <button
                onClick={() => {
                  if (confirm('Reset to default SBA presets (Apex, Vanguard, Ironclad)? Custom presets will be replaced.')) {
                    onResetDefaults();
                    setShowManageModal(false);
                  }
                }}
                className="text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Default Templates</span>
              </button>

              <button
                onClick={() => setShowManageModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 border border-slate-200 shadow-2xl space-y-3 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-sm text-slate-900">Confirm Deletion</h3>
            </div>
            <p className="text-xs text-slate-600">
              Are you sure you want to delete this company preset? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2 text-xs">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeletePreset(confirmDeleteId);
                  setConfirmDeleteId(null);
                }}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg"
              >
                Delete Preset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
