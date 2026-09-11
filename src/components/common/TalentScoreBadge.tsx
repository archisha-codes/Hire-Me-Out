import React from 'react';
import { ShieldCheck, Award, Sparkles, CheckCircle2 } from 'lucide-react';

interface TalentScoreBadgeProps {
  score: number;
  tier?: string;
  percentile?: number;
  humanVerified?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export const TalentScoreBadge: React.FC<TalentScoreBadgeProps> = ({
  score,
  tier = 'Tier A',
  percentile = 88,
  humanVerified = true,
  size = 'md',
  showDetails = true,
}) => {
  let badgeGradient = 'from-indigo-600 to-blue-600';
  let tierBadgeBg = 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';

  if (score >= 90) {
    badgeGradient = 'from-amber-500 via-emerald-500 to-cyan-500';
    tierBadgeBg = 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
  } else if (score < 75) {
    badgeGradient = 'from-slate-500 to-slate-700';
    tierBadgeBg = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';
  }

  const isSmall = size === 'sm';
  const isLarge = size === 'lg';

  return (
    <div className="inline-flex items-center gap-3">
      {/* Score Badge */}
      <div className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br ${badgeGradient} p-[2px] shadow-md`}>
        <div className={`flex items-center gap-2 rounded-[14px] bg-white dark:bg-slate-950 ${isSmall ? 'px-2.5 py-1 text-xs' : isLarge ? 'px-4 py-2 text-lg' : 'px-3 py-1.5 text-sm'} font-bold text-slate-900 dark:text-white backdrop-blur-md`}>
          <ShieldCheck className={`${isSmall ? 'w-3.5 h-3.5' : isLarge ? 'w-5 h-5' : 'w-4 h-4'} text-indigo-600 dark:text-indigo-400`} />
          <span>Verified Score</span>
          <span className={`font-mono font-black ${isSmall ? 'text-sm' : isLarge ? 'text-2xl' : 'text-base'} text-indigo-600 dark:text-indigo-400`}>
            {score}
          </span>
          <span className="text-xs text-slate-400">/100</span>
        </div>
      </div>

      {/* Tier & Details */}
      {showDetails && (
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold ${tierBadgeBg}`}>
            <Award className="w-3 h-3" />
            {tier}
          </span>
          {percentile > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 dark:bg-cyan-950 border border-cyan-200 dark:border-cyan-800 px-2.5 py-0.5 text-xs font-bold text-cyan-700 dark:text-cyan-300">
              <Sparkles className="w-3 h-3" />
              Top {Math.round(100 - percentile)}%
            </span>
          )}
          {humanVerified && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Human Verified
            </span>
          )}
        </div>
      )}
    </div>
  );
};

