import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { UserProfile } from '../types';
import { getUserProfile, saveUserProfile, seedDemoDataIfEmpty } from '../services/resultService';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  updateProfile: (username: string, displayName: string, avatar: string, bio?: string) => Promise<void>;
  switchDemoUser: (username: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Attempt demo data seed first
    seedDemoDataIfEmpty();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Load user profile from Firestore or local storage
        let userProf = await getUserProfile(currentUser.uid);
        if (!userProf) {
          const storedHandle = localStorage.getItem(`sp_handle_${currentUser.uid}`) || `student_${currentUser.uid.slice(0, 5).toLowerCase()}`;
          const storedName = localStorage.getItem(`sp_name_${currentUser.uid}`) || 'You';
          const storedAvatar = localStorage.getItem(`sp_avatar_${currentUser.uid}`) || '🎓';
          
          userProf = {
            uid: currentUser.uid,
            username: storedHandle,
            displayName: storedName,
            avatar: storedAvatar,
            bio: 'Student & Academic Learner',
            joinedAt: new Date().toISOString(),
          };
          await saveUserProfile(userProf);
        }
        setProfile(userProf);
        setLoading(false);
      } else {
        // Sign in anonymously for zero-friction access
        try {
          const cred = await signInAnonymously(auth);
          setUser(cred.user);
        } catch (error) {
          console.warn('Anonymous sign-in error:', error);
          // Fallback mock guest profile
          const guestUid = 'local_guest_' + Math.random().toString(36).substring(2, 7);
          const fallbackProfile: UserProfile = {
            uid: guestUid,
            username: 'my_results',
            displayName: 'My Profile',
            avatar: '🎯',
            joinedAt: new Date().toISOString(),
          };
          setProfile(fallbackProfile);
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const updateProfile = async (username: string, displayName: string, avatar: string, bio?: string) => {
    const cleanUsername = username.trim().toLowerCase().replace(/^@/, '').replace(/[^a-z0-9_]/g, '');
    const currentUid = user ? user.uid : (profile ? profile.uid : 'user_' + Date.now());
    const newProfile: UserProfile = {
      uid: currentUid,
      username: cleanUsername || 'student',
      displayName: displayName.trim() || cleanUsername,
      avatar: avatar || '🎓',
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
      console.warn('Could not persist profile remotely:', e);
    }
  };

  const switchDemoUser = async (targetUsername: string) => {
    // Allows testing viewing/posting as different demo users
    const clean = targetUsername.toLowerCase().replace('@', '');
    const newProfile: UserProfile = {
      uid: 'demo_user_' + clean,
      username: clean,
      displayName: clean.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      avatar: clean.includes('alex') ? '👨‍💻' : clean.includes('maya') ? '👩‍🔬' : clean.includes('jordan') ? '⚡' : '🎨',
      bio: 'Active friend profile on ScorePeer',
      joinedAt: new Date().toISOString(),
    };
    setProfile(newProfile);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, updateProfile, switchDemoUser }}>
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
