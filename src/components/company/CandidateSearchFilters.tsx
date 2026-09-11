import React from 'react';
import { Search, Filter, SlidersHorizontal, Award, Sparkles, CheckCircle2 } from 'lucide-react';

interface CandidateSearchFiltersProps {
  filters: any;
  onChange: (newFilters: any) => void;
}

export const CandidateSearchFilters: React.FC<CandidateSearchFiltersProps> = ({ filters, onChange }) => {
  const domains = ['ALL', 'Software Development', 'AI / ML', 'Data Science', 'Cloud / DevOps', 'Product Management', 'UI/UX'];
  const tiers = ['ALL', 'Tier S', 'Tier A', 'Tier B'];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4 shadow-xl">
      {/* Search Input & Quick Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidates by skill (e.g. React, Python, SQL), name, or college..."
            value={filters.skills || ''}
            onChange={e => onChange({ ...filters, skills: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-brand-500 outline-none"
          />
        </div>

        {/* Domain Selector */}
        <select
          value={filters.domain || 'ALL'}
          onChange={e => onChange({ ...filters, domain: e.target.value === 'ALL' ? '' : e.target.value })}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:border-brand-500 outline-none font-medium"
        >
          {domains.map((d, i) => (
            <option key={i} value={d}>{d === 'ALL' ? 'All Target Domains' : d}</option>
          ))}
        </select>

        {/* Sorting Dropdown */}
        <select
          value={filters.sort || 'HIGHEST_SCORE'}
          onChange={e => onChange({ ...filters, sort: e.target.value })}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:border-brand-500 outline-none font-mono"
        >
          <option value="HIGHEST_SCORE">Highest Talent Score</option>
          <option value="RECENTLY_VERIFIED">Most Recently Verified</option>
          <option value="HIGHEST_TECH">Highest Technical Score</option>
          <option value="HIGHEST_INTERVIEW">Best AI Interview</option>
        </select>
      </div>

      {/* Secondary Detailed Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-800 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          
          {/* Min Talent Score Slider */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Min Talent Score:</span>
            <input
              type="range"
              min="60"
              max="95"
              value={filters.minScore || 75}
              onChange={e => onChange({ ...filters, minScore: e.target.value })}
              className="w-24 accent-brand-500 cursor-pointer"
            />
            <span className="font-mono font-bold text-brand-300">{filters.minScore || 75}+</span>
          </div>

          {/* Tier Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Talent Tier:</span>
            <div className="flex gap-1">
              {tiers.map((t, i) => (
                <button
                  key={i}
                  onClick={() => onChange({ ...filters, tier: t })}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition-all ${
                    (filters.tier || 'ALL') === t
                      ? 'bg-brand-600/30 border-brand-500 text-brand-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Human Verified Checkbox */}
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={filters.humanVerifiedOnly === 'true'}
              onChange={e => onChange({ ...filters, humanVerifiedOnly: e.target.checked ? 'true' : 'false' })}
              className="rounded bg-slate-950 border-slate-800 text-brand-600 focus:ring-0"
            />
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Human Verified Only
            </span>
          </label>
        </div>

        {/* Clear Filters */}
        <button
          onClick={() => onChange({ domain: '', skills: '', minScore: 75, tier: 'ALL', humanVerifiedOnly: 'false', sort: 'HIGHEST_SCORE' })}
          className="text-slate-400 hover:text-white underline text-[11px]"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};
