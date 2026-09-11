import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const FAQ: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does the Verified Talent Score work?',
      a: 'The Verified Talent Score (0-100) is generated after evaluating candidate technical knowledge, problem solving accuracy, coding/debugging capabilities, communication clarity, project proof points, and AI mock interview performance using weighted domain scoring matrices.'
    },
    {
      q: 'Is a high Talent Score a guarantee of employment?',
      a: 'No. A high score is a verified, transparent signal of capability designed to create trust between candidates, recruiters, and referrers — not a guarantee of employment or hiring outcomes.'
    },
    {
      q: 'Why is referral the final step instead of the first step?',
      a: 'Traditional referral marketplaces encourage employees to refer resumes blindly without knowing candidate quality. Hire Me Out verifies actual capability first through AI assessments and interviews, ensuring referrers only refer candidates they can stand behind.'
    },
    {
      q: 'How do company leads discover candidates?',
      a: 'Recruiters can filter candidates by target domain, specific skills, Talent Score, Talent Tier, CGPA, university, and verification badges. They can inspect full radar charts, project code repositories, and downloadable AI interview reports.'
    },
    {
      q: 'Can students control who views their private profile information?',
      a: 'Yes! Students maintain full privacy control over their contact phone number, email, and detailed profile visibility (Public, Verified Employers Only, Referral-Only, or Private).'
    },
    {
      q: 'What happens if AI API services are offline?',
      a: 'Hire Me Out is built with a provider-agnostic AI engine coupled with a deterministic fallback system. All resume parsing, assessment scoring, and interview report generation remain 100% functional out-of-the-box.'
    }
  ];

  return (
    <section className="py-20 bg-slate-950 border-t border-slate-800 w-full">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3.5 py-1 text-xs font-semibold text-brand-300">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div key={idx} className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-4 text-left font-semibold text-white text-sm flex items-center justify-between gap-4 hover:bg-slate-800/50 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-brand-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-300 border-t border-slate-800/80 leading-relaxed bg-slate-950/40">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
