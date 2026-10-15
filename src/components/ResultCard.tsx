import React, { useState, useEffect } from 'react';
import { MessageSquare, Heart, Share2, Trash2, Award, Calendar, Tag, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { ResultItem, CommentItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { deleteResult, addComment, subscribeToComments } from '../services/resultService';

interface ResultCardProps {
  result: ResultItem;
  onUsernameClick?: (username: string) => void;
  onCompareClick?: (username: string) => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  result,
  onUsernameClick,
  onCompareClick,
}) => {
  const { profile } = useAuth();
  const [likes, setLikes] = useState<number>(() => {
    const saved = localStorage.getItem(`kudos_${result.id}`);
    return saved ? parseInt(saved, 10) : Math.floor(Math.random() * 5) + 1;
  });
  const [hasLiked, setHasLiked] = useState<boolean>(() => {
    return localStorage.getItem(`has_liked_${result.id}`) === 'true';
  });

  const [showComments, setShowComments] = useState<boolean>(false);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentInput, setCommentInput] = useState<string>('');
  const [isSubmittingComment, setIsSubmittingComment] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const isOwner = profile && (profile.uid === result.userId || profile.username === result.username);

  useEffect(() => {
    if (showComments) {
      const unsub = subscribeToComments(result.id, (loadedComments) => {
        setComments(loadedComments);
      });
      return () => unsub();
    }
  }, [showComments, result.id]);

  const handleLike = () => {
    if (!hasLiked) {
      const next = likes + 1;
      setLikes(next);
      setHasLiked(true);
      localStorage.setItem(`kudos_${result.id}`, next.toString());
      localStorage.setItem(`has_liked_${result.id}`, 'true');
    } else {
      const next = Math.max(0, likes - 1);
      setLikes(next);
      setHasLiked(false);
      localStorage.setItem(`kudos_${result.id}`, next.toString());
      localStorage.setItem(`has_liked_${result.id}`, 'false');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !profile) return;

    setIsSubmittingComment(true);
    const newComment: CommentItem = {
      id: 'cmt_' + Date.now(),
      resultId: result.id,
      userId: profile.uid,
      username: profile.username,
      displayName: profile.displayName,
      text: commentInput.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      await addComment(result.id, newComment);
      setComments((prev) => [...prev, newComment]);
      setCommentInput('');
    } catch (err) {
      console.warn('Comment upload note:', err);
      // Local optimistic update
      setComments((prev) => [...prev, newComment]);
      setCommentInput('');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to remove "${result.title}"?`)) {
      try {
        await deleteResult(result.id);
      } catch (e) {
        console.error('Delete error:', e);
      }
    }
  };

  const handleShare = () => {
    const text = `${result.displayName} (@${result.username}) scored ${result.score}/${result.maxScore} (${result.percentage}%, Grade ${result.grade}) in ${result.title}!`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Grade color accent
  const isHighScore = result.percentage >= 90;
  const isPassing = result.percentage >= 60;

  return (
    <article className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 transition-shadow transition-colors duration-150">
      <div className="p-5 sm:p-6">
        {/* Card Header: User identity & unboxed metadata */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onUsernameClick?.(result.username)}
              className="text-2xl w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:scale-105 transition-transform"
              title={`View @${result.username}'s profile`}
            >
              {result.displayName.includes('Alex') ? '👨‍💻' : result.displayName.includes('Maya') ? '👩‍🔬' : result.displayName.includes('Jordan') ? '⚡' : result.displayName.includes('Sarah') ? '🎨' : '🎓'}
            </button>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 text-sm">
                  {result.displayName}
                </span>
                <button
                  onClick={() => onUsernameClick?.(result.username)}
                  className="font-mono text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                >
                  @{result.username}
                </button>
              </div>

              {/* Zero-pill metadata with typographic separators */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                <span>{result.category}</span>
                <span aria-hidden="true">·</span>
                <span>{result.date || 'Recent'}</span>
                {result.tags && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-slate-400 truncate max-w-[140px] sm:max-w-[200px]">
                      {result.tags}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions Menu */}
          <div className="flex items-center gap-1.5 shrink-0">
            {onCompareClick && (
              <button
                onClick={() => onCompareClick(result.username)}
                className="hidden sm:inline-flex text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md px-2.5 py-1 transition-colors"
                title={`Compare your scores against @${result.username}`}
              >
                Compare
              </button>
            )}
            {isOwner && (
              <button
                onClick={handleDelete}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                title="Delete your result"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-900 leading-snug mb-3">
          {result.title}
        </h3>

        {/* Score & Performance Box */}
        <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-baseline gap-3">
            <div className="flex items-baseline">
              <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight tabular-nums">
                {result.score}
              </span>
              <span className="text-sm font-medium text-slate-500 font-mono ml-1 tabular-nums">
                /{result.maxScore}
              </span>
            </div>

            <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
              <span className="text-base font-bold text-slate-800 font-mono tabular-nums">
                {result.percentage.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
                isHighScore
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : isPassing
                  ? 'bg-blue-50 text-blue-800 border border-blue-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
            >
              Grade: {result.grade}
            </span>
          </div>
        </div>

        {/* Notes if provided */}
        {result.notes && (
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            {result.notes}
          </p>
        )}

        {/* Proof snapshot / attachment if provided */}
        {result.proofUrl && (
          <div className="mb-4 rounded-lg overflow-hidden border border-slate-200 bg-slate-900/5 max-h-56">
            <img
              src={result.proofUrl}
              alt="Result Proof"
              referrerPolicy="no-referrer"
              className="w-full h-auto object-cover max-h-56 cursor-pointer hover:opacity-95 transition-opacity"
              onClick={() => window.open(result.proofUrl, '_blank')}
            />
          </div>
        )}

        {/* Card Actions Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 py-1 px-2 rounded-md transition-colors ${
                hasLiked ? 'text-rose-600 font-semibold bg-rose-50' : 'hover:text-slate-800'
              }`}
            >
              <Heart className={`w-4 h-4 ${hasLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span className="font-mono tabular-nums">{likes} Kudos</span>
            </button>

            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1.5 py-1 px-2 rounded-md hover:text-slate-800 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>
                {comments.length > 0 ? `${comments.length} Comments` : 'Comment'}
              </span>
              {showComments ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-1 py-1 px-2 rounded-md hover:text-slate-800 transition-colors"
              title="Copy share summary"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied!' : 'Share'}</span>
            </button>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {comments.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No comments yet. Congratulate your friend!</p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-900">{c.displayName}</span>
                      <span className="font-mono text-slate-400">@{c.username}</span>
                    </div>
                    <p className="text-slate-700">{c.text}</p>
                  </div>
                ))
              )}
            </div>

            {/* Comment input form */}
            <form onSubmit={handleAddComment} className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="Write a supportive comment or congratulations..."
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                className="flex-1 text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all"
              />
              <button
                type="submit"
                disabled={!commentInput.trim() || isSubmittingComment}
                className="px-3 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-40 transition-colors shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </article>
  );
};
