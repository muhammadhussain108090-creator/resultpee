import React, { useState, useMemo } from 'react';
import { Users, ArrowLeftRight, Award, TrendingUp, CheckCircle, BarChart2 } from 'lucide-react';
import { ResultItem } from '../types';
import { useAuth } from '../context/AuthContext';

interface CompareViewProps {
  results: ResultItem[];
  preselectedFriend?: string;
  onUsernameClick: (username: string) => void;
}

export const CompareView: React.FC<CompareViewProps> = ({
  results,
  preselectedFriend,
  onUsernameClick,
}) => {
  const { profile } = useAuth();
  const currentUsername = profile?.username || 'you';

  // Get all unique usernames from results
  const allUsernames = useMemo(() => {
    const set = new Set<string>();
    if (profile?.username) set.add(profile.username);
    results.forEach((r) => set.add(r.username.toLowerCase()));
    return Array.from(set);
  }, [results, profile]);

  const [user1Handle, setUser1Handle] = useState<string>(currentUsername);
  const [user2Handle, setUser2Handle] = useState<string>(
    preselectedFriend || (allUsernames.find((u) => u !== currentUsername) || 'alex_lee')
  );

  // Sync if preselectedFriend changes
  React.useEffect(() => {
    if (preselectedFriend) {
      setUser2Handle(preselectedFriend);
    }
  }, [preselectedFriend]);

  // Calculations for User 1
  const user1Results = useMemo(() => {
    return results.filter((r) => r.username.toLowerCase() === user1Handle.toLowerCase());
  }, [results, user1Handle]);

  const user1Stats = useMemo(() => {
    if (user1Results.length === 0) return { avg: 0, highest: 0, count: 0, highCount: 0 };
    const avg = user1Results.reduce((sum, r) => sum + r.percentage, 0) / user1Results.length;
    const highest = Math.max(...user1Results.map((r) => r.percentage));
    const highCount = user1Results.filter((r) => r.percentage >= 90).length;
    return { avg, highest, count: user1Results.length, highCount };
  }, [user1Results]);

  // Calculations for User 2
  const user2Results = useMemo(() => {
    return results.filter((r) => r.username.toLowerCase() === user2Handle.toLowerCase());
  }, [results, user2Handle]);

  const user2Stats = useMemo(() => {
    if (user2Results.length === 0) return { avg: 0, highest: 0, count: 0, highCount: 0 };
    const avg = user2Results.reduce((sum, r) => sum + r.percentage, 0) / user2Results.length;
    const highest = Math.max(...user2Results.map((r) => r.percentage));
    const highCount = user2Results.filter((r) => r.percentage >= 90).length;
    return { avg, highest, count: user2Results.length, highCount };
  }, [user2Results]);

  const swapUsers = () => {
    const temp = user1Handle;
    setUser1Handle(user2Handle);
    setUser2Handle(temp);
  };

  return (
    <div className="space-y-6">
      {/* Compare Selector Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-5 h-5 text-blue-600" />
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Head-to-Head Result Comparison
          </h1>
        </div>
        <p className="text-xs text-slate-500 mb-6">
          Compare exam performance, grade distributions, and highest achievements between two friend usernames.
        </p>

        {/* User Pickers Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="w-full sm:flex-1">
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              First Friend
            </label>
            <select
              value={user1Handle}
              onChange={(e) => setUser1Handle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
            >
              {allUsernames.map((u) => (
                <option key={u} value={u}>
                  @{u} {u === profile?.username ? '(You)' : ''}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={swapUsers}
            className="p-2.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors self-center shrink-0"
            title="Swap friend positions"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>

          <div className="w-full sm:flex-1">
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Second Friend
            </label>
            <select
              value={user2Handle}
              onChange={(e) => setUser2Handle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
            >
              {allUsernames.map((u) => (
                <option key={u} value={u}>
                  @{u} {u === profile?.username ? '(You)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Head-to-Head Comparative Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1: Average Score */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <span className="text-xs font-semibold text-slate-500 block mb-3">
            Overall Average Score
          </span>
          <div className="flex items-center justify-between">
            <div className="text-left">
              <span className="text-xs font-mono text-slate-500 block">@{user1Handle}</span>
              <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                {user1Stats.avg > 0 ? `${user1Stats.avg.toFixed(1)}%` : '—'}
              </span>
            </div>
            <div className="text-xs font-semibold px-2 py-1 bg-slate-100 rounded text-slate-600 font-mono">
              vs
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-slate-500 block">@{user2Handle}</span>
              <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                {user2Stats.avg > 0 ? `${user2Stats.avg.toFixed(1)}%` : '—'}
              </span>
            </div>
          </div>
          {user1Stats.avg > 0 && user2Stats.avg > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 text-center font-mono">
              Delta: {Math.abs(user1Stats.avg - user2Stats.avg).toFixed(1)}% ({user1Stats.avg > user2Stats.avg ? `@${user1Handle} leads` : user2Stats.avg > user1Stats.avg ? `@${user2Handle} leads` : 'Tied'})
            </div>
          )}
        </div>

        {/* Metric 2: Peak High Score */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <span className="text-xs font-semibold text-slate-500 block mb-3">
            Peak Recorded Score
          </span>
          <div className="flex items-center justify-between">
            <div className="text-left">
              <span className="text-xs font-mono text-slate-500 block">@{user1Handle}</span>
              <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                {user1Stats.highest > 0 ? `${user1Stats.highest.toFixed(1)}%` : '—'}
              </span>
            </div>
            <div className="text-xs font-semibold px-2 py-1 bg-slate-100 rounded text-slate-600 font-mono">
              vs
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-slate-500 block">@{user2Handle}</span>
              <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                {user2Stats.highest > 0 ? `${user2Stats.highest.toFixed(1)}%` : '—'}
              </span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 text-center font-mono">
            Distinctions (≥90%): {user1Stats.highCount} vs {user2Stats.highCount}
          </div>
        </div>

        {/* Metric 3: Total Submissions */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <span className="text-xs font-semibold text-slate-500 block mb-3">
            Total Results Uploaded
          </span>
          <div className="flex items-center justify-between">
            <div className="text-left">
              <span className="text-xs font-mono text-slate-500 block">@{user1Handle}</span>
              <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                {user1Stats.count}
              </span>
            </div>
            <div className="text-xs font-semibold px-2 py-1 bg-slate-100 rounded text-slate-600 font-mono">
              vs
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-slate-500 block">@{user2Handle}</span>
              <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                {user2Stats.count}
              </span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 text-center font-mono">
            Combined Activity: {user1Stats.count + user2Stats.count} total records
          </div>
        </div>
      </div>

      {/* Side-by-Side Results Comparison Column Split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User 1 Results Panel */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">@{user1Handle}</h3>
              <span className="text-[11px] text-slate-500">{user1Results.length} Results Recorded</span>
            </div>
            <button
              onClick={() => onUsernameClick(user1Handle)}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              Full Profile →
            </button>
          </div>

          <div className="space-y-3">
            {user1Results.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">No results uploaded yet.</p>
            ) : (
              user1Results.map((r) => (
                <div key={r.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                  <div className="min-w-0 pr-3">
                    <span className="text-xs font-semibold text-slate-900 block truncate">{r.title}</span>
                    <span className="text-[10px] text-slate-500">{r.category} · {r.date}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-slate-900 block tabular-nums">{r.score}/{r.maxScore}</span>
                    <span className="text-[10px] font-mono text-slate-600 font-semibold tabular-nums">{r.percentage.toFixed(1)}%</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* User 2 Results Panel */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">@{user2Handle}</h3>
              <span className="text-[11px] text-slate-500">{user2Results.length} Results Recorded</span>
            </div>
            <button
              onClick={() => onUsernameClick(user2Handle)}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              Full Profile →
            </button>
          </div>

          <div className="space-y-3">
            {user2Results.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">No results uploaded yet.</p>
            ) : (
              user2Results.map((r) => (
                <div key={r.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                  <div className="min-w-0 pr-3">
                    <span className="text-xs font-semibold text-slate-900 block truncate">{r.title}</span>
                    <span className="text-[10px] text-slate-500">{r.category} · {r.date}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-slate-900 block tabular-nums">{r.score}/{r.maxScore}</span>
                    <span className="text-[10px] font-mono text-slate-600 font-semibold tabular-nums">{r.percentage.toFixed(1)}%</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
