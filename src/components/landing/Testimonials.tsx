import React from 'react';
import { Star } from 'lucide-react';

export const Testimonials: React.FC = () => {
  const testimonials = [
    {
      role: 'STUDENT / CANDIDATE',
      name: 'Ananya Sharma',
      title: 'Full Stack Developer @ TechNova',
      text: '"The best part wasn\'t just getting referred. It was knowing that when a company opened my profile, they could see actual proof of my React and Node.js capability — not just a generic PDF resume."',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120',
    },
    {
      role: 'COMPANY RECRUITER',
      name: 'Sarah Jenkins',
      title: 'Head of Technical Hiring @ TechNova Solutions',
      text: '"We no longer have to judge candidate potential solely by a resume. Hire Me Out\'s AI interview reports and radar scores give us 10x higher confidence before scheduling final rounds."',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120',
    },
    {
      role: 'EMPLOYEE REFERRER',
      name: 'Rohan Verma',
      title: 'Senior Lead Engineer @ TechCorp',
      text: '"I can confidently submit internal referrals now. Because I can inspect the candidate\'s actual skill assessment scores and technical interview reports beforehand, my referral success rate is over 75%."',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120',
    },
  ];

  return (
    <section className="py-20 bg-slate-900/50 border-t border-slate-800 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-mono font-bold text-brand-400 uppercase tracking-wider">
            COMMUNITY & RECRUITER TRUST
          </span>
          <h2 className="text-3xl font-extrabold text-white">Trusted Across the Hiring Lifecycle</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <div key={idx} className="rounded-2xl border border-slate-800 bg-slate-950 p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic">{t.text}</p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-800/80">
                <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover border border-slate-700" />
                <div>
                  <h4 className="font-bold text-white text-sm">{t.name}</h4>
                  <p className="text-[11px] text-brand-300 font-medium">{t.title}</p>
                  <span className="text-[10px] text-slate-400 block uppercase font-mono">{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
