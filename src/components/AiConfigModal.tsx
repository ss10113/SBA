import React, { useState, useEffect } from 'react';
import { 
  X, 
  Cpu, 
  Key, 
  Server, 
  CheckCircle2, 
  AlertTriangle, 
  Terminal, 
  Copy, 
  Check, 
  RefreshCw, 
  ExternalLink,
  Shield,
  HelpCircle,
  HardDrive,
  Network,
  Zap,
  Globe,
  Sliders,
  FileCode,
  Download,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff
} from 'lucide-react';

interface AiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved?: () => void;
}

export const AiConfigModal: React.FC<AiConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved,
}) => {
  const [activeTab, setActiveTab] = useState<'config' | 'sam-sba' | 'vm-guide' | 'docker'>('config');
  const [provider, setProvider] = useState<'gemini' | 'ollama' | 'openai-compatible' | 'custom'>('gemini');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [modelName, setModelName] = useState('gemini-3.8-flash');
  const [baseUrl, setBaseUrl] = useState('');
  const [temperature, setTemperature] = useState(0.2);
  
  // SBA / SAM.gov Key State
  const [samApiKeyInput, setSamApiKeyInput] = useState('');
  const [showSamKey, setShowSamKey] = useState(false);
  const [samTargetEnv, setSamTargetEnv] = useState<'production' | 'alpha'>('production');
  const [savingSamKey, setSavingSamKey] = useState(false);
  const [samFeedback, setSamFeedback] = useState<{ text: string; ok: boolean } | null>(null);
  const [samStatus, setSamStatus] = useState<any>(null);
  const [testingSamKey, setTestingSamKey] = useState(false);
  const [samTestResult, setSamTestResult] = useState<any>(null);
  
  // Status & testing
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    latencyMs?: number;
    message?: string;
    model?: string;
    details?: string;
  } | null>(null);
  const [currentConfig, setCurrentConfig] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);

  const loadSamStatus = async () => {
    try {
      const res = await fetch('/api/sam/status');
      const data = await res.json();
      setSamStatus(data);
      if (data.activeEnv) setSamTargetEnv(data.activeEnv);
    } catch (err) {
      console.warn('Could not load SAM status:', err);
    }
  };

  // Fetch current config on open
  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    setSaveError(null);
    fetch('/api/config/ai')
      .then((r) => r.json())
      .then((data) => {
        setCurrentConfig(data);
        if (data.provider) setProvider(data.provider);
        if (data.modelName) setModelName(data.modelName);
        if (data.baseUrl) setBaseUrl(data.baseUrl);
        if (data.temperature !== undefined) setTemperature(data.temperature);
      })
      .catch((err) => console.warn('Could not fetch AI config:', err))
      .finally(() => setIsLoading(false));

    loadSamStatus();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleProviderSelect = (newProvider: 'gemini' | 'ollama' | 'openai-compatible' | 'custom') => {
    setProvider(newProvider);
    setTestResult(null);
    setSaveError(null);
    if (newProvider === 'gemini') {
      setModelName('gemini-3.8-flash');
      setBaseUrl('');
    } else if (newProvider === 'ollama') {
      setModelName('llama3.3:latest');
      setBaseUrl('http://localhost:11434/v1');
    } else if (newProvider === 'openai-compatible') {
      setModelName('qwen2.5:32b');
      setBaseUrl('http://localhost:8000/v1');
    }
  };

  const handleTestConnection = async () => {
    setIsLoading(true);
    setTestResult(null);
    setSaveError(null);
    try {
      const res = await fetch('/api/config/ai/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          apiKey: apiKeyInput || undefined,
          modelName,
          baseUrl,
          temperature,
        }),
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({
        ok: false,
        message: `Connection failed: ${err.message || 'Network error'}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);
    try {
      const res = await fetch('/api/config/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          apiKey: apiKeyInput || undefined,
          modelName,
          baseUrl,
          temperature,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSaveSuccess(true);
        setCurrentConfig(data.currentConfig || data);
        setApiKeyInput(''); // Clear plain text input once saved to backend
        if (onConfigSaved) onConfigSaved();
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        setSaveError(data.error || 'Failed to save AI configuration');
      }
    } catch (err: any) {
      setSaveError(`Error saving configuration: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSamKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSamKey(true);
    setSamFeedback(null);
    try {
      const res = await fetch('/api/sam/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: samApiKeyInput,
          targetEnv: samTargetEnv,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSamFeedback({
          text: samApiKeyInput.trim() ? 'SAM.gov / SBA API Key saved and activated successfully!' : 'API key cleared.',
          ok: true,
        });
        setSamApiKeyInput('');
        loadSamStatus();
      } else {
        setSamFeedback({ text: data.message || 'Failed to update key', ok: false });
      }
    } catch (err: any) {
      setSamFeedback({ text: err.message || 'Error saving key', ok: false });
    } finally {
      setSavingSamKey(false);
    }
  };

  const handleTestSamKey = async () => {
    setTestingSamKey(true);
    setSamTestResult(null);
    try {
      const res = await fetch('/api/sam/verify-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: samApiKeyInput || undefined,
          targetEnv: samTargetEnv,
        }),
      });
      const data = await res.json();
      setSamTestResult(data);
    } catch (err: any) {
      setSamTestResult({ isValid: false, message: err.message });
    } finally {
      setTestingSamKey(false);
    }
  };

  const dockerComposeCode = `version: '3.8'

services:
  # SBA GovWin Federal Procurement Platform
  sba-govwin:
    build: .
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - NODE_ENV=production
      # Google Gemini or Local LLM Options
      - GEMINI_API_KEY=\${GEMINI_API_KEY:-}
      - AI_PROVIDER=\${AI_PROVIDER:-gemini} # 'gemini', 'ollama', or 'openai-compatible'
      - AI_MODEL=\${AI_MODEL:-gemini-3.8-flash}
      - AI_BASE_URL=\${AI_BASE_URL:-}
      # SAM.gov API Credentials (Optional)
      - SAM_GOV_API_KEY=\${SAM_GOV_API_KEY:-}
      - SAM_GOV_ENV=production
    depends_on:
      - ollama # Optional: if hosting local LLM on the same VM

  # Self-Hosted Local LLM (Ollama)
  ollama:
    image: ollama/ollama:latest
    container_name: sba-ollama
    restart: unless-stopped
    ports:
      - "11434:11434"
    volumes:
      - ollama_models:/root/.ollama
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia # Remove if running on CPU-only VM
              count: all
              capabilities: [gpu]

volumes:
  ollama_models:
`;

  const envFileCode = `# ==============================================================================
# SBA GOVWIN SELF-HOSTED HOME VM CONFIGURATION
# ==============================================================================

# Server Network Port
PORT=3000
NODE_ENV=production

# ------------------------------------------------------------------------------
# 1. AI AGENT & LLM PLATFORM PROVIDER
# ------------------------------------------------------------------------------
# Choose: 'gemini' | 'ollama' | 'openai-compatible' | 'custom'
AI_PROVIDER=gemini

# Google Gemini API Key (Get free key at: https://aistudio.google.com/apikey)
GEMINI_API_KEY=ADD GEMINI KEY HERE

# Selected AI Model
# For Gemini: 'gemini-3.8-flash', 'gemini-3.1-pro-preview'
# For Ollama: 'llama3.3:latest', 'qwen2.5:32b', 'mistral:latest'
AI_MODEL=gemini-3.8-flash

# Base URL (Required for Ollama / LocalAI / OpenAI-compatible on home VM)
# Example for Ollama on same host: http://localhost:11434/v1
# Example for remote home VM: http://192.168.1.100:11434/v1
AI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/

# ------------------------------------------------------------------------------
# 2. SAM.GOV FEDERAL OPPORTUNITIES API (OPTIONAL)
# ------------------------------------------------------------------------------
# Obtain at: https://open.gsa.gov/api/get-opportunities-public-api/
# When left empty, app operates in high-fidelity 213-record benchmark repository mode
SAM_GOV_API_KEY=SAM-3a8174ee-9181-4352-9cc7-c2b7009aee41
SAM_GOV_ENV=production
`;

  const systemdServiceCode = `[Unit]
Description=SBA GovWin Federal Procurement Capture Engine
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/sba-govwin
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
EnvironmentFile=/opt/sba-govwin/.env

[Install]
WantedBy=multi-user.target
`;

  return (
    <div className={`fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-50 animate-in fade-in duration-200 transition-all ${isMaximized ? 'p-0' : 'p-2 sm:p-4'}`}>
      <div className={`bg-white shadow-2xl flex flex-col overflow-hidden border border-slate-200 transition-all duration-150 ${isMaximized ? 'w-full h-full max-w-none max-h-none rounded-none' : 'max-w-4xl w-full max-h-[94vh] sm:max-h-[92vh] rounded-2xl'}`}>
        {/* Modal Top Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl shadow-xs shrink-0">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold tracking-tight">
                  Self-Hosted VM & AI Agent Configuration
                </h3>
                <span className="bg-blue-500/20 text-blue-300 text-[10px] font-mono px-2 py-0.5 rounded border border-blue-400/30">
                  HOME VM READY
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300">
                Configure your own API keys, connect local LLMs (Ollama), or deploy on your private home server
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsMaximized(!isMaximized)}
              title={isMaximized ? "Restore window size (Minimize to standard dialog)" : "Expand window to full screen (Maximize)"}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
            >
              {isMaximized ? <Minimize2 className="w-4 h-4 text-blue-400" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              title="Close window"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('config')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'config'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>AI Platform & Gemini Key</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sam-sba')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'sam-sba'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-amber-600" />
            <span>SBA / SAM.gov Key</span>
            {samStatus?.hasLiveApiKey && (
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('vm-guide')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'vm-guide'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Self-Hosted Home VM Guide</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('docker')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'docker'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Docker & .env Templates</span>
          </button>
        </div>

        {/* Tab 1: AI Provider & Keys Config */}
        {activeTab === 'config' && (
          <form onSubmit={handleSaveConfig} className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
            {/* Live Server Status Banner */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <span className={`w-2.5 h-2.5 rounded-full ${currentConfig?.hasKey ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                <div>
                  <span className="font-bold text-slate-900">Current Server Status: </span>
                  <span className="text-slate-600 font-mono">
                    Provider: <strong>{currentConfig?.provider?.toUpperCase() || 'GEMINI'}</strong> | Model: <strong>{currentConfig?.modelName || 'gemini-3.8-flash'}</strong>
                  </span>
                  {currentConfig?.maskedKey && (
                    <span className="text-slate-400 font-mono ml-2 text-[11px]">
                      (Key: {currentConfig.maskedKey})
                    </span>
                  )}
                </div>
              </div>

              <div className="text-xs">
                {currentConfig?.hasKey ? (
                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Active Key Configured</span>
                  </span>
                ) : (
                  <span className="bg-amber-100 text-amber-800 border border-amber-300 font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    <span>No Custom Key (Using Local Engine)</span>
                  </span>
                )}
              </div>
            </div>

            {/* Provider Selector Cards */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2 uppercase tracking-wider">
                Select AI Platform / Agent Provider
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Provider 1: Gemini */}
                <div
                  onClick={() => handleProviderSelect('gemini')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                    provider === 'gemini'
                      ? 'border-blue-600 bg-blue-50/60 shadow-xs ring-1 ring-blue-600/30'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-blue-600" />
                        <span>Google Gemini</span>
                      </span>
                      {provider === 'gemini' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Cloud AI via Google AI Studio API. High-performance reasoning with official TypeScript SDK.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded self-start mt-3">
                    gemini-3.8-flash / 3.1-pro
                  </span>
                </div>

                {/* Provider 2: Ollama (Local Home VM) */}
                <div
                  onClick={() => handleProviderSelect('ollama')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                    provider === 'ollama'
                      ? 'border-blue-600 bg-blue-50/60 shadow-xs ring-1 ring-blue-600/30'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                        <HardDrive className="w-4 h-4 text-emerald-600" />
                        <span>Ollama (Home VM)</span>
                      </span>
                      {provider === 'ollama' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      100% self-hosted on your home VM. Completely offline, private, zero external API keys needed.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded self-start mt-3">
                    llama3.3 / mistral / qwen
                  </span>
                </div>

                {/* Provider 3: OpenAI Compatible */}
                <div
                  onClick={() => handleProviderSelect('openai-compatible')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                    provider === 'openai-compatible'
                      ? 'border-blue-600 bg-blue-50/60 shadow-xs ring-1 ring-blue-600/30'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                        <Network className="w-4 h-4 text-indigo-600" />
                        <span>OpenAI-Compatible</span>
                      </span>
                      {provider === 'openai-compatible' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Works with LocalAI, vLLM, LM Studio, OpenWebUI, or standard OpenAI endpoints.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded self-start mt-3">
                    /v1/chat/completions
                  </span>
                </div>
              </div>
            </div>

            {/* API Key & Credentials */}
            <div className="space-y-4 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-4 h-4 text-blue-600" />
                <span>API Key & Connection Credentials</span>
              </h4>

              {provider === 'gemini' ? (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Gemini API Key
                    </label>
                    <a
                      href="https://aistudio.google.com/apikey"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <span>Get Free API Key from Google AI Studio</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      type={showKey ? 'text' : 'password'}
                      placeholder={currentConfig?.hasKey ? `Current Key: ${currentConfig.maskedKey} (leave empty to keep)` : 'Enter AIzaSy... key'}
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-semibold"
                    >
                      {showKey ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Key is sent securely to your backend proxy (<code className="font-mono text-slate-700">/api/generate-strategy</code>). Never exposed to browser bundle.
                  </p>
                </div>
              ) : provider === 'ollama' ? (
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-900">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>No API Key Required for Local Ollama</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    Ollama running on your home VM does not require authorization tokens. Simply specify your local endpoint below.
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Endpoint API Key / Bearer Token (Optional for local servers)
                  </label>
                  <input
                    type={showKey ? 'text' : 'password'}
                    placeholder="Enter sk-... or custom token (or leave empty if unauthenticated)"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  />
                </div>
              )}

              {/* Endpoint URL and Model Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    AI Model Identifier
                  </label>
                  <input
                    type="text"
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    placeholder="e.g. gemini-3.8-flash or llama3.3:latest"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <div className="flex flex-wrap items-center gap-1 mt-1.5">
                    <span className="text-[10px] text-slate-400">Presets:</span>
                    {(provider === 'gemini'
                      ? ['gemini-3.8-flash', 'gemini-3.1-pro-preview']
                      : ['llama3.3:latest', 'qwen2.5:32b', 'mistral:latest']
                    ).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setModelName(m)}
                        className="text-[10px] font-mono bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded text-slate-700 border border-slate-200 transition cursor-pointer"
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Base URL / API Endpoint
                  </label>
                  <input
                    type="text"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    placeholder={
                      provider === 'gemini' 
                        ? 'Default (https://generativelanguage.googleapis.com)' 
                        : 'http://localhost:11434/v1'
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">
                    {provider === 'ollama' 
                      ? 'Point to your home VM IP, e.g. http://192.168.1.150:11434/v1'
                      : 'Leave blank to use default cloud endpoints'}
                  </span>
                </div>
              </div>
            </div>

            {/* Test Connection Results Display */}
            {testResult && (
              <div className={`p-4 rounded-xl border text-xs ${
                testResult.ok 
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950' 
                  : 'bg-red-50 border-red-300 text-red-950'
              }`}>
                <div className="flex items-center gap-2 font-bold mb-1">
                  {testResult.ok ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Connection Successful!</span>
                      {testResult.latencyMs && (
                        <span className="font-mono text-emerald-700 font-normal">({testResult.latencyMs}ms response time)</span>
                      )}
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span>Connection Failed</span>
                    </>
                  )}
                </div>
                <p className="text-[11px] leading-relaxed">
                  {testResult.message || (testResult.ok ? 'Successfully validated AI model handshake.' : 'Could not contact model.')}
                </p>
                {testResult.details && (
                  <div className="mt-2 p-2 bg-white/70 rounded font-mono text-[10px] text-slate-700 overflow-x-auto">
                    {testResult.details}
                  </div>
                )}
              </div>
            )}

            {/* Save Success Notice */}
            {saveSuccess && (
              <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-lg text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>AI Configuration saved to server! Next AI bid strategies will use your active settings.</span>
              </div>
            )}

            {/* Save Error Notice */}
            {saveError && (
              <div className="p-3 bg-red-100 border border-red-300 text-red-900 rounded-lg text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>{saveError}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isLoading}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold text-xs border border-slate-300 flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? 'Testing Handshake...' : 'Test Connection & Ping'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Save AI Configuration</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Tab: SBA / SAM.gov Opportunities API Key Configuration */}
        {activeTab === 'sam-sba' && (
          <form onSubmit={handleSaveSamKey} className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
            {/* Live SAM Status Banner */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <span className={`w-2.5 h-2.5 rounded-full ${samStatus?.hasLiveApiKey ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                <div>
                  <span className="font-bold text-slate-900">SAM.gov Feed Status: </span>
                  <span className="text-slate-600 font-mono">
                    Mode: <strong>{samStatus?.hasLiveApiKey ? 'LIVE API' : 'ACTIVE CURATED BENCHMARK'}</strong> | Env: <strong>{samStatus?.activeEnv?.toUpperCase() || 'PRODUCTION'}</strong>
                  </span>
                  {samStatus?.maskedKey && (
                    <span className="text-slate-400 font-mono ml-2 text-[11px]">
                      (Key: {samStatus.maskedKey})
                    </span>
                  )}
                </div>
              </div>

              <div className="text-xs">
                {samStatus?.hasLiveApiKey ? (
                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>SBA / SAM Key Active</span>
                  </span>
                ) : (
                  <span className="bg-amber-100 text-amber-800 border border-amber-300 font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    <span>No Key Saved (Using Curated Feed)</span>
                  </span>
                )}
              </div>
            </div>

            {/* Key Input Card */}
            <div className="bg-amber-50/40 border border-amber-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-slate-900">
                <div className="p-2 rounded-lg bg-amber-100 text-amber-800 border border-amber-300">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Enter Your SAM.gov / SBA API Key</h4>
                  <p className="text-xs text-slate-500">
                    Connect directly to the GSA SAM.gov Opportunities Public API to query live solicitations.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Opportunities API Key
                </label>
                <div className="relative">
                  <input
                    type={showSamKey ? 'text' : 'password'}
                    value={samApiKeyInput}
                    onChange={(e) => setSamApiKeyInput(e.target.value)}
                    placeholder={samStatus?.hasLiveApiKey ? '•••••••••••••••• (Key saved - enter new key to replace)' : 'Paste your SAM.gov or SBA API key here...'}
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSamKey(!showSamKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showSamKey ? 'Hide key' : 'Show key'}
                  >
                    {showSamKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Key is saved to server runtime configuration. Never committed to source code or git.
                </p>
              </div>

              {/* Target Environment */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Target API Environment
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSamTargetEnv('production')}
                    className={`p-3 rounded-lg border text-left transition cursor-pointer ${
                      samTargetEnv === 'production'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-1 ring-emerald-400'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <strong className="text-xs">🟢 Production API</strong>
                      {samTargetEnv === 'production' && <span className="text-[10px] font-bold text-emerald-700 font-mono">SELECTED</span>}
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono">api.sam.gov</p>
                    <p className="text-[10px] text-slate-600 mt-1">Live official notices across all federal agencies.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSamTargetEnv('alpha')}
                    className={`p-3 rounded-lg border text-left transition cursor-pointer ${
                      samTargetEnv === 'alpha'
                        ? 'bg-amber-50 border-amber-500 text-amber-900 ring-1 ring-amber-400'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <strong className="text-xs">🧪 Alpha Test API</strong>
                      {samTargetEnv === 'alpha' && <span className="text-[10px] font-bold text-amber-700 font-mono">SELECTED</span>}
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono">api-alpha.sam.gov</p>
                    <p className="text-[10px] text-slate-600 mt-1">Recommended for staging and test account verification.</p>
                  </button>
                </div>
              </div>
            </div>

            {/* Test Results Banner */}
            {samTestResult && (
              <div className={`p-4 rounded-xl border text-xs ${samTestResult.isValid ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-red-50 border-red-300 text-red-950'}`}>
                <div className="flex items-center gap-2 font-bold mb-1">
                  {samTestResult.isValid ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>SAM.gov API Handshake Verified (HTTP {samTestResult.httpStatus || 200})!</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span>Verification Note: {samTestResult.message || 'Key test completed'}</span>
                    </>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 font-mono">
                  Endpoint: {samTestResult.endpoint} | Latency: {samTestResult.latencyMs || 0}ms
                </p>
              </div>
            )}

            {samFeedback && (
              <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 font-medium ${samFeedback.ok ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-red-50 border-red-300 text-red-900'}`}>
                {samFeedback.ok ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-red-600" />}
                <span>{samFeedback.text}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200">
              <button
                type="button"
                onClick={handleTestSamKey}
                disabled={testingSamKey}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold text-xs border border-slate-300 flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testingSamKey ? 'animate-spin' : ''}`} />
                <span>{testingSamKey ? 'Verifying with GSA...' : 'Test Key with GSA'}</span>
              </button>

              <div className="flex items-center gap-2">
                {samStatus?.hasLiveApiKey && (
                  <button
                    type="button"
                    onClick={() => {
                      setSamApiKeyInput('');
                      handleSaveSamKey({ preventDefault: () => {} } as any);
                    }}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-xs transition cursor-pointer"
                  >
                    Disconnect Key
                  </button>
                )}
                <button
                  type="submit"
                  disabled={savingSamKey}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs shadow-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                >
                  {savingSamKey ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Save SAM / SBA API Key</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Tab 2: Self-Hosted Home VM Deployment Guide */}
        {activeTab === 'vm-guide' && (
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-slate-700 leading-relaxed">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-blue-950">
              <h4 className="font-bold text-sm mb-1 flex items-center gap-1.5">
                <Server className="w-4 h-4 text-blue-600" />
                <span>Self-Hosted Home VM Architecture</span>
              </h4>
              <p className="text-[11px] text-blue-900/90 leading-relaxed">
                You can easily move this entire application to your home laboratory (Proxmox, Unraid, TrueNAS SCALE, Ubuntu Server, or a local Linux VM). The application is fully self-contained with Node.js and Express, requiring zero external subscriptions when paired with local Ollama models.
              </p>
            </div>

            {/* Step-by-step instructions */}
            <div className="space-y-4">
              <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-xs">
                <h5 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">1</span>
                  <span>Install Prerequisites on Home VM</span>
                </h5>
                <p className="text-slate-600 mb-2">
                  Requires Node.js 20+ (or Docker) and Git on your Linux VM (Ubuntu/Debian example):
                </p>
                <div className="relative bg-slate-950 text-slate-200 p-3 rounded-lg font-mono text-[11px] overflow-x-auto">
                  <button
                    onClick={() => handleCopy('sudo apt update && sudo apt install -y curl git\ncurl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -\nsudo apt install -y nodejs', 'step1')}
                    className="absolute right-2 top-2 text-slate-400 hover:text-white p-1"
                  >
                    {copiedCode === 'step1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <code>sudo apt update && sudo apt install -y curl git<br />curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -<br />sudo apt install -y nodejs</code>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-xs">
                <h5 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">2</span>
                  <span>Deploy and Run with Node.js</span>
                </h5>
                <p className="text-slate-600 mb-2">
                  Copy application directory into <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">/opt/sba-govwin</code>, install dependencies, and start:
                </p>
                <div className="relative bg-slate-950 text-slate-200 p-3 rounded-lg font-mono text-[11px] overflow-x-auto">
                  <button
                    onClick={() => handleCopy('cd /opt/sba-govwin\nnpm install\nnpm run build\nnpm start', 'step2')}
                    className="absolute right-2 top-2 text-slate-400 hover:text-white p-1"
                  >
                    {copiedCode === 'step2' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <code>cd /opt/sba-govwin<br />npm install<br />npm run build<br />npm start</code>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-xs">
                <h5 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">3</span>
                  <span>Configure Systemd Service for Auto-Start on Boot</span>
                </h5>
                <p className="text-slate-600 mb-2">
                  To ensure the service restarts automatically whenever your VM boots up:
                </p>
                <div className="relative bg-slate-950 text-slate-200 p-3 rounded-lg font-mono text-[11px] overflow-x-auto">
                  <button
                    onClick={() => handleCopy(systemdServiceCode, 'systemd')}
                    className="absolute right-2 top-2 text-slate-400 hover:text-white p-1"
                  >
                    {copiedCode === 'systemd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <pre className="text-[10px] leading-tight text-slate-300">{systemdServiceCode}</pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Docker & .env Templates */}
        {activeTab === 'docker' && (
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-slate-700">
            {/* .env Template */}
            <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h5 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <FileCode className="w-4 h-4 text-blue-600" />
                    <span>.env Environment Configuration File</span>
                  </h5>
                  <p className="text-[11px] text-slate-500">
                    Place this in your application root folder on your VM
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(envFileCode, 'env')}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded font-semibold text-xs flex items-center gap-1 transition cursor-pointer"
                >
                  {copiedCode === 'env' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy .env</span>
                </button>
              </div>

              <div className="bg-slate-950 text-slate-200 p-3 rounded-lg font-mono text-[10px] max-h-56 overflow-y-auto">
                <pre>{envFileCode}</pre>
              </div>
            </div>

            {/* Docker Compose Template */}
            <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h5 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <HardDrive className="w-4 h-4 text-emerald-600" />
                    <span>docker-compose.yml (App + Local Ollama Stack)</span>
                  </h5>
                  <p className="text-[11px] text-slate-500">
                    One-command setup that launches both SBA GovWin and local Ollama model engine
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(dockerComposeCode, 'docker')}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded font-semibold text-xs flex items-center gap-1 transition cursor-pointer"
                >
                  {copiedCode === 'docker' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy docker-compose.yml</span>
                </button>
              </div>

              <div className="bg-slate-950 text-slate-200 p-3 rounded-lg font-mono text-[10px] max-h-56 overflow-y-auto">
                <pre>{dockerComposeCode}</pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
