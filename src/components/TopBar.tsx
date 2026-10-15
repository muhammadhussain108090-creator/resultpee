import React from 'react';
import { Plus, User as UserIcon, Search, BarChart3, Users, Flame } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type NavTab = 'feed' | 'search' | 'leaderboard' | 'compare';

interface TopBarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenUpload: () => void;
  onOpenProfile: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onTabChange,
  onOpenUpload,
  onOpenProfile,
}) => {
  const { profile } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
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
                Friend Results &amp; Scores
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation links */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => onTabChange('feed')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'feed'
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Activity Feed
          </button>

          <button
            onClick={() => onTabChange('search')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'search'
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            Find by Username
          </button>

          <button
            onClick={() => onTabChange('leaderboard')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'leaderboard'
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Leaderboard
          </button>

          <button
            onClick={() => onTabChange('compare')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'compare'
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Compare
          </button>
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-all shadow-sm active:scale-95 whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload Result</span>
          </button>

          <button
            onClick={onOpenProfile}
            title="Edit your username & profile"
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 text-left"
          >
            <span className="text-base select-none">{profile?.avatar || '👤'}</span>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-slate-900 leading-tight">
                {profile?.displayName || 'User'}
              </span>
              <span className="text-[10px] font-mono text-slate-500 leading-tight">
                @{profile?.username || 'handle'}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile subnavigation bar */}
      <div className="md:hidden flex items-center justify-around px-2 py-2 border-t border-slate-100 bg-slate-50/80">
        <button
          onClick={() => onTabChange('feed')}
          className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
            activeTab === 'feed' ? 'bg-white shadow-xs text-slate-900 font-semibold' : 'text-slate-600'
          }`}
        >
          Feed
        </button>
        <button
          onClick={() => onTabChange('search')}
          className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
            activeTab === 'search' ? 'bg-white shadow-xs text-slate-900 font-semibold' : 'text-slate-600'
          }`}
        >
          Search @User
        </button>
        <button
          onClick={() => onTabChange('leaderboard')}
          className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
            activeTab === 'leaderboard' ? 'bg-white shadow-xs text-slate-900 font-semibold' : 'text-slate-600'
          }`}
        >
          Ranks
        </button>
        <button
          onClick={() => onTabChange('compare')}
          className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
            activeTab === 'compare' ? 'bg-white shadow-xs text-slate-900 font-semibold' : 'text-slate-600'
          }`}
        >
          Compare
        </button>
      </div>
    </header>
  );
};
