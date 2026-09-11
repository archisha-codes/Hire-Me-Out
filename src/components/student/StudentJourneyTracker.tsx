import React, { useState } from 'react';
import { CheckCircle2, Circle, Lock, ArrowRight, ShieldCheck, Sparkles, Video, UserCheck, Eye, Building2, Briefcase, Award } from 'lucide-react';

export interface JourneyStage {
  id: string;
  label: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'LOCKED';
  description: string;
  icon: React.ReactNode;
  actionText?: string;
}

interface StudentJourneyTrackerProps {
  currentStageId?: string;
  studentProfile: any;
  onNavigateToStage?: (stageId: string) => void;
}

export const StudentJourneyTracker: React.FC<StudentJourneyTrackerProps> = ({
  currentStageId = 'ASSESSMENT',
  studentProfile,
  onNavigateToStage,
}) => {
  const [selectedStage, setSelectedStage] = useState<JourneyStage | null>(null);

  // Compute status based on profile data
  const isProfileComplete = Boolean(studentProfile?.onboardingComplete || studentProfile?.headline);
  const isAssessmentDone = Boolean(studentProfile?.assessmentAttempts?.length > 0 || (studentProfile?.talentScore > 0));
  const isInterviewDone = Boolean(studentProfile?.interviewSessions?.length > 0 || (studentProfile?.interviewScore > 0));
  const isVerified = Boolean(studentProfile?.humanVerified || isInterviewDone);
  const isDiscoverable = studentProfile?.privacyLevel !== 'PRIVATE';

  const stages: JourneyStage[] = [
    {
      id: 'PROFILE',
      label: 'Build Profile',
      status: isProfileComplete ? 'COMPLETED' : 'IN_PROGRESS',
      description: 'Upload resume and complete basic education, skills, and projects.',
      icon: <UserCheck className="w-4 h-4" />,
      actionText: 'Edit Profile',
    },
    {
      id: 'ASSESSMENT',
      label: 'Prove Skills',
      status: isAssessmentDone ? 'COMPLETED' : isProfileComplete ? 'IN_PROGRESS' : 'LOCKED',
      description: 'Take 20-min AI Technical Assessment evaluating MCQ and code accuracy.',
      icon: <Sparkles className="w-4 h-4" />,
      actionText: 'Start Assessment',
    },
    {
      id: 'AI_INTERVIEW',
      label: 'AI Interview',
      status: isInterviewDone ? 'COMPLETED' : isAssessmentDone ? 'IN_PROGRESS' : 'LOCKED',
      description: 'Complete 6-round technical & behavioral interview with AI interviewer.',
      icon: <Video className="w-4 h-4" />,
      actionText: 'Start AI Interview',
    },
    {
      id: 'VERIFIED',
      label: 'Verified Talent',
      status: isVerified ? 'COMPLETED' : isInterviewDone ? 'IN_PROGRESS' : 'LOCKED',
      description: 'Talent Score calculated & verified badges unlocked.',
      icon: <ShieldCheck className="w-4 h-4" />,
      actionText: 'View Badges',
    },
    {
      id: 'DISCOVERABLE',
      label: 'Employer Discovery',
      status: isDiscoverable ? 'COMPLETED' : isVerified ? 'IN_PROGRESS' : 'LOCKED',
      description: 'Opt-in to allow verified recruiters to discover your proof profile.',
      icon: <Eye className="w-4 h-4" />,
      actionText: 'Toggle Discovery',
    },
    {
      id: 'COMPANY_INTEREST',
      label: 'Company Interest',
      status: 'IN_PROGRESS',
      description: 'Recruiters view, shortlist, or request interviews.',
      icon: <Building2 className="w-4 h-4" />,
      actionText: 'View Shortlists',
    },
    {
      id: 'INTERVIEW',
      label: 'Company Interview',
      status: 'LOCKED',
      description: 'Direct recruiter technical & culture fit interview rounds.',
      icon: <Briefcase className="w-4 h-4" />,
    },
    {
      id: 'REFERRAL',
      label: 'Employee Referral',
      status: 'LOCKED',
      description: 'Verified employee reviews proof and submits internal referral.',
      icon: <UserCheck className="w-4 h-4" />,
    },
    {
      id: 'OFFER',
      label: 'Job Offer',
      status: 'LOCKED',
      description: 'Formal employment offer extended by company.',
      icon: <Award className="w-4 h-4" />,
    },
  ];

  const handleNodeClick = (stage: JourneyStage) => {
    setSelectedStage(stage);
    if (stage.status !== 'LOCKED' && onNavigateToStage) {
      onNavigateToStage(stage.id);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            CANDIDATE VERIFICATION PIPELINE
          </span>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            Your Verified Journey
          </h3>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          "Proof before referral"
        </div>
      </div>

      {/* Horizontal Scrollable Pipeline Nodes */}
      <div className="overflow-x-auto pb-2 scrollbar-none">
        <div className="flex items-center gap-2 min-w-[700px] py-2">
          {stages.map((stg, idx) => {
            const isLast = idx === stages.length - 1;

            let nodeBg = 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700';
            if (stg.status === 'COMPLETED') {
              nodeBg = 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700';
            } else if (stg.status === 'IN_PROGRESS') {
              nodeBg = 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-300 dark:border-indigo-600 ring-2 ring-indigo-500/20';
            }

            return (
              <React.Fragment key={stg.id}>
                <button
                  onClick={() => handleNodeClick(stg)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all hover:scale-105 ${nodeBg}`}
                >
                  <div className="flex-shrink-0">
                    {stg.status === 'COMPLETED' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : stg.status === 'IN_PROGRESS' ? (
                      <div className="w-3.5 h-3.5 rounded-full bg-indigo-500 animate-pulse" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>
                  <span className="whitespace-nowrap font-sans">{stg.label}</span>
                </button>

                {!isLast && (
                  <ArrowRight className={`w-3.5 h-3.5 flex-shrink-0 ${stg.status === 'COMPLETED' ? 'text-emerald-400' : 'text-slate-300 dark:text-slate-700'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Selected Stage Detail Drawer / Info */}
      {selectedStage && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              {selectedStage.icon}
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{selectedStage.label}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase font-bold ${
                  selectedStage.status === 'COMPLETED'
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                    : selectedStage.status === 'IN_PROGRESS'
                    ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}>
                  {selectedStage.status}
                </span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {selectedStage.description}
              </p>
            </div>
          </div>

          {selectedStage.status !== 'LOCKED' && selectedStage.actionText && onNavigateToStage && (
            <button
              onClick={() => onNavigateToStage(selectedStage.id)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold whitespace-nowrap shadow-sm"
            >
              {selectedStage.actionText}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
