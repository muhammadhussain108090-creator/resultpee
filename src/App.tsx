import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TopBar, NavTab } from './components/TopBar';
import { FeedView } from './components/FeedView';
import { SearchByUsername } from './components/SearchByUsername';
import { LeaderboardView } from './components/LeaderboardView';
import { CompareView } from './components/CompareView';
import { UploadResultModal } from './components/UploadResultModal';
import { ProfileModal } from './components/ProfileModal';
import { ResultItem } from './types';
import { subscribeToResults } from './services/resultService';
import { INITIAL_RESULTS } from './data/mockSeeds';

function MainContent() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('feed');
  const [results, setResults] = useState<ResultItem[]>(INITIAL_RESULTS);
  const [selectedUserForSearch, setSelectedUserForSearch] = useState<string>('');
  const [selectedUserForCompare, setSelectedUserForCompare] = useState<string>('');
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  // Check URL query params for ?user= handle on initial mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userParam = params.get('user');
    if (userParam) {
      setSelectedUserForSearch(userParam);
      setActiveTab('search');
    }
  }, []);

  // Real-time Firestore sync
  useEffect(() => {
    const unsub = subscribeToResults((items) => {
      setResults(items);
    });
    return () => unsub();
  }, []);

  const handleUsernameClick = (username: string) => {
    setSelectedUserForSearch(username);
    setActiveTab('search');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompareClick = (username: string) => {
    setSelectedUserForCompare(username);
    setActiveTab('compare');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <TopBar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'feed' && (
          <FeedView
            results={results}
            onUsernameClick={handleUsernameClick}
            onCompareClick={handleCompareClick}
            onOpenUpload={() => setIsUploadOpen(true)}
          />
        )}

        {activeTab === 'search' && (
          <SearchByUsername
            initialUsername={selectedUserForSearch}
            allResults={results}
            onCompareWithUser={handleCompareClick}
            onOpenUpload={() => setIsUploadOpen(true)}
          />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardView
            results={results}
            onUsernameClick={handleUsernameClick}
            onCompareClick={handleCompareClick}
          />
        )}

        {activeTab === 'compare' && (
          <CompareView
            results={results}
            preselectedFriend={selectedUserForCompare}
            onUsernameClick={handleUsernameClick}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">ScorePeer</span>
            <span aria-hidden="true">·</span>
            <span>Peer Result &amp; Academic Sharing Platform</span>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-600">
            <button
              onClick={() => {
                setSelectedUserForSearch('');
                setActiveTab('search');
              }}
              className="hover:text-slate-900 transition-colors"
            >
              Browse Friends
            </button>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="hover:text-slate-900 transition-colors"
            >
              Post Result
            </button>
            <button
              onClick={() => setIsProfileOpen(true)}
              className="hover:text-slate-900 transition-colors font-mono"
            >
              @{profile?.username || 'profile'}
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <UploadResultModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={() => {
          // Toast or auto refresh feed
        }}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
