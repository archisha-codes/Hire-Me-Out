import React from 'react';
import { X, CheckCircle2, ArrowRight, TrendingUp, Sparkles, ShieldCheck, Target } from 'lucide-react';

interface ScoreExplanationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  score: number;
  tier: string;
  percentile: number;
  breakdown?: {
    tech: number;
    problemSolving: number;
    comm: number;
    projects: number;
    interview: number;
  };
  onImproveScore?: () => void;
}

export const ScoreExplanationDrawer: React.FC<ScoreExplanationDrawerProps> = ({
  isOpen,
  onClose,
  score,
  tier,
  percentile,
  breakdown = { tech: 91, problemSolving: 88, comm: 79, projects: 93, interview: 85 },
  onImproveScore,
}) => {
  if (!isOpen) return null;

  const strengths = [
    'Strong React & JavaScript core fundamentals',
    'High coding accuracy in data structure assessments',
    'Demonstrated full-stack project building evidence',
    'Clear technical explanation during AI interviews',
  ];

  const focusAreas = [
    'Distributed systems & rate-limiting concepts',
    'Database index optimization & SQL query tuning',
    'Asynchronous messaging queues (RabbitMQ / Kafka)',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl p-6 overflow-y-auto space-y-6 flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Why Your Score is {score}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {tier} • Top {100 - Math.round(percentile)}% Candidate
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

          {/* Overall Score Highlight */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 via-blue-50 to-teal-50 dark:from-slate-800 dark:via-indigo-950/50 dark:to-slate-900 border border-indigo-100 dark:border-indigo-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                VERIFIED TALENT SCORE
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-600 text-white">
                {tier}
              </span>
            </div>
            <div className="text-4xl font-black text-slate-900 dark:text-white font-mono">
              {score} <span className="text-sm font-normal text-slate-500">/ 100</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Your score is evaluated dynamically across 5 verified proof dimensions using standardized AI assessments, technical mock interviews, and repository analysis.
            </p>
          </div>

          {/* Breakdown Bars */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Score Breakdown
            </h4>

            {[
              { label: 'Technical Core', value: breakdown.tech, color: 'bg-indigo-600' },
              { label: 'Problem Solving', value: breakdown.problemSolving, color: 'bg-blue-600' },
              { label: 'Projects Proof', value: breakdown.projects, color: 'bg-cyan-500' },
              { label: 'AI Technical Interview', value: breakdown.interview, color: 'bg-emerald-500' },
              { label: 'Communication Depth', value: breakdown.comm, color: 'bg-amber-500' },
            ].map((metric) => (
              <div key={metric.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>{metric.label}</span>
                  <span className="font-mono font-bold">{metric.value}/100</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full ${metric.color} rounded-full transition-all duration-500`}
                    style={{ width: `${metric.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Key Strengths */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Validated Strengths
            </h4>
            <div className="space-y-2">
              {strengths.map((str) => (
                <div
                  key={str}
                  className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 text-xs font-medium text-slate-800 dark:text-slate-200 flex items-start gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{str}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Focus Areas */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-4 h-4" /> Focus Areas To Unlock Tier A+
            </h4>
            <div className="space-y-2">
              {focusAreas.map((fa) => (
                <div
                  key={fa}
                  className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-xs font-medium text-slate-800 dark:text-slate-200 flex items-start gap-2"
                >
                  <ArrowRight className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <span>{fa}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-slate-800 text-xs text-indigo-900 dark:text-indigo-200 flex items-center justify-between">
            <span className="font-semibold">Next Best Action:</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">Complete Backend Assessment</span>
          </div>
          <button
            onClick={() => {
              if (onImproveScore) onImproveScore();
              onClose();
            }}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Improve My Score Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
