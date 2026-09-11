import React from 'react';
import { TalentScoreBadge } from '../common/TalentScoreBadge';
import { RadarChart } from '../common/RadarChart';
import { ScoreExplainer } from '../common/ScoreExplainer';
import { Github, Linkedin, Globe, ShieldCheck, CheckCircle2, Award, FileText, ExternalLink, Calendar, MapPin, GraduationCap } from 'lucide-react';

interface StudentProfileViewProps {
  student: any;
}

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({ student }) => {
  if (!student) return <div className="p-8 text-center text-slate-400">Loading student profile...</div>;

  const user = student.user || {};
  const scores = {
    techScore: student.techScore || 91,
    problemSolvingScore: student.problemSolvingScore || 88,
    commScore: student.commScore || 79,
    projectsScore: student.projectsScore || 93,
    interviewScore: student.interviewScore || 85,
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Profile Banner & Cover */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-2xl">
        <div className="h-32 bg-gradient-to-r from-brand-900 via-indigo-950 to-slate-950 relative">
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified Talent Profile
            </span>
          </div>
        </div>

        <div className="p-6 relative pt-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-12 mb-4">
            <div className="flex items-end gap-4">
              <div className="w-24 h-24 rounded-2xl bg-slate-950 border-4 border-slate-900 overflow-hidden shadow-xl flex items-center justify-center font-bold text-2xl text-brand-300">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.name ? user.name[0] : 'S'
                )}
              </div>
              <div className="space-y-0.5">
                <h1 className="text-2xl font-extrabold text-white">{user.name || 'Ananya Sharma'}</h1>
                <p className="text-sm font-medium text-brand-400">{student.headline || 'Full Stack Developer & AI Specialist'}</p>
                <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
                  <span className="flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5 text-slate-400" /> {student.college || 'IIT Bangalore'} ({student.degree || 'B.Tech'})</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {student.location || 'Bangalore, India'}</span>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-2">
              {student.github && (
                <a href={student.github} target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white">
                  <Github className="w-4 h-4" />
                </a>
              )}
              {student.linkedin && (
                <a href={student.linkedin} target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white">
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {student.portfolio && (
                <a href={student.portfolio} target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white">
                  <Globe className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <TalentScoreBadge
              score={student.talentScore || 87}
              tier={student.talentTier || 'Tier A'}
              percentile={student.percentile || 88}
              humanVerified={student.humanVerified}
              size="md"
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Radar & Evidence */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Column: Radar & Score Breakdown */}
        <div className="md:col-span-5 space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-white text-base">Verified Skill Capabilities</h3>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <RadarChart scores={scores} height={220} />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
            <h3 className="font-bold text-white text-base">Verification Badges</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-emerald-500/20 text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>AI Assessment Verified</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-emerald-500/20 text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>AI Mock Interview Verified</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-emerald-500/20 text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Resume Score ({student.resumeScore || 89}/100)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-emerald-500/20 text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Human Verification</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Projects, Certifications, Experience */}
        <div className="md:col-span-7 space-y-6">
          
          {/* Projects */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-white text-base flex items-center justify-between">
              <span>Verified Projects</span>
              <span className="text-xs text-brand-400 font-mono">{(student.projects || []).length} Verified</span>
            </h3>
            <div className="space-y-3">
              {(student.projects || []).map((proj: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-sm">{proj.title}</h4>
                    {proj.githubUrl && (
                      <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="text-xs text-brand-400 flex items-center gap-1 hover:underline">
                        <span>Code</span> <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-slate-300">{proj.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-white text-base">Certifications & Credentials</h3>
            <div className="space-y-2">
              {(student.certifications || []).map((cert: any, idx: number) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <h5 className="font-bold text-white">{cert.title}</h5>
                    <span className="text-slate-400">{cert.issuer} • {cert.issueDate}</span>
                  </div>
                  <Award className="w-4 h-4 text-amber-400" />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
