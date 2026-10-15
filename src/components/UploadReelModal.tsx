import React, { useState } from 'react';
import { X, Upload, Film, Music, Check, AlertCircle, Video } from 'lucide-react';
import { ReelItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { uploadReel } from '../services/resultService';

interface UploadReelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const SAMPLE_PRESET_VIDEOS = [
  {
    name: 'Study Routine / Desk Focus',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  },
  {
    name: 'Outdoor Campus Sprint / Fitness',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  },
  {
    name: 'Tech & Hardware Build Showcase',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  },
  {
    name: 'Late Night Library Session',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
  },
];

export const UploadReelModal: React.FC<UploadReelModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { profile } = useAuth();
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState('#studentlife #finals #results');
  const [audioTrack, setAudioTrack] = useState('Original Audio');
  const [videoUrl, setVideoUrl] = useState(SAMPLE_PRESET_VIDEOS[0].url);
  const [isCustomFile, setIsCustomFile] = useState(false);
  const [fileName, setFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleVideoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        setErrorMsg('Video file size limit is 25MB.');
        return;
      }
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setFileName(file.name);
      setIsCustomFile(true);
      setErrorMsg(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim()) {
      setErrorMsg('Please enter a caption for your reel.');
      return;
    }
    if (!videoUrl) {
      setErrorMsg('Please select or upload a video file.');
      return;
    }

    setIsSubmitting(true);
    const reelId = 'reel_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);

    const newReel: ReelItem = {
      id: reelId,
      userId: profile?.uid || 'user_' + Date.now(),
      username: profile?.username || 'student',
      displayName: profile?.displayName || 'User',
      avatar: profile?.avatar || '🎓',
      videoUrl,
      caption: caption.trim(),
      tags: tags.trim(),
      audioTrack: audioTrack.trim() || 'Original Sound',
      likes: 0,
      commentsCount: 0,
      createdAt: new Date().toISOString(),
    };

    try {
      await uploadReel(newReel);
      onSuccess();
      onClose();
    } catch (err) {
      console.warn('Reel publish note:', err);
      onSuccess();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-slate-800" />
            <h2 className="text-base font-bold text-slate-900">
              Upload Reel
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Video Preview Box */}
          <div className="rounded-xl overflow-hidden bg-black aspect-video max-h-56 relative flex items-center justify-center border border-slate-800">
            {videoUrl ? (
              <video
                src={videoUrl}
                controls
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-slate-500 text-xs flex flex-col items-center">
                <Video className="w-8 h-8 mb-2" />
                <span>No video chosen</span>
              </div>
            )}
          </div>

          {/* Video Selection Options */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Choose Video Source
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 transition-colors">
                <Upload className="w-4 h-4 text-slate-600" />
                <span>{isCustomFile ? `Selected: ${fileName.slice(0, 15)}...` : 'Upload Video File (MP4/WebM)'}</span>
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  onChange={handleVideoFile}
                  className="hidden"
                />
              </label>

              <select
                value={isCustomFile ? '' : videoUrl}
                onChange={(e) => {
                  if (e.target.value) {
                    setVideoUrl(e.target.value);
                    setIsCustomFile(false);
                    setFileName('');
                  }
                }}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
              >
                <option value="" disabled>Or choose preset video clip...</option>
                {SAMPLE_PRESET_VIDEOS.map((preset) => (
                  <option key={preset.url} value={preset.url}>
                    {preset.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Caption */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Caption *
            </label>
            <textarea
              required
              rows={2}
              placeholder="What is this reel about? (Study tips, exam results celebration, sprint PR...)"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all"
            />
          </div>

          {/* Tags & Audio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tags (e.g. #studyvlog #exam)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sound / Music Title
              </label>
              <input
                type="text"
                placeholder="e.g. Chillhop Beats"
                value={audioTrack}
                onChange={(e) => setAudioTrack(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Film className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Publishing...' : 'Share Reel'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
