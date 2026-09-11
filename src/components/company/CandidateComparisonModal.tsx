import React from 'react';
import { CandidateCardData } from '../../types';
import { TalentScoreBadge } from '../common/TalentScoreBadge';
import { X, CheckCircle2, Award, ShieldCheck } from 'lucide-react';

interface CandidateComparisonModalProps {
  candidates: CandidateCardData[];
  onClose: () => void;
  onRequestInterview: (candidate: CandidateCardData) => void;
}

export const CandidateComparisonModal: React.FC<CandidateComparisonModalProps> = ({
  candidates,
  onClose,
  onRequestInterview,
}) => {
  if (candidates.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-5xl w-full p-6 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-mono text-brand-400 font-bold uppercase">TALENT COMPARISON ENGINE</span>
            <h2 className="text-xl font-extrabold text-white">Side-by-Side Candidate Verification Analysis</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Comparison Grid Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950">
                <th className="p-3 font-semibold text-slate-400 uppercase font-mono">Metric / Attribute</th>
                {candidates.map(c => (
                  <th key={c.id} className="p-3 font-bold text-white text-sm min-w-[200px]">
                    {c.name}
                    <span className="block text-[11px] text-slate-400 font-normal">{c.college}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              <tr>
                <td className="p-3 font-medium text-slate-400">Verified Talent Score</td>
                {candidates.map(c => (
                  <td key={c.id} className="p-3 font-bold font-mono text-brand-300 text-sm">
                    {c.talentScore}/100 ({c.talentTier})
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-medium text-slate-400">Technical Depth</td>
                {candidates.map(c => (
                  <td key={c.id} className="p-3 font-mono font-bold text-slate-200">{c.techScore}/100</td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-medium text-slate-400">Problem Solving</td>
                {candidates.map(c => (
                  <td key={c.id} className="p-3 font-mono font-bold text-slate-200">{c.problemSolvingScore}/100</td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-medium text-slate-400">Communication Clarity</td>
                {candidates.map(c => (
                  <td key={c.id} className="p-3 font-mono font-bold text-slate-200">{c.commScore}/100</td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-medium text-slate-400">AI Interview Score</td>
                {candidates.map(c => (
                  <td key={c.id} className="p-3 font-mono font-bold text-emerald-400">{c.latestInterview}/100</td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-medium text-slate-400">Human Verified</td>
                {candidates.map(c => (
                  <td key={c.id} className="p-3 font-medium text-slate-300">
                    {c.humanVerified ? <span className="text-emerald-400">YES ✓</span> : 'No'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-medium text-slate-400">Core Tech Skills</td>
                {candidates.map(c => (
                  <td key={c.id} className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {c.skills.map((s, idx) => (
                        <span key={idx} className="bg-slate-950 px-2 py-0.5 rounded text-[10px] border border-slate-800 text-slate-300">{s}</span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-medium text-slate-400">Action</td>
                {candidates.map(c => (
                  <td key={c.id} className="p-3">
                    <button
                      onClick={() => {
                        onClose();
                        onRequestInterview(c);
                      }}
                      className="w-full py-1.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded text-xs"
                    >
                      Request Interview
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
