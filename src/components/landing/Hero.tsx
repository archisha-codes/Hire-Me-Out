import React from 'react';
import { TalentScoreBadge } from '../common/TalentScoreBadge';
import { RadarChart } from '../common/RadarChart';
import { ShieldCheck, ArrowRight, Sparkles, CheckCircle2, Search, Award, UserCheck, Building2, User } from 'lucide-react';

interface HeroProps {
  onStartOnboarding: () => void;
  onExploreDiscovery: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartOnboarding, onExploreDiscovery }) => {
  return (
    <section className="relative pt-10 pb-20 overflow-hidden w-full bg-soft-gradient transition-colors">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-500/10 dark:bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 relative z-10 space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Copy & Conversion */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 dark:border-indigo-800 bg-white/80 dark:bg-indigo-950/80 px-3.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-300 shadow-sm backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Hire Me Out — Verified Talent Network</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              Don't just get referred.{' '}
              <span className="text-brand-gradient">
                Get verified first.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 max-w-3xl leading-relaxed font-normal">
              Prove your skills through AI-powered assessments and interviews, build a trusted professional profile, and get discovered by companies looking for real talent — <span className="font-semibold text-slate-900 dark:text-white">not just an unverified CV</span>.
            </p>

            <div className="p-4.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm backdrop-blur-md max-w-2xl space-y-1.5">
              <div className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-extrabold uppercase tracking-wider">
                CORE PHILOSOPHY
              </div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 italic">
                "Proof before referral. Companies should see the candidate's journey, not just the candidate's CV."
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onStartOnboarding}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm sm:text-base transition-all shadow-md shadow-indigo-600/20 hover:-translate-y-0.5"
              >
                <span>Build My Verified Profile</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onExploreDiscovery}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-sm sm:text-base transition-all shadow-sm"
              >
                <Search className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>Discover Verified Talent</span>
              </button>
            </div>

            {/* Trust Bullet Badges */}
            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>AI Skill Assessment</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>AI Technical Mock Interview</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Verified Talent Score</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Trusted Employee Referrals</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Card Widget */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl space-y-6">
              
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo-600/10 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center font-black text-indigo-600 dark:text-indigo-300 text-lg">
                    AS
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Ananya Sharma</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Full Stack Developer | IIT Bangalore</p>
                  </div>
                </div>
                <span className="text-xs bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-full font-bold">
                  Verified Talent
                </span>
              </div>

              {/* Verified Score & Badges */}
              <div className="space-y-2">
                <TalentScoreBadge score={87} tier="Tier A" percentile={88} humanVerified={true} size="md" />
              </div>

              {/* Mini Radar Chart */}
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <RadarChart
                  scores={{
                    techScore: 91,
                    problemSolvingScore: 88,
                    commScore: 79,
                    projectsScore: 93,
                    interviewScore: 85,
                  }}
                  height={180}
                />
              </div>

              {/* Match Card snippet */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-indigo-950/60 p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <span className="text-slate-800 dark:text-slate-200 font-bold">Full Stack Developer Match</span>
                </div>
                <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">94% Match</span>
              </div>
            </div>
          </div>

        </div>

        {/* Three-Sided Marketplace Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 inline-block font-bold">
              <User className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">FOR STUDENTS</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              "Prove what you can do." Pass AI technical assessments, complete mock interviews, and build a verified profile recruiters trust.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <div className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 inline-block font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">FOR COMPANIES</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              "Discover talent beyond resumes." Filter candidates by verified technical score, interview evidence, and role match percentage.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 inline-block font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">FOR EMPLOYEES</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              "Refer people you can trust." Review candidate verification proof before lodging company referrals and earning referral bonuses.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
