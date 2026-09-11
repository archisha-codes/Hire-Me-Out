import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs py-12 w-full transition-colors">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-slate-900 dark:text-white text-base uppercase tracking-tight">Hire Me <span className="text-indigo-600 dark:text-indigo-400">Out</span></span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
              Don't just get referred. Get verified first. Prove your skills, get discovered, and build trusted employee referrals.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-3">Platform Features</h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>For Students & Candidates</li>
              <li>For Companies & Recruiters</li>
              <li>For Employee Referrers</li>
              <li>AI Job Radar</li>
              <li>Pricing & Plans</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-3">Verification Engine</h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>Candidate Skill Assessments</li>
              <li>AI Technical Mock Interviews</li>
              <li>Explainable Verified Talent Score</li>
              <li>Referral Journey Pipeline</li>
              <li>Human Verification Badges</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-3">Core Philosophy</h4>
            <p className="text-slate-600 dark:text-slate-400 text-xs italic bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              "Prove your skills. Get discovered. Get referred. Companies should see the candidate's journey, not just the candidate's CV."
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div>© {new Date().getFullYear()} Hire Me Out. All rights reserved. Verified Talent Discovery & Referral Platform.</div>
          <div className="flex gap-4 cursor-pointer">
            <span className="hover:text-slate-900 dark:hover:text-slate-300">Privacy Policy</span>
            <span className="hover:text-slate-900 dark:hover:text-slate-300">Terms of Service</span>
            <span className="hover:text-slate-900 dark:hover:text-slate-300">Security & Compliance</span>
            <span className="hover:text-slate-900 dark:hover:text-slate-300">Contact Support</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

