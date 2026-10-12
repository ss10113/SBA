import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { 
  auth, 
  signInWithGoogle, 
  logout, 
  SyncedCacheStats, 
  fetchSyncedOpportunitiesFromFirestore, 
  saveOpportunitiesToFirestoreSync 
} from '../lib/firebase';
import { SAMOpportunity } from '../types/contract';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<User | null>;
  logout: () => Promise<void>;
  syncStats: SyncedCacheStats | null;
  cachedOpps: SAMOpportunity[];
  refreshSyncCache: () => Promise<void>;
  persistOpportunitiesToSync: (opps: SAMOpportunity[], source?: string) => Promise<number>;
  syncingData: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => null,
  logout: async () => {},
  syncStats: null,
  cachedOpps: [],
  refreshSyncCache: async () => {},
  persistOpportunitiesToSync: async () => 0,
  syncingData: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncStats, setSyncStats] = useState<SyncedCacheStats | null>(null);
  const [cachedOpps, setCachedOpps] = useState<SAMOpportunity[]>([]);
  const [syncingData, setSyncingData] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        refreshSyncCache();
      }
    });

    return () => unsubscribe();
  }, []);

  const refreshSyncCache = async () => {
    try {
      setSyncingData(true);
      const res = await fetchSyncedOpportunitiesFromFirestore();
      setCachedOpps(res.opportunities);
      setSyncStats(res.stats);
    } catch (err) {
      console.warn('Sync cache notice:', err);
    } finally {
      setSyncingData(false);
    }
  };

  const persistOpportunitiesToSync = async (opps: SAMOpportunity[], source?: string) => {
    try {
      setSyncingData(true);
      const count = await saveOpportunitiesToFirestoreSync(opps, source);
      await refreshSyncCache();
      return count;
    } catch (err) {
      console.error('Failed to sync to Firestore cache:', err);
      return 0;
    } finally {
      setSyncingData(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signInWithGoogle,
      logout,
      syncStats,
      cachedOpps,
      refreshSyncCache,
      persistOpportunitiesToSync,
      syncingData
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
