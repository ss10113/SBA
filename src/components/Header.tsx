import React from 'react';
import { 
  ShieldCheck, 
  Building2, 
  Briefcase, 
  Kanban, 
  BarChart3, 
  Sparkles,
  ChevronDown,
  Cpu,
  Server,
  Zap,
  Maximize2,
  Minimize2,
  Key,
  Eye,
  EyeOff,
  Save,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { BusinessProfile } from '../types/contract';
import { SAMPLE_PROFILES } from '../data/samCuratedData';

interface HeaderProps {
  activeTab: 'canvass' | 'strategy' | 'profile' | 'pipeline' | 'insights' | 'labor_rates';
  setActiveTab: (tab: 'canvass' | 'strategy' | 'profile' | 'pipeline' | 'insights' | 'labor_rates') => void;
  currentProfile: BusinessProfile;
  profiles: BusinessProfile[];
  onSelectProfile: (profile: BusinessProfile) => void;
  onCreateNewPreset?: () => void;
  savedBidsCount: number;
  totalOpportunitiesCount: number;
  apiMode?: 'live-api' | 'test-api' | 'curated-feed';
  hasLiveApiKey?: boolean;
  activeEnv?: 'alpha' | 'production';
  onChangeEnv?: (env: 'alpha' | 'production') => void;
  totalSamDatabaseRecords?: number;
  onRefreshFeed?: () => void;
  onOpenValidationModal?: () => void;
  onOpenAiConfig?: () => void;
  onOpenGsaApiKeyModal?: () => void;
  aiConfigStatus?: {
    hasKey: boolean;
    provider: string;
    modelName: string;
    maskedKey?: string | null;
  } | null;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentProfile,
  profiles,
  onSelectProfile,
  onCreateNewPreset,
  savedBidsCount,
  totalOpportunitiesCount,
  apiMode = 'curated-feed',
  hasLiveApiKey = false,
  activeEnv = 'alpha',
  onChangeEnv,
  totalSamDatabaseRecords,
  onRefreshFeed,
  onOpenValidationModal,
  onOpenAiConfig,
  onOpenGsaApiKeyModal,
  aiConfigStatus,
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = React.useState(false);
  const [apiInfoModalOpen, setApiInfoModalOpen] = React.useState(false);
  const [isApiModalMaximized, setIsApiModalMaximized] = React.useState(false);
  const [pingTesting, setPingTesting] = React.useState(false);
  const [pingResult, setPingResult] = React.useState<any>(null);
  const [samKeyInput, setSamKeyInput] = React.useState('');
  const [showSamKey, setShowSamKey] = React.useState(false);
  const [savingSamKey, setSavingSamKey] = React.useState(false);
  const [samKeyFeedback, setSamKeyFeedback] = React.useState<{ text: string; ok: boolean } | null>(null);

  const handleSaveSamKey = async () => {
    setSavingSamKey(true);
    setSamKeyFeedback(null);
    try {
      const res = await fetch('/api/sam/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: samKeyInput,
          targetEnv: activeEnv,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSamKeyFeedback({
          text: samKeyInput.trim() ? 'SAM.gov / SBA API Key saved and activated successfully!' : 'API key cleared. System reverted to curated feed.',
          ok: true,
        });
        setSamKeyInput('');
        if (onRefreshFeed) onRefreshFeed();
      } else {
        setSamKeyFeedback({ text: data.message || 'Failed to update key', ok: false });
      }
    } catch (e: any) {
      setSamKeyFeedback({ text: e.message || 'Network error updating key', ok: false });
    } finally {
      setSavingSamKey(false);
    }
  };

  const handleTestPing = async () => {
    setPingTesting(true);
    setPingResult(null);
    const start = Date.now();
    try {
      const [res, keyVerification] = await Promise.all([
        fetch('/api/sam/opportunities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            limit: 5,
            targetEnv: activeEnv,
            naicsCode: currentProfile.primaryNaics,
          }),
        }),
        fetch('/api/sam/verify-key', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetEnv: activeEnv }),
        }).then((r) => r.json()).catch(() => null),
      ]);

      const data = await res.json();
      const elapsed = Date.now() - start;
      setPingResult({
        ok: res.ok,
        status: res.status,
        elapsed,
        data,
        keyVerification,
      });
    } catch (err: any) {
      setPingResult({
        ok: false,
        error: err.message,
        elapsed: Date.now() - start,
      });
    } finally {
      setPingTesting(false);
    }
  };

  const getEnvBadgeLabel = () => {
    if (hasLiveApiKey) {
      if (activeEnv === 'alpha') return 'SAM.gov Alpha Test API (api-alpha.sam.gov)';
      return 'SAM.gov Production API (api.sam.gov)';
    }
    return 'SAM.gov Test Stage (Active Curated Feed)';
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-lg">
      {/* Official Gov Banner */}
      <div className="bg-slate-950 px-4 py-1 border-b border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-block w-3.5 h-2.5 bg-red-600 relative overflow-hidden rounded-xs border border-white/20">
            <span className="absolute top-0 left-0 w-1.5 h-1.5 bg-blue-700"></span>
          </span>
          <span className="font-medium text-slate-300">An Official SAM.gov SBA Intelligence Suite</span>
          <span className="hidden sm:inline text-slate-500">|</span>
          <button
            onClick={() => setApiInfoModalOpen(true)}
            className="flex items-center gap-1.5 hover:underline cursor-pointer transition"
          >
            <span className={`w-2 h-2 rounded-full ${hasLiveApiKey ? (activeEnv === 'alpha' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400 animate-pulse') : 'bg-blue-400'}`}></span>
            <span className={`font-mono text-[11px] ${hasLiveApiKey ? (activeEnv === 'alpha' ? 'text-amber-300 font-bold' : 'text-emerald-400 font-bold') : 'text-blue-300'}`}>
              {getEnvBadgeLabel()}
            </span>
          </button>
        </div>
        <div className="flex items-center gap-2.5 text-[11px]">
          {onOpenAiConfig && (
            <button
              onClick={onOpenAiConfig}
              className="bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 hover:text-white border border-indigo-600/70 px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide flex items-center gap-1 transition cursor-pointer"
              title="Configure AI Agent / Gemini API Key / Self-Hosted Home VM"
            >
              <Cpu className="w-3 h-3 text-indigo-400" />
              <span>
                AI Agent: <strong className="text-white">{aiConfigStatus?.hasKey ? (aiConfigStatus.provider === 'gemini' ? 'Gemini 3.8' : aiConfigStatus.provider.toUpperCase()) : 'Config'}</strong>
              </span>
            </button>
          )}
          <button
            onClick={() => setApiInfoModalOpen(true)}
            className="bg-amber-950/70 hover:bg-amber-900/80 text-amber-300 hover:text-white border border-amber-600/60 px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide flex items-center gap-1 transition cursor-pointer"
            title="Configure SAM.gov / SBA API Key and Testing Environment"
          >
            <Key className="w-3 h-3 text-amber-400" />
            <span>
              SBA API Key: <strong className={hasLiveApiKey ? 'text-emerald-400' : 'text-amber-300'}>{hasLiveApiKey ? 'Active' : 'Input Key'}</strong>
            </span>
          </button>
          {onOpenGsaApiKeyModal && (
            <button
              onClick={onOpenGsaApiKeyModal}
              className="bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 hover:text-white border border-emerald-600/60 px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide flex items-center gap-1 transition cursor-pointer"
              title="Configure GSA Acquisition Gateway & CALC API Key (api.gsa.gov)"
            >
              <DollarSign className="w-3 h-3 text-emerald-400" />
              <span>
                GSA Rates API Key: <strong className="text-emerald-300">Config</strong>
              </span>
            </button>
          )}
          {onOpenValidationModal && (
            <button
              onClick={onOpenValidationModal}
              className="bg-blue-900/60 hover:bg-blue-800 text-blue-200 hover:text-white border border-blue-500/50 px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide flex items-center gap-1 transition cursor-pointer"
              title="Learn which number to use and validate against SAM.gov"
            >
              <ShieldCheck className="w-3 h-3 text-blue-400" />
              <span>Validate Contract ID</span>
            </button>
          )}
          {totalSamDatabaseRecords !== undefined && (
            <span className="hidden lg:inline bg-slate-800 text-blue-300 border border-slate-700 px-2 py-0.5 rounded font-mono text-[10px]">
              SAM.gov Matches: <strong className="text-white font-bold">{totalSamDatabaseRecords.toLocaleString()}</strong>
            </span>
          )}
          <span className="text-slate-400">
            CAGE: <strong className="text-white font-mono">{currentProfile.cageCode}</strong>
          </span>
          <span className="hidden md:inline text-slate-400">
            UEI: <strong className="text-white font-mono">{currentProfile.uei}</strong>
          </span>
          <span className="bg-emerald-950 text-emerald-300 border border-emerald-800/60 px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide">
            SBA CERTIFIED
          </span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 flex items-center justify-center shadow-md border border-blue-400/30">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  SBA <span className="text-blue-400">GovWin</span>
                </h1>
                <span className="bg-blue-500/20 text-blue-300 text-[10px] font-mono font-medium px-2 py-0.5 rounded border border-blue-500/30">
                  SAM.GOV READY
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans">
                Active Federal Opportunities & AI Bid Strategy Engine
              </p>
            </div>
          </div>

          {/* Profile Switcher & AI Button on Mobile */}
          <div className="md:hidden flex items-center gap-1.5">
            {onOpenAiConfig && (
              <button
                type="button"
                onClick={onOpenAiConfig}
                className="text-xs bg-indigo-950/80 border border-indigo-600/70 px-2 py-1.5 rounded text-indigo-300 flex items-center gap-1 cursor-pointer"
                title="AI Agent & VM Settings"
              >
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                <span>AI</span>
              </button>
            )}
            <button
              onClick={() => setActiveTab('profile')}
              className="text-xs bg-slate-800 border border-slate-700 px-2.5 py-1.5 rounded text-slate-200 flex items-center gap-1"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Profile</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none text-xs sm:text-sm">
          <button
            onClick={() => setActiveTab('canvass')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'canvass'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Canvass SAM.gov</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              activeTab === 'canvass' ? 'bg-blue-800 text-blue-100' : 'bg-slate-800 text-slate-300'
            }`}>
              {totalOpportunitiesCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('pipeline')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'pipeline'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Kanban className="w-4 h-4" />
            <span>Bid Pipeline</span>
            {savedBidsCount > 0 && (
              <span className="bg-amber-500 text-slate-950 font-bold text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                {savedBidsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('insights')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'insights'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>SBA Insights</span>
          </button>

          <button
            onClick={() => setActiveTab('labor_rates')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'labor_rates'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Labor Rates & CLINs</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'profile'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Business Profile</span>
          </button>
        </nav>

        {/* Desktop Controls (AI Config & Profile Switcher) */}
        <div className="hidden md:flex items-center gap-2.5">
          {onOpenAiConfig && (
            <button
              type="button"
              onClick={onOpenAiConfig}
              className="flex items-center gap-2 bg-slate-800/90 hover:bg-slate-800 border border-indigo-500/50 hover:border-indigo-400 px-3 py-1.5 rounded-lg text-left text-xs transition cursor-pointer text-slate-200"
              title="Configure AI Agent / Google Gemini API Key / Self-Hosted Home VM"
            >
              <div className="w-7 h-7 rounded-md bg-indigo-900/70 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-bold text-xs">
                <Cpu className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="max-w-[130px]">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-white">AI Agent</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${aiConfigStatus?.hasKey ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                </div>
                <p className="text-[10px] text-indigo-300 font-mono truncate">
                  {aiConfigStatus?.hasKey ? (aiConfigStatus.provider === 'gemini' ? (aiConfigStatus.modelName || 'Gemini 3.8') : aiConfigStatus.provider.toUpperCase()) : 'Connect Key'}
                </p>
              </div>
            </button>
          )}

          {/* SAM.gov & SBA API Key Config button */}
          <button
            type="button"
            onClick={() => setApiInfoModalOpen(true)}
            className="flex items-center gap-2 bg-slate-800/90 hover:bg-slate-800 border border-amber-500/50 hover:border-amber-400 px-3 py-1.5 rounded-lg text-left text-xs transition cursor-pointer text-slate-200"
            title="Configure SAM.gov / SBA API Key and Environments"
          >
            <div className="w-7 h-7 rounded-md bg-amber-950/70 border border-amber-500/40 text-amber-300 flex items-center justify-center font-bold text-xs">
              <Key className="w-4 h-4 text-amber-400" />
            </div>
            <div className="max-w-[130px]">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-white">SBA API Key</span>
                <span className={`w-1.5 h-1.5 rounded-full ${hasLiveApiKey ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              </div>
              <p className="text-[10px] text-amber-300 font-mono truncate">
                {hasLiveApiKey ? 'Connected' : 'Input Key'}
              </p>
            </div>
          </button>

          {/* Profile Switcher dropdown on desktop */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2.5 bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 px-3 py-1.5 rounded-lg text-left text-xs transition cursor-pointer"
            >
            <div className="w-7 h-7 rounded-md bg-blue-900/60 border border-blue-500/40 text-blue-300 flex items-center justify-center font-bold text-xs">
              {currentProfile.companyName.charAt(0)}
            </div>
            <div className="max-w-[150px] truncate">
              <p className="font-semibold text-slate-100 truncate">{currentProfile.companyName}</p>
              <p className="text-[10px] text-slate-400 font-mono">NAICS: {currentProfile.primaryNaics}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>

          {profileDropdownOpen && (
            <div 
              className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              onMouseLeave={() => setProfileDropdownOpen(false)}
            >
              <div className="px-3 py-1.5 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Select SBA Profile Preset</span>
                <span className="text-[10px] text-slate-500 font-mono">{profiles.length} Presets</span>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/50">
                {profiles.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectProfile(p);
                      setProfileDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 transition ${
                      currentProfile.id === p.id ? 'bg-blue-900/30 text-blue-300 font-semibold' : 'text-slate-300'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <p className="font-medium text-white truncate">{p.companyName}</p>
                      <p className="text-[10px] text-slate-400 truncate">
                        NAICS {p.primaryNaics} | {p.certifications.length > 0 ? p.certifications.join(', ') : 'Small Business'}
                      </p>
                    </div>
                    {currentProfile.id === p.id && (
                      <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0"></span>
                    )}
                  </button>
                ))}
              </div>
              <div className="border-t border-slate-800 mt-1 pt-1 px-2 space-y-1">
                <button
                  onClick={() => {
                    setActiveTab('profile');
                    setProfileDropdownOpen(false);
                    if (onCreateNewPreset) onCreateNewPreset();
                  }}
                  className="w-full text-left py-1.5 px-2 text-xs text-emerald-400 hover:text-emerald-300 hover:bg-slate-800 rounded font-medium flex items-center gap-1.5 transition"
                >
                  <span className="w-4 h-4 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">+</span>
                  <span>Add New Company Preset</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('profile');
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full text-left py-1.5 px-2 text-xs text-blue-400 hover:text-blue-300 hover:bg-slate-800 rounded font-medium flex items-center gap-1.5 transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Manage & Edit Presets</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

      {/* SAM.gov API Architecture, Test Environment & Diagnostics Modal */}
      {apiInfoModalOpen && (
        <div className={`fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center transition-all ${isApiModalMaximized ? 'p-0' : 'p-2 sm:p-4 md:p-6'} overflow-y-auto`}>
          <div className={`bg-slate-900 border border-slate-700 text-white shadow-2xl flex flex-col overflow-hidden transition-all duration-150 ${isApiModalMaximized ? 'w-full h-full max-w-none max-h-none rounded-none' : 'max-w-2xl w-full max-h-[92vh] sm:max-h-[90vh] rounded-2xl animate-in fade-in zoom-in-95'}`}>
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <span className={`w-3 h-3 rounded-full ${hasLiveApiKey ? (activeEnv === 'alpha' ? 'bg-amber-400' : 'bg-emerald-400') : 'bg-blue-400'} animate-pulse`}></span>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>SAM.gov Opportunities API Workbench</span>
                    <span className="text-[10px] font-mono bg-blue-900/60 text-blue-300 px-2 py-0.5 rounded border border-blue-700/50">
                      GSA v2 Spec
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Environment configuration, Alpha Test API, and search results alignment
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsApiModalMaximized(!isApiModalMaximized)}
                  title={isApiModalMaximized ? "Restore window size (Minimize to standard dialog)" : "Expand window to full screen (Maximize)"}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
                >
                  {isApiModalMaximized ? <Minimize2 className="w-4 h-4 text-blue-400" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setApiInfoModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                  title="Close window"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">

            {/* SBA / SAM.gov API Key Configuration Card */}
            <div className="bg-slate-800/95 rounded-xl p-4 sm:p-5 border border-amber-500/40 shadow-xl space-y-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                    <Key className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <span>SBA / SAM.gov Opportunities API Key</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${hasLiveApiKey ? 'bg-emerald-950 text-emerald-300 border-emerald-600/70' : 'bg-amber-950 text-amber-300 border-amber-600/70'}`}>
                        {hasLiveApiKey ? '✓ KEY CONNECTED' : 'KEY REQUIRED FOR LIVE STREAM'}
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Input your official SAM.gov API Key to query live procurement notices directly from GSA and federal agencies.
                    </p>
                  </div>
                </div>
              </div>

              {/* Input, Save & Clear Buttons */}
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showSamKey ? 'text' : 'password'}
                      value={samKeyInput}
                      onChange={(e) => setSamKeyInput(e.target.value)}
                      placeholder={hasLiveApiKey ? '•••••••••••••••• (Key active - type new key to replace)' : 'Enter your SAM.gov or SBA API key here...'}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSamKey(!showSamKey)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                      title={showSamKey ? 'Hide key' : 'Show key'}
                    >
                      {showSamKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSaveSamKey}
                      disabled={savingSamKey}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{savingSamKey ? 'Saving...' : 'Save API Key'}</span>
                    </button>

                    {hasLiveApiKey && (
                      <button
                        type="button"
                        onClick={() => {
                          setSamKeyInput('');
                          handleSaveSamKey();
                        }}
                        className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition cursor-pointer"
                        title="Disconnect API key and use active curated feed"
                      >
                        Disconnect
                      </button>
                    )}
                  </div>
                </div>

                {samKeyFeedback && (
                  <div className={`p-2.5 rounded-lg text-xs flex items-center gap-2 font-medium ${samKeyFeedback.ok ? 'bg-emerald-950/70 border border-emerald-600/70 text-emerald-300' : 'bg-rose-950/70 border border-rose-600/70 text-rose-300'}`}>
                    {samKeyFeedback.ok ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <span className="text-rose-400 font-bold shrink-0">✕</span>}
                    <span>{samKeyFeedback.text}</span>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>
                    Need a key? Request a free key at{' '}
                    <a
                      href="https://sam.gov/content/developer-hub"
                      target="_blank"
                      rel="noreferrer"
                      className="text-amber-400 hover:underline font-semibold"
                    >
                      SAM.gov Developer Hub ↗
                    </a>{' '}
                    or test on{' '}
                    <a
                      href="https://alpha.sam.gov"
                      target="_blank"
                      rel="noreferrer"
                      className="text-amber-400 hover:underline font-semibold"
                    >
                      alpha.sam.gov ↗
                    </a>
                  </span>
                </div>
              </div>
            </div>

            {/* Environment Selector (Alpha Test vs Production vs Curated) */}
            <div className="bg-slate-800/90 rounded-xl p-4 border border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <span>Target API Environment</span>
                </h4>
                <span className="text-[10px] text-slate-400">
                  Select testing environment per GSA documentation
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Alpha Test API Option */}
                <button
                  type="button"
                  onClick={() => onChangeEnv && onChangeEnv('alpha')}
                  className={`p-3 rounded-lg border text-left transition cursor-pointer flex flex-col justify-between ${
                    activeEnv === 'alpha'
                      ? 'bg-amber-950/40 border-amber-500/80 text-amber-200 ring-1 ring-amber-500/30'
                      : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs flex items-center gap-1.5 text-white">
                      <span>🧪 SAM.gov Alpha (Test API)</span>
                    </span>
                    {activeEnv === 'alpha' && (
                      <span className="text-[10px] font-bold bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded font-mono">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono break-all mb-1">
                    api-alpha.sam.gov/opportunities/v2/search
                  </p>
                  <p className="text-[10px] text-amber-300/90">
                    Recommended for development & testing stage. Uses alpha.sam.gov user accounts.
                  </p>
                </button>

                {/* Production API Option */}
                <button
                  type="button"
                  onClick={() => onChangeEnv && onChangeEnv('production')}
                  className={`p-3 rounded-lg border text-left transition cursor-pointer flex flex-col justify-between ${
                    activeEnv === 'production'
                      ? 'bg-emerald-950/40 border-emerald-500/80 text-emerald-200 ring-1 ring-emerald-500/30'
                      : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs flex items-center gap-1.5 text-white">
                      <span>🟢 SAM.gov Production API</span>
                    </span>
                    {activeEnv === 'production' && (
                      <span className="text-[10px] font-bold bg-emerald-500 text-slate-950 px-1.5 py-0.2 rounded font-mono">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono break-all mb-1">
                    api.sam.gov/opportunities/v2/search
                  </p>
                  <p className="text-[10px] text-emerald-300/90">
                    Live production procurement feed with government-wide solicitations.
                  </p>
                </button>
              </div>
            </div>

            {/* Diagnostic Guide: Why Website Numbers Differ from API & How It's Resolved */}
            <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/80 space-y-2.5 text-xs text-slate-300 leading-relaxed">
              <h4 className="font-bold text-white text-xs flex items-center gap-1.5 text-blue-300">
                <span>🔍 Why Search Results May Differ from SAM.gov Website (And the Resolution)</span>
              </h4>
              
              <ul className="space-y-2 text-[11px]">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold shrink-0">1.</span>
                  <div>
                    <strong className="text-white">Total Database Records vs. Page Pagination:</strong> On the SAM.gov website, the header displays the total database matches (e.g. <em>"1,420 Results"</em>), but only displays 25 notices per page. SBA GovWin now captures and displays both: the <strong>Total SAM.gov Database Matches</strong> alongside the active ledger page.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold shrink-0">2.</span>
                  <div>
                    <strong className="text-white">Active Notice Types Filter (`ptype`):</strong> By default, the SAM.gov public search excludes historical awards and justifications. Per GSA Open Tech specifications, SBA GovWin now explicitly queries <code className="bg-slate-900 text-cyan-300 px-1 rounded font-mono">ptype=o,k,p,r</code> (Solicitation, Combined Synopsis, Presolicitation, Sources Sought) to mirror the website search results.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold shrink-0">3.</span>
                  <div>
                    <strong className="text-white">Query Parameter Mapping (`ncode`, `title`, `state`):</strong> The SAM.gov Opportunities v2 API silently ignores arbitrary query parameters (like <code className="bg-slate-900 text-red-300 px-1 rounded font-mono">q</code>). All user searches now map to validated GSA parameters: <code className="bg-slate-900 text-emerald-300 px-1 rounded font-mono">ncode</code> (NAICS), <code className="bg-slate-900 text-emerald-300 px-1 rounded font-mono">title</code> (Keywords), <code className="bg-slate-900 text-emerald-300 px-1 rounded font-mono">typeOfSetAside</code> (SBA, 8A, SDVOSBC, WOSB, HZC), and <code className="bg-slate-900 text-emerald-300 px-1 rounded font-mono">organizationName</code>.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold shrink-0">4.</span>
                  <div>
                    <strong className="text-white">Mandatory 1-Year Date Window:</strong> SAM.gov strictly requires <code className="bg-slate-900 text-cyan-300 px-1 rounded font-mono">postedFrom</code> and <code className="bg-slate-900 text-cyan-300 px-1 rounded font-mono">postedTo</code> parameters in MM/dd/yyyy format with a range not exceeding 365 days.
                  </div>
                </li>
              </ul>
            </div>

            {/* Official GSA References & Test Webpage Links */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Official Government References & Test Portals:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <a
                  href="https://open.gsa.gov/api/get-opportunities-public-api/#overview"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-slate-900 hover:bg-slate-850 border border-slate-700/80 rounded-lg flex items-center justify-between text-blue-400 hover:text-blue-300 transition"
                >
                  <span className="truncate">📖 GSA Public API Specification</span>
                  <span className="text-slate-500 text-[10px]">open.gsa.gov ↗</span>
                </a>
                <a
                  href="https://alpha.sam.gov"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-slate-900 hover:bg-slate-850 border border-slate-700/80 rounded-lg flex items-center justify-between text-amber-400 hover:text-amber-300 transition"
                >
                  <span className="truncate">🧪 SAM.gov Alpha Test Webpage</span>
                  <span className="text-slate-500 text-[10px]">alpha.sam.gov ↗</span>
                </a>
                <a
                  href="https://sam.gov/search/?index=opp"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-slate-900 hover:bg-slate-850 border border-slate-700/80 rounded-lg flex items-center justify-between text-emerald-400 hover:text-emerald-300 transition"
                >
                  <span className="truncate">🏛️ SAM.gov Live Search Portal</span>
                  <span className="text-slate-500 text-[10px]">sam.gov ↗</span>
                </a>
                <a
                  href="https://sam.gov/content/developer-hub"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-slate-900 hover:bg-slate-850 border border-slate-700/80 rounded-lg flex items-center justify-between text-indigo-400 hover:text-indigo-300 transition"
                >
                  <span className="truncate">🔑 Developer Hub & API Keys</span>
                  <span className="text-slate-500 text-[10px]">sam.gov ↗</span>
                </a>
              </div>
            </div>

            {/* Test Connection / Ping Tool */}
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white">Diagnostic Connection Ping</span>
                <button
                  type="button"
                  onClick={handleTestPing}
                  disabled={pingTesting}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                >
                  <span>{pingTesting ? 'Pinging Endpoint...' : `Ping ${activeEnv === 'alpha' ? 'Alpha Test API' : 'Production API'}`}</span>
                </button>
              </div>

              {pingResult && (
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className={pingResult.ok ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      Status: {pingResult.status || (pingResult.ok ? '200 OK' : 'Error')}
                    </span>
                    <span className="text-slate-400">{pingResult.elapsed}ms latency</span>
                  </div>
                  <div className="text-slate-400 truncate">
                    Endpoint: {pingResult.data?.endpoint || (activeEnv === 'alpha' ? 'https://api-alpha.sam.gov' : 'https://api.sam.gov')}
                  </div>
                  <div className="text-slate-300">
                    Source: <strong className="text-white">{pingResult.data?.source || 'curated'}</strong> | 
                    Total Database Records: <strong className="text-emerald-400">{pingResult.data?.totalRecords || pingResult.data?.total || 0}</strong>
                  </div>

                  {pingResult.keyVerification && (
                    <div className="pt-1.5 mt-1.5 border-t border-slate-800 text-[10px] space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Key Authenticator:</span>
                        <span className={pingResult.keyVerification.isValid ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                          {pingResult.keyVerification.isValid ? '✓ Validated (HTTP 200)' : `Status: ${pingResult.keyVerification.httpStatus || 'Curated Feed'}`}
                        </span>
                      </div>
                      <div className="text-slate-400 truncate">
                        {pingResult.keyVerification.message}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-t border-slate-800 bg-slate-950/60 shrink-0">
              {onRefreshFeed && (
                <button
                  onClick={() => {
                    onRefreshFeed();
                    setApiInfoModalOpen(false);
                  }}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition cursor-pointer"
                >
                  Sync Opportunities Now
                </button>
              )}
              <button
                onClick={() => setApiInfoModalOpen(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg transition ml-auto cursor-pointer"
              >
                Close Workbench
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
