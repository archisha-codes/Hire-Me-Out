import React from 'react';
import { CheckCircle2, Circle, Clock, Building2, UserCheck, Award } from 'lucide-react';

interface StatusStep {
  key: string;
  label: string;
  description: string;
}

const PIPELINE_STEPS: StatusStep[] = [
  { key: 'PROFILE_CREATED', label: 'Profile Created', description: 'Student onboarding complete' },
  { key: 'ASSESSMENT_COMPLETE', label: 'Assessment Verified', description: 'AI Skill assessment passed' },
  { key: 'AI_INTERVIEW_COMPLETE', label: 'AI Interview Complete', description: 'Technical mock interview report ready' },
  { key: 'VERIFIED', label: 'Talent Verified', description: 'Verified Talent Score generated' },
  { key: 'SHORTLISTED', label: 'Company Shortlisted', description: 'Discovered by recruiter' },
  { key: 'INTERVIEW_REQUESTED', label: 'Interview Requested', description: 'Recruiter requested initial screening' },
  { key: 'INTERVIEW_COMPLETED', label: 'Interview Completed', description: 'Screening evaluation complete' },
  { key: 'REFERRAL_REQUESTED', label: 'Referral Requested', description: 'Assigned to company employee referrer' },
  { key: 'REFERRAL_SUBMITTED', label: 'Referral Submitted', description: 'Internal employee referral lodged' },
  { key: 'SCREENING', label: 'Company Screening', description: 'HR & team evaluation' },
  { key: 'FINAL_INTERVIEW', label: 'Final Rounds', description: 'Executive technical interview' },
  { key: 'OFFER', label: 'Offer Received', description: 'Hiring offer extended' },
];

interface StatusTrackerProps {
  currentStatus: string;
  statusHistory?: { status: string; date: string; text?: string }[];
}

export const StatusTracker: React.FC<StatusTrackerProps> = ({ currentStatus, statusHistory = [] }) => {
  const currentIndex = PIPELINE_STEPS.findIndex(s => s.key === currentStatus);
  const activeIdx = currentIndex >= 0 ? currentIndex : 8; // default fallback index for demo

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-brand-400" />
          <h3 className="font-semibold text-slate-100 text-sm">Verified Candidate Referral Pipeline</h3>
        </div>
        <span className="text-xs bg-brand-500/20 text-brand-300 border border-brand-500/30 px-3 py-1 rounded-full font-mono font-medium">
          Current Stage: {currentStatus}
        </span>
      </div>

      {/* Visual Pipeline Bar */}
      <div className="relative flex items-center justify-between w-full px-2 overflow-x-auto py-4">
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-800 rounded z-0" />
        <div
          className="absolute left-6 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-brand-500 via-indigo-500 to-emerald-500 rounded z-0 transition-all duration-500"
          style={{ width: `${Math.min(100, (activeIdx / (PIPELINE_STEPS.length - 1)) * 100)}%` }}
        />

        {PIPELINE_STEPS.map((step, idx) => {
          const isDone = idx <= activeIdx;
          const isCurrent = idx === activeIdx;

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center group min-w-[70px]">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                  isCurrent
                    ? 'bg-brand-600 border-white text-white shadow-lg shadow-brand-500/50 scale-110'
                    : isDone
                    ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                    : 'bg-slate-900 border-slate-700 text-slate-500'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Circle className="w-3.5 h-3.5" />
                )}
              </div>
              <span className={`text-[10px] font-medium mt-2 text-center max-w-[80px] line-clamp-2 ${isCurrent ? 'text-brand-300 font-bold' : isDone ? 'text-slate-200' : 'text-slate-500'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Recent History Timeline List */}
      {statusHistory.length > 0 && (
        <div className="mt-4 bg-slate-950/60 rounded-xl p-4 border border-slate-800/80 space-y-3">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Verification Audit Log
          </h4>
          <div className="space-y-2 text-xs">
            {statusHistory.slice(-4).map((hist, idx) => (
              <div key={idx} className="flex items-start justify-between bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/60">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span className="text-slate-200 font-medium">{hist.text || hist.status}</span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono ml-4 flex-shrink-0">{hist.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
