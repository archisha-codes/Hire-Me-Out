import React, { useState } from 'react';
import { api } from '../../services/api';
import { X, Briefcase, Plus } from 'lucide-react';

interface JobCreatorModalProps {
  onClose: () => void;
  onJobCreated: () => void;
}

export const JobCreatorModal: React.FC<JobCreatorModalProps> = ({ onClose, onJobCreated }) => {
  const [title, setTitle] = useState('Software Engineer Intern');
  const [domain, setDomain] = useState('Software Development');
  const [role, setRole] = useState('Full Stack Developer');
  const [experienceLevel, setExperienceLevel] = useState('Fresher');
  const [location, setLocation] = useState('Bangalore, India (Hybrid)');
  const [salaryRange, setSalaryRange] = useState('₹12 - 18 LPA');
  const [referralBonus, setReferralBonus] = useState('8000');
  const [requiredSkills, setRequiredSkills] = useState('React, Node.js, SQL, TypeScript');
  const [description, setDescription] = useState('Seeking verified engineering talent proficient in modern web frameworks and API architecture.');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const skillsArr = requiredSkills.split(',').map(s => s.trim()).filter(Boolean);
      await api.createJob({
        title,
        domain,
        role,
        experienceLevel,
        location,
        salaryRange,
        referralBonus,
        requiredSkills: skillsArr,
        description,
      });
      onJobCreated();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-brand-400" />
            <h2 className="text-xl font-extrabold text-white">Create Verified Job Position</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-400">Job Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:border-brand-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-slate-400">Target Role</label>
              <input
                type="text"
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:border-brand-500 outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-400">Location</label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:border-brand-500 outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-400">Salary Range</label>
              <input
                type="text"
                value={salaryRange}
                onChange={e => setSalaryRange(e.target.value)}
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:border-brand-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-400">Required Skills (Comma separated)</label>
            <input
              type="text"
              value={requiredSkills}
              onChange={e => setRequiredSkills(e.target.value)}
              className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:border-brand-500 outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-400">Job Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:border-brand-500 outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg font-semibold">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-bold shadow-lg shadow-brand-600/30">
              {loading ? 'Creating Job...' : 'Publish Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
