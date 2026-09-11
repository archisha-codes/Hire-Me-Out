import React, { useState } from 'react';
import { X, UserCheck, ShieldCheck, CheckCircle2, Send, Sparkles } from 'lucide-react';
import { api } from '../../services/api';

interface ReferralSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: any;
  onSuccess?: () => void;
}

export const ReferralSubmissionModal: React.FC<ReferralSubmissionModalProps> = ({
  isOpen,
  onClose,
  opportunity,
  onSuccess,
}) => {
  const [notes, setNotes] = useState('Reviewed verified candidate proof (Talent Score: 89, AI Interview: 91). Highly recommended for internal referral.');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !opportunity) return null;

  const student = opportunity.studentProfile || {};
  const user = student.user || {};
  const job = opportunity.job || {};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.acceptReferral(opportunity.id);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Failed to submit referral.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-white dark:from-slate-900 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Submit Employee Referral
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Refer Candidate to {job.companyProfile?.companyName || 'Company'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Referral Submitted Successfully!
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Candidate and company recruiting teams have been notified. Referral pipeline status updated.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-medium">
            {/* Candidate Proof Summary */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    {user.name || 'Ananya Sharma'}
                  </h4>
                  <p className="text-slate-500 text-[11px]">
                    Role: {job.title || 'Software Engineer'}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-mono font-bold">
                  Score: {student.talentScore || 89}/100
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-[10px] pt-2 border-t border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-slate-400 block">AI Interview</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{student.interviewScore || 91}/100</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Role Match</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">94%</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Verification</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">VERIFIED ✓</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 dark:text-slate-300 font-bold block">
                Internal Recommendation Note
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                required
              />
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-2 shadow-md shadow-indigo-600/20"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Submitting...' : 'Submit Referral'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
