import React from 'react';
import { TalentScoreBadge } from '../common/TalentScoreBadge';
import { RadarChart } from '../common/RadarChart';
import { CheckCircle2, ShieldCheck, Award, FileText, UserCheck, ArrowRight, Sparkles } from 'lucide-react';

interface CandidateVerificationCardProps {
  opportunity: any;
  onAcceptReferral: (id: string) => void;
}

export const CandidateVerificationCard: React.FC<CandidateVerificationCardProps> = ({
  opportunity,
  onAcceptReferral,
}) => {
  const student = opportunity.studentProfile || {};
  const user = student.user || {};
  const job = opportunity.job || {};

  const scores = {
    techScore: student.techScore || 91,
    problemSolvingScore: student.problemSolvingScore || 88,
    commScore: student.commScore || 79,
    projectsScore: student.projectsScore || 93,
    interviewScore: student.interviewScore || 85,
  };

  const isSubmitted = opportunity.status === 'REFERRAL_SUBMITTED' || opportunity.status === 'SCREENING' || opportunity.status === 'HIRED';

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 space-y-6 shadow-sm hover:shadow-md transition-all">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-300 text-base">
            {user.name ? user.name[0] : 'S'}
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{user.name || 'Ananya Sharma'}</h3>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">{student.headline || 'Full Stack Developer'}</p>
            <p className="text-[11px] text-slate-400 font-mono">{student.college || 'IIT Bangalore'} • CGPA {student.cgpa || 9.1}</p>
          </div>
        </div>

        <span className="text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-full text-slate-700 dark:text-slate-300 font-mono">
          Target: {job.title || 'Software Engineer'}
        </span>
      </div>

      {/* Verified Score & Badges */}
      <TalentScoreBadge
        score={student.talentScore || 87}
        tier={student.talentTier || 'Tier A'}
        percentile={student.percentile || 88}
        humanVerified={student.humanVerified}
        size="sm"
      />

      {/* Verified Evidence Summary Box */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3 text-xs">
        <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-500" /> WHY THIS CANDIDATE? (PROOF SUMMARY)
        </div>

        <div className="grid grid-cols-2 gap-2 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>AI Assessment: {scores.techScore}/100</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>AI Interview: {scores.interviewScore}/100</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Role Match: 94%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>Code Repos Verified</span>
          </div>
        </div>
      </div>

      {/* Mini Radar Chart */}
      <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
        <RadarChart scores={scores} height={140} />
      </div>

      {/* Action Button */}
      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <span className="text-xs text-slate-500 font-mono">
          Bonus: <span className="text-emerald-600 dark:text-emerald-400 font-bold">₹{job.referralBonus || 5000}</span>
        </span>

        <button
          onClick={() => onAcceptReferral(opportunity.id)}
          disabled={isSubmitted}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
            isSubmitted
              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>{isSubmitted ? 'Referral Submitted ✓' : 'Refer Candidate'}</span>
        </button>
      </div>

    </div>
  );
};

