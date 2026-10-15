import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInAnonymously, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { UserProfile, FriendItem } from '../types';
import { 
  getUserProfile, 
  saveUserProfile, 
  seedDemoDataIfEmpty,
  getFriendsList,
  addFriend,
  removeFriend
} from '../services/resultService';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  friends: FriendItem[];
  signUp: (email: string, pass: string, username: string, displayName: string) => Promise<{ success: boolean; error?: string }>;
  logIn: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logOut: () => Promise<void>;
  updateProfile: (username: string, displayName: string, avatar: string, bio?: string) => Promise<void>;
  switchDemoUser: (username: string) => Promise<void>;
  toggleFriend: (friend: { uid: string; username: string; displayName: string; avatar: string }) => Promise<boolean>;
  isFriend: (friendUid: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [friends, setFriends] = useState<FriendItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Load user friends
  const loadFriends = async (uid: string) => {
    const list = await getFriendsList(uid);
    setFriends(list);
  };

  useEffect(() => {
    seedDemoDataIfEmpty();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        let userProf = await getUserProfile(currentUser.uid);
        if (!userProf) {
          const storedHandle = localStorage.getItem(`sp_handle_${currentUser.uid}`) || `student_${currentUser.uid.slice(0, 5).toLowerCase()}`;
          const storedName = localStorage.getItem(`sp_name_${currentUser.uid}`) || (currentUser.email ? currentUser.email.split('@')[0] : 'You');
          const storedAvatar = localStorage.getItem(`sp_avatar_${currentUser.uid}`) || '🎓';
          
          userProf = {
            uid: currentUser.uid,
            username: storedHandle,
            displayName: storedName,
            avatar: storedAvatar,
            email: currentUser.email || undefined,
            bio: 'Student & Academic Learner',
            joinedAt: new Date().toISOString(),
          };
          await saveUserProfile(userProf);
        }
        setProfile(userProf);
        await loadFriends(currentUser.uid);
        setLoading(false);
      } else {
        // Sign in anonymously as default so browsing & testing work out of the box
        try {
          const cred = await signInAnonymously(auth);
          setUser(cred.user);
        } catch (error) {
          console.warn('Anonymous sign in note:', error);
          const guestUid = 'local_guest_' + Math.random().toString(36).substring(2, 7);
          const fallbackProfile: UserProfile = {
            uid: guestUid,
            username: 'my_results',
            displayName: 'My Profile',
            avatar: '🎯',
            joinedAt: new Date().toISOString(),
          };
          setProfile(fallbackProfile);
          await loadFriends(guestUid);
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, pass: string, username: string, displayName: string) => {
    try {
      const cleanHandle = username.trim().toLowerCase().replace(/^@/, '').replace(/[^a-z0-9_]/g, '');
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      const newProf: UserProfile = {
        uid: cred.user.uid,
        username: cleanHandle || 'student',
        displayName: displayName.trim() || cleanHandle,
        avatar: '🎓',
        email,
        bio: 'New ScorePeer member',
        joinedAt: new Date().toISOString(),
      };
      await saveUserProfile(newProf);
      setProfile(newProf);
      await loadFriends(cred.user.uid);
      return { success: true };
    } catch (e: any) {
      console.error('Sign up error:', e);
      return { success: false, error: e.message || 'Failed to sign up.' };
    }
  };

  const logIn = async (email: string, pass: string) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const prof = await getUserProfile(cred.user.uid);
      if (prof) {
        setProfile(prof);
      }
      await loadFriends(cred.user.uid);
      return { success: true };
    } catch (e: any) {
      console.error('Login error:', e);
      return { success: false, error: e.message || 'Invalid email or password.' };
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
      // Automatically sign in anonymously again for continuous applet preview experience
      await signInAnonymously(auth);
    } catch (e) {
      console.error('Sign out error:', e);
    }
  };

  const updateProfile = async (username: string, displayName: string, avatar: string, bio?: string) => {
    const cleanUsername = username.trim().toLowerCase().replace(/^@/, '').replace(/[^a-z0-9_]/g, '');
    const currentUid = user ? user.uid : (profile ? profile.uid : 'user_' + Date.now());
    const newProfile: UserProfile = {
      uid: currentUid,
      username: cleanUsername || 'student',
      displayName: displayName.trim() || cleanUsername,
      avatar: avatar || '🎓',
      email: profile?.email,
      bio: bio?.trim() || '',
      joinedAt: profile?.joinedAt || new Date().toISOString(),
    };

    localStorage.setItem(`sp_handle_${currentUid}`, newProfile.username);
    localStorage.setItem(`sp_name_${currentUid}`, newProfile.displayName);
    localStorage.setItem(`sp_avatar_${currentUid}`, newProfile.avatar);

    setProfile(newProfile);
    try {
      await saveUserProfile(newProfile);
    } catch (e) {
      console.warn('Profile persist note:', e);
    }
  };

  const switchDemoUser = async (targetUsername: string) => {
    const clean = targetUsername.toLowerCase().replace('@', '');
    const targetUid = 'demo_user_' + clean;
    const newProfile: UserProfile = {
      uid: targetUid,
      username: clean,
      displayName: clean.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      avatar: clean.includes('alex') ? '👨‍💻' : clean.includes('maya') ? '👩‍🔬' : clean.includes('jordan') ? '⚡' : '🎨',
      bio: 'Active friend profile on ScorePeer',
      joinedAt: new Date().toISOString(),
    };
    setProfile(newProfile);
    await loadFriends(targetUid);
  };

  const toggleFriend = async (friend: { uid: string; username: string; displayName: string; avatar: string }) => {
    if (!profile) return false;
    const friendUid = friend.uid || 'demo_user_' + friend.username.toLowerCase();
    const alreadyFriend = friends.some(f => f.friendUid === friendUid || f.username.toLowerCase() === friend.username.toLowerCase());

    if (alreadyFriend) {
      await removeFriend(profile.uid, friendUid);
      setFriends(prev => prev.filter(f => f.friendUid !== friendUid && f.username.toLowerCase() !== friend.username.toLowerCase()));
      return false;
    } else {
      const newFriend: FriendItem = {
        friendUid,
        username: friend.username,
        displayName: friend.displayName,
        avatar: friend.avatar || '👤',
        addedAt: new Date().toISOString(),
      };
      await addFriend(profile.uid, newFriend);
      setFriends(prev => [...prev, newFriend]);
      return true;
    }
  };

  const isFriend = (friendUid: string) => {
    return friends.some(f => f.friendUid === friendUid || f.username.toLowerCase() === friendUid.toLowerCase());
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        friends,
        signUp,
        logIn,
        logOut,
        updateProfile,
        switchDemoUser,
        toggleFriend,
        isFriend,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
