import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, User, LogOut, Search, Radar, Building2, UserCheck, Bell, Sparkles } from 'lucide-react';
import { NotificationsModal } from '../common/NotificationsModal';
import { ThemeToggle } from '../common/ThemeToggle';
import { GlobalSearchModal } from '../common/GlobalSearchModal';
import { api } from '../../services/api';

interface NavbarProps {
  onOpenAuth: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth, activeTab, setActiveTab }) => {
  const { user, role, logout, demoLogin } = useAuth();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      try {
        const res = await api.getNotifications();
        setUnreadCount(res.unreadCount || 0);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 w-full transition-colors">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 h-16 flex items-center justify-between">
          
          {/* Brand Logo */}
          <div
            onClick={() => setActiveTab('landing')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-slate-900 dark:text-white text-lg tracking-tight leading-none uppercase">
                HIRE ME <span className="text-indigo-600 dark:text-indigo-400">OUT</span>
              </span>
              <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400 tracking-wider uppercase">Don't just get referred. Get verified first.</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <button
              onClick={() => setActiveTab('landing')}
              className={`px-3.5 py-2 rounded-xl transition-colors ${activeTab === 'landing' ? 'bg-indigo-50 dark:bg-slate-900 text-indigo-600 dark:text-white font-bold border border-indigo-200/80 dark:border-slate-800' : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900/50'}`}
            >
              Home
            </button>

            <button
              onClick={() => setActiveTab('discovery')}
              className={`px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 ${activeTab === 'discovery' ? 'bg-indigo-50 dark:bg-slate-900 text-indigo-600 dark:text-white font-bold border border-indigo-200/80 dark:border-slate-800' : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900/50'}`}
            >
              <Search className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>Talent Discovery</span>
            </button>

            <button
              onClick={() => setActiveTab('radar')}
              className={`px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 ${activeTab === 'radar' ? 'bg-indigo-50 dark:bg-slate-900 text-indigo-600 dark:text-white font-bold border border-indigo-200/80 dark:border-slate-800' : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900/50'}`}
            >
              <Radar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Job Radar</span>
            </button>

            <button
              onClick={() => setActiveTab('feed')}
              className={`px-3.5 py-2 rounded-xl transition-colors ${activeTab === 'feed' ? 'bg-indigo-50 dark:bg-slate-900 text-indigo-600 dark:text-white font-bold border border-indigo-200/80 dark:border-slate-800' : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900/50'}`}
            >
              Progress Feed
            </button>

            <button
              onClick={() => setActiveTab('pricing')}
              className={`px-3.5 py-2 rounded-xl transition-colors ${activeTab === 'pricing' ? 'bg-indigo-50 dark:bg-slate-900 text-indigo-600 dark:text-white font-bold border border-indigo-200/80 dark:border-slate-800' : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900/50'}`}
            >
              Pricing
            </button>
          </nav>

          {/* User Auth & Actions Bar */}
          <div className="flex items-center gap-2.5">
            {/* Global Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white transition-colors flex items-center gap-2"
              title="Search platform"
            >
              <Search className="w-4 h-4" />
              <span className="hidden lg:inline text-xs text-slate-400 font-mono">Cmd+K</span>
            </button>

            {/* Theme Toggle Button */}
            <ThemeToggle />

            {user ? (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setIsNotificationsOpen(true)}
                  className="relative p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-semibold hover:border-indigo-400 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-indigo-600/20 text-indigo-600 dark:text-indigo-300 font-bold flex items-center justify-center text-xs">
                    {user.name ? user.name[0] : 'U'}
                  </div>
                  <span className="hidden sm:inline">{user.name.split(' ')[0]}</span>
                  <span className="text-[10px] bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 rounded font-mono uppercase font-bold">
                    {role}
                  </span>
                </button>

                <button
                  onClick={logout}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {/* Quick Demo Switcher Presets */}
                <div className="hidden xl:flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px]">
                  <button onClick={() => demoLogin('STUDENT')} className="px-2 py-1 hover:text-indigo-600 text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1">
                    <User className="w-3 h-3 text-indigo-500" /> Student
                  </button>
                  <button onClick={() => demoLogin('COMPANY')} className="px-2 py-1 hover:text-indigo-600 text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-indigo-500" /> Company
                  </button>
                  <button onClick={() => demoLogin('EMPLOYEE')} className="px-2 py-1 hover:text-indigo-600 text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-indigo-500" /> Referrer
                  </button>
                </div>

                <button
                  onClick={onOpenAuth}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-600/20 transition-all"
                >
                  Sign In / Get Started
                </button>
              </div>
            )}
          </div>

        </div>
      </header>

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectCandidate={() => setActiveTab('discovery')}
        onSelectJob={() => setActiveTab('radar')}
      />
    </>
  );
};

