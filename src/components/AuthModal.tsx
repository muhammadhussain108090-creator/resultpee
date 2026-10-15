import React, { useState } from 'react';
import { X, Lock, Mail, User, AlertCircle, CheckCircle, Sparkles, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'signup',
}) => {
  const { signUp, logIn, switchDemoUser, user } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    if (mode === 'signup') {
      if (!username.trim() || username.length < 3) {
        setErrorMsg('Username must be at least 3 characters.');
        setIsSubmitting(false);
        return;
      }
      if (!displayName.trim()) {
        setErrorMsg('Please enter your display name.');
        setIsSubmitting(false);
        return;
      }

      const res = await signUp(email, password, username, displayName);
      setIsSubmitting(false);
      if (res.success) {
        onClose();
      } else {
        setErrorMsg(res.error || 'Failed to create account.');
      }
    } else {
      const res = await logIn(email, password);
      setIsSubmitting(false);
      if (res.success) {
        onClose();
      } else {
        setErrorMsg(res.error || 'Invalid email or password.');
      }
    }
  };

  const handleQuickDemo = async (uname: string) => {
    await switchDemoUser(uname);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {mode === 'signup' ? 'Create ScorePeer Account' : 'Log In to ScorePeer'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {mode === 'signup'
                ? 'Join your friends to share results, chat, and post reels'
                : 'Welcome back! Sign in to access your friends and results'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-4">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                mode === 'signup' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Sign Up</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                mode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Log In</span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Choose Username Handle *
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400 text-xs font-mono font-bold">@</span>
                  <input
                    type="text"
                    required
                    pattern="^[a-zA-Z0-9_]{3,24}$"
                    placeholder="your_handle"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    className="w-full pl-8 pr-3 py-2 text-xs font-mono font-semibold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1 font-mono">
                  Friends use @{username || 'handle'} to search and see your results
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Display Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Chen"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address *
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3 w-3.5 h-3.5 text-slate-400" />
              <input
                type="email"
                required
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password *
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 w-3.5 h-3.5 text-slate-400" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            {isSubmitting
              ? 'Please wait...'
              : mode === 'signup'
              ? 'Create Account & Sign In'
              : 'Log In'}
          </button>

          {/* Quick Demo Friend Switcher */}
          <div className="pt-4 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-500 block mb-2">
              Or test as an existing friend instantly:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {['alex_lee', 'maya_chen', 'jordan_k', 'sarah_w'].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleQuickDemo(d)}
                  className="px-2.5 py-1 text-[11px] font-mono bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md transition-colors"
                >
                  @{d}
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
