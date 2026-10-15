import React, { useState, useMemo } from 'react';
import { Trophy, Medal, ArrowUpRight, Award, Flame, Users } from 'lucide-react';
import { ResultItem } from '../types';

interface LeaderboardViewProps {
  results: ResultItem[];
  onUsernameClick: (username: string) => void;
  onCompareClick: (username: string) => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  results,
  onUsernameClick,
  onCompareClick,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [metric, setMetric] = useState<'average' | 'highest' | 'count'>('average');

  const categories = [
    'All',
    'Academic Exam',
    'Quiz & Test',
    'Course & Cert',
    'Coding',
    'Fitness & Sports',
  ];

  // Aggregate stats per friend username
  const rankings = useMemo(() => {
    const userMap: Record<
      string,
      {
        username: string;
        displayName: string;
        scores: number[];
        resultsCount: number;
        bestTitle: string;
        bestScore: number;
      }
    > = {};

    const filtered = categoryFilter === 'All' 
      ? results 
      : results.filter((r) => r.category === categoryFilter);

    filtered.forEach((r) => {
      const uname = r.username.toLowerCase();
      if (!userMap[uname]) {
        userMap[uname] = {
          username: r.username,
          displayName: r.displayName,
          scores: [],
          resultsCount: 0,
          bestTitle: r.title,
          bestScore: r.percentage,
        };
      }
      userMap[uname].scores.push(r.percentage);
      userMap[uname].resultsCount += 1;
      if (r.percentage > userMap[uname].bestScore) {
        userMap[uname].bestScore = r.percentage;
        userMap[uname].bestTitle = r.title;
      }
    });

    const rankedList = Object.values(userMap).map((u) => {
      const avg = u.scores.reduce((a, b) => a + b, 0) / u.scores.length;
      return {
        ...u,
        average: avg,
        highest: u.bestScore,
      };
    });

    // Sort based on chosen metric
    if (metric === 'average') {
      rankedList.sort((a, b) => b.average - a.average);
    } else if (metric === 'highest') {
      rankedList.sort((a, b) => b.highest - a.highest);
    } else {
      rankedList.sort((a, b) => b.resultsCount - a.resultsCount);
    }

    return rankedList;
  }, [results, categoryFilter, metric]);

  return (
    <div className="space-y-6">
      {/* Leaderboard Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Friend Leaderboard
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Compare academic standing, highest test scores, and consistency across your peer network.
          </p>
        </div>

        {/* Metric Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start sm:self-auto">
          <button
            onClick={() => setMetric('average')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              metric === 'average'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Average Score %
          </button>
          <button
            onClick={() => setMetric('highest')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              metric === 'highest'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Peak Score
          </button>
          <button
            onClick={() => setMetric('count')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              metric === 'count'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Total Results
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              categoryFilter === cat
                ? 'bg-slate-900 text-white font-semibold'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Rankings Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 w-14 text-center">Rank</th>
                <th className="py-3 px-4">Friend</th>
                <th className="py-3 px-4 text-right">Average %</th>
                <th className="py-3 px-4 text-right">Peak Score</th>
                <th className="py-3 px-4 text-right">Uploads</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rankings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 italic">
                    No results found in this category yet.
                  </td>
                </tr>
              ) : (
                rankings.map((user, idx) => {
                  const rank = idx + 1;
                  const isTopThree = rank <= 3;

                  return (
                    <tr
                      key={user.username}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Rank Column */}
                      <td className="py-3.5 px-4 text-center">
                        {rank === 1 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold text-xs">
                            1
                          </span>
                        ) : rank === 2 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold text-xs">
                            2
                          </span>
                        ) : rank === 3 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-50 text-amber-900 font-bold text-xs border border-amber-200">
                            3
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono font-medium">
                            #{rank}
                          </span>
                        )}
                      </td>

                      {/* Friend Identity */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => onUsernameClick(user.username)}
                          className="flex items-center gap-2.5 text-left group"
                        >
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm">
                            {user.displayName.includes('Alex') ? '👨‍💻' : user.displayName.includes('Maya') ? '👩‍🔬' : user.displayName.includes('Jordan') ? '⚡' : '🎓'}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                              <span>{user.displayName}</span>
                              <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <span className="font-mono text-[11px] text-slate-500">
                              @{user.username}
                            </span>
                          </div>
                        </button>
                      </td>

                      {/* Average */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 text-sm tabular-nums">
                        {user.average.toFixed(1)}%
                      </td>

                      {/* Peak Score */}
                      <td className="py-3.5 px-4 text-right font-mono text-slate-700 text-xs tabular-nums">
                        <span className="font-bold">{user.highest.toFixed(1)}%</span>
                        <span className="block text-[10px] text-slate-400 truncate max-w-[150px] ml-auto">
                          {user.bestTitle}
                        </span>
                      </td>

                      {/* Results Count */}
                      <td className="py-3.5 px-4 text-right font-mono text-slate-600 tabular-nums">
                        {user.resultsCount}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onUsernameClick(user.username)}
                            className="px-2.5 py-1 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                          >
                            View Scores
                          </button>
                          <button
                            onClick={() => onCompareClick(user.username)}
                            className="px-2.5 py-1 text-[11px] font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                          >
                            Compare
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
