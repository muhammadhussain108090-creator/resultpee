import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  UserCheck, 
  TrendingUp, 
  Award, 
  BookOpen, 
  Share2, 
  ArrowRight, 
  UserPlus, 
  Users, 
  MessageSquare 
} from 'lucide-react';
import { ResultItem, UserProfile } from '../types';
import { ResultCard } from './ResultCard';
import { getAllUsernames, getUserProfileByUsername } from '../services/resultService';
import { useAuth } from '../context/AuthContext';

interface SearchByUsernameProps {
  initialUsername?: string;
  allResults: ResultItem[];
  onCompareWithUser: (username: string) => void;
  onOpenUpload: () => void;
  onStartChat: (username: string) => void;
}

export const SearchByUsername: React.FC<SearchByUsernameProps> = ({
  initialUsername = '',
  allResults,
  onCompareWithUser,
  onOpenUpload,
  onStartChat,
}) => {
  const { profile: currentProfile, toggleFriend, isFriend } = useAuth();
  const [searchInput, setSearchInput] = useState<string>(initialUsername);
  const [selectedUsername, setSelectedUsername] = useState<string>(initialUsername);
  const [friendProfiles, setFriendProfiles] = useState<{ username: string; displayName: string; avatar: string; uid?: string }[]>([]);
  const [targetProfile, setTargetProfile] = useState<UserProfile | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [directoryFilter, setDirectoryFilter] = useState<'all' | 'friends'>('all');
  const [copied, setCopied] = useState<boolean>(false);

  // Load registered usernames
  useEffect(() => {
    getAllUsernames().then((list) => {
      setFriendProfiles(list);
    });
  }, [allResults]);

  // Sync initial username prop
  useEffect(() => {
    if (initialUsername) {
      setSearchInput(initialUsername);
      setSelectedUsername(initialUsername);
    }
  }, [initialUsername]);

  // Fetch target profile when selectedUsername changes
  useEffect(() => {
    if (selectedUsername) {
      getUserProfileByUsername(selectedUsername).then((prof) => {
        setTargetProfile(prof);
      });
    } else {
      setTargetProfile(null);
    }
  }, [selectedUsername]);

  // Filter results for selected username
  const userResults = useMemo(() => {
    if (!selectedUsername) return [];
    const clean = selectedUsername.trim().toLowerCase().replace('@', '');
    return allResults.filter((r) => r.username.toLowerCase() === clean);
  }, [selectedUsername, allResults]);

  // Category-filtered results
  const filteredUserResults = useMemo(() => {
    if (categoryFilter === 'All') return userResults;
    return userResults.filter((r) => r.category === categoryFilter);
  }, [userResults, categoryFilter]);

  // Performance calculations for target user
  const userStats = useMemo(() => {
    if (userResults.length === 0) {
      return { total: 0, avgPercentage: 0, highest: 0, bestGrade: 'N/A' };
    }
    const total = userResults.length;
    const avgPercentage = userResults.reduce((sum, r) => sum + r.percentage, 0) / total;
    const highest = Math.max(...userResults.map((r) => r.percentage));
    const bestGrade = userResults.find((r) => r.percentage === highest)?.grade || 'A';

    return { total, avgPercentage, highest, bestGrade };
  }, [userResults]);

  const handleSelectUser = (uname: string) => {
    const clean = uname.trim().toLowerCase().replace('@', '');
    setSearchInput(clean);
    setSelectedUsername(clean);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      handleSelectUser(searchInput);
    }
  };

  const handleShareProfile = () => {
    if (!selectedUsername) return;
    const url = window.location.href.split('?')[0] + `?user=${selectedUsername}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const targetUid = targetProfile?.uid || (selectedUsername ? 'demo_user_' + selectedUsername : '');
  const userIsFriend = selectedUsername ? isFriend(targetUid) || isFriend(selectedUsername) : false;

  const categories = ['All', 'Academic Exam', 'Quiz & Test', 'Course & Cert', 'Coding', 'Fitness & Sports', 'Project'];

  // Filtered friends directory
  const displayedDirectory = useMemo(() => {
    if (directoryFilter === 'friends') {
      return friendProfiles.filter((f) => isFriend(f.uid || '') || isFriend(f.username));
    }
    return friendProfiles;
  }, [friendProfiles, directoryFilter, isFriend]);

  return (
    <div className="space-y-8">
      {/* Search Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">
            Explore Results by Username
          </h1>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            Enter any friend&apos;s username to view their uploaded test scores, grades, certificates, and academic performance history.
          </p>

          {/* Search Bar Form */}
          <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Type username (e.g. alex_lee, maya_chen, jordan_k)..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors shrink-0 shadow-sm"
            >
              Search
            </button>
          </form>

          {/* Quick Friend Handles List */}
          <div className="mt-4 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Active friends:</span>
            {friendProfiles.map((f) => (
              <button
                key={f.username}
                onClick={() => handleSelectUser(f.username)}
                className={`px-2.5 py-1 rounded-md text-xs font-mono transition-colors ${
                  selectedUsername.toLowerCase() === f.username.toLowerCase()
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                @{f.username}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* When a username is selected: Show Profile & Results */}
      {selectedUsername ? (
        <div className="space-y-6">
          {/* Friend Profile Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-3xl shadow-xs">
                  {targetProfile?.avatar || (selectedUsername.includes('alex') ? '👨‍💻' : selectedUsername.includes('maya') ? '👩‍🔬' : '🎓')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-900">
                      {targetProfile?.displayName || selectedUsername}
                    </h2>
                    <span className="font-mono text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      @{selectedUsername}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {targetProfile?.bio || 'Active participant sharing results on ScorePeer'}
                  </p>
                </div>
              </div>

              {/* Action Buttons: Add Friend, Chat, Compare */}
              <div className="flex flex-wrap items-center gap-2.5">
                {currentProfile?.username.toLowerCase() !== selectedUsername.toLowerCase() && (
                  <>
                    <button
                      onClick={() =>
                        toggleFriend({
                          uid: targetUid,
                          username: selectedUsername,
                          displayName: targetProfile?.displayName || selectedUsername,
                          avatar: targetProfile?.avatar || '👤',
                        })
                      }
                      className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs ${
                        userIsFriend
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {userIsFriend ? (
                        <>
                          <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Friends</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Add Friend</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => onStartChat(selectedUsername)}
                      className="px-3.5 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat</span>
                    </button>
                  </>
                )}

                <button
                  onClick={() => onCompareWithUser(selectedUsername)}
                  className="px-3.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Compare</span>
                </button>

                <button
                  onClick={handleShareProfile}
                  className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copied' : 'Share'}</span>
                </button>
              </div>
            </div>

            {/* Stats Row with Tabular Figures */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[11px] font-medium text-slate-500 block mb-1">Total Uploads</span>
                <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                  {userStats.total}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[11px] font-medium text-slate-500 block mb-1">Average Score</span>
                <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                  {userStats.avgPercentage > 0 ? `${userStats.avgPercentage.toFixed(1)}%` : '—'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[11px] font-medium text-slate-500 block mb-1">Peak Score</span>
                <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                  {userStats.highest > 0 ? `${userStats.highest.toFixed(1)}%` : '—'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[11px] font-medium text-slate-500 block mb-1">Top Distinction</span>
                <span className="text-xl font-bold text-slate-900 truncate block">
                  {userStats.bestGrade}
                </span>
              </div>
            </div>
          </div>

          {/* Results List Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-base font-bold text-slate-900">
                Published Results for @{selectedUsername} ({filteredUserResults.length})
              </h3>

              {/* Category Filter Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                      categoryFilter === cat
                        ? 'bg-slate-900 text-white font-semibold'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {filteredUserResults.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
                <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-800 mb-1">
                  No {categoryFilter !== 'All' ? categoryFilter : ''} results recorded for @{selectedUsername}
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                  {selectedUsername === currentProfile?.username
                    ? 'You have not uploaded a result in this category yet.'
                    : `Ask @${selectedUsername} to share their latest score or reel!`}
                </p>
                {selectedUsername === currentProfile?.username && (
                  <button
                    onClick={onOpenUpload}
                    className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    Upload Your First Result
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredUserResults.map((result) => (
                  <ResultCard
                    key={result.id}
                    result={result}
                    onCompareClick={onCompareWithUser}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Friends Directory Overview */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Friend Directory ({displayedDirectory.length} Members)
              </h3>
              <span className="text-xs text-slate-500">
                Select any friend to view their full results, start a chat, or add to friends
              </span>
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start sm:self-auto">
              <button
                onClick={() => setDirectoryFilter('all')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  directoryFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Peers
              </button>
              <button
                onClick={() => setDirectoryFilter('friends')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  directoryFilter === 'friends' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                My Added Friends
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayedDirectory.map((friend) => {
              const friendResults = allResults.filter(
                (r) => r.username.toLowerCase() === friend.username.toLowerCase()
              );
              const avg = friendResults.length > 0
                ? (friendResults.reduce((sum, r) => sum + r.percentage, 0) / friendResults.length).toFixed(1)
                : '0.0';
              const isAdded = isFriend(friend.uid || '') || isFriend(friend.username);

              return (
                <div
                  key={friend.username}
                  className="bg-white border border-slate-200 hover:border-slate-300 p-5 rounded-xl text-left transition-all hover:shadow-xs group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <button
                        onClick={() => handleSelectUser(friend.username)}
                        className="text-2xl w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:scale-105 transition-transform"
                      >
                        {friend.avatar}
                      </button>

                      {currentProfile?.username.toLowerCase() !== friend.username.toLowerCase() && (
                        <button
                          onClick={() =>
                            toggleFriend({
                              uid: friend.uid || 'demo_user_' + friend.username,
                              username: friend.username,
                              displayName: friend.displayName,
                              avatar: friend.avatar,
                            })
                          }
                          className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                            isAdded
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                          title={isAdded ? 'Remove from Friends' : 'Add Friend'}
                        >
                          {isAdded ? <UserCheck className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => handleSelectUser(friend.username)}
                      className="text-left w-full"
                    >
                      <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                        {friend.displayName}
                      </h4>
                      <p className="text-xs font-mono text-slate-500 truncate">
                        @{friend.username}
                      </p>
                    </button>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      {friendResults.length} {friendResults.length === 1 ? 'Result' : 'Results'}
                    </span>
                    <span className="font-mono font-bold text-slate-900 tabular-nums">
                      Avg {avg}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
