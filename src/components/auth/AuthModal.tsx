import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';
import { ShieldCheck, X, Sparkles, User, Building2, UserCheck, KeyRound } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: Role;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultRole = 'STUDENT' }) => {
  if (!isOpen) return null;

  const { login, demoLogin, register } = useAuth();
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<Role>(defaultRole);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    college: 'IIT Bangalore',
    companyName: 'TechNova Solutions',
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isRegister) {
        await register({ ...form, role: selectedRole });
      } else {
        await login({ email: form.email, password: form.password });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoPreset = async (r: Role) => {
    setLoading(true);
    setError(null);
    try {
      await demoLogin(r);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1">
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1 text-center">
          <div className="inline-flex p-3 rounded-xl bg-brand-500/10 text-brand-400 mb-1">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            {isRegister ? 'Join Hire Me Out' : 'Welcome to Hire Me Out'}
          </h2>
          <p className="text-xs text-slate-400">
            Don't just get referred. Get verified first.
          </p>
        </div>

        {/* Quick Demo Accounts Banner */}
        <div className="p-3 bg-slate-950 rounded-xl border border-brand-500/30 space-y-2 text-center">
          <span className="text-[11px] font-bold text-brand-300 font-mono uppercase tracking-wider flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> ONE-CLICK QUICK DEMO LOGIN
          </span>
          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            <button
              onClick={() => handleDemoPreset('STUDENT')}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-200 font-semibold flex items-center justify-center gap-1"
            >
              <User className="w-3 h-3 text-brand-400" /> Student
            </button>
            <button
              onClick={() => handleDemoPreset('COMPANY')}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-200 font-semibold flex items-center justify-center gap-1"
            >
              <Building2 className="w-3 h-3 text-brand-400" /> Recruiter
            </button>
            <button
              onClick={() => handleDemoPreset('EMPLOYEE')}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-200 font-semibold flex items-center justify-center gap-1"
            >
              <UserCheck className="w-3 h-3 text-brand-400" /> Referrer
            </button>
            <button
              onClick={() => handleDemoPreset('ADMIN')}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-200 font-semibold flex items-center justify-center gap-1"
            >
              <KeyRound className="w-3 h-3 text-brand-400" /> Admin
            </button>
          </div>
        </div>

        {error && (
          <div className="p-2.5 bg-red-500/10 border border-red-500/30 text-red-300 text-xs rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Standard Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {isRegister && (
            <>
              <div>
                <label className="font-semibold text-slate-400">Account Role</label>
                <div className="grid grid-cols-3 gap-1.5 mt-1">
                  {(['STUDENT', 'COMPANY', 'EMPLOYEE'] as Role[]).map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setSelectedRole(r)}
                      className={`p-2 rounded border text-[11px] font-semibold transition-all ${
                        selectedRole === r ? 'bg-brand-600 text-white border-brand-500' : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-400">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:border-brand-500 outline-none"
                  required
                />
              </div>
            </>
          )}

          <div>
            <label className="font-semibold text-slate-400">Email Address</label>
            <input
              type="email"
              placeholder="name@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:border-brand-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="font-semibold text-slate-400">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:border-brand-500 outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-brand-600/30"
          >
            {loading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400">
          {isRegister ? 'Already have an account?' : "Don't have an account yet?"}{' '}
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-brand-400 font-semibold underline ml-1"
          >
            {isRegister ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
};
