import React from 'react';
import { Users, Building2, UserCheck, Award } from 'lucide-react';

export const Metrics: React.FC = () => {
  const stats = [
    { label: 'Verified Candidates', value: '10K+', icon: Users, desc: 'Profiles evaluated via AI assessments' },
    { label: 'Company Leads & Recruiters', value: '500+', icon: Building2, desc: 'Actively searching verified talent' },
    { label: 'Company Employee Referrers', value: '250+', icon: UserCheck, desc: 'Reviewing candidates before referral' },
    { label: 'Shortlist to Interview Rate', value: '85%', icon: Award, desc: 'High trust signal over unverified resumes' },
  ];

  return (
    <section className="py-12 border-y border-slate-800/80 bg-slate-950/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
                <div className="inline-flex p-3 rounded-xl bg-brand-500/10 text-brand-400 mb-1">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-3xl font-extrabold text-white font-mono">{stat.value}</div>
                <div className="text-sm font-semibold text-slate-200">{stat.label}</div>
                <div className="text-xs text-slate-400">{stat.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
