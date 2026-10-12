import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Database, ShieldCheck, RefreshCw, Zap, Cloud, Key, CheckCircle, AlertCircle, LogIn } from 'lucide-react';

interface LiveSyncManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadCachedOppsIntoFeed: (opps: any[]) => void;
}

export const LiveSyncManagerModal: React.FC<LiveSyncManagerModalProps> = ({
  isOpen,
  onClose,
  onLoadCachedOppsIntoFeed
}) => {
  const { user, signInWithGoogle, syncStats, cachedOpps, refreshSyncCache, syncingData } = useAuth();
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleManualRefresh = async () => {
    setSyncNotice(null);
    await refreshSyncCache();
    setSyncNotice('Sync cache refreshed from Firestore!');
    setTimeout(() => setSyncNotice(null), 3000);
  };

  const handleLoadFeed = () => {
    if (cachedOpps.length > 0) {
      onLoadCachedOppsIntoFeed(cachedOpps);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-950 p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Live Site Data Sync & Rate Limit Cache
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full">
                  Firebase Active
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Holds synced contract data from SAM.gov to protect your API keys from rate limit exhaustion.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 text-xl font-bold rounded-lg hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-sm text-slate-300">
          
          {/* User Auth Status Banner */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {user ? (
                <img 
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'User')}`} 
                  alt="User avatar" 
                  className="w-10 h-10 rounded-full border border-emerald-500/50 object-cover"
                />
              ) : (
                <div className="p-2.5 bg-slate-800 rounded-full text-slate-400">
                  <LogIn className="w-5 h-5" />
                </div>
              )}
              <div>
                <div className="font-semibold text-white text-xs">
                  {user ? user.displayName || user.email : 'Google Authentication Required'}
                </div>
                <div className="text-[11px] text-slate-400">
                  {user ? `Connected: ${user.email}` : 'Sign in to sync & persist live contract records in Firestore.'}
                </div>
              </div>
            </div>

            {!user && (
              <button
                onClick={() => signInWithGoogle()}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-2 shadow-lg"
              >
                <LogIn className="w-4 h-4" />
                Sign In with Google
              </button>
            )}
          </div>

          {/* Rate Limit Protection Explanation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-emerald-950/20 p-4 rounded-xl border border-emerald-500/30 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
                Rate-Limit Defense Active
              </div>
              <p className="text-xs text-emerald-200/80 leading-relaxed">
                SAM.gov enforces strict API quotas (e.g. 10 requests/min). When live searches occur, results are automatically synced to Firestore to serve repeat queries without consuming API quota.
              </p>
            </div>

            <div className="bg-blue-950/20 p-4 rounded-xl border border-blue-500/30 space-y-2">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
                <Cloud className="w-4 h-4" />
                Live Firestore Persistence
              </div>
              <p className="text-xs text-blue-200/80 leading-relaxed">
                All contract opportunities, bid decisions, proposal drafts, and market intelligence are backed up synchronously to your secure Firestore database instance.
              </p>
            </div>
          </div>

          {/* Sync Statistics */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Live Cache Status & Metrics
              </h3>
              <button
                onClick={handleManualRefresh}
                disabled={syncingData}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncingData ? 'animate-spin text-emerald-400' : ''}`} />
                {syncingData ? 'Syncing...' : 'Refresh Sync Cache'}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center pt-2">
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <div className="text-xl font-bold text-emerald-400">{syncStats?.totalSyncedCount || cachedOpps.length || 0}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Synced Records</div>
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <div className="text-xs font-semibold text-cyan-400 truncate">
                  {syncStats?.lastSyncedAt ? new Date(syncStats.lastSyncedAt).toLocaleTimeString() : 'Active'}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Last Live Sync</div>
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <div className="text-xs font-semibold text-indigo-400">
                  {syncStats?.sources?.join(', ') || 'SAM.gov & GSA'}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Protected API Feeds</div>
              </div>
            </div>

            {syncNotice && (
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {syncNotice}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-white text-xs">Load Cached Live Opportunities Into Workspace</div>
              <p className="text-[11px] text-slate-400">Populates the main contract feed directly from Firestore sync storage without calling SAM.gov APIs.</p>
            </div>
            <button
              onClick={handleLoadFeed}
              disabled={cachedOpps.length === 0}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition shrink-0 cursor-pointer disabled:opacity-40"
            >
              Browse Cached Feed ({cachedOpps.length})
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition"
          >
            Close Manager
          </button>
        </div>

      </div>
    </div>
  );
};
