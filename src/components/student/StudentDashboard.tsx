import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { TalentScoreBadge } from '../common/TalentScoreBadge';
import { StatusTracker } from '../common/StatusTracker';
import { StudentJourneyTracker } from './StudentJourneyTracker';
import { ScoreExplanationDrawer } from './ScoreExplanationDrawer';
import { InterviewReportModal } from './InterviewReportModal';
import { PaymentSimulatorModal } from '../common/PaymentSimulatorModal';
import { ShieldCheck, Award, ArrowRight, Sparkles, Video, FileText, CheckCircle2, Building2, HelpCircle, Eye, CreditCard } from 'lucide-react';

interface StudentDashboardProps {
  onStartAssessment: () => void;
  onStartInterview: () => void;
  onViewProfile: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onStartAssessment,
  onStartInterview,
  onViewProfile,
}) => {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [isScoreExplanationOpen, setIsScoreExplanationOpen] = useState(false);
  const [isInterviewReportOpen, setIsInterviewReportOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [interviewSession, setInterviewSession] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const pData = await api.getStudentProfile();
        setProfile(pData.student);

        const rData = await api.getMyReferralRequests();
        setRequests(rData.requests || []);
      } catch (err) {
        console.error(err);
      }
    };
    loadData();
  }, []);

  const student = profile || user?.studentProfile || {};
  const score = student.talentScore || 87;
  const tier = student.talentTier || 'Tier A';
  const activeReq = requests[0];

  // Dynamic Profile Strength Calculation
  const calculateProfileStrength = () => {
    let completed = 0;
    let total = 6;
    if (student.headline) completed++;
    if (student.resumeUrl) completed++;
    if (student.github) completed++;
    if (student.projects?.length > 0 || student.projectsScore > 0) completed++;
    if (student.assessmentAttempts?.length > 0 || student.techScore > 0) completed++;
    if (student.interviewSessions?.length > 0 || student.interviewScore > 0) completed++;
    return Math.round((completed / total) * 100);
  };

  const profileStrength = calculateProfileStrength();

  // Dynamic Next Step Determination
  const getNextStepInfo = () => {
    if (profileStrength < 50) {
      return {
        text: 'Complete your profile details & upload resume',
        actionLabel: 'Complete Profile',
        onAction: onViewProfile,
      };
    }
    if (!student.assessmentAttempts || student.assessmentAttempts.length === 0) {
      return {
        text: 'Take your AI Skill Assessment to establish Talent Score',
        actionLabel: 'Start Assessment',
        onAction: onStartAssessment,
      };
    }
    if (!student.interviewSessions || student.interviewSessions.length === 0) {
      return {
        text: 'Complete your AI Technical Interview to unlock Verification Badges',
        actionLabel: 'Start AI Interview',
        onAction: onStartInterview,
      };
    }
    if (student.privacyLevel === 'PRIVATE') {
      return {
        text: 'Your profile is ready! Make your profile employer-visible',
        actionLabel: 'Enable Discovery',
        onAction: onViewProfile,
      };
    }
    if (requests.length > 0) {
      return {
        text: `${requests[0].companyProfile?.companyName || 'TechNova'} shortlisted your verified profile!`,
        actionLabel: 'Review Request',
        onAction: onViewProfile,
      };
    }
    return {
      text: 'You are now live & discoverable to verified recruiters!',
      actionLabel: 'View Verified Profile',
      onAction: onViewProfile,
    };
  };

  const nextStep = getNextStepInfo();

  return (
    <div className="space-y-8">
      {/* Smart Welcome Banner with Soft Gradient */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white p-6 border border-indigo-800/50 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-lg">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-300 font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
              VERIFIED CANDIDATE WORKSPACE
            </span>
            <span className="text-xs text-indigo-200">Profile Strength: <strong className="text-white font-mono">{profileStrength}%</strong></span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome back, {user?.name || 'Ananya'}! 👋
          </h1>

          <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-indigo-200 font-semibold block text-[11px]">NEXT RECOMMENDED STEP:</span>
              <span className="font-bold text-white text-sm">{nextStep.text}</span>
            </div>
            <button
              onClick={nextStep.onAction}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-xl text-xs whitespace-nowrap shadow-md transition-all flex items-center gap-1.5"
            >
              <span>{nextStep.actionLabel}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center md:items-end gap-3 flex-shrink-0">
          <TalentScoreBadge score={score} tier={tier} percentile={student.percentile || 88} humanVerified={student.humanVerified} size="md" />
          <button
            onClick={() => setIsScoreExplanationOpen(true)}
            className="text-xs text-indigo-300 hover:text-white underline font-semibold flex items-center gap-1"
          >
            <HelpCircle className="w-3.5 h-3.5" /> Understand My Score
          </button>
        </div>
      </div>

      {/* Prominent Visual Journey Tracker */}
      <StudentJourneyTracker
        studentProfile={student}
        onNavigateToStage={(stgId) => {
          if (stgId === 'PROFILE') onViewProfile();
          else if (stgId === 'ASSESSMENT') onStartAssessment();
          else if (stgId === 'AI_INTERVIEW') onStartInterview();
          else if (stgId === 'VERIFIED' || stgId === 'DISCOVERABLE') onViewProfile();
        }}
      />

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">Verified Talent Score</span>
          <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">{score}/100</div>
          <button
            onClick={() => setIsScoreExplanationOpen(true)}
            className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
          >
            <span>{tier} • Top 12% Candidate</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">Profile Strength</span>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">{profileStrength}%</div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Core verification evidence complete</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">Recruiter Opportunities</span>
          <div className="text-3xl font-extrabold text-cyan-600 dark:text-cyan-400 font-mono">{requests.length || 2}</div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Shortlisted by TechNova</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">AI Interview Score</span>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">{student.interviewScore || 85}/100</div>
          <button
            onClick={() => {
              setInterviewSession({
                role: student.targetDomain || 'Full Stack Developer',
                overallScore: student.interviewScore || 85,
                recommendation: 'STRONGLY RECOMMENDED',
              });
              setIsInterviewReportOpen(true);
            }}
            className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
          >
            View Evidence Report
          </button>
        </div>
      </div>

      {/* Quick Action Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={onStartAssessment}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left space-y-2 transition-all hover:border-indigo-400 shadow-sm group"
        >
          <div className="inline-flex p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Evaluate My Skills</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Take dynamic AI technical skills assessment</p>
        </button>

        <button
          onClick={onStartInterview}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left space-y-2 transition-all hover:border-indigo-400 shadow-sm group"
        >
          <div className="inline-flex p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
            <Video className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">AI Technical Mock Interview</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">6-round interview generating report card</p>
        </button>

        <button
          onClick={() => setIsPaymentOpen(true)}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left space-y-2 transition-all hover:border-indigo-400 shadow-sm group"
        >
          <div className="inline-flex p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 group-hover:scale-105 transition-transform">
            <CreditCard className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Upgrade to Verified Pro</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Priority recruiter placement & badges</p>
        </button>
      </div>

      {/* Active Pipeline Status Tracker */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
        <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center justify-between">
          <span>Active Company Referral Tracker</span>
          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-mono font-normal">TechNova Solutions (Full Stack Role)</span>
        </h3>
        <StatusTracker
          currentStatus={activeReq ? activeReq.status : 'SCREENING'}
          statusHistory={activeReq && activeReq.statusHistoryJson ? JSON.parse(activeReq.statusHistoryJson) : []}
        />
      </div>

      {/* Score Explanation Drawer */}
      <ScoreExplanationDrawer
        isOpen={isScoreExplanationOpen}
        onClose={() => setIsScoreExplanationOpen(false)}
        score={score}
        tier={tier}
        percentile={student.percentile || 88}
        onImproveScore={onStartAssessment}
      />

      {/* Interview Report Modal */}
      <InterviewReportModal
        isOpen={isInterviewReportOpen}
        onClose={() => setIsInterviewReportOpen(false)}
        session={interviewSession}
      />

      {/* Payment Simulator Modal */}
      <PaymentSimulatorModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        planName="Verified Talent Pro"
        amount={499}
      />
    </div>
  );
};
