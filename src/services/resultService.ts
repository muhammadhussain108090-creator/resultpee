import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  query,
  where,
  orderBy,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { ResultItem, UserProfile, CommentItem } from '../types';
import { INITIAL_PROFILES, INITIAL_RESULTS } from '../data/mockSeeds';

const USERS_COLLECTION = 'users';
const RESULTS_COLLECTION = 'results';

// Seed demo data to Firestore if not already present
export async function seedDemoDataIfEmpty() {
  try {
    const resSnap = await getDocs(collection(db, RESULTS_COLLECTION));
    if (resSnap.empty) {
      // Seed users
      for (const profile of INITIAL_PROFILES) {
        await setDoc(doc(db, USERS_COLLECTION, profile.uid), profile);
      }
      // Seed results
      for (const res of INITIAL_RESULTS) {
        await setDoc(doc(db, RESULTS_COLLECTION, res.id), res);
      }
      return true;
    }
  } catch (error) {
    console.warn('Could not seed remote Firestore, fallback in-memory demo will be active:', error);
  }
  return false;
}

// User Profile Operations
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
  } catch (e) {
    console.error('Error fetching user profile:', e);
  }
  return null;
}

export async function getUserProfileByUsername(username: string): Promise<UserProfile | null> {
  const cleanUsername = username.trim().toLowerCase().replace(/^@/, '');
  try {
    const q = query(
      collection(db, USERS_COLLECTION),
      where('username', '==', cleanUsername)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data() as UserProfile;
    }
  } catch (e) {
    console.error('Error finding profile by username:', e);
  }
  
  // Check fallback mock profiles
  const match = INITIAL_PROFILES.find(p => p.username.toLowerCase() === cleanUsername);
  return match || null;
}

export async function getAllUsernames(): Promise<{ username: string; displayName: string; avatar: string }[]> {
  try {
    const snap = await getDocs(collection(db, USERS_COLLECTION));
    const list: { username: string; displayName: string; avatar: string }[] = [];
    snap.forEach(d => {
      const data = d.data() as UserProfile;
      if (data.username) {
        list.push({
          username: data.username,
          displayName: data.displayName || data.username,
          avatar: data.avatar || '👤',
        });
      }
    });

    // Merge with seeds if missing
    for (const p of INITIAL_PROFILES) {
      if (!list.some(item => item.username.toLowerCase() === p.username.toLowerCase())) {
        list.push({
          username: p.username,
          displayName: p.displayName,
          avatar: p.avatar,
        });
      }
    }
    return list;
  } catch (e) {
    console.warn('Using local usernames fallback:', e);
    return INITIAL_PROFILES.map(p => ({
      username: p.username,
      displayName: p.displayName,
      avatar: p.avatar,
    }));
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  await setDoc(doc(db, USERS_COLLECTION, profile.uid), profile, { merge: true });
}

// Results Operations
export async function uploadResult(result: ResultItem): Promise<void> {
  await setDoc(doc(db, RESULTS_COLLECTION, result.id), result);
}

export async function deleteResult(resultId: string): Promise<void> {
  await deleteDoc(doc(db, RESULTS_COLLECTION, resultId));
}

// Subscribe to all results (chronological feed)
export function subscribeToResults(callback: (results: ResultItem[]) => void) {
  try {
    const q = query(collection(db, RESULTS_COLLECTION));
    return onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const items: ResultItem[] = [];
        snapshot.forEach(d => {
          items.push(d.data() as ResultItem);
        });
        // Sort newest first
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        callback(items);
      } else {
        // Fallback to initial results if remote collection is empty
        callback(INITIAL_RESULTS);
      }
    }, (error) => {
      console.warn('Realtime subscription error, using local data:', error);
      callback(INITIAL_RESULTS);
    });
  } catch (e) {
    console.warn('Subscription failed:', e);
    callback(INITIAL_RESULTS);
    return () => {};
  }
}

// Fetch results for a specific username
export async function getResultsByUsername(username: string): Promise<ResultItem[]> {
  const cleanUsername = username.trim().toLowerCase().replace(/^@/, '');
  try {
    const q = query(
      collection(db, RESULTS_COLLECTION),
      where('username', '==', cleanUsername)
    );
    const snap = await getDocs(q);
    const results: ResultItem[] = [];
    snap.forEach(d => {
      results.push(d.data() as ResultItem);
    });
    if (results.length > 0) {
      return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  } catch (e) {
    console.error('Error querying results by username:', e);
  }

  // Fallback to initial results filter
  return INITIAL_RESULTS.filter(r => r.username.toLowerCase() === cleanUsername);
}

// Comments subcollection
export async function addComment(resultId: string, comment: CommentItem): Promise<void> {
  await setDoc(doc(db, RESULTS_COLLECTION, resultId, 'comments', comment.id), comment);
}

export function subscribeToComments(resultId: string, callback: (comments: CommentItem[]) => void) {
  try {
    const commentsRef = collection(db, RESULTS_COLLECTION, resultId, 'comments');
    return onSnapshot(commentsRef, (snapshot) => {
      const list: CommentItem[] = [];
      snapshot.forEach(d => list.push(d.data() as CommentItem));
      list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      callback(list);
    });
  } catch (e) {
    console.warn('Comments subscription error:', e);
    callback([]);
    return () => {};
  }
}
