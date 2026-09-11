import React, { useState, useEffect } from 'react';
import { Search, X, Briefcase, User, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { api } from '../../services/api';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCandidate?: (id: string) => void;
  onSelectJob?: (id: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectCandidate,
  onSelectJob,
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setCandidates([]);
      setJobs([]);
      return;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setCandidates([]);
      setJobs([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [candRes, jobRes] = await Promise.all([
          api.getCandidates({ search: query }),
          api.getJobs(),
        ]);

        setCandidates(candRes.candidates || []);
        
        const filteredJobs = (jobRes.jobs || []).filter((j: any) =>
          j.title.toLowerCase().includes(query.toLowerCase()) ||
          j.domain.toLowerCase().includes(query.toLowerCase()) ||
          j.location.toLowerCase().includes(query.toLowerCase())
        );
        setJobs(filteredJobs);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-indigo-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search candidates, roles, skills, colleges..."
            className="flex-1 bg-transparent border-none text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none text-sm font-medium"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            Esc
          </button>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {loading && (
            <div className="py-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 animate-spin text-indigo-500" />
              <span>Searching verified talent network...</span>
            </div>
          )}

          {!loading && !query && (
            <div className="py-8 text-center space-y-2">
              <p className="text-xs font-semibold text-slate-400">Quick suggestions:</p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {['Full Stack Developer', 'React', 'Node.js', 'IIT Bangalore', 'System Design', 'Score 85+'].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => setQuery(chip)}
                    className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 text-xs transition-colors"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!loading && query && candidates.length === 0 && jobs.length === 0 && (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No candidates or jobs match "{query}"
              </p>
              <p className="text-xs text-slate-500">
                Try searching for skills like "React", "Python", or titles like "Software Engineer".
              </p>
            </div>
          )}

          {/* Candidate Results */}
          {!loading && candidates.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Candidates ({candidates.length})
              </h4>
              <div className="space-y-2">
                {candidates.slice(0, 4).map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      if (onSelectCandidate) onSelectCandidate(c.id);
                      onClose();
                    }}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 hover:border-indigo-400 dark:hover:border-indigo-500 cursor-pointer flex items-center justify-between transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-600/10 text-indigo-600 dark:text-indigo-300 font-bold flex items-center justify-center text-sm">
                        {c.user?.name ? c.user.name[0] : 'C'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-slate-900 dark:text-white text-xs group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                            {c.user?.name}
                          </h5>
                          {c.humanVerified && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                              <ShieldCheck className="w-3 h-3" /> Verified
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {c.headline || c.college || 'Full Stack Developer'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {c.talentScore || 85}/100
                        </span>
                        <span className="text-[10px] text-slate-400 block">Talent Score</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Job Results */}
          {!loading && jobs.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-mono text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" /> Open Roles ({jobs.length})
              </h4>
              <div className="space-y-2">
                {jobs.slice(0, 4).map((j) => (
                  <div
                    key={j.id}
                    onClick={() => {
                      if (onSelectJob) onSelectJob(j.id);
                      onClose();
                    }}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 hover:border-cyan-400 cursor-pointer flex items-center justify-between transition-colors group"
                  >
                    <div>
                      <h5 className="font-bold text-slate-900 dark:text-white text-xs group-hover:text-cyan-600 dark:group-hover:text-cyan-400">
                        {j.title}
                      </h5>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {j.companyProfile?.companyName || 'TechNova'} • {j.location}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded">
                        {j.salaryRange}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
