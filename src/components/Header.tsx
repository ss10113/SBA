import React, { useState, useRef } from 'react';
import { 
  ShieldCheck, 
  Building2, 
  Briefcase, 
  Kanban, 
  BarChart3, 
  Sparkles,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
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
  DollarSign,
  Database,
  LogIn,
  LogOut,
  Cloud
} from 'lucide-react';
import { BusinessProfile } from '../types/contract';
import { SAMPLE_PROFILES } from '../data/samCuratedData';
import { useAuth } from '../context/AuthContext';

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
  aiConfigStatus?: { hasKey: boolean; providerName: string };
  onOpenAiConfig?: () => void;
  onOpenGsaApiKeyModal?: () => void;
  onOpenSyncManager?: () => void;
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
  activeEnv = 'production',
  onChangeEnv,
  totalSamDatabaseRecords,
  onRefreshFeed,
  onOpenValidationModal,
  aiConfigStatus,
  onOpenAiConfig,
  onOpenGsaApiKeyModal,
  onOpenSyncManager
}) => {
  const { user, signInWithGoogle, logout, syncStats, cachedOpps } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [apiInfoModalOpen, setApiInfoModalOpen] = useState(false);
  const [isApiModalMaximized, setIsApiModalMaximized] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Diagnostic Ping tool
  const [pingTesting, setPingTesting] = useState(false);
  const [pingResult, setPingResult] = useState<any>(null);

  const handleTestPing = async () => {
    setPingTesting(true);
    setPingResult(null);
    const start = Date.now();
    try {
      const res = await fetch('/api/sam/status');
      const data = await res.json();
      const elapsed = Date.now() - start;
      setPingResult({
        ok: res.ok,
        status: res.status,
        elapsed,
        data
      });
    } catch (err: any) {
      setPingResult({
        ok: false,
        status: 'Error',
        elapsed: Date.now() - start,
        error: err.message
      });
    } finally {
      setPingTesting(false);
    }
  };

  const getEnvBadgeLabel = () => {
    if (hasLiveApiKey) {
      return activeEnv === 'alpha' ? 'SAM.gov ALPHA' : 'SAM.gov LIVE API';
    }
    return 'SAM.gov CURATED';
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-lg">
      {/* Official Gov Status Bar */}
      <div className="bg-slate-950 px-4 py-1.5 border-b border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="inline-block w-3.5 h-2.5 bg-red-600 relative overflow-hidden rounded-xs border border-white/20">
            <span className="absolute top-0 left-0 w-1.5 h-1.5 bg-blue-700"></span>
          </span>
          <span className="font-medium text-slate-300 hidden sm:inline">Official SAM.gov SBA Intelligence Suite</span>
          <span className="hidden sm:inline text-slate-600">•</span>
          <button
            onClick={() => setApiInfoModalOpen(true)}
            className="flex items-center gap-1.5 hover:underline cursor-pointer transition text-[11px]"
          >
            <span className={`w-2 h-2 rounded-full ${hasLiveApiKey ? (activeEnv === 'alpha' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400 animate-pulse') : 'bg-blue-400'}`}></span>
            <span className={`font-mono ${hasLiveApiKey ? (activeEnv === 'alpha' ? 'text-amber-300 font-bold' : 'text-emerald-400 font-bold') : 'text-blue-300'}`}>
              {getEnvBadgeLabel()}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          {onOpenSyncManager && (
            <button
              onClick={onOpenSyncManager}
              className="flex items-center gap-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 px-2.5 py-0.5 rounded text-[10px] font-semibold transition cursor-pointer"
              title="Hold live site sync data to protect SAM.gov API limits"
            >
              <Database className="w-3 h-3 text-emerald-400" />
              <span>Live Site Sync ({syncStats?.totalSyncedCount || cachedOpps.length || 0})</span>
            </button>
          )}

          {totalSamDatabaseRecords !== undefined && (
            <span className="text-slate-400 font-mono hidden md:inline">
              Repository: <strong className="text-slate-200">{totalSamDatabaseRecords.toLocaleString()} notices</strong>
            </span>
          )}

          <div className="flex items-center gap-1.5 text-slate-300 font-mono">
            <span className="text-slate-500">CAGE</span>
            <strong className="text-white bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">{currentProfile.cageCode}</strong>
          </div>

          <span className="hidden sm:inline-block bg-emerald-950 text-emerald-300 border border-emerald-800/60 px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide">
            SBA CERTIFIED
          </span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
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
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('canvass')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'canvass' 
                ? 'bg-blue-600 text-white font-semibold shadow-xs' 
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Opportunities ({totalOpportunitiesCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('pipeline')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'pipeline' 
                ? 'bg-blue-600 text-white font-semibold shadow-xs' 
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Pipeline ({savedBidsCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('strategy')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'strategy' 
                ? 'bg-blue-600 text-white font-semibold shadow-xs' 
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Bid Strategy</span>
          </button>

          <button
            onClick={() => setActiveTab('insights')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'insights' 
                ? 'bg-blue-600 text-white font-semibold shadow-xs' 
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Market Intel</span>
          </button>

          <button
            onClick={() => setActiveTab('labor_rates')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'labor_rates' 
                ? 'bg-blue-600 text-white font-semibold shadow-xs' 
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span>GSA Labor Rates</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'profile' 
                ? 'bg-blue-600 text-white font-semibold shadow-xs' 
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Company Profile</span>
          </button>
        </nav>

        {/* Desktop Controls (Live Sync, AI, Auth & Profile) */}
        <div className="hidden lg:flex items-center gap-2">
          {onOpenSyncManager && (
            <button
              type="button"
              onClick={onOpenSyncManager}
              className="flex items-center gap-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shadow-xs"
              title="Hold live site sync data from SAM.gov to stay within API limits"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sync Storage</span>
            </button>
          )}

          {onRefreshFeed && (
            <button
              type="button"
              onClick={onRefreshFeed}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shadow-xs"
              title="Sync latest federal solicitations from SAM.gov"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Sync SAM</span>
            </button>
          )}

          {onOpenAiConfig && (
            <button
              type="button"
              onClick={onOpenAiConfig}
              className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500/70 px-2.5 py-1.5 rounded-lg text-xs transition cursor-pointer text-slate-300 hover:text-white"
              title="Configure AI Agent"
            >
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span className="font-medium">AI Agent</span>
            </button>
          )}

          {/* User Auth Menu */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 px-2.5 py-1.5 rounded-lg transition cursor-pointer"
              >
                <img 
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'User')}`}
                  alt="Avatar" 
                  className="w-5 h-5 rounded-full border border-emerald-400 object-cover"
                />
                <span className="text-xs font-semibold text-slate-200 max-w-[90px] truncate">
                  {user.displayName?.split(' ')[0] || 'Account'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-xl z-50 p-2 text-xs">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <p className="font-bold text-white truncate">{user.displayName || 'GovCon User'}</p>
                    <p className="text-slate-400 truncate text-[11px]">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      if (onOpenSyncManager) onOpenSyncManager();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-800 rounded-lg text-emerald-400 font-medium flex items-center gap-2 mt-1 cursor-pointer"
                  >
                    <Database className="w-3.5 h-3.5" />
                    Live Sync & Rate Limits
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-800 rounded-lg text-rose-400 font-medium flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => signInWithGoogle()}
              className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shadow-md"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Google Sign-In</span>
            </button>
          )}
        </div>
      </div>

      {/* SAM.gov & API Info Workbench Modal */}
      {apiInfoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className={`bg-slate-900 border border-slate-800 rounded-2xl w-full shadow-2xl transition-all duration-200 flex flex-col ${isApiModalMaximized ? 'max-w-7xl h-[95vh]' : 'max-w-3xl max-h-[90vh]'}`}>
            
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950 shrink-0">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    SAM.gov & Federal API Integration Hub
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                      GSA v2 API
                    </span>
                  </h3>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsApiModalMaximized(!isApiModalMaximized)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
                >
                  {isApiModalMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setApiInfoModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-slate-200">SAM.gov Rate Limits & Firestore Syncing</h4>
                <p className="text-slate-400 leading-relaxed">
                  To prevent rate limits from SAM.gov, fetched contract opportunities are held in your persistent Firebase Firestore database cache.
                </p>
              </div>

              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">Diagnostic Connection Ping</span>
                  <button
                    type="button"
                    onClick={handleTestPing}
                    disabled={pingTesting}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                  >
                    <span>{pingTesting ? 'Pinging Endpoint...' : 'Ping SAM API Endpoint'}</span>
                  </button>
                </div>
                {pingResult && (
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] space-y-1">
                    <div className="text-emerald-400 font-bold">Status: {pingResult.status || '200 OK'}</div>
                    <div className="text-slate-400">{pingResult.elapsed}ms latency</div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 bg-slate-950/60 shrink-0">
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
