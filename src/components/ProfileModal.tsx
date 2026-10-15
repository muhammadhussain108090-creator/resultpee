import React, { useState } from 'react';
import { X, User, Check, Sparkles, SwitchCamera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVATARS = ['🎓', '👨‍💻', '👩‍🔬', '⚡', '🎨', '🚀', '🎯', '📚', '🏆', '💡', '🤖', '🌟'];

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { profile, updateProfile, switchDemoUser } = useAuth();

  const [username, setUsername] = useState(profile?.username || '');
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [avatar, setAvatar] = useState(profile?.avatar || '🎓');
  const [bio, setBio] = useState(profile?.bio || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateProfile(username, displayName, avatar, bio);
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 800);
  };

  const handleSwitchToDemo = async (demoUsername: string) => {
    await switchDemoUser(demoUsername);
    setUsername(demoUsername);
    setDisplayName(demoUsername.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-700" />
            <h2 className="text-base font-bold text-slate-900">
              Your Profile &amp; Username
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {/* Avatar Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Choose Avatar
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {AVATARS.map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  onClick={() => setAvatar(emoji)}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                    avatar === emoji
                      ? 'bg-slate-900 text-white scale-110 shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Username (Handle) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Username Handle (Unique ID for friends to find you) *
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-slate-400 text-xs font-mono font-bold">@</span>
              <input
                type="text"
                required
                pattern="^[a-zA-Z0-9_]{3,24}$"
                title="3 to 24 letters, numbers, or underscores"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                className="w-full pl-8 pr-3 py-2 text-xs font-mono font-semibold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                placeholder="your_handle"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1 font-mono">
              Friends will use @{username || 'your_handle'} to view your results
            </p>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Display Name *
            </label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
              placeholder="e.g. Alex Chen"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Bio or Study Program (Optional)
            </label>
            <input
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
              placeholder="e.g. Computer Science · Class of 2026"
            />
          </div>

          {/* Quick Demo Switcher */}
          <div className="pt-3 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1.5 flex items-center gap-1">
              <SwitchCamera className="w-3 h-3" />
              <span>Test as a Friend Profile:</span>
            </span>
            <div className="flex flex-wrap gap-1">
              {['alex_lee', 'maya_chen', 'jordan_k', 'sarah_w'].map((demo) => (
                <button
                  key={demo}
                  type="button"
                  onClick={() => handleSwitchToDemo(demo)}
                  className="px-2 py-1 text-[10px] font-mono bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
                >
                  @{demo}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Profile</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
