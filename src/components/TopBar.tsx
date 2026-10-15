import React, { useState } from 'react';
import { 
  Plus, 
  User as UserIcon, 
  Search, 
  BarChart3, 
  Users, 
  Film, 
  MessageSquare, 
  LogIn, 
  LogOut, 
  Settings, 
  ChevronDown 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type NavTab = 'feed' | 'search' | 'reels' | 'chat' | 'leaderboard' | 'compare';

interface TopBarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenUpload: () => void;
  onOpenUploadReel: () => void;
  onOpenProfile: () => void;
  onOpenAuth: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onTabChange,
  onOpenUpload,
  onOpenUploadReel,
  onOpenProfile,
  onOpenAuth,
}) => {
  const { profile, user, logOut } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const isGuest = user?.isAnonymous || !profile?.email;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Brand wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onTabChange('feed')}
            className="flex items-center gap-2.5 text-left focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              S
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap leading-none">
                ScorePeer
              </span>
              <span className="text-[11px] font-medium text-slate-500 leading-tight">
                Results · Chat · Reels
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation links */}
        <nav className="hidden lg:flex items-center gap-1">
          <button
            onClick={() => onTabChange('feed')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'feed'
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Results Feed
          </button>

          <button
            onClick={() => onTabChange('search')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'search'
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Find @User</span>
          </button>

          <button
            onClick={() => onTabChange('reels')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'reels'
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Film className="w-3.5 h-3.5 text-rose-500" />
            <span>Reels</span>
          </button>

          <button
            onClick={() => onTabChange('chat')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'chat'
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
            <span>Chat</span>
          </button>

          <button
            onClick={() => onTabChange('leaderboard')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'leaderboard'
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Leaderboard</span>
          </button>

          <button
            onClick={() => onTabChange('compare')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'compare'
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Compare</span>
          </button>
        </nav>

        {/* Zone 3: Actions & Account */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Quick Create Button */}
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-all shadow-xs whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Upload Result</span>
            <span className="sm:hidden">Result</span>
          </button>

          <button
            onClick={onOpenUploadReel}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Film className="w-3.5 h-3.5" />
            <span>Post Reel</span>
          </button>

          {/* User Account / Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors whitespace-nowrap text-left"
            >
              <span className="text-base select-none">{profile?.avatar || '👤'}</span>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900 leading-tight">
                  {profile?.displayName || 'User'}
                </span>
                <span className="text-[10px] font-mono text-slate-500 leading-tight">
                  @{profile?.username || 'handle'}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
            </button>

            {showDropdown && (
              <div 
                className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setShowDropdown(false)}
              >
                <div className="px-4 py-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900 block truncate">
                    {profile?.displayName}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 block truncate">
                    @{profile?.username}
                  </span>
                  {profile?.email && (
                    <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                      {profile.email}
                    </span>
                  )}
                </div>

                {isGuest && (
                  <button
                    onClick={onOpenAuth}
                    className="w-full px-4 py-2 text-left text-xs text-blue-600 hover:bg-blue-50 font-semibold flex items-center gap-2"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign Up / Log In</span>
                  </button>
                )}

                <button
                  onClick={onOpenProfile}
                  className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  <span>Edit Profile &amp; Handle</span>
                </button>

                <button
                  onClick={() => onTabChange('chat')}
                  className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                  <span>My Chats</span>
                </button>

                <button
                  onClick={onOpenUploadReel}
                  className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Film className="w-3.5 h-3.5 text-slate-400" />
                  <span>Upload Reel</span>
                </button>

                <div className="border-t border-slate-100 my-1" />

                <button
                  onClick={logOut}
                  className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile subnavigation bar with all 6 options */}
      <div className="lg:hidden flex items-center justify-between px-2 py-2 border-t border-slate-100 bg-slate-50/90 overflow-x-auto scrollbar-none">
        <button
          onClick={() => onTabChange('feed')}
          className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
            activeTab === 'feed' ? 'bg-white shadow-xs text-slate-900 font-semibold' : 'text-slate-600'
          }`}
        >
          Feed
        </button>
        <button
          onClick={() => onTabChange('search')}
          className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
            activeTab === 'search' ? 'bg-white shadow-xs text-slate-900 font-semibold' : 'text-slate-600'
          }`}
        >
          @Search
        </button>
        <button
          onClick={() => onTabChange('reels')}
          className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'reels' ? 'bg-white shadow-xs text-rose-600 font-semibold' : 'text-slate-600'
          }`}
        >
          <Film className="w-3 h-3 text-rose-500" />
          <span>Reels</span>
        </button>
        <button
          onClick={() => onTabChange('chat')}
          className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'chat' ? 'bg-white shadow-xs text-blue-600 font-semibold' : 'text-slate-600'
          }`}
        >
          <MessageSquare className="w-3 h-3 text-blue-500" />
          <span>Chat</span>
        </button>
        <button
          onClick={() => onTabChange('leaderboard')}
          className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
            activeTab === 'leaderboard' ? 'bg-white shadow-xs text-slate-900 font-semibold' : 'text-slate-600'
          }`}
        >
          Ranks
        </button>
        <button
          onClick={() => onTabChange('compare')}
          className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
            activeTab === 'compare' ? 'bg-white shadow-xs text-slate-900 font-semibold' : 'text-slate-600'
          }`}
        >
          Compare
        </button>
      </div>
    </header>
  );
};
