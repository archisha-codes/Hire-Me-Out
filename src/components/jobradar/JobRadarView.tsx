import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Radar, Briefcase, Sparkles, ShieldCheck, CheckCircle2, ArrowRight, Building2, AlertCircle } from 'lucide-react';

export const JobRadarView: React.FC = () => {
  const [radarJobs, setRadarJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadRadar = async () => {
      try {
        const data = await api.getJobRadar();
        setRadarJobs(data.radarJobs || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadRadar();
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white p-6 border border-indigo-800/50 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-lg">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-cyan-300 font-mono text-xs font-bold uppercase">
            <Radar className="w-4 h-4 animate-spin text-cyan-400" /> AI JOB RADAR DISCOVERY
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Jobs That Match YOU 👋</h1>
          <p className="text-xs sm:text-sm text-indigo-200">
            Real-time candidate-to-job match scoring based on your Verified Talent Score, AI interview proof, and skill breakdown.
          </p>
        </div>
      </div>

      {/* Radar Job List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-slate-500 font-mono flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600 animate-spin" />
            <span>Scanning job radar for verified matches...</span>
          </div>
        ) : (
          radarJobs.map((item, idx) => {
            const matchPct = item.matchPercentage || 94;
            const matchedSkills = item.requiredSkills?.slice(0, 3) || ['React', 'Node.js', 'SQL'];
            const missingSkill = item.missingSkill || 'Docker';

            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-700 transition-all space-y-4 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center font-black text-indigo-600 dark:text-indigo-300 text-base">
                      {item.companyName ? item.companyName[0] : 'C'}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{item.title}</h3>
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                        {item.companyName} • {item.location}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-50 dark:bg-emerald-950/60 px-3.5 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 text-center font-mono">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-bold">Match Score</span>
                      <span className="text-base font-black text-emerald-600 dark:text-emerald-400">{matchPct}% Match</span>
                    </div>
                    {item.referralAvailable && (
                      <span className="text-xs bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-3 py-1 rounded-full font-bold">
                        Referral Available ✓
                      </span>
                    )}
                  </div>
                </div>

                {/* Why You Match Breakdown */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-2 text-xs">
                  <span className="font-bold text-slate-900 dark:text-white block">Why do you match this role?</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700 dark:text-slate-300 font-medium">
                    {matchedSkills.map((sk: string) => (
                      <div key={sk} className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>Verified skill match: <strong>{sk}</strong></span>
                      </div>
                    ))}
                    <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                      <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Passed AI Technical Interview (85+)</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-[11px] font-mono">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Skill to improve for 100% match: {missingSkill}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-500 font-mono">
                    Salary: <strong className="text-slate-900 dark:text-white">{item.salaryRange || '₹18 - 24 LPA'}</strong>
                  </span>

                  <div className="flex gap-2">
                    <button
                      onClick={() => alert(`Opening details for ${item.title}`)}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white font-bold rounded-xl text-xs"
                    >
                      View Job
                    </button>
                    <button
                      onClick={() => alert(`Requesting referral for ${item.title}`)}
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-600/20"
                    >
                      Get Referred
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
