import React from 'react';
import {
  Radar,
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';

interface CandidateRadarProps {
  scores: {
    techScore: number;
    problemSolvingScore: number;
    commScore: number;
    projectsScore: number;
    interviewScore: number;
  };
  height?: number;
}

export const RadarChart: React.FC<CandidateRadarProps> = ({ scores, height = 260 }) => {
  const data = [
    { subject: 'Technical', score: scores.techScore || 85, fullMark: 100 },
    { subject: 'Problem Solving', score: scores.problemSolvingScore || 80, fullMark: 100 },
    { subject: 'Communication', score: scores.commScore || 75, fullMark: 100 },
    { subject: 'Projects Proof', score: scores.projectsScore || 90, fullMark: 100 },
    { subject: 'AI Interview', score: scores.interviewScore || 85, fullMark: 100 },
  ];

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <RechartsRadar data={data}>
            <PolarGrid stroke="#334155" strokeDasharray="3 3" />
            <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fill: '#cbd5e1', fontSize: 11 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" tick={false} />
            <Radar
              name="Verified Talent Capability"
              dataKey="score"
              stroke="#6366f1"
              fill="#4f46e5"
              fillOpacity={0.45}
            />
          </RechartsRadar>
        </ResponsiveContainer>
      </div>
      {/* Sub-score Pills */}
      <div className="grid grid-cols-5 gap-1.5 w-full mt-2 text-center text-xs">
        <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
          <span className="text-slate-400 block text-[10px]">Technical</span>
          <span className="font-bold text-brand-300 font-mono">{scores.techScore}</span>
        </div>
        <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
          <span className="text-slate-400 block text-[10px]">Problem Solving</span>
          <span className="font-bold text-brand-300 font-mono">{scores.problemSolvingScore}</span>
        </div>
        <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
          <span className="text-slate-400 block text-[10px]">Communication</span>
          <span className="font-bold text-brand-300 font-mono">{scores.commScore}</span>
        </div>
        <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
          <span className="text-slate-400 block text-[10px]">Projects</span>
          <span className="font-bold text-brand-300 font-mono">{scores.projectsScore}</span>
        </div>
        <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
          <span className="text-slate-400 block text-[10px]">Interview</span>
          <span className="font-bold text-brand-300 font-mono">{scores.interviewScore}</span>
        </div>
      </div>
    </div>
  );
};
