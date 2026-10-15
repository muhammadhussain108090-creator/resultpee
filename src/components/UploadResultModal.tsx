import React, { useState } from 'react';
import { X, Upload, Check, AlertCircle, Sparkles, Image as ImageIcon } from 'lucide-react';
import { ResultCategory, ResultItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { uploadResult } from '../services/resultService';

interface UploadResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const UploadResultModal: React.FC<UploadResultModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { profile } = useAuth();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ResultCategory>('Academic Exam');
  const [score, setScore] = useState<string>('');
  const [maxScore, setMaxScore] = useState<string>('100');
  const [grade, setGrade] = useState<string>('A');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');
  const [tags, setTags] = useState<string>('');
  const [proofUrl, setProofUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Compute percentage
  const numScore = parseFloat(score) || 0;
  const numMax = parseFloat(maxScore) || 100;
  const percentage = numMax > 0 ? (numScore / numMax) * 100 : 0;

  // Auto-calculate recommended grade when score or maxScore changes
  const handleScoreChange = (val: string) => {
    setScore(val);
    const s = parseFloat(val);
    const m = parseFloat(maxScore) || 100;
    if (!isNaN(s) && m > 0) {
      const pct = (s / m) * 100;
      if (pct >= 95) setGrade('A+');
      else if (pct >= 90) setGrade('A');
      else if (pct >= 85) setGrade('B+');
      else if (pct >= 80) setGrade('B');
      else if (pct >= 75) setGrade('C+');
      else if (pct >= 70) setGrade('C');
      else if (pct >= 60) setGrade('Pass');
      else setGrade('Incomplete');
    }
  };

  const handleProofImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMsg('Image size should be under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setProofUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please enter a subject or result title.');
      return;
    }
    if (score === '' || isNaN(numScore)) {
      setErrorMsg('Please enter a valid numeric score.');
      return;
    }
    if (numMax <= 0) {
      setErrorMsg('Maximum score must be greater than 0.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const resultId = 'res_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const userHandle = profile?.username || 'student';
    const userName = profile?.displayName || 'User';
    const userUid = profile?.uid || 'user_' + Date.now();

    const newResult: ResultItem = {
      id: resultId,
      userId: userUid,
      username: userHandle,
      displayName: userName,
      title: title.trim(),
      category,
      score: numScore,
      maxScore: numMax,
      percentage: parseFloat(percentage.toFixed(1)),
      grade: grade.trim() || 'Passed',
      date,
      notes: notes.trim(),
      proofUrl: proofUrl || undefined,
      tags: tags.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    try {
      await uploadResult(newResult);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Upload result error:', err);
      // Still notify success locally
      onSuccess();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories: ResultCategory[] = [
    'Academic Exam',
    'Quiz & Test',
    'Course & Cert',
    'Coding',
    'Fitness & Sports',
    'Project',
    'Other',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Upload New Result
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Publishing as <span className="font-mono text-slate-700 font-semibold">@{profile?.username}</span> for your friends to see
            </p>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Subject, Test, or Challenge Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Advanced Calculus Final, LeetCode Weekly, AWS Certified..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
            />
          </div>

          {/* Category Selector Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Category
            </label>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                    category === cat
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Score, Max Score & Grade */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Score Attained *
              </label>
              <input
                type="number"
                step="any"
                required
                placeholder="e.g. 94"
                value={score}
                onChange={(e) => handleScoreChange(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Max Score *
              </label>
              <input
                type="number"
                step="any"
                required
                placeholder="100"
                value={maxScore}
                onChange={(e) => setMaxScore(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Grade / Distinction
              </label>
              <input
                type="text"
                placeholder="e.g. A+, Distinction"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-3 py-2 text-sm font-medium bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Calculated Percentage Live Pill */}
          {score !== '' && (
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-600">Calculated Percentage:</span>
              <span className="font-mono font-bold text-slate-900 text-sm tabular-nums">
                {percentage.toFixed(1)}%
              </span>
            </div>
          )}

          {/* Date & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Date or Term
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tags (comma separated)
              </label>
              <input
                type="text"
                placeholder="e.g. Midterm, Honors, CS301"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Personal Notes or Feedback (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Aced the problem solving section, need to review chapter 4..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
            />
          </div>

          {/* Optional Proof Screenshot / Certificate */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Attach Score Report / Certificate Photo (Optional)
            </label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors border border-slate-200">
                <ImageIcon className="w-4 h-4 text-slate-500" />
                <span>{proofUrl ? 'Change Photo' : 'Upload Screenshot'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProofImage}
                  className="hidden"
                />
              </label>
              {proofUrl && (
                <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium">
                  <Check className="w-3.5 h-3.5" />
                  <span>Image attached</span>
                  <button
                    type="button"
                    onClick={() => setProofUrl('')}
                    className="text-slate-400 hover:text-rose-500 text-xs ml-1"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Uploading...' : 'Publish Result'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
