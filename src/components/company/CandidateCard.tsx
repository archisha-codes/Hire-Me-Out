import React from 'react';
import { ShieldCheck, Video, Award, Star, CheckCircle2, ArrowRight } from 'lucide-react';

interface CandidateCardProps {
  candidate: any;
  onViewProfile: (candidate: any) => void;
  onShortlist: (candidate: any) => void;
  onRequestInterview: (candidate: any) => void;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  onViewProfile,
  onShortlist,
  onRequestInterview,
}) => {
  const user = candidate.user || {};
  const score = candidate.talentScore || 87;
  const tier = candidate.talentTier || 'Tier A';
  const matchPct = candidate.roleMatch || Math.min(99, Math.max(75, Math.round(score * 1.05)));

  const skills = candidate.skills?.length > 0
    ? candidate.skills.map((s: any) => typeof s === 'string' ? s : s.name)
    : ['React', 'Node.js', 'Python', 'SQL', 'TypeScript'];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm hover:shadow-md dark:hover:border-slate-700 hover:border-indigo-200 transition-all duration-200 flex flex-col justify-between space-y-4 group">
      {/* Top Header */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white font-black flex items-center justify-center text-base shadow-md shadow-indigo-600/20">
              {user.name ? user.name[0] : 'C'}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {user.name || 'Candidate Name'}
                </h3>
                {candidate.humanVerified && (
                  <span className="p-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" title="Human Verified">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {candidate.headline || 'Full Stack Developer'}
              </p>
              <p className="text-[11px] text-slate-400 font-mono">
                {candidate.college || 'IIT Bangalore'} {candidate.cgpa ? `• CGPA ${candidate.cgpa}` : ''}
              </p>
            </div>
          </div>

          <div className="text-right flex flex-col items-end">
            <div className="px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="font-mono font-black text-sm">{score}</span>
              <span className="text-[10px] font-bold uppercase">{tier}</span>
            </div>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
              {matchPct}% Role Match
            </span>
          </div>
        </div>

        {/* Proof Metrics Row */}
        <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-center">
          <div>
            <span className="text-[10px] text-slate-400 font-mono block">Tech Depth</span>
            <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">{candidate.techScore || 91}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-mono block">Problem Solving</span>
            <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">{candidate.problemSolvingScore || 88}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-mono block">AI Interview</span>
            <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">{candidate.interviewScore || 85}</span>
          </div>
        </div>

        {/* Skills Chips */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {skills.slice(0, 5).map((skill: string) => (
            <span
              key={skill}
              className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium"
            >
              {skill}
            </span>
          ))}
        </div>

        {/* Verification Badges Row */}
        <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400 pt-1">
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" /> Skill Verified
          </span>
          <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
            <Video className="w-3.5 h-3.5" /> AI Interview ✓
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-3 gap-2">
        <button
          onClick={() => onViewProfile(candidate)}
          className="py-2 px-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold rounded-xl text-xs transition-colors text-center"
        >
          View Proof
        </button>
        <button
          onClick={() => onShortlist(candidate)}
          className="py-2 px-2 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-300 font-bold rounded-xl text-xs transition-colors border border-indigo-200 dark:border-indigo-800 text-center"
        >
          Shortlist
        </button>
        <button
          onClick={() => onRequestInterview(candidate)}
          className="py-2 px-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm text-center"
        >
          Interview
        </button>
      </div>
    </div>
  );
};
