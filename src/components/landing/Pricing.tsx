import React from 'react';
import { Check, ShieldCheck, Zap, Sparkles } from 'lucide-react';

interface PricingProps {
  onSelectPlan: (planName: string) => void;
}

export const Pricing: React.FC<PricingProps> = ({ onSelectPlan }) => {
  const plans = [
    {
      name: 'FREE',
      price: '₹0',
      period: 'forever',
      desc: 'Build candidate profile & baseline skills assessment',
      features: [
        'Public Verified Profile',
        '1 Basic AI Skill Assessment',
        'Resume Parsing Score',
        'Standard Job Radar Access',
      ],
      cta: 'Start Free',
      popular: false,
    },
    {
      name: 'VERIFIED',
      price: '₹499',
      period: 'one-time',
      desc: 'Complete full AI assessment & AI mock interview for verified badge',
      features: [
        'Everything in Free',
        'Unlimited AI Skill Assessments',
        '6-Round AI Technical Mock Interview',
        'Explainable Verified Talent Score',
        'Talent Tier & Percentile Ranking',
        'Verified Talent Profile Badge',
      ],
      cta: 'Get Verified',
      popular: true,
    },
    {
      name: 'PRO VERIFICATION',
      price: '₹1,499',
      period: 'one-time',
      desc: 'Includes 1-on-1 Human Verification Interview with Senior Tech Lead',
      features: [
        'Everything in Verified',
        '1-on-1 Live Human Tech Interview',
        'Human Verification Badge',
        'Priority Recruiter Discovery',
        'Exportable PDF Interview Report',
      ],
      cta: 'Upgrade to Pro',
      popular: false,
    },
    {
      name: 'RECRUITER & COMPANY',
      price: '₹9,999',
      period: 'per month',
      desc: 'Full candidate discovery, AI matching, & referral requests',
      features: [
        'Unlimited Candidate Search & Filters',
        'AI Candidate-to-Job Match Scoring',
        'Side-by-Side Candidate Comparison',
        'Request Candidate Interviews',
        'Assign Employee Referrers',
        'Talent Pipeline Management',
      ],
      cta: 'Company Access',
      popular: false,
    },
  ];

  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 transition-colors">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 space-y-12">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950 px-3.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Transparent Pricing</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
            Simple Plans for Verified Talent & Recruiters
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Invest in verifiable proof before referral. Flexible plans for candidates, employee referrers, and hiring leads.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`rounded-2xl p-6 flex flex-col justify-between space-y-6 transition-all ${
                plan.popular
                  ? 'bg-white dark:bg-slate-900 border-2 border-indigo-600 shadow-xl shadow-indigo-600/10 relative scale-105'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white font-bold text-[10px] uppercase tracking-wider px-3 py-0.5 rounded-full shadow">
                  Most Popular
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{plan.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 min-h-[36px]">{plan.desc}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">{plan.price}</span>
                  <span className="text-xs text-slate-500 font-mono">/ {plan.period}</span>
                </div>

                <ul className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => onSelectPlan(plan.name)}
                className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all ${
                  plan.popular
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
