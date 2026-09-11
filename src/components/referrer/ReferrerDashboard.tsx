import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { CandidateVerificationCard } from './CandidateVerificationCard';
import { ReferrerProfileModal } from './ReferrerProfileModal';
import { ReferralSubmissionModal } from './ReferralSubmissionModal';
import { UserCheck, Award, TrendingUp, CheckCircle2, Building2, ShieldCheck, Settings, Sparkles } from 'lucide-react';

export const ReferrerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [selectedOpportunityForReferral, setSelectedOpportunityForReferral] = useState<any>(null);

  const loadOpportunities = async () => {
    setLoading(true);
    try {
      const data = await api.getReferralOpportunities();
      setOpportunities(data.opportunities || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOpportunities();
  }, []);

  const employee: any = user?.employeeProfile || {};

  return (
    <div className="space-y-8">
      {/* Welcome Banner with Soft Indigo Gradient */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white p-6 border border-indigo-800/50 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-lg">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
              EMPLOYEE REFERRER PORTAL
            </span>
            <span className="text-xs text-indigo-200">Verified at: <strong className="text-white font-mono">{employee.companyName || 'Google'}</strong></span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Refer Verified Talent to {employee.companyName || 'TechNova'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200">
            "Proof before referral." Review candidate AI assessment scores, project evidence, and interview reports before lodging company referrals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 font-mono text-center">
            <span className="text-[10px] text-indigo-200 block uppercase font-bold">Total Earnings</span>
            <span className="text-2xl font-black text-emerald-400">₹{employee.earnings || 24000}</span>
          </div>

          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl text-white border border-white/10 transition-colors"
            title="Edit Referrer Profile"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-mono">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-slate-500 dark:text-slate-400 block font-sans">Pending Referral Requests</span>
          <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{opportunities.length || 2}</span>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-slate-500 dark:text-slate-400 block font-sans">Total Referrals Lodged</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white">{employee.totalReferrals || 8}</span>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-slate-500 dark:text-slate-400 block font-sans">Successful Hires</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{employee.successfulReferrals || 3}</span>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-slate-500 dark:text-slate-400 block font-sans">Referral Success Rate</span>
          <span className="text-2xl font-black text-cyan-600 dark:text-cyan-400">75%</span>
        </div>
      </div>

      {/* Verified Referral Opportunities Inbox */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Verified Candidate Referral Inbox ({opportunities.length})</span>
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            Candidate proof verified prior to request
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 font-mono flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600 animate-spin" />
            <span>Loading referral opportunities...</span>
          </div>
        ) : opportunities.length === 0 ? (
          <div className="p-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center text-slate-500 shadow-sm">
            No pending candidate referral requests at this moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {opportunities.map((op) => (
              <CandidateVerificationCard
                key={op.id}
                opportunity={op}
                onAcceptReferral={() => setSelectedOpportunityForReferral(op)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <ReferrerProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        referrerProfile={employee}
      />

      {selectedOpportunityForReferral && (
        <ReferralSubmissionModal
          isOpen={Boolean(selectedOpportunityForReferral)}
          opportunity={selectedOpportunityForReferral}
          onClose={() => setSelectedOpportunityForReferral(null)}
          onSuccess={() => loadOpportunities()}
        />
      )}
    </div>
  );
};
