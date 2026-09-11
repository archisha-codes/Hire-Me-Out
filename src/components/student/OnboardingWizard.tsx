import React, { useState } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, ArrowRight, ArrowLeft, Upload, CheckCircle2, Sparkles, Plus, Trash2 } from 'lucide-react';

interface OnboardingWizardProps {
  onComplete: () => void;
  onLaunchAssessment: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete, onLaunchAssessment }) => {
  const { user, refreshUser } = useAuth();
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  // Form State
  const [personal, setPersonal] = useState({
    name: user?.name || '',
    location: 'Bangalore, India',
    bio: 'Passionate developer focused on scalable modern web applications and cloud architectures.',
  });

  const [education, setEducation] = useState({
    college: 'IIT Bangalore',
    degree: 'B.Tech',
    branch: 'Computer Science & Engineering',
    gradYear: 2026,
    cgpa: 9.1,
  });

  const [skills, setSkills] = useState<string[]>(['React', 'Node.js', 'TypeScript', 'SQL', 'AWS', 'Python']);
  const [newSkill, setNewSkill] = useState<string>('');

  const [projects, setProjects] = useState([
    { title: 'Distributed Cloud Storage Engine', description: 'Node.js, Redis, AWS S3 storage system.', techStack: 'Node.js, Redis, AWS', githubUrl: 'https://github.com/demo/cloud-storage' },
    { title: 'Real-time Analytics Dashboard', description: 'React & WebSocket visualization panel.', techStack: 'React, TypeScript, WebSockets', githubUrl: 'https://github.com/demo/analytics' }
  ]);

  const [certifications, setCertifications] = useState([
    { title: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services', issueDate: '2026' }
  ]);

  const [links, setLinks] = useState({
    github: 'https://github.com/candidate',
    linkedin: 'https://linkedin.com/in/candidate',
    portfolio: 'https://candidate.dev'
  });

  const [resumeText, setResumeText] = useState<string>('Extracted resume text featuring React, Node.js, Python, SQL, B.Tech CSE CGPA 9.1, 2 internships, 4 projects.');
  const [parsedResume, setParsedResume] = useState<any>(null);

  const domains = [
    'Software Development', 'AI / ML', 'Data Science', 'Data Analytics',
    'Cybersecurity', 'Cloud / DevOps', 'Product Management', 'UI/UX',
    'Business / Sales', 'Finance', 'Marketing', 'HR'
  ];
  const [targetDomain, setTargetDomain] = useState<string>('Software Development');

  const roleOptions: Record<string, string[]> = {
    'Software Development': ['Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer'],
    'AI / ML': ['ML Engineer', 'AI Research Scientist', 'Prompt Engineer', 'Computer Vision Specialist'],
    'Data Science': ['Data Scientist', 'Data Analyst', 'Data Engineer'],
    'Cloud / DevOps': ['Cloud Engineer', 'DevOps Engineer', 'Site Reliability Engineer'],
  };

  const [selectedRoles, setSelectedRoles] = useState<string[]>(['Full Stack Developer', 'Software Engineer']);

  const handleParseResume = async () => {
    setLoading(true);
    try {
      const data = await api.uploadResume({ resumeText, targetDomain });
      setParsedResume(data.parsedData);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await api.updateStudentProfile({
        headline: `${selectedRoles[0] || 'Software Engineer'} | ${education.college}`,
        college: education.college,
        degree: education.degree,
        branch: education.branch,
        gradYear: education.gradYear,
        cgpa: education.cgpa,
        location: personal.location,
        targetDomain,
        targetRoles: selectedRoles,
        experienceLevel: 'Fresher',
        bio: personal.bio,
        github: links.github,
        linkedin: links.linkedin,
        portfolio: links.portfolio,
        skills: skills.map(s => ({ name: s })),
        projects,
        certifications,
      });
      await refreshUser();
      onComplete();
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(prev => Math.min(12, prev + 1));
  const prevStep = () => setStep(prev => Math.max(1, prev - 1));

  return (
    <div className="max-w-3xl mx-auto p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl space-y-6">
      {/* Wizard Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>Student Onboarding Setup</span>
          <span>Step {step} of 12</span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-cyan-400 transition-all duration-300"
            style={{ width: `${(step / 12) * 100}%` }}
          />
        </div>
      </div>

      {/* Step 1: Personal Info */}
      {step === 1 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white">Step 1: Personal Information</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-400">Full Name</label>
              <input
                type="text"
                value={personal.name}
                onChange={e => setPersonal({ ...personal, name: e.target.value })}
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:border-brand-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400">Current Location</label>
              <input
                type="text"
                value={personal.location}
                onChange={e => setPersonal({ ...personal, location: e.target.value })}
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:border-brand-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400">Short Headline / Bio</label>
              <textarea
                value={personal.bio}
                onChange={e => setPersonal({ ...personal, bio: e.target.value })}
                rows={3}
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:border-brand-500 outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Education */}
      {step === 2 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white">Step 2: Educational Background</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400">College / University</label>
              <input
                type="text"
                value={education.college}
                onChange={e => setEducation({ ...education, college: e.target.value })}
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:border-brand-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400">Degree</label>
              <input
                type="text"
                value={education.degree}
                onChange={e => setEducation({ ...education, degree: e.target.value })}
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:border-brand-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400">Branch / Major</label>
              <input
                type="text"
                value={education.branch}
                onChange={e => setEducation({ ...education, branch: e.target.value })}
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:border-brand-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400">Graduation Year</label>
              <input
                type="number"
                value={education.gradYear}
                onChange={e => setEducation({ ...education, gradYear: parseInt(e.target.value) || 2026 })}
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:border-brand-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400">CGPA / Percentage</label>
              <input
                type="number"
                step="0.1"
                value={education.cgpa}
                onChange={e => setEducation({ ...education, cgpa: parseFloat(e.target.value) || 9.0 })}
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:border-brand-500 outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Skills */}
      {step === 3 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white">Step 3: Core Skills</h3>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add skill (e.g. React, Docker, Python)"
              value={newSkill}
              onChange={e => setNewSkill(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:border-brand-500 outline-none"
            />
            <button
              onClick={() => {
                if (newSkill.trim()) {
                  setSkills([...skills, newSkill.trim()]);
                  setNewSkill('');
                }
              }}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-semibold"
            >
              Add Skill
            </button>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            {skills.map((s, idx) => (
              <span key={idx} className="inline-flex items-center gap-1.5 bg-slate-950 border border-slate-800 text-slate-200 px-3 py-1 rounded-lg text-xs">
                {s}
                <button onClick={() => setSkills(skills.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-red-400">
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Step 9: Resume Upload & AI Parser */}
      {step === 9 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white">Step 9: Upload Resume & AI Analysis</h3>
          <p className="text-xs text-slate-400">Paste your resume text or upload your CV to trigger automated AI skill parsing and quality scoring.</p>
          <textarea
            value={resumeText}
            onChange={e => setResumeText(e.target.value)}
            rows={5}
            placeholder="Paste your resume content here..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:border-brand-500 outline-none font-mono"
          />
          <button
            onClick={handleParseResume}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-semibold transition-all"
          >
            <Sparkles className="w-4 h-4 text-cyan-300" />
            <span>{loading ? 'Analyzing with AI...' : 'Parse Resume with AI'}</span>
          </button>

          {parsedResume && (
            <div className="bg-slate-950 border border-brand-500/30 p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-300">AI Resume Analysis Result</span>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded border border-emerald-500/30 font-mono font-bold">
                  Quality Score: {parsedResume.resumeQualityScore}/100
                </span>
              </div>
              <div className="text-xs space-y-1 text-slate-300">
                <p>Detected Skills: <span className="text-brand-300 font-semibold">{parsedResume.skills.join(', ')}</span></p>
                <p>Missing Recommended Skills: <span className="text-amber-400 font-semibold">{parsedResume.missingRecommendedSkills.join(', ')}</span></p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 10: Target Domain */}
      {step === 10 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white">Step 10: Choose Target Domain</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {domains.map((dom, idx) => (
              <button
                key={idx}
                onClick={() => setTargetDomain(dom)}
                className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                  targetDomain === dom
                    ? 'bg-brand-600/20 border-brand-500 text-white shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                {dom}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 11: Target Roles */}
      {step === 11 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white">Step 11: Choose Target Roles</h3>
          <div className="flex flex-wrap gap-2">
            {(roleOptions[targetDomain] || ['Software Engineer', 'Full Stack Developer']).map((roleName, idx) => {
              const selected = selectedRoles.includes(roleName);
              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (selected) setSelectedRoles(selectedRoles.filter(r => r !== roleName));
                    else setSelectedRoles([...selectedRoles, roleName]);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    selected
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  {roleName} {selected && '✓'}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 12: Assessment Readiness CTA */}
      {step === 12 && (
        <div className="space-y-6 text-center py-6">
          <div className="inline-flex p-4 rounded-full bg-brand-500/20 border border-brand-500/40 text-brand-300 mb-2">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-extrabold text-white">Profile Ready for AI Skill Evaluation</h3>
          <p className="text-slate-300 text-sm max-w-md mx-auto">
            Next, take your role-specific AI Skill Assessment to establish your Verified Talent Score and Tier ranking!
          </p>
          <div className="flex justify-center gap-4 pt-2">
            <button
              onClick={async () => {
                await handleSaveProfile();
                onLaunchAssessment();
              }}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-brand-600/30"
            >
              <Sparkles className="w-4 h-4" />
              <span>Evaluate My Skills Now</span>
            </button>
          </div>
        </div>
      )}

      {/* Wizard Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <button
          onClick={prevStep}
          disabled={step === 1}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-30"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {step < 12 && (
          <button
            onClick={nextStep}
            className="flex items-center gap-1.5 px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-semibold"
          >
            <span>Next Step</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
