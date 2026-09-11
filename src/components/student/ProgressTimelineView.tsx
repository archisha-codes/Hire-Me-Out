import React from 'react';
import { Calendar, TrendingUp, Award, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface ProgressTimelineViewProps {
  timeline?: any[];
  currentScore?: number;
  tier?: string;
}

export const ProgressTimelineView: React.FC<ProgressTimelineViewProps> = ({
  timeline = [],
  currentScore = 87,
  tier = 'Tier A',
}) => {
  const defaultTimeline = [
    { id: '1', date: 'March 2, 2026', title: 'Profile Established', type: 'PROFILE', score: 72, description: 'Created initial candidate profile & preferences.' },
    { id: '2', date: 'March 7, 2026', title: 'AI Resume Parsing', type: 'RESUME', score: 82, description: 'Resume parsed with Quality Score 82/100.' },
    { id: '3', date: 'March 15, 2026', title: 'Software Dev AI Assessment', type: 'ASSESSMENT', score: 91, description: 'Completed technical assessment with score 91/100.' },
    { id: '4', date: 'March 22, 2026', title: 'AI Mock Interview Completed', type: 'INTERVIEW', score: 85, description: '6-round mock technical interview verified.' },
    { id: '5', date: 'April 4, 2026', title: 'Talent Score Upgraded', type: 'TIER', score: 87, description: 'Talent Tier upgraded to Tier A (Top 12% percentile).' },
  ];

  const items = timeline.length > 0 ? timeline : defaultTimeline;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-brand-400 font-mono text-xs font-semibold uppercase">
            <TrendingUp className="w-4 h-4" /> Real-time Capability Evolution
          </div>
          <h2 className="text-2xl font-extrabold text-white">How Your Verified Talent Profile Has Evolved</h2>
          <p className="text-xs text-slate-400 mt-1">Recruiters see your candidate journey, progression velocity, and milestones over time.</p>
        </div>

        <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-center">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Current Score</span>
            <span className="text-2xl font-extrabold text-brand-300">{currentScore}</span>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Tier</span>
            <span className="text-xs font-bold text-emerald-400">{tier}</span>
          </div>
        </div>
      </div>

      {/* Timeline List */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
        {items.map((evt, idx) => (
          <div key={idx} className="relative group">
            {/* Circle Node */}
            <div className="absolute -left-6 top-1.5 w-5 h-5 rounded-full bg-brand-600 border-2 border-slate-900 flex items-center justify-center text-white shadow-md">
              <CheckCircle2 className="w-3 h-3" />
            </div>

            {/* Event Card */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 hover:border-brand-500/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-brand-400" /> {evt.date}
                </span>
                <span className="text-xs font-mono font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30 px-2.5 py-0.5 rounded">
                  Score: {evt.score}
                </span>
              </div>
              <h3 className="font-bold text-white text-sm">{evt.title}</h3>
              <p className="text-xs text-slate-300">{evt.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
