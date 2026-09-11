import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, UserCheck, Sparkles, Video, Search, Radar, Award, TrendingUp, Settings, ShieldCheck, DollarSign, Briefcase, FileText } from 'lucide-react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const { role } = useAuth();

  const studentLinks = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'profile', label: 'My Verified Profile', icon: ShieldCheck },
    { id: 'onboarding', label: 'Profile Setup', icon: FileText },
    { id: 'assessment', label: 'AI Skill Assessment', icon: Sparkles },
    { id: 'interview', label: 'AI Technical Interview', icon: Video },
    { id: 'timeline', label: 'Progress Timeline', icon: TrendingUp },
    { id: 'radar', label: 'AI Job Radar', icon: Radar },
    { id: 'feed', label: 'Progress Feed', icon: Award },
  ];

  const companyLinks = [
    { id: 'dashboard', label: 'Talent Discovery', icon: Search },
    { id: 'jobs', label: 'Create & Manage Jobs', icon: Briefcase },
    { id: 'radar', label: 'AI Job Radar', icon: Radar },
  ];

  const employeeLinks = [
    { id: 'dashboard', label: 'Referral Opportunities', icon: UserCheck },
    { id: 'earnings', label: 'Earnings & Rewards', icon: DollarSign },
  ];

  const adminLinks = [
    { id: 'dashboard', label: 'Platform Analytics', icon: LayoutDashboard },
    { id: 'governance', label: 'Pricing & Rules', icon: Settings },
    { id: 'users', label: 'User Accounts', icon: ShieldCheck },
  ];

  const links = role === 'COMPANY' ? companyLinks : role === 'EMPLOYEE' ? employeeLinks : role === 'ADMIN' ? adminLinks : studentLinks;

  return (
    <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-4 flex-shrink-0 shadow-sm dark:shadow-none transition-colors">
      <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-200 dark:border-slate-800">
        <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">
          {role || 'STUDENT'} WORKSPACE
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-col gap-1.5">
        {links.map((link) => {
          const Icon = link.icon;
          const active = activeView === link.id;
          return (
            <button
              key={link.id}
              onClick={() => setActiveView(link.id)}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                active
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{link.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};

