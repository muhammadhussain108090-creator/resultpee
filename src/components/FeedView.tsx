import React, { useState, useMemo } from 'react';
import { Search, Filter, Sparkles, BookOpen, UserPlus, Flame } from 'lucide-react';
import { ResultCategory, ResultItem } from '../types';
import { ResultCard } from './ResultCard';

interface FeedViewProps {
  results: ResultItem[];
  onUsernameClick: (username: string) => void;
  onCompareClick: (username: string) => void;
  onOpenUpload: () => void;
}

export const FeedView: React.FC<FeedViewProps> = ({
  results,
  onUsernameClick,
  onCompareClick,
  onOpenUpload,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'highest'>('newest');

  const categories = [
    'All',
    'Academic Exam',
    'Quiz & Test',
    'Course & Cert',
    'Coding',
    'Fitness & Sports',
    'Project',
  ];

  // Filter and sort results
  const filteredResults = useMemo(() => {
    let list = [...results];

    // Category filter
    if (selectedCategory !== 'All') {
      list = list.filter((r) => r.category === selectedCategory);
    }

    // Text search (matches title, username, displayName, tags, notes)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.username.toLowerCase().includes(q) ||
          r.displayName.toLowerCase().includes(q) ||
          (r.tags && r.tags.toLowerCase().includes(q)) ||
          (r.notes && r.notes.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sortBy === 'highest') {
      list.sort((a, b) => b.percentage - a.percentage);
    } else {
      list.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return list;
  }, [results, selectedCategory, searchQuery, sortBy]);

  // Feed stats
  const totalSubmissions = results.length;
  const uniqueFriends = new Set(results.map((r) => r.username.toLowerCase())).size;
  const topScore = results.length > 0 ? Math.max(...results.map((r) => r.percentage)) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner & Overview */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Friends Result Feed
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>{totalSubmissions} results shared</span>
            <span aria-hidden="true">·</span>
            <span>{uniqueFriends} active friends</span>
            <span aria-hidden="true">·</span>
            <span>Peak score: {topScore > 0 ? `${topScore.toFixed(1)}%` : '—'}</span>
          </div>
        </div>

        <button
          onClick={onOpenUpload}
          className="self-start sm:self-auto px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors shadow-xs whitespace-nowrap"
        >
          + Post New Result
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search by subject, @username, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all"
          />
        </div>

        {/* Sort & Category Dropdown or Toggle */}
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'highest')}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
          >
            <option value="newest">Sort: Most Recent</option>
            <option value="highest">Sort: Highest Score</option>
          </select>
        </div>
      </div>

      {/* Category Pills (Functional filter tabs) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white font-semibold'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results Stream */}
      {filteredResults.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800 mb-1">
            No matching results found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            Try adjusting your search query or category filter, or upload your own score to start the feed.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredResults.map((result) => (
            <ResultCard
              key={result.id}
              result={result}
              onUsernameClick={onUsernameClick}
              onCompareClick={onCompareClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};
