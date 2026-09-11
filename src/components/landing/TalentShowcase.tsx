import React from 'react';
import { TalentScoreBadge } from '../common/TalentScoreBadge';
import { RadarChart } from '../common/RadarChart';
import { CheckCircle2, ArrowRight, ExternalLink, Code2 } from 'lucide-react';

interface ShowcaseCandidate {
  name: string;
  role: string;
  college: string;
  cgpa: number;
  score: number;
  tier: string;
  tech: number;
  ps: number;
  comm: number;
  proj: number;
  interview: number;
  skills: string[];
  humanVerified: boolean;
}

export const TalentShowcase: React.FC<{ onExplore: () => void }> = ({ onExplore }) => {
  const showcaseData: ShowcaseCandidate[] = [
    {
      name: 'Ananya Sharma',
      role: 'Full Stack Developer',
      college: 'IIT Bangalore (CGPA 9.1)',
      cgpa: 9.1,
      score: 87,
      tier: 'Tier A',
      tech: 91,
      ps: 88,
      comm: 79,
      proj: 93,
      interview: 85,
      skills: ['React', 'Node.js', 'TypeScript', 'SQL', 'AWS'],
      humanVerified: true,
    },
    {
      name: 'Rahul Sharma',
      role: 'Software Engineer (Backend)',
      college: 'IIT Delhi (CGPA 9.4)',
      cgpa: 9.4,
      score: 92,
      tier: 'Tier S',
      tech: 94,
      ps: 91,
      comm: 88,
      proj: 95,
      interview: 90,
      skills: ['Go', 'Python', 'PostgreSQL', 'Redis', 'Docker'],
      humanVerified: true,
    },
    {
      name: 'Priya Patel',
      role: 'AI / ML Engineer',
      college: 'BITS Pilani (CGPA 9.3)',
      cgpa: 9.3,
      score: 94,
      tier: 'Tier S',
      tech: 96,
      ps: 94,
      comm: 86,
      proj: 92,
      interview: 91,
      skills: ['Python', 'PyTorch', 'Vector DBs', 'TensorFlow'],
      humanVerified: true,
    }
  ];

  return (
    <section className="py-20 bg-slate-900/40 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <span className="text-xs font-mono font-bold text-brand-400 uppercase tracking-wider">
              VERIFIED CANDIDATE SHOWCASE
            </span>
            <h2 className="text-3xl font-extrabold text-white">Candidates Evaluated Beyond the Resume</h2>
            <p className="text-slate-400 text-sm max-w-xl">
              Recruiters see transparent skill radar profiles, technical interview report cards, and project evidence.
            </p>
          </div>
          <button
            onClick={onExplore}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-brand-300 font-semibold text-xs border border-slate-700 transition-all self-start"
          >
            <span>Explore All Candidates</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Candidate Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {showcaseData.map((cand, idx) => (
            <div key={idx} className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-6 hover:border-brand-500/50 transition-all shadow-xl">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                <div>
                  <h3 className="font-bold text-white text-base">{cand.name}</h3>
                  <p className="text-xs text-brand-400 font-medium">{cand.role}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{cand.college}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center font-bold text-brand-300 text-sm">
                  {cand.name.split(' ').map(n => n[0]).join('')}
                </div>
              </div>

              {/* Score Badge */}
              <TalentScoreBadge
                score={cand.score}
                tier={cand.tier}
                humanVerified={cand.humanVerified}
                size="sm"
              />

              {/* Mini Radar Chart */}
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <RadarChart
                  scores={{
                    techScore: cand.tech,
                    problemSolvingScore: cand.ps,
                    commScore: cand.comm,
                    projectsScore: cand.proj,
                    interviewScore: cand.interview,
                  }}
                  height={150}
                />
              </div>

              {/* Skills Tags */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 block">Verified Tech Skills:</span>
                <div className="flex flex-wrap gap-1.5">
                  {cand.skills.map((skill, sIdx) => (
                    <span key={sIdx} className="text-xs bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
