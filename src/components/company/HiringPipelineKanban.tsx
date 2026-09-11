import React, { useState } from 'react';
import { UserCheck, ShieldCheck, Video, Award, CheckCircle2, ChevronRight, Filter } from 'lucide-react';
import { api } from '../../services/api';

interface HiringPipelineKanbanProps {
  referralRequests: any[];
  onRefresh?: () => void;
}

export const HiringPipelineKanban: React.FC<HiringPipelineKanbanProps> = ({
  referralRequests = [],
  onRefresh,
}) => {
  const columns = [
    { id: 'SHORTLISTED', label: 'Shortlisted', color: 'border-blue-500 text-blue-600 dark:text-blue-400' },
    { id: 'INTERVIEW_REQUESTED', label: 'Interview Requested', color: 'border-indigo-500 text-indigo-600 dark:text-indigo-400' },
    { id: 'REFERRAL_ACCEPTED', label: 'Referral Verified', color: 'border-cyan-500 text-cyan-600 dark:text-cyan-400' },
    { id: 'SCREENING', label: 'Screening', color: 'border-purple-500 text-purple-600 dark:text-purple-400' },
    { id: 'TECHNICAL', label: 'Technical Rounds', color: 'border-amber-500 text-amber-600 dark:text-amber-400' },
    { id: 'OFFER', label: 'Offer Extended', color: 'border-emerald-500 text-emerald-600 dark:text-emerald-400' },
  ];

  const handleAdvanceStatus = async (reqId: string, nextStatus: string) => {
    try {
      await api.updateReferralStatus(reqId, { status: nextStatus, notes: `Status advanced to ${nextStatus}` });
      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to update candidate status.');
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            RECRUITER REVENUE & TALENT PIPELINE
          </span>
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
            Verified Candidate Hiring Pipeline
          </h3>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          {referralRequests.length} active candidates in pipeline
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto pb-4">
        {columns.map((col) => {
          const items = referralRequests.filter((r) => r.status === col.id || (col.id === 'SHORTLISTED' && !r.status));

          return (
            <div
              key={col.id}
              className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 flex flex-col space-y-3 min-w-[200px]"
            >
              {/* Column Header */}
              <div className={`flex items-center justify-between pb-2 border-b-2 ${col.color}`}>
                <h4 className="text-xs font-extrabold font-sans">
                  {col.label}
                </h4>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  {items.length}
                </span>
              </div>

              {/* Column Cards */}
              <div className="space-y-2.5 flex-1 min-h-[160px]">
                {items.length === 0 ? (
                  <div className="py-8 text-center text-[11px] text-slate-400 font-medium">
                    No candidates
                  </div>
                ) : (
                  items.map((item) => {
                    const student = item.studentProfile || {};
                    const user = student.user || {};
                    const score = student.talentScore || 87;

                    return (
                      <div
                        key={item.id}
                        className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-3 shadow-sm hover:shadow-md transition-all space-y-2.5"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                              {user.name || 'Ananya Sharma'}
                            </h5>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                              {student.headline || 'Full Stack Developer'}
                            </p>
                          </div>
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                            {score}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-100 dark:border-slate-700/60">
                          <span>{item.job?.title || 'Software Role'}</span>
                          {col.id !== 'OFFER' && (
                            <button
                              onClick={() => {
                                const nextMap: Record<string, string> = {
                                  SHORTLISTED: 'INTERVIEW_REQUESTED',
                                  INTERVIEW_REQUESTED: 'REFERRAL_ACCEPTED',
                                  REFERRAL_ACCEPTED: 'SCREENING',
                                  SCREENING: 'TECHNICAL',
                                  TECHNICAL: 'OFFER',
                                };
                                handleAdvanceStatus(item.id, nextMap[col.id] || 'OFFER');
                              }}
                              className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 font-bold"
                            >
                              <span>Next</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
