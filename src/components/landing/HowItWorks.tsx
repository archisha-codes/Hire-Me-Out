import React, { useState } from 'react';
import { User, Building2, UserCheck, Sparkles } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const [activeRole, setActiveRole] = useState<'STUDENT' | 'COMPANY' | 'EMPLOYEE'>('STUDENT');

  const studentSteps = [
    { num: '01', title: 'Create Profile & Upload Resume', desc: 'Complete 12-step onboarding wizard. AI automatically parses skills, experience, and certifications.' },
    { num: '02', title: 'Take AI Skill Assessment', desc: 'Engage in dynamic MCQ, coding, scenario, and debugging evaluations tailored to your target role.' },
    { num: '03', title: 'Complete AI Technical Interview', desc: '6-round mock technical interview generating an explainable Verified Talent Score and Report Card.' },
    { num: '04', title: 'Get Discovered & Referred', desc: 'Recruiters discover your proof points, request interviews, and employee referrers lodge trusted referrals.' },
  ];

  const companySteps = [
    { num: '01', title: 'Post Role Requirements', desc: 'Define target job, required skills, preferred qualifications, and salary range.' },
    { num: '02', title: 'Filter Verified Talent', desc: 'Search candidates by Talent Score, Tier, CGPA, specific skills, and AI interview performance.' },
    { num: '03', title: 'Review Verified Proof', desc: 'Inspect candidate radar charts, AI interview report cards, and code project proof before interviewing.' },
    { num: '04', title: 'Request Interview & Move to Referral', desc: 'Connect directly with top candidates and assign company employees to submit internal referrals.' },
  ];

  const employeeSteps = [
    { num: '01', title: 'Receive Verified Referral Requests', desc: 'View pre-screened candidates interested in your company.' },
    { num: '02', title: 'Review Candidate Proof Points', desc: 'Inspect AI assessment scores, interview reports, and project verification before deciding.' },
    { num: '03', title: 'Submit Internal Company Referral', desc: 'Confidently submit candidate to your company internal HR portal.' },
    { num: '04', title: 'Track Outcome & Rewards', desc: 'Monitor candidate interview progress and earn verified referral rewards.' },
  ];

  const steps = activeRole === 'STUDENT' ? studentSteps : activeRole === 'COMPANY' ? companySteps : employeeSteps;

  return (
    <section className="py-20 bg-slate-950 relative w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 space-y-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3.5 py-1 text-xs font-semibold text-brand-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>End-to-End Verified Talent Pipeline</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">How Hire Me Out Works</h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Establishing trust between candidates, hiring leads, and employee referrers through AI skill verification.
          </p>

          {/* Role Tab Switcher */}
          <div className="inline-flex flex-wrap justify-center p-1.5 rounded-xl bg-slate-900 border border-slate-800 gap-2 mt-4">
            <button
              onClick={() => setActiveRole('STUDENT')}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeRole === 'STUDENT' ? 'bg-brand-600 text-white shadow-md font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" /> For Candidates
            </button>
            <button
              onClick={() => setActiveRole('COMPANY')}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeRole === 'COMPANY' ? 'bg-brand-600 text-white shadow-md font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" /> For Recruiters & Companies
            </button>
            <button
              onClick={() => setActiveRole('EMPLOYEE')}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeRole === 'EMPLOYEE' ? 'bg-brand-600 text-white shadow-md font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" /> For Employee Referrers
            </button>
          </div>
        </div>

        {/* 4 Step Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 hover:border-brand-500/40 transition-all group">
              <div className="text-3xl font-extrabold text-brand-400 font-mono group-hover:scale-105 transition-transform">
                {step.num}
              </div>
              <h3 className="text-base font-bold text-white leading-snug">{step.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
