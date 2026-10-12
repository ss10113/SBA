import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  getDocFromServer, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { SAMOpportunity } from '../types/contract';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// CRITICAL: Initialize Firestore with specific database ID from configuration
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test as required by skill guidelines
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration: client is offline.");
    }
  }
}
testConnection();

// --- AUTHENTICATION HELPERS ---
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    if (result.user) {
      await saveUserProfile(result.user);
    }
    return result.user;
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
}

export async function logout() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign Out Error:', error);
    throw error;
  }
}

export async function saveUserProfile(user: User, companyName?: string) {
  const path = `users/${user.uid}`;
  try {
    const userRef = doc(db, 'users', user.uid);
    const existingSnap = await getDoc(userRef);
    
    const now = new Date().toISOString();
    const userData = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || 'GovCon User',
      photoURL: user.photoURL || '',
      companyName: companyName || existingSnap.data()?.companyName || 'GovCon Partner',
      updatedAt: now,
      ...(!existingSnap.exists() && { createdAt: now })
    };

    await setDoc(userRef, userData, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// --- LIVE SITE SYNC & SAM.GOV CACHING HELPERS ---
// Holds synced data from live sites so users don't break over rate limits from SAM.gov or other gov API keys

export interface SyncedCacheStats {
  totalSyncedCount: number;
  lastSyncedAt: string | null;
  sources: string[];
}

export async function saveOpportunitiesToFirestoreSync(
  opportunities: SAMOpportunity[], 
  source: string = 'SAM.gov Live Sync'
): Promise<number> {
  if (!opportunities || opportunities.length === 0) return 0;
  const path = 'syncedOpportunities';
  
  try {
    const batch = writeBatch(db);
    const now = new Date().toISOString();
    let savedCount = 0;

    for (const opp of opportunities.slice(0, 100)) {
      const cleanId = (opp.noticeId || `opp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`)
        .replace(/[^a-zA-Z0-9_\-]/g, '_');
      
      const docRef = doc(db, 'syncedOpportunities', cleanId);
      
      const syncPayload = {
        noticeId: opp.noticeId || opp.solicitationNumber || cleanId,
        title: opp.title || 'Untitled Government Opportunity',
        solicitationNumber: opp.solicitationNumber || '',
        agency: opp.department || 'Federal Agency',
        postedDate: opp.postedDate || now,
        responseDeadline: opp.responseDeadLine || '',
        type: opp.type || 'Solicitation',
        setAside: opp.setAside || 'N/A',
        naicsCode: opp.naicsCode || '',
        description: (opp.description || '').substring(0, 9500),
        department: opp.department || '',
        placeOfPerformance: typeof opp.placeOfPerformance === 'string' ? opp.placeOfPerformance : `${opp.placeOfPerformance?.city || ''}, ${opp.placeOfPerformance?.state || ''}`,
        syncedAt: now,
        syncedBy: auth.currentUser?.uid || 'system_sync',
        source: source
      };

      batch.set(docRef, syncPayload, { merge: true });
      savedCount++;
    }

    await batch.commit();
    return savedCount;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return 0;
  }
}

export async function fetchSyncedOpportunitiesFromFirestore(): Promise<{ opportunities: SAMOpportunity[]; stats: SyncedCacheStats }> {
  const path = 'syncedOpportunities';
  try {
    const oppsRef = collection(db, 'syncedOpportunities');
    const q = query(oppsRef, limit(150));
    const snapshot = await getDocs(q);

    const opportunities: SAMOpportunity[] = [];
    let latestSync: string | null = null;
    const sourcesSet = new Set<string>();

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.syncedAt && (!latestSync || data.syncedAt > latestSync)) {
        latestSync = data.syncedAt;
      }
      if (data.source) sourcesSet.add(data.source);

      opportunities.push({
        noticeId: data.noticeId || docSnap.id,
        solicitationNumber: data.solicitationNumber || '',
        title: data.title || 'Cached Federal Opportunity',
        department: data.agency || data.department || 'Federal Agency',
        subTier: 'Synced Feed',
        office: 'Contracting Office',
        postedDate: data.postedDate || new Date().toISOString().split('T')[0],
        responseDeadLine: data.responseDeadline || '',
        performanceStartDate: '',
        performanceEndDate: '',
        naicsCode: data.naicsCode || '541511',
        naicsTitle: 'Custom Computer Programming Services',
        pscCode: 'R499',
        pscTitle: 'Support - Professional Services',
        type: data.type || 'Solicitation',
        setAside: data.setAside || 'Total Small Business',
        setAsideCode: 'SBA',
        contractType: 'Firm Fixed Price (FFP)',
        estimatedValue: '$1,000,000',
        valueMagnitude: 1000000,
        placeOfPerformance: {
          city: 'Washington',
          state: 'DC',
          zip: '20001',
          country: 'USA'
        },
        contractingOfficeAddress: {
          city: 'Washington',
          state: 'DC',
          zip: '20001'
        },
        description: data.description || '',
        scopeBullets: ['Hold live site sync data from SAM.gov in Firestore'],
        keyFarClauses: [],
        poc: { name: 'Contract Specialist', title: 'Specialist', email: 'contracting@agency.gov', phone: '202-555-0100' },
        requiredClearance: 'None',
        sourceLink: `https://sam.gov/opp/${data.noticeId}/view`,
        incumbentInfo: {
          hasIncumbent: false,
          incumbentName: 'Data held in live site sync cache'
        },
        attachments: []
      });
    });

    return {
      opportunities,
      stats: {
        totalSyncedCount: snapshot.size,
        lastSyncedAt: latestSync,
        sources: Array.from(sourcesSet)
      }
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

// --- USER PIPELINE PERSISTENCE ---
export async function savePipelineToFirestore(pipelineItem: any) {
  if (!auth.currentUser) return;
  const path = `pipeline/${pipelineItem.id}`;
  try {
    const cleanId = (pipelineItem.id || `pipe_${Date.now()}`).replace(/[^a-zA-Z0-9_\-]/g, '_');
    const itemRef = doc(db, 'pipeline', cleanId);
    
    await setDoc(itemRef, {
      ...pipelineItem,
      id: cleanId,
      userId: auth.currentUser.uid,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchUserPipelineFromFirestore(): Promise<any[]> {
  if (!auth.currentUser) return [];
  const path = 'pipeline';
  try {
    const pipelineRef = collection(db, 'pipeline');
    const q = query(pipelineRef, where('userId', '==', auth.currentUser.uid));
    const snapshot = await getDocs(q);
    
    const items: any[] = [];
    snapshot.forEach((docSnap) => {
      items.push(docSnap.data());
    });
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}
