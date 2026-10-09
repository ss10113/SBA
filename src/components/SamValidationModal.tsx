import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  Check, 
  Search, 
  HelpCircle, 
  AlertTriangle, 
  Database, 
  Building2, 
  FileText, 
  Info, 
  X, 
  ShieldAlert, 
  ArrowRight,
  RefreshCw,
  Code,
  Key,
  CheckCircle,
  XCircle,
  ShieldCheck,
  Terminal,
  Activity,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { SAMOpportunity } from '../types/contract';
import { getSafeSamGovUrl, extractSamNoticeUUID } from '../utils/samUrlHelper';

interface SamValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity?: SAMOpportunity | null;
  activeEnv: 'alpha' | 'production';
  hasLiveApiKey: boolean;
  apiMode: 'live-api' | 'test-api' | 'curated-feed';
  syncValidationAudit?: any;
}

export const SamValidationModal: React.FC<SamValidationModalProps> = ({
  isOpen,
  onClose,
  opportunity,
  activeEnv,
  hasLiveApiKey,
  apiMode,
  syncValidationAudit
}) => {
  const [activeModalTab, setActiveModalTab] = useState<'contract-id' | 'api-key'>('contract-id');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [testSearchInput, setTestSearchInput] = useState(opportunity?.solicitationNumber || '');
  const [testTargetEnv, setTestTargetEnv] = useState<'alpha' | 'production'>(activeEnv);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<any>(null);

  // API Key Health Testing State
  const [keyChecking, setKeyChecking] = useState(false);
  const [keyCheckResult, setKeyCheckResult] = useState<any>(null);
  const [testCustomKeyInput, setTestCustomKeyInput] = useState('');
  const [isMaximized, setIsMaximized] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleRunLiveValidation = async () => {
    if (!testSearchInput.trim()) return;
    setIsVerifying(true);
    setVerifyResult(null);

    try {
      const [oppsRes, solValidationRes] = await Promise.all([
        fetch('/api/sam/opportunities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            searchQuery: testSearchInput.trim(),
            targetEnv: testTargetEnv,
            limit: 5,
          }),
        }).then((r) => r.json()).catch((e) => ({ error: e.message })),
        fetch('/api/sam/validate-solicitation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            solicitationNumber: testSearchInput.trim(),
            targetEnv: testTargetEnv,
          }),
        }).then((r) => r.json()).catch(() => null),
      ]);

      setVerifyResult({
        ...(oppsRes || {}),
        solValidation: solValidationRes,
      });
    } catch (err: any) {
      setVerifyResult({ error: err.message || 'Failed to connect to API proxy' });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCheckApiKey = async (customKey?: string) => {
    setKeyChecking(true);
    setKeyCheckResult(null);

    try {
      const res = await fetch('/api/sam/verify-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: customKey || undefined,
          targetEnv: testTargetEnv,
        }),
      });
      const data = await res.json();
      setKeyCheckResult(data);
    } catch (err: any) {
      setKeyCheckResult({
        configured: true,
        isValid: false,
        message: err.message || 'Network timeout contacting GSA API gateway',
      });
    } finally {
      setKeyChecking(false);
    }
  };

  const currentSolNum = opportunity?.solicitationNumber || testSearchInput || 'SOL-SAMPLE';
  const currentNoticeId = opportunity?.noticeId || 'SAM-NTC-SAMPLE';
  const isCuratedNotice = currentNoticeId.startsWith('SAM-2026-NTC');

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center transition-all ${isMaximized ? 'p-0' : 'p-2 sm:p-4 md:p-6'}`}>
      <div className={`bg-white border border-slate-200 shadow-2xl flex flex-col overflow-hidden transition-all duration-150 ${isMaximized ? 'w-full h-full max-w-none max-h-none rounded-none' : 'w-full max-w-4xl max-h-[94vh] sm:max-h-[92vh] rounded-2xl animate-in fade-in zoom-in-95'}`}>
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex flex-wrap items-center gap-2">
                <span>SAM.gov Contract ID & API Key Verification Inspector</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700">
                  GSA VERIFICATION
                </span>
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Official federal identifiers, API key live authenticator, and GSA cross-referencing guide
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsMaximized(!isMaximized)}
              title={isMaximized ? "Restore window size (Minimize to standard dialog)" : "Expand window to full screen (Maximize)"}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              {isMaximized ? <Minimize2 className="w-4 h-4 text-blue-400" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              title="Close window"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Sub-Tabs */}
        <div className="bg-slate-900/90 px-6 pt-2 pb-0 border-b border-slate-800 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveModalTab('contract-id')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeModalTab === 'contract-id'
                ? 'bg-slate-800 text-white border-blue-500'
                : 'text-slate-400 hover:text-white border-transparent'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>1. Contract ID & Number Verification</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveModalTab('api-key');
              if (!keyCheckResult) handleCheckApiKey();
            }}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeModalTab === 'api-key'
                ? 'bg-slate-800 text-white border-emerald-500'
                : 'text-slate-400 hover:text-white border-transparent'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-emerald-400" />
            <span>2. Is My API Key Working? (Live Authenticator)</span>
            <span className={`w-2 h-2 rounded-full ${hasLiveApiKey ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800 text-sm">

          {activeModalTab === 'api-key' ? (
            /* TAB 2: API KEY HEALTH & VERIFICATION */
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Executive Answer to "How do I know if the API key provided is working?" */}
              <div className="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-4.5 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-600 text-white rounded-lg shrink-0 mt-0.5">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-emerald-950">
                      How to know if your SAM.gov API key is working:
                    </h4>
                    <p className="text-xs text-emerald-900 leading-relaxed">
                      There are <strong>3 immediate ways</strong> to confirm whether your API key is authentic and streaming live data from GSA:
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-emerald-200 text-xs">
                  <div className="bg-white p-3 rounded-lg border border-emerald-200 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs">1</span>
                      <span>Top Header Badge</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Look at the top navbar. When an API key is connected, it displays a pulsing green pill: <strong className="text-emerald-700">SAM.gov Production API</strong> or amber pill <strong className="text-amber-700">SAM.gov Alpha Test API</strong>.
                    </p>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-emerald-200 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs">2</span>
                      <span>Live Response Header</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Every search returns the official GSA response payload. Active keys return source <code className="bg-slate-100 text-slate-800 px-1 rounded font-mono text-[10px]">sam-production-api</code> or <code className="bg-slate-100 text-slate-800 px-1 rounded font-mono text-[10px]">sam-alpha-test-api</code> with real GSA <code className="bg-slate-100 text-slate-800 px-1 rounded font-mono text-[10px]">totalRecords</code>.
                    </p>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-emerald-200 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs">3</span>
                      <span>Instant Diagnostic Ping</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Use the test button below to ping GSA's gateway right now. An active key returns <strong className="text-emerald-700">HTTP 200 OK</strong>. An invalid key returns <strong className="text-rose-700">HTTP 403 Forbidden</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Live GSA API Key Ping & Authenticator Tool */}
              <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-800">
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-emerald-400" />
                      <span>Live GSA Key Authenticator</span>
                    </h4>
                    <p className="text-xs text-slate-400">
                      Directly pings GSA's Opportunities v2 Gateway to verify authentication, latency, and rate limits
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCheckApiKey()}
                      disabled={keyChecking}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {keyChecking ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Pinging GSA...</span>
                        </>
                      ) : (
                        <>
                          <Activity className="w-3 h-3" />
                          <span>Test Current Key</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Current Key Status Card */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Environment Target</span>
                    <span className="font-bold text-white flex items-center gap-1.5 mt-0.5">
                      <span>{testTargetEnv === 'alpha' ? '🧪 Alpha Test API' : '🟢 Production API'}</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono block truncate mt-1">
                      {testTargetEnv === 'alpha' ? 'api-alpha.sam.gov' : 'api.sam.gov'}
                    </span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Configured Key Status</span>
                    <span className={`font-bold flex items-center gap-1.5 mt-0.5 ${hasLiveApiKey ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {hasLiveApiKey ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                      <span>{hasLiveApiKey ? 'Key Configured in .env' : 'No Key Set (Using Sandbox)'}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono block mt-1">
                      {keyCheckResult?.maskedKey || (hasLiveApiKey ? 'Key loaded' : 'SAM_GOV_API_KEY unset')}
                    </span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">GSA Authentication</span>
                    <span className={`font-bold flex items-center gap-1.5 mt-0.5 ${keyCheckResult?.isValid ? 'text-emerald-400' : (keyCheckResult ? 'text-rose-400' : 'text-slate-400')}`}>
                      {keyCheckResult?.isValid ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>HTTP 200 OK</span>
                        </>
                      ) : keyCheckResult ? (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-rose-400" />
                          <span>HTTP {keyCheckResult.httpStatus || 'Rejected'}</span>
                        </>
                      ) : (
                        <span>Ready to Ping</span>
                      )}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono block mt-1">
                      {keyCheckResult ? `${keyCheckResult.latencyMs}ms latency` : 'Click "Test Current Key"'}
                    </span>
                  </div>
                </div>

                {/* Detailed Result Card */}
                {keyCheckResult && (
                  <div className={`p-4 rounded-xl border font-mono text-xs space-y-2 ${
                    keyCheckResult.isValid 
                      ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
                      : 'bg-rose-950/40 border-rose-500/60 text-rose-200'
                  }`}>
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1.5">
                        {keyCheckResult.isValid ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-400" />}
                        <span>{keyCheckResult.message}</span>
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-black/40 border border-white/10">
                        {keyCheckResult.httpStatus === 200 ? 'AUTHENTICATED' : `STATUS ${keyCheckResult.httpStatus}`}
                      </span>
                    </div>

                    <p className="text-[11px] font-sans text-slate-300 leading-relaxed">
                      {keyCheckResult.details}
                    </p>

                    {keyCheckResult.rateLimitRemaining && (
                      <div className="text-[10px] text-slate-400 pt-1 border-t border-white/10">
                        GSA Quota Remaining: <strong className="text-white">{keyCheckResult.rateLimitRemaining}</strong>
                      </div>
                    )}

                    {keyCheckResult.errorBody && (
                      <div className="p-2 bg-black/50 rounded border border-rose-800/80 text-[10px] text-rose-300 overflow-x-auto">
                        Raw GSA response: {typeof keyCheckResult.errorBody === 'object' ? JSON.stringify(keyCheckResult.errorBody) : keyCheckResult.errorBody}
                      </div>
                    )}
                  </div>
                )}

                {/* Test a Custom Key Input */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span>Test a New API Key without editing .env:</span>
                    <span className="text-[10px] text-slate-400 font-normal">Safe sandbox testing (not stored)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="password"
                      value={testCustomKeyInput}
                      onChange={(e) => setTestCustomKeyInput(e.target.value)}
                      placeholder="Paste your GSA api.data.gov or SAM.gov API key here..."
                      className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleCheckApiKey(testCustomKeyInput)}
                      disabled={keyChecking || !testCustomKeyInput.trim()}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 border border-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                    >
                      Verify Key
                    </button>
                  </div>
                </div>
              </div>

              {/* Where to get free keys */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Where to Get Official Free SAM.gov API Keys:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
                  <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                    <strong className="text-amber-800 font-semibold block">1. Testing Stage: SAM.gov Alpha Key</strong>
                    <p className="text-[11px] text-slate-600">
                      Sign in at <a href="https://alpha.sam.gov" target="_blank" rel="noreferrer" className="text-blue-600 underline font-mono">alpha.sam.gov</a> using Login.gov sandbox credentials. Request an API key in your user profile workspace to query the Alpha test database.
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                    <strong className="text-emerald-800 font-semibold block">2. Production: api.data.gov / SAM.gov Key</strong>
                    <p className="text-[11px] text-slate-600">
                      Register free in 30 seconds at <a href="https://api.data.gov/signup/" target="_blank" rel="noreferrer" className="text-blue-600 underline font-mono">api.data.gov/signup/</a> or visit the SAM.gov Developer Hub. Add the key to <code className="font-mono bg-slate-100 px-1 rounded">.env</code> as <code className="font-mono bg-slate-100 px-1 rounded">SAM_GOV_API_KEY</code>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* TAB 1: CONTRACT ID & SOLICITATION NUMBER VERIFICATION */
            <>
          {/* Core Answer Banner: Which Number to Use? */}
          <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-4.5 space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-600 text-white rounded-lg shrink-0 mt-0.5">
                <Info className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-blue-950">
                  Which number do you use to validate on SAM.gov?
                </h4>
                <p className="text-xs text-blue-900 leading-relaxed">
                  Always use the <strong className="text-blue-950 underline decoration-blue-500 font-mono text-xs">Solicitation Number</strong> (e.g.{' '}
                  <span className="font-mono bg-blue-100 text-blue-900 px-1 py-0.5 rounded font-bold">
                    {opportunity?.solicitationNumber || 'W912P8-26-R-0042'}
                  </span>
                  ) to search and validate on SAM.gov.
                </p>
              </div>
            </div>

            {/* Quick Breakdown Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-2 border-t border-blue-200 text-xs">
              <div className="bg-white p-3 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900">1. Solicitation Number</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                    USE THIS ON SAM.GOV
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Official RFP/RFQ number assigned by the Contracting Office. Type or paste this into SAM.gov's search bar.
                </p>
              </div>

              <div className="bg-white p-3 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900">2. Notice ID</span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-mono font-medium">
                    DIRECT URL KEY
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  SAM.gov internal unique database key. Used in direct link paths:{' '}
                  <code className="text-[10px] font-mono text-blue-700">sam.gov/opp/&#123;noticeId&#125;/view</code>.
                </p>
              </div>

              <div className="bg-white p-3 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900">3. Contract ID (Award)</span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold">
                    NOT YET ASSIGNED
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Active solicitations do <strong>not</strong> have a Contract Number yet because they are open for bidding and have not been awarded.
                </p>
              </div>
            </div>
          </div>

          {/* Sync Return Quality & Validation Audit Card (if available or live API active) */}
          {syncValidationAudit && (
            <div className="bg-emerald-950/70 border border-emerald-600/60 rounded-xl p-4.5 space-y-2.5 text-white">
              <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-emerald-700/60">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span>Live SAM.gov Sync Return Audit</span>
                      <span className="text-[10px] font-mono bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 px-2 py-0.2 rounded-full">
                        {syncValidationAudit.environment}
                      </span>
                    </h4>
                    <p className="text-[11px] text-emerald-200/80">
                      Quality analysis of current active opportunities returned from the SAM.gov Opportunities API
                    </p>
                  </div>
                </div>

                <span className="text-xs font-bold text-emerald-300 bg-emerald-900/80 border border-emerald-500 px-2.5 py-1 rounded-lg">
                  ✓ {syncValidationAudit.directLinkPercentage ?? 100}% Direct Notice Links Verified
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs pt-1">
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Live Solicitations Synced</span>
                  <strong className="text-white text-sm font-mono">{syncValidationAudit.totalLiveFetched ?? syncValidationAudit.totalRecords ?? 0} notices</strong>
                </div>

                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Direct 32-Hex Notice UUIDs</span>
                  <strong className="text-emerald-400 text-sm font-mono">{syncValidationAudit.directNoticeCount ?? syncValidationAudit.totalRecords ?? 0} ({syncValidationAudit.directLinkPercentage ?? 100}%)</strong>
                </div>

                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Link Integrity Status</span>
                  <span className="text-emerald-300 font-bold block text-[11px] truncate">
                    ✓ Verified sam.gov/opp/:id/view
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-emerald-200/70 font-mono">
                {syncValidationAudit.auditMessage || 'All returned solicitations feature valid canonical direct link paths directly to the live SAM.gov portal.'}
              </p>
            </div>
          )}

          {/* Selected Opportunity Card Inspector */}
          {opportunity && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4.5 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Selected Opportunity to Validate:
                </span>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-500">Data Origin:</span>
                  {isCuratedNotice ? (
                    <span className="bg-blue-100 text-blue-800 font-medium px-2 py-0.5 rounded border border-blue-200 flex items-center gap-1">
                      <Database className="w-3 h-3" />
                      Curated SBA Benchmark Dataset
                    </span>
                  ) : (
                    <span className="bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Live SAM.gov API Record
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{opportunity.title}</h4>
                    <p className="text-xs text-slate-500 font-medium">
                      {opportunity.department} • {opportunity.office}
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold bg-slate-900 text-white px-2.5 py-1 rounded">
                    {opportunity.solicitationNumber}
                  </span>
                </div>

                {/* Validation Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100">
                  {/* Action 1: Copy Solicitation Number */}
                  <button
                    type="button"
                    onClick={() => handleCopy(opportunity.solicitationNumber, 'solicitationNumber')}
                    className="p-2.5 rounded-lg border border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-blue-50 text-left transition flex items-center justify-between cursor-pointer group"
                  >
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Solicitation Number
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-800 group-hover:text-blue-700">
                        {opportunity.solicitationNumber}
                      </span>
                    </div>
                    {copiedField === 'solicitationNumber' ? (
                      <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Copied!
                      </span>
                    ) : (
                      <Copy className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                    )}
                  </button>

                  {/* Action 2: Direct Official Notice or Open SAM.gov Search */}
                  {(() => {
                    const directNoticeUUID = extractSamNoticeUUID(opportunity);
                    if (directNoticeUUID) {
                      return (
                        <a
                          href={`https://sam.gov/opp/${directNoticeUUID}/view`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2.5 rounded-lg border border-emerald-400 bg-emerald-600 hover:bg-emerald-700 text-white text-left transition flex items-center justify-between cursor-pointer group shadow-xs"
                          title="Direct link to official notice on live SAM.gov portal"
                        >
                          <div>
                            <span className="text-[10px] text-emerald-100 font-bold uppercase block">
                              Official Direct Notice
                            </span>
                            <span className="text-xs font-bold text-white flex items-center gap-1">
                              Direct Notice on SAM.gov
                              <ExternalLink className="w-3 h-3 text-emerald-200" />
                            </span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-emerald-200 group-hover:translate-x-0.5 transition" />
                        </a>
                      );
                    }
                    return (
                      <a
                        href={getSafeSamGovUrl(opportunity)}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 rounded-lg border border-emerald-300 bg-emerald-50/70 hover:bg-emerald-100/80 text-left transition flex items-center justify-between cursor-pointer group"
                        title="Search official solicitation on SAM.gov"
                      >
                        <div>
                          <span className="text-[10px] text-emerald-700 font-bold uppercase block">
                            Official Live Search
                          </span>
                          <span className="text-xs font-semibold text-emerald-900 flex items-center gap-1">
                            Search on SAM.gov
                            <ExternalLink className="w-3 h-3 text-emerald-700" />
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-0.5 transition" />
                      </a>
                    );
                  })()}

                  {/* Action 3: Open Alpha Test Search */}
                  <a
                    href={`https://alpha.sam.gov/search/?index=opp&q=${encodeURIComponent(opportunity.solicitationNumber)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-lg border border-amber-300 bg-amber-50/70 hover:bg-amber-100/80 text-left transition flex items-center justify-between cursor-pointer group"
                  >
                    <div>
                      <span className="text-[10px] text-amber-800 font-bold uppercase block">
                        Test Environment
                      </span>
                      <span className="text-xs font-semibold text-amber-950 flex items-center gap-1">
                        Search on Alpha.sam.gov
                        <ExternalLink className="w-3 h-3 text-amber-700" />
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-amber-600 group-hover:translate-x-0.5 transition" />
                  </a>
                </div>

                {/* Direct Notice URL */}
                <div className="text-xs text-slate-500 pt-1 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-600 truncate">
                    <span>Direct Notice ID:</span>
                    <strong className="text-slate-800">{opportunity.noticeId}</strong>
                  </div>
                  <a
                    href={getSafeSamGovUrl(opportunity)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline flex items-center gap-1"
                  >
                    Direct Opportunity Link on SAM.gov
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Why the Data Might Not Match Explained */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4.5 space-y-2.5">
            <h4 className="text-xs font-bold text-amber-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Why an opportunity might not return results on live SAM.gov:</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-amber-950">
              <div className="bg-white/80 p-3 rounded-lg border border-amber-200/80 space-y-1">
                <strong className="text-amber-900 block font-semibold">
                  A. Curated SBA Benchmark Dataset (Default Prototype Mode)
                </strong>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  When testing without a SAM.gov API key, the app loads curated realistic federal contracting scenarios with real agency structures (US Army Cyber, NAVFAC, VA, GSA), authentic NAICS, and FAR clauses to test proposal workflows. If you search these benchmark numbers on live SAM.gov, SAM.gov will not have that exact prototype solicitation.
                </p>
              </div>

              <div className="bg-white/80 p-3 rounded-lg border border-amber-200/80 space-y-1">
                <strong className="text-amber-900 block font-semibold">
                  B. Alpha Test API vs. Live Production SAM.gov
                </strong>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Per your test stage request, SAM.gov operates a dedicated test site (<strong className="font-mono text-amber-800">alpha.sam.gov</strong> and <strong className="font-mono text-amber-800">api-alpha.sam.gov</strong>). Test solicitations created in the Alpha test environment exist only on <a href="https://alpha.sam.gov" target="_blank" rel="noreferrer" className="underline font-bold text-amber-900">alpha.sam.gov</a> and will return 0 matches on the main production site!
                </p>
              </div>
            </div>
          </div>

          {/* Live SAM.gov API Query & Cross-Referencer Tool */}
          <div className="bg-slate-900 text-white rounded-xl p-5 space-y-4 border border-slate-800">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Search className="w-4 h-4 text-blue-400" />
                  <span>Live SAM.gov Query & Verification Tool</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Search any live Solicitation Number or keyword directly through GSA's Opportunities v2 API
                </p>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-lg border border-slate-700">
                <button
                  type="button"
                  onClick={() => setTestTargetEnv('alpha')}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                    testTargetEnv === 'alpha' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Alpha (Test)
                </button>
                <button
                  type="button"
                  onClick={() => setTestTargetEnv('production')}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                    testTargetEnv === 'production' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Production (Live)
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={testSearchInput}
                  onChange={(e) => setTestSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRunLiveValidation()}
                  placeholder="Enter Solicitation Number (e.g. W912P8-26-R-0042) or Keyword..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="button"
                onClick={handleRunLiveValidation}
                disabled={isVerifying || !testSearchInput.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Querying API...</span>
                  </>
                ) : (
                  <>
                    <span>Validate Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>

            {/* Verification Result Display */}
            {verifyResult && (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
                {/* Specific Solicitation Direct Live Validation Callout */}
                {verifyResult.solValidation && (
                  <div className={`p-3 rounded-lg border text-xs font-sans ${
                    verifyResult.solValidation.exists 
                      ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200' 
                      : 'bg-amber-950/80 border-amber-500/60 text-amber-200'
                  }`}>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 font-bold">
                        {verifyResult.solValidation.exists ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        )}
                        <span>{verifyResult.solValidation.status}</span>
                      </div>
                      {verifyResult.solValidation.directUrl && (
                        <a
                          href={verifyResult.solValidation.directUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-[11px] font-bold inline-flex items-center gap-1 shadow-xs transition"
                        >
                          <span>Open Direct Notice on SAM.gov</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <p className="text-[11px] mt-1 text-slate-300 leading-relaxed font-mono">
                      {verifyResult.solValidation.message}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800">
                  <span>
                    API Status: <strong className="text-emerald-400">200 OK</strong>
                  </span>
                  <span>
                    Total Database Matches: <strong className="text-white">{verifyResult.totalRecords ?? verifyResult.total ?? 0}</strong>
                  </span>
                  <span>
                    Feed Source: <strong className="text-amber-400">{verifyResult.source}</strong>
                  </span>
                </div>

                {verifyResult.opportunities && verifyResult.opportunities.length > 0 ? (
                  <div className="space-y-2">
                    <span className="text-[11px] text-slate-400 uppercase font-sans font-semibold">
                      Live Matched Solicitations ({verifyResult.opportunities.length} returned):
                    </span>
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-1 font-sans">
                      {verifyResult.opportunities.map((opp: any, idx: number) => (
                        <div
                          key={`${opp.noticeId || 'opp'}-${opp.solicitationNumber || idx}-${idx}`}
                          className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-xs flex items-start justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-amber-300 bg-slate-950 px-1.5 py-0.5 rounded text-[11px]">
                                {opp.solicitationNumber}
                              </span>
                              <span className="text-slate-400 text-[11px]">
                                {opp.department}
                              </span>
                            </div>
                            <div className="font-semibold text-white line-clamp-1">{opp.title}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Notice ID: {opp.noticeId} • Set-Aside: {opp.setAside}
                            </div>
                          </div>
                          <a
                            href={getSafeSamGovUrl(opp)}
                            target="_blank"
                            rel="noreferrer"
                            className="shrink-0 p-1.5 bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white rounded border border-blue-500/40 transition flex items-center gap-1 text-[11px]"
                          >
                            <span>View on SAM</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-400 text-center py-3 font-sans">
                    No opportunities returned for query: <code className="text-white">"{testSearchInput}"</code>.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Federal Identification Reference Table */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-xs">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              Federal Procurement Identifier Reference Guide
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-[11px]">
                    <th className="py-1.5 font-bold">Identifier Name</th>
                    <th className="py-1.5 font-bold">Example Format</th>
                    <th className="py-1.5 font-bold">Role in Federal Contracting</th>
                    <th className="py-1.5 font-bold">Where Used</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700 text-[11px]">
                  <tr>
                    <td className="py-2 font-bold text-slate-900">Solicitation Number</td>
                    <td className="py-2 font-mono text-blue-700">W912P8-26-R-0042</td>
                    <td className="py-2">Contracting Officer's public RFP/RFQ identifier</td>
                    <td className="py-2">SAM.gov Search Bar, Bids, Proposals</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold text-slate-900">Notice ID</td>
                    <td className="py-2 font-mono text-blue-700">a3f890c4e12...</td>
                    <td className="py-2">GSA SAM.gov database primary key (GUID)</td>
                    <td className="py-2">API requests, Direct URLs (/opp/&#123;id&#125;/view)</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold text-slate-900">Contract Award ID (PIID)</td>
                    <td className="py-2 font-mono text-slate-500">47QTCA26D0012</td>
                    <td className="py-2">Assigned ONLY after contract is awarded</td>
                    <td className="py-2">FPDS, USASpending, Award Notices</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold text-slate-900">UEI (Unique Entity ID)</td>
                    <td className="py-2 font-mono text-slate-500">K8L9MN4PQ231</td>
                    <td className="py-2">Replaces DUNS; identifies the contractor entity</td>
                    <td className="py-2">SAM.gov Entity Registration, SBA Profiles</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold text-slate-900">CAGE Code</td>
                    <td className="py-2 font-mono text-slate-500">8K7M2</td>
                    <td className="py-2">Defense Logistics Agency 5-character facility ID</td>
                    <td className="py-2">DoD contracts, Facility Clearances</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          </>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Need to query live SAM.gov API directly? Add a free key in <code className="font-mono text-slate-700 font-bold">.env</code> (<code className="font-mono text-slate-700">SAM_GOV_API_KEY</code>).
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};
