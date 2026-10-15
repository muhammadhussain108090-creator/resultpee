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
  onSnapshot,
  updateDoc,
  increment
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { ResultItem, UserProfile, CommentItem, FriendItem, ChatMessage, ReelItem, ReelComment } from '../types';
import { INITIAL_PROFILES, INITIAL_RESULTS, INITIAL_REELS } from '../data/mockSeeds';

const USERS_COLLECTION = 'users';
const RESULTS_COLLECTION = 'results';
const CHATS_COLLECTION = 'chats';
const REELS_COLLECTION = 'reels';

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
      // Seed reels
      for (const reel of INITIAL_REELS) {
        await setDoc(doc(db, REELS_COLLECTION, reel.id), reel);
      }
      return true;
    }
  } catch (error) {
    console.warn('Could not seed remote Firestore, fallback in-memory demo active:', error);
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

export async function getAllUsernames(): Promise<{ username: string; displayName: string; avatar: string; uid?: string }[]> {
  try {
    const snap = await getDocs(collection(db, USERS_COLLECTION));
    const list: { username: string; displayName: string; avatar: string; uid?: string }[] = [];
    snap.forEach(d => {
      const data = d.data() as UserProfile;
      if (data.username) {
        list.push({
          uid: data.uid,
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
          uid: p.uid,
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
      uid: p.uid,
      username: p.username,
      displayName: p.displayName,
      avatar: p.avatar,
    }));
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  await setDoc(doc(db, USERS_COLLECTION, profile.uid), profile, { merge: true });
}

// Friends Operations
export async function addFriend(userUid: string, friend: FriendItem): Promise<void> {
  try {
    await setDoc(doc(db, USERS_COLLECTION, userUid, 'friends', friend.friendUid), friend);
  } catch (e) {
    console.warn('Local friends storage note:', e);
  }
  const key = `friends_${userUid}`;
  const local = JSON.parse(localStorage.getItem(key) || '[]');
  if (!local.some((f: FriendItem) => f.friendUid === friend.friendUid)) {
    local.push(friend);
    localStorage.setItem(key, JSON.stringify(local));
  }
}

export async function removeFriend(userUid: string, friendUid: string): Promise<void> {
  try {
    await deleteDoc(doc(db, USERS_COLLECTION, userUid, 'friends', friendUid));
  } catch (e) {
    console.warn('Remote unfriend note:', e);
  }
  const key = `friends_${userUid}`;
  const local = JSON.parse(localStorage.getItem(key) || '[]');
  const updated = local.filter((f: FriendItem) => f.friendUid !== friendUid);
  localStorage.setItem(key, JSON.stringify(updated));
}

export async function getFriendsList(userUid: string): Promise<FriendItem[]> {
  try {
    const snap = await getDocs(collection(db, USERS_COLLECTION, userUid, 'friends'));
    if (!snap.empty) {
      const list: FriendItem[] = [];
      snap.forEach(d => list.push(d.data() as FriendItem));
      return list;
    }
  } catch (e) {
    console.warn('Remote friends load note:', e);
  }
  // Check localStorage
  const local = JSON.parse(localStorage.getItem(`friends_${userUid}`) || '[]');
  if (local.length > 0) return local;

  // Default seed: provide 2 initial friends
  return [
    {
      friendUid: 'demo_user_alex',
      username: 'alex_lee',
      displayName: 'Alex Lee',
      avatar: '👨‍💻',
      addedAt: '2026-10-01T10:00:00Z',
    },
    {
      friendUid: 'demo_user_maya',
      username: 'maya_chen',
      displayName: 'Maya Chen',
      avatar: '👩‍🔬',
      addedAt: '2026-10-02T12:00:00Z',
    },
  ];
}

// Chat Operations
export function getChatId(uid1: string, uid2: string): string {
  return [uid1, uid2].sort().join('_');
}

export async function sendChatMessage(message: ChatMessage): Promise<void> {
  try {
    await setDoc(doc(db, CHATS_COLLECTION, message.chatId, 'messages', message.id), message);
  } catch (e) {
    console.warn('Local message storage note:', e);
    const key = `chat_${message.chatId}`;
    const stored = JSON.parse(localStorage.getItem(key) || '[]');
    stored.push(message);
    localStorage.setItem(key, JSON.stringify(stored));
  }
}

export function subscribeToChatMessages(chatId: string, callback: (msgs: ChatMessage[]) => void) {
  try {
    const q = query(
      collection(db, CHATS_COLLECTION, chatId, 'messages')
    );
    return onSnapshot(q, (snapshot) => {
      const msgs: ChatMessage[] = [];
      snapshot.forEach(d => msgs.push(d.data() as ChatMessage));
      msgs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      if (msgs.length > 0) {
        callback(msgs);
      } else {
        const local = JSON.parse(localStorage.getItem(`chat_${chatId}`) || '[]');
        callback(local);
      }
    }, (err) => {
      console.warn('Chat subscription note:', err);
      const local = JSON.parse(localStorage.getItem(`chat_${chatId}`) || '[]');
      callback(local);
    });
  } catch (e) {
    const local = JSON.parse(localStorage.getItem(`chat_${chatId}`) || '[]');
    callback(local);
    return () => {};
  }
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
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        callback(items);
      } else {
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

// Reels Operations
export async function uploadReel(reel: ReelItem): Promise<void> {
  try {
    await setDoc(doc(db, REELS_COLLECTION, reel.id), reel);
  } catch (e) {
    console.warn('Remote reel upload note:', e);
  }
  // Store locally as well
  const stored = JSON.parse(localStorage.getItem('local_reels') || '[]');
  stored.unshift(reel);
  localStorage.setItem('local_reels', JSON.stringify(stored));
}

export function subscribeToReels(callback: (reels: ReelItem[]) => void) {
  try {
    const q = query(collection(db, REELS_COLLECTION));
    return onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const items: ReelItem[] = [];
        snapshot.forEach(d => items.push(d.data() as ReelItem));
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        callback(items);
      } else {
        const local = JSON.parse(localStorage.getItem('local_reels') || '[]');
        callback([...local, ...INITIAL_REELS]);
      }
    }, (error) => {
      console.warn('Reels subscription error, using mock:', error);
      const local = JSON.parse(localStorage.getItem('local_reels') || '[]');
      callback([...local, ...INITIAL_REELS]);
    });
  } catch (e) {
    const local = JSON.parse(localStorage.getItem('local_reels') || '[]');
    callback([...local, ...INITIAL_REELS]);
    return () => {};
  }
}

export async function likeReel(reelId: string, currentLikes: number): Promise<void> {
  try {
    await updateDoc(doc(db, REELS_COLLECTION, reelId), {
      likes: currentLikes + 1
    });
  } catch (e) {
    console.warn('Local like update:', e);
  }
}

export async function addReelComment(reelId: string, comment: ReelComment): Promise<void> {
  try {
    await setDoc(doc(db, REELS_COLLECTION, reelId, 'comments', comment.id), comment);
  } catch (e) {
    console.warn('Reel comment note:', e);
  }
  const key = `reel_comments_${reelId}`;
  const list = JSON.parse(localStorage.getItem(key) || '[]');
  list.push(comment);
  localStorage.setItem(key, JSON.stringify(list));
}

export function subscribeToReelComments(reelId: string, callback: (comments: ReelComment[]) => void) {
  try {
    const commentsRef = collection(db, REELS_COLLECTION, reelId, 'comments');
    return onSnapshot(commentsRef, (snapshot) => {
      const list: ReelComment[] = [];
      snapshot.forEach(d => list.push(d.data() as ReelComment));
      list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      if (list.length > 0) {
        callback(list);
      } else {
        const local = JSON.parse(localStorage.getItem(`reel_comments_${reelId}`) || '[]');
        callback(local);
      }
    });
  } catch (e) {
    const local = JSON.parse(localStorage.getItem(`reel_comments_${reelId}`) || '[]');
    callback(local);
    return () => {};
  }
}
