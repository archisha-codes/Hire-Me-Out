import React from 'react';
import { Home, Search, Radar, Rss, User, Briefcase, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeView: string;
  setActiveView: (view: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  setActiveTab,
  activeView,
  setActiveView,
}) => {
  const { role } = useAuth();

  const getNavItems = () => {
    if (role === 'COMPANY') {
      return [
        { id: 'dashboard', label: 'Home', icon: <Home className="w-5 h-5" /> },
        { id: 'discovery', label: 'Talent', icon: <Search className="w-5 h-5" /> },
        { id: 'radar', label: 'Radar', icon: <Radar className="w-5 h-5" /> },
        { id: 'feed', label: 'Feed', icon: <Rss className="w-5 h-5" /> },
      ];
    }
    if (role === 'EMPLOYEE') {
      return [
        { id: 'dashboard', label: 'Home', icon: <Home className="w-5 h-5" /> },
        { id: 'referrals', label: 'Referrals', icon: <UserCheck className="w-5 h-5" /> },
        { id: 'radar', label: 'Jobs', icon: <Briefcase className="w-5 h-5" /> },
        { id: 'feed', label: 'Feed', icon: <Rss className="w-5 h-5" /> },
      ];
    }
    // Student or public
    return [
      { id: 'landing', label: 'Home', icon: <Home className="w-5 h-5" /> },
      { id: 'discovery', label: 'Discover', icon: <Search className="w-5 h-5" /> },
      { id: 'radar', label: 'Job Radar', icon: <Radar className="w-5 h-5" /> },
      { id: 'feed', label: 'Progress', icon: <Rss className="w-5 h-5" /> },
      { id: 'dashboard', label: 'Profile', icon: <User className="w-5 h-5" /> },
    ];
  };

  const items = getNavItems();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-2 py-2 flex items-center justify-around shadow-lg">
      {items.map((item) => {
        const isActive = activeTab === item.id || (activeTab === 'dashboard' && activeView === item.id);
        return (
          <button
            key={item.id}
            onClick={() => {
              if (item.id === 'dashboard') {
                setActiveTab('dashboard');
                setActiveView('dashboard');
              } else {
                setActiveTab(item.id);
              }
            }}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              isActive
                ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {item.icon}
            <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
