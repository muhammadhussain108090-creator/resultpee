import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  ChevronUp, 
  ChevronDown, 
  Plus, 
  UserPlus, 
  UserCheck, 
  Music, 
  Send, 
  X,
  Sparkles
} from 'lucide-react';
import { ReelItem, ReelComment } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  subscribeToReels, 
  likeReel, 
  addReelComment, 
  subscribeToReelComments 
} from '../services/resultService';

interface ReelsViewProps {
  onOpenUploadReel: () => void;
  onUsernameClick: (username: string) => void;
}

export const ReelsView: React.FC<ReelsViewProps> = ({
  onOpenUploadReel,
  onUsernameClick,
}) => {
  const { profile, toggleFriend, isFriend } = useAuth();
  const [reels, setReels] = useState<ReelItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [likesState, setLikesState] = useState<Record<string, { count: number; liked: boolean }>>({});
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<ReelComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [copied, setCopied] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Subscribe to reels
  useEffect(() => {
    const unsub = subscribeToReels((loadedReels) => {
      setReels(loadedReels);
    });
    return () => unsub();
  }, []);

  const currentReel = reels[currentIndex];

  // Initialize likes state
  useEffect(() => {
    if (currentReel && !likesState[currentReel.id]) {
      const savedLiked = localStorage.getItem(`reel_liked_${currentReel.id}`) === 'true';
      setLikesState((prev) => ({
        ...prev,
        [currentReel.id]: {
          count: currentReel.likes || 12,
          liked: savedLiked,
        },
      }));
    }
  }, [currentReel, likesState]);

  // Subscribe to comments for active reel
  useEffect(() => {
    if (currentReel && showComments) {
      const unsub = subscribeToReelComments(currentReel.id, (loadedComments) => {
        setComments(loadedComments);
      });
      return () => unsub();
    }
  }, [currentReel, showComments]);

  // Play/pause management on index switch
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {
        // Autoplay policy might require mute
        setIsMuted(true);
      });
      setIsPlaying(true);
    }
  }, [currentIndex]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < reels.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleLike = () => {
    if (!currentReel) return;
    const currentState = likesState[currentReel.id] || { count: currentReel.likes || 10, liked: false };
    const newLiked = !currentState.liked;
    const newCount = newLiked ? currentState.count + 1 : Math.max(0, currentState.count - 1);

    setLikesState((prev) => ({
      ...prev,
      [currentReel.id]: { count: newCount, liked: newLiked },
    }));

    localStorage.setItem(`reel_liked_${currentReel.id}`, newLiked ? 'true' : 'false');
    likeReel(currentReel.id, currentState.count);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !profile || !currentReel) return;

    const newComment: ReelComment = {
      id: 'rcmt_' + Date.now(),
      reelId: currentReel.id,
      userId: profile.uid,
      username: profile.username,
      displayName: profile.displayName,
      text: commentText.trim(),
      createdAt: new Date().toISOString(),
    };

    setComments((prev) => [...prev, newComment]);
    setCommentText('');
    await addReelComment(currentReel.id, newComment);
  };

  const handleShare = () => {
    if (!currentReel) return;
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (reels.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center max-w-lg mx-auto">
        <h2 className="text-lg font-bold text-slate-900 mb-2">No Reels Uploaded Yet</h2>
        <p className="text-xs text-slate-500 mb-4">
          Be the first to share a short video clip with your friends!
        </p>
        <button
          onClick={onOpenUploadReel}
          className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors"
        >
          Upload First Reel
        </button>
      </div>
    );
  }

  const currentLikes = likesState[currentReel?.id] || { count: currentReel?.likes || 0, liked: false };
  const userIsFriend = currentReel ? isFriend(currentReel.userId) || isFriend(currentReel.username) : false;

  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center">
      {/* Top Bar for Reels */}
      <div className="w-full flex items-center justify-between mb-4 px-2">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Friend Reels
          </h1>
          <p className="text-xs text-slate-500">
            Watch short video clips, study hacks, and results shared by peers.
          </p>
        </div>

        <button
          onClick={onOpenUploadReel}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Post Reel</span>
        </button>
      </div>

      {/* Main Reels Viewport */}
      <div className="relative w-full max-w-[380px] sm:max-w-[420px] h-[640px] sm:h-[680px] bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800 flex items-center justify-center">
        {/* Video Element */}
        <video
          ref={videoRef}
          src={currentReel?.videoUrl}
          loop
          muted={isMuted}
          playsInline
          onClick={togglePlay}
          className="w-full h-full object-cover cursor-pointer"
        />

        {/* Play/Pause Center Indicator (shows briefly when paused) */}
        {!isPlaying && (
          <div
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer pointer-events-auto"
          >
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <Play className="w-8 h-8 fill-white ml-1" />
            </div>
          </div>
        )}

        {/* Volume Toggle Top Right */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Right Floating Action Sidebar */}
        <div className="absolute right-3 bottom-16 z-20 flex flex-col items-center gap-4">
          {/* Creator Avatar with Friend Button */}
          <div className="relative flex flex-col items-center">
            <button
              onClick={() => onUsernameClick(currentReel.username)}
              className="w-11 h-11 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-xl shadow-md hover:scale-105 transition-transform"
              title={`View @${currentReel.username}'s profile`}
            >
              {currentReel.avatar}
            </button>
            {profile?.username !== currentReel.username && (
              <button
                onClick={() =>
                  toggleFriend({
                    uid: currentReel.userId,
                    username: currentReel.username,
                    displayName: currentReel.displayName,
                    avatar: currentReel.avatar,
                  })
                }
                className={`-mt-2.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white font-bold transition-all shadow-xs ${
                  userIsFriend ? 'bg-emerald-600' : 'bg-blue-600 hover:bg-blue-700'
                }`}
                title={userIsFriend ? 'Friends' : 'Add Friend'}
              >
                {userIsFriend ? <UserCheck className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
              </button>
            )}
          </div>

          {/* Like Button */}
          <div className="flex flex-col items-center">
            <button
              onClick={handleLike}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                currentLikes.liked
                  ? 'bg-rose-500 text-white scale-110 shadow-lg'
                  : 'bg-black/40 text-white backdrop-blur-md hover:bg-black/60'
              }`}
            >
              <Heart className={`w-5 h-5 ${currentLikes.liked ? 'fill-white' : ''}`} />
            </button>
            <span className="text-[11px] font-mono text-white font-semibold mt-1 tabular-nums drop-shadow-sm">
              {currentLikes.count}
            </span>
          </div>

          {/* Comments Button */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => setShowComments(!showComments)}
              className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
            <span className="text-[11px] font-mono text-white font-semibold mt-1 tabular-nums drop-shadow-sm">
              {comments.length || currentReel.commentsCount || 4}
            </span>
          </div>

          {/* Share Button */}
          <div className="flex flex-col items-center">
            <button
              onClick={handleShare}
              className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition-colors"
              title="Share Reel Link"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <span className="text-[10px] text-white font-medium mt-1 drop-shadow-sm">
              {copied ? 'Copied' : 'Share'}
            </span>
          </div>
        </div>

        {/* Bottom Scrim & Info Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 pt-16 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none z-10 text-left">
          <div className="pointer-events-auto max-w-[80%] space-y-1.5">
            {/* Creator Username */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUsernameClick(currentReel.username)}
                className="font-bold text-white text-sm hover:underline flex items-center gap-1.5"
              >
                <span>{currentReel.displayName}</span>
                <span className="font-mono text-xs text-blue-300 font-normal">
                  @{currentReel.username}
                </span>
              </button>
            </div>

            {/* Caption */}
            <p className="text-xs text-white/95 leading-relaxed line-clamp-3">
              {currentReel.caption}
            </p>

            {/* Tags */}
            {currentReel.tags && (
              <p className="text-[11px] font-mono text-blue-200">
                {currentReel.tags}
              </p>
            )}

            {/* Audio Track */}
            {currentReel.audioTrack && (
              <div className="flex items-center gap-1.5 text-[11px] text-white/80 pt-1">
                <Music className="w-3 h-3 text-white/60 animate-spin" style={{ animationDuration: '6s' }} />
                <span className="truncate">{currentReel.audioTrack}</span>
              </div>
            )}
          </div>
        </div>

        {/* Comments Overlay Drawer */}
        {showComments && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-xs z-30 flex flex-col justify-end pointer-events-auto">
            <div className="bg-white rounded-t-2xl p-4 max-h-[70%] flex flex-col shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h3 className="text-xs font-bold text-slate-900">
                  Comments ({comments.length})
                </h3>
                <button
                  onClick={() => setShowComments(false)}
                  className="p-1 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-3 space-y-2.5 max-h-56 pr-1">
                {comments.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-4">No comments yet. Be first to comment!</p>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-900">{c.displayName}</span>
                        <span className="font-mono text-slate-400 text-[10px]">@{c.username}</span>
                      </div>
                      <p className="text-slate-700">{c.text}</p>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleAddComment} className="pt-2 border-t border-slate-100 flex gap-2">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="px-3 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold disabled:opacity-40"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons for Next/Previous Reel */}
      <div className="flex items-center gap-4 mt-4">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="p-2.5 bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-30 rounded-full text-slate-700 transition-colors shadow-xs"
          title="Previous Reel"
        >
          <ChevronUp className="w-5 h-5" />
        </button>

        <span className="text-xs font-mono font-semibold text-slate-500 tabular-nums">
          Reel {currentIndex + 1} of {reels.length}
        </span>

        <button
          onClick={handleNext}
          disabled={currentIndex === reels.length - 1}
          className="p-2.5 bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-30 rounded-full text-slate-700 transition-colors shadow-xs"
          title="Next Reel"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
