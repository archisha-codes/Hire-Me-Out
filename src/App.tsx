import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { MobileNav } from './components/layout/MobileNav';
import { Hero } from './components/landing/Hero';
import { Metrics } from './components/landing/Metrics';
import { HowItWorks } from './components/landing/HowItWorks';
import { TalentShowcase } from './components/landing/TalentShowcase';
import { Pricing } from './components/landing/Pricing';
import { Testimonials } from './components/landing/Testimonials';
import { FAQ } from './components/landing/FAQ';
import { AuthModal } from './components/auth/AuthModal';

// Role Dashboards & Views
import { StudentDashboard } from './components/student/StudentDashboard';
import { OnboardingWizard } from './components/student/OnboardingWizard';
import { AssessmentPlayer } from './components/student/AssessmentPlayer';
import { InterviewRoom } from './components/student/InterviewRoom';
import { StudentProfileView } from './components/student/StudentProfileView';
import { ProgressTimelineView } from './components/student/ProgressTimelineView';
import { CompanyDashboard } from './components/company/CompanyDashboard';
import { ReferrerDashboard } from './components/referrer/ReferrerDashboard';
import { JobRadarView } from './components/jobradar/JobRadarView';
import { SocialFeedView } from './components/feed/SocialFeedView';
import { AdminDashboard } from './components/admin/AdminDashboard';

const MainContent: React.FC = () => {
  const { user, role } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('landing'); // landing, discovery, radar, feed, pricing, dashboard
  const [activeView, setActiveView] = useState<string>('dashboard'); // sub-view within logged in area
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-600 selection:text-white transition-colors pb-16 md:pb-0">
      <Navbar
        onOpenAuth={() => setIsAuthOpen(true)}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'dashboard') setActiveView('dashboard');
        }}
      />

      <main className="flex-1 w-full min-w-0">
        {/* PUBLIC LANDING TAB */}
        {activeTab === 'landing' && (
          <div className="w-full">
            <Hero
              onStartOnboarding={() => {
                if (!user) setIsAuthOpen(true);
                else {
                  setActiveTab('dashboard');
                  setActiveView('onboarding');
                }
              }}
              onExploreDiscovery={() => setActiveTab('discovery')}
            />
            <Metrics />
            <HowItWorks />
            <TalentShowcase onExplore={() => setActiveTab('discovery')} />
            <Pricing onSelectPlan={() => setIsAuthOpen(true)} />
            <Testimonials />
            <FAQ />
          </div>
        )}

        {/* PUBLIC / RECRUITER DISCOVERY TAB */}
        {activeTab === 'discovery' && (
          <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-8">
            <CompanyDashboard />
          </div>
        )}

        {/* AI JOB RADAR TAB */}
        {activeTab === 'radar' && (
          <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-8">
            <JobRadarView />
          </div>
        )}

        {/* PROGRESS FEED TAB */}
        {activeTab === 'feed' && (
          <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-8">
            <SocialFeedView />
          </div>
        )}

        {/* PRICING TAB */}
        {activeTab === 'pricing' && (
          <div className="w-full py-8">
            <Pricing onSelectPlan={() => setIsAuthOpen(true)} />
          </div>
        )}

        {/* LOGGED IN DASHBOARD WORKSPACE */}
        {activeTab === 'dashboard' && (
          <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-6 flex flex-col md:flex-row gap-6 min-w-0">
            <Sidebar activeView={activeView} setActiveView={setActiveView} />

            <div className="flex-1 min-w-0">
              {/* STUDENT ROLE VIEWS */}
              {role === 'STUDENT' && (
                <>
                  {activeView === 'dashboard' && (
                    <StudentDashboard
                      onStartAssessment={() => setActiveView('assessment')}
                      onStartInterview={() => setActiveView('interview')}
                      onViewProfile={() => setActiveView('profile')}
                    />
                  )}
                  {activeView === 'onboarding' && (
                    <OnboardingWizard
                      onComplete={() => setActiveView('dashboard')}
                      onLaunchAssessment={() => setActiveView('assessment')}
                    />
                  )}
                  {activeView === 'assessment' && (
                    <AssessmentPlayer
                      onCompleted={() => setActiveView('dashboard')}
                      onLaunchInterview={() => setActiveView('interview')}
                    />
                  )}
                  {activeView === 'interview' && (
                    <InterviewRoom onCompleted={() => setActiveView('dashboard')} />
                  )}
                  {activeView === 'profile' && (
                    <StudentProfileView student={user?.studentProfile} />
                  )}
                  {activeView === 'timeline' && (
                    <ProgressTimelineView
                      currentScore={user?.studentProfile?.talentScore || 87}
                      tier={user?.studentProfile?.talentTier || 'Tier A'}
                    />
                  )}
                  {activeView === 'radar' && <JobRadarView />}
                  {activeView === 'feed' && <SocialFeedView />}
                </>
              )}

              {/* COMPANY RECRUITER ROLE VIEWS */}
              {role === 'COMPANY' && (
                <CompanyDashboard />
              )}

              {/* EMPLOYEE REFERRER ROLE VIEWS */}
              {role === 'EMPLOYEE' && (
                <ReferrerDashboard />
              )}

              {/* ADMIN ROLE VIEWS */}
              {role === 'ADMIN' && (
                <AdminDashboard />
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />

      <MobileNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
