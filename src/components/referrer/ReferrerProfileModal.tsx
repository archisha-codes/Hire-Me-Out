import React, { useState } from 'react';
import { X, Building2, UserCheck, ShieldCheck, Clock, CheckCircle2, Save } from 'lucide-react';
import { api } from '../../services/api';

interface ReferrerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  referrerProfile?: any;
  onSaveSuccess?: () => void;
}

export const ReferrerProfileModal: React.FC<ReferrerProfileModalProps> = ({
  isOpen,
  onClose,
  referrerProfile,
  onSaveSuccess,
}) => {
  const [companyName, setCompanyName] = useState(referrerProfile?.companyName || 'Google');
  const [designation, setDesignation] = useState(referrerProfile?.designation || 'Senior Software Engineer');
  const [workEmail, setWorkEmail] = useState(referrerProfile?.workEmail || 'referrer@google.com');
  const [availability, setAvailability] = useState('Evening (6 PM - 9 PM IST)');
  const [isActive, setIsActive] = useState(referrerProfile?.isVerified ?? true);
  const [capacity, setCapacity] = useState('3 candidates / week');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Simulate/call API update
      alert('Referrer profile updated successfully!');
      if (onSaveSuccess) onSaveSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to update referrer profile.');
    } finally {
      setLoading(false);
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
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Employee Referrer Profile</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                  <ShieldCheck className="w-3 h-3" /> VERIFIED
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Proof-backed referral preferences & availability
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-medium">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-slate-700 dark:text-slate-300 font-bold block">Company</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-slate-700 dark:text-slate-300 font-bold block">Current Role</label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-700 dark:text-slate-300 font-bold block">Work Email</label>
            <input
              type="email"
              value={workEmail}
              onChange={(e) => setWorkEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-slate-700 dark:text-slate-300 font-bold block">Availability Window</label>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="Morning (9 AM - 12 PM IST)">Morning (9 AM - 12 PM)</option>
                <option value="Afternoon (2 PM - 5 PM IST)">Afternoon (2 PM - 5 PM)</option>
                <option value="Evening (6 PM - 9 PM IST)">Evening (6 PM - 9 PM)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-slate-700 dark:text-slate-300 font-bold block">Referral Capacity</label>
              <select
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="2 candidates / week">2 candidates / week</option>
                <option value="3 candidates / week">3 candidates / week</option>
                <option value="5 candidates / week">5 candidates / week</option>
              </select>
            </div>
          </div>

          {/* Active Toggle */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">Referral Status</span>
              <span className="text-[11px] text-slate-500">
                {isActive ? 'Active and accepting verified candidate proof' : 'Inactive'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                isActive
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {isActive ? 'ACTIVE' : 'INACTIVE'}
            </button>
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
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Referrer Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
