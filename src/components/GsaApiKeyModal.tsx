import React, { useState, useEffect } from 'react';
import {
  X,
  Key,
  Shield,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Zap,
  Globe,
  Sliders,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  DollarSign,
  Building2,
  Check,
  Search
} from 'lucide-react';

interface GsaApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved?: () => void;
}

export const GsaApiKeyModal: React.FC<GsaApiKeyModalProps> = ({
  isOpen,
  onClose,
  onKeySaved,
}) => {
  const [gsaApiKeyInput, setGsaApiKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [gsaStatus, setGsaStatus] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [feedback, setFeedback] = useState<{ text: string; ok: boolean } | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);

  // Fetch current GSA API status
  const loadGsaStatus = async () => {
    try {
      const res = await fetch('/api/gsa/status');
      const data = await res.json();
      setGsaStatus(data);
    } catch (err) {
      console.warn('Could not load GSA status:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadGsaStatus();
      setTestResult(null);
      setFeedback(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveKey = async () => {
    setIsSaving(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/gsa/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: gsaApiKeyInput }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({
          text: gsaApiKeyInput.trim()
            ? 'GSA Acquisition Gateway API key saved and activated successfully!'
            : 'API key cleared. System reverted to baseline labor benchmarks.',
          ok: true,
        });
        setGsaApiKeyInput('');
        await loadGsaStatus();
        if (onKeySaved) onKeySaved();
      } else {
        setFeedback({ text: data.message || 'Failed to save GSA API key', ok: false });
      }
    } catch (e: any) {
      setFeedback({ text: e.message || 'Network error saving GSA API key', ok: false });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestKey = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/gsa/verify-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: gsaApiKeyInput.trim() || undefined }),
      });
      const data = await res.json();
      setTestResult(data);
    } catch (e: any) {
      setTestResult({
        isValid: false,
        message: `Network error verifying key: ${e.message}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div
        className={`bg-slate-900 border border-slate-700 rounded-xl shadow-2xl text-slate-100 transition-all duration-200 flex flex-col ${
          isMaximized ? 'w-full h-full max-w-none rounded-none' : 'w-full max-w-3xl max-h-[90vh]'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/80 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  GSA Acquisition Gateway & CALC API Key Integration
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                  v4.0 Live Rate Pulls
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Connect your GSA API key to stream live awarded labor categories and ceiling rates from api.gsa.gov
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title={isMaximized ? 'Restore Modal' : 'Maximize Modal'}
            >
              {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-sm text-slate-300">
          
          {/* Active Status Card */}
          <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
            gsaStatus?.hasLiveApiKey
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
              : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg mt-0.5 ${
                gsaStatus?.hasLiveApiKey ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
              }`}>
                {gsaStatus?.hasLiveApiKey ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              </div>
              <div>
                <div className="font-semibold text-sm flex items-center gap-2">
                  <span>
                    {gsaStatus?.hasLiveApiKey
                      ? `Live GSA CALC API Active (${gsaStatus.maskedKey})`
                      : 'Baseline Labor Rate Mode Active'}
                  </span>
                </div>
                <p className="text-xs opacity-90 mt-1">
                  {gsaStatus?.hasLiveApiKey
                    ? 'Connected to https://api.gsa.gov/acquisitiongateway/api/v4.0/. Live queries fetch current awarded prices, contract schedules, experience, and vendor data.'
                    : 'Currently using curated federal labor rate benchmarks ($/hr). Input your GSA API key below to unlock live real-time rate queries.'}
                </p>
              </div>
            </div>

            <a
              href="https://open.gsa.gov/api/key/"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-lg border border-slate-700 flex items-center gap-1.5 whitespace-nowrap transition-colors"
            >
              <span>Get Free GSA API Key</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Key Input Section */}
          <div className="bg-slate-800/50 border border-slate-700/80 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-400" />
                GSA API Key Input
              </label>
              {gsaStatus?.hasLiveApiKey && (
                <span className="text-xs text-slate-400">
                  Current Key: <code className="bg-slate-900 px-1.5 py-0.5 rounded text-emerald-400 font-mono">{gsaStatus.maskedKey}</code>
                </span>
              )}
            </div>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={gsaApiKeyInput}
                onChange={(e) => setGsaApiKeyInput(e.target.value)}
                placeholder={gsaStatus?.hasLiveApiKey ? 'Enter new GSA API Key to overwrite...' : 'Paste your api.gsa.gov key here...'}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 pr-24"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                title={showKey ? 'Hide Key' : 'Show Key'}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {feedback && (
              <div className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
                feedback.ok ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60' : 'bg-rose-950/60 text-rose-300 border border-rose-800/60'
              }`}>
                {feedback.ok ? <Check className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                <span>{feedback.text}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestKey}
                  disabled={isTesting}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {isTesting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                      Testing Key...
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      Test Connection & Quota
                    </>
                  )}
                </button>

                {gsaStatus?.hasLiveApiKey && (
                  <button
                    type="button"
                    onClick={async () => {
                      setGsaApiKeyInput('');
                      setIsSaving(true);
                      try {
                        await fetch('/api/gsa/config', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ apiKey: '' }),
                        });
                        await loadGsaStatus();
                        setFeedback({ text: 'GSA API key cleared.', ok: true });
                        if (onKeySaved) onKeySaved();
                      } finally {
                        setIsSaving(false);
                      }
                    }}
                    disabled={isSaving}
                    className="px-3 py-2 bg-slate-900 hover:bg-rose-950/60 text-rose-400 hover:text-rose-300 text-xs font-medium rounded-lg border border-slate-800 hover:border-rose-800/50 transition-colors"
                  >
                    Remove Saved Key
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={handleSaveKey}
                disabled={isSaving || !gsaApiKeyInput.trim()}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-emerald-950/50 flex items-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Save & Activate GSA Key
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Test Verification Results */}
          {testResult && (
            <div className={`p-4 rounded-xl border space-y-3 ${
              testResult.isValid
                ? 'bg-emerald-950/40 border-emerald-500/50 text-slate-200'
                : 'bg-rose-950/40 border-rose-500/50 text-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-xs">
                  {testResult.isValid ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                  )}
                  <span>Test Result: {testResult.isValid ? 'Valid GSA API Key' : 'Connection Error'}</span>
                </div>
                {testResult.latencyMs && (
                  <span className="text-[11px] font-mono text-slate-400">
                    Latency: {testResult.latencyMs} ms
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-300">{testResult.message}</p>

              {testResult.isValid && testResult.sampleRatesCount !== undefined && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs border-t border-slate-800">
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">Sample Rates Returned</span>
                    <span className="text-sm font-bold text-emerald-400">{testResult.sampleRatesCount} categories</span>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">Endpoint Verified</span>
                    <span className="text-xs font-mono text-slate-200 truncate block">api.gsa.gov v4.0</span>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 col-span-2 sm:col-span-1">
                    <span className="text-[11px] text-slate-400 block">Rate Limit Status</span>
                    <span className="text-xs text-emerald-300 font-semibold">{testResult.rateLimitRemaining || 'Standard Limit'}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Endpoint Technical Details */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              GSA Acquisition Gateway API v4.0 & CALC Endpoints
            </h4>

            <div className="space-y-2 text-xs font-mono text-slate-400">
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">Base Endpoint:</span>
                <span className="text-emerald-400">https://api.gsa.gov/acquisitiongateway/api/v4.0/</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">CALC Quick Rates Endpoint:</span>
                <span className="text-emerald-400">https://api.gsa.gov/acquisition/calc/v3/api/ceilingrates/</span>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              GSA Acquisition Gateway and CALC APIs allow federal buyers and industry vendors to search contract-awarded hourly ceiling rates across GSA Multiple Award Schedule (MAS) contracts.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 rounded-b-xl flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Keys are securely kept in server memory for proxy requests to api.gsa.gov</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
