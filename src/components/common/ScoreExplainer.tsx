import React from 'react';
import { HelpCircle, CheckCircle, AlertTriangle, ArrowUpRight } from 'lucide-react';

interface ScoreExplainerProps {
  score: number;
  explanation: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    whyText?: string;
  };
}

export const ScoreExplainer: React.FC<ScoreExplainerProps> = ({ score, explanation }) => {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <HelpCircle className="w-5 h-5 text-brand-400" />
        <h4 className="font-semibold text-slate-100 text-sm">Why this Verified Score? ({score}/100)</h4>
      </div>

      {explanation.whyText && (
        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80 font-mono">
          {explanation.whyText}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        <div className="space-y-2">
          <h5 className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
            <CheckCircle className="w-3.5 h-3.5" /> Verified Strengths
          </h5>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {explanation.strengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-slate-950/40 p-2 rounded border border-emerald-500/10">
                <span className="text-emerald-400 font-bold">•</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses / Improvement Areas */}
        <div className="space-y-2">
          <h5 className="text-xs font-semibold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5" /> Focus Areas
          </h5>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {explanation.weaknesses.map((weak, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-slate-950/40 p-2 rounded border border-amber-500/10">
                <span className="text-amber-400 font-bold">•</span>
                <span>{weak}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recommended Next Actions */}
      {explanation.recommendations && explanation.recommendations.length > 0 && (
        <div className="pt-2 border-t border-slate-800/80">
          <h5 className="text-xs font-semibold text-brand-300 flex items-center gap-1.5 mb-2">
            <ArrowUpRight className="w-3.5 h-3.5" /> Recommended Score Optimization Actions:
          </h5>
          <div className="flex flex-wrap gap-2">
            {explanation.recommendations.map((rec, idx) => (
              <span key={idx} className="inline-flex items-center text-[11px] bg-brand-500/10 text-brand-200 border border-brand-500/20 px-2.5 py-1 rounded-md">
                {rec}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
