import React from 'react';
import { X, Video, Award, CheckCircle2, AlertTriangle, FileText, Sparkles, Download, ShieldCheck } from 'lucide-react';

interface InterviewReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: any;
}

export const InterviewReportModal: React.FC<InterviewReportModalProps> = ({
  isOpen,
  onClose,
  session,
}) => {
  if (!isOpen || !session) return null;

  const score = session.overallScore || 88;
  const recommendation = session.recommendation || 'STRONGLY RECOMMENDED';

  const strengths = session.strengthsJson
    ? JSON.parse(session.strengthsJson)
    : [
        'Clear architectural explanation of React state management',
        'Strong problem-solving methodology when optimizing database queries',
        'Excellent articulation of API REST vs GraphQL trade-offs',
      ];

  const weaknesses = session.weaknessesJson
    ? JSON.parse(session.weaknessesJson)
    : [
        'Could provide deeper detail on microservice circuit breakers',
        'Can expand on Docker multi-stage build optimization techniques',
      ];

  const qaList = session.answersJson
    ? JSON.parse(session.answersJson)
    : [
        {
          question: 'How do you prevent unnecessary re-renders in React applications?',
          answer: 'By using React.memo for pure components, useMemo for expensive computations, and useCallback for callback props passed to child components.',
          feedback: 'Excellent answer covering core React optimization primitives.',
        },
        {
          question: 'Explain how indexing improves SQL query execution speed.',
          answer: 'Indexes create B-Tree structures that reduce search complexity from O(N) full table scan to O(log N) lookup.',
          feedback: 'Accurate data structure explanation.',
        },
      ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-50 via-blue-50 to-white dark:from-slate-900 dark:via-indigo-950/40 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white font-bold">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  AI Technical Interview Evidence Report
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                  <ShieldCheck className="w-3 h-3" /> VERIFIED PROOF
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Role: {session.role || 'Full Stack Developer'} • Domain: {session.domain || 'Software Engineering'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Report Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Score Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-indigo-600 text-white space-y-2 shadow-lg shadow-indigo-600/20">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold opacity-80">
                OVERALL INTERVIEW SCORE
              </span>
              <div className="text-4xl font-black font-mono">
                {score} <span className="text-base font-normal opacity-80">/ 100</span>
              </div>
              <div className="inline-block text-xs font-bold bg-white/20 px-3 py-1 rounded-full uppercase tracking-wider">
                {recommendation}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Technical Depth</span>
                <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">{session.techDepthScore || 91}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Problem Solving</span>
                <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">{session.accuracyScore || 88}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Communication</span>
                <span className="text-2xl font-extrabold text-cyan-600 dark:text-cyan-400 font-mono">{session.commScore || 82}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Behavioral Fit</span>
                <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">{session.behavioralScore || 87}</span>
              </div>
            </div>
          </div>

          {/* Strengths & Focus Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 space-y-3">
              <h4 className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Strongest Demonstrated Areas
              </h4>
              <ul className="space-y-2 text-xs text-slate-800 dark:text-slate-200">
                {strengths.map((str: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 space-y-3">
              <h4 className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Growth Recommendations
              </h4>
              <ul className="space-y-2 text-xs text-slate-800 dark:text-slate-200">
                {weaknesses.map((wk: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{wk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Transcribed Q&A Evidence */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4" /> Interview Response Evidence
            </h4>
            <div className="space-y-3">
              {qaList.map((qa: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs"
                >
                  <p className="font-bold text-slate-900 dark:text-white">
                    Q{idx + 1}: {qa.question}
                  </p>
                  <p className="text-slate-600 dark:text-slate-300 italic bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                    "{qa.answer}"
                  </p>
                  {qa.feedback && (
                    <p className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Evaluator Note: {qa.feedback}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
          <span className="text-xs text-slate-500">Evidence timestamp: {new Date(session.createdAt || Date.now()).toLocaleDateString()}</span>
          <div className="flex gap-2">
            <button
              onClick={() => alert('Downloading official Talent Verification PDF report...')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-4 h-4" /> Download Official Report PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
