import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { CandidateCardData } from '../../types';
import { CandidateSearchFilters } from './CandidateSearchFilters';
import { CandidateCard } from './CandidateCard';
import { CandidateComparisonModal } from './CandidateComparisonModal';
import { JobCreatorModal } from './JobCreatorModal';
import { InterviewRequestModal } from './InterviewRequestModal';
import { HiringPipelineKanban } from './HiringPipelineKanban';
import { StudentProfileView } from '../student/StudentProfileView';
import { Search, Briefcase, Plus, Users, Video, ShieldCheck, ArrowRight, X, Sparkles, Filter } from 'lucide-react';

export const CompanyDashboard: React.FC = () => {
  const [candidates, setCandidates] = useState<CandidateCardData[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<any>({
    domain: '',
    skills: '',
    minScore: 75,
    tier: 'ALL',
    humanVerifiedOnly: 'false',
    sort: 'HIGHEST_SCORE',
  });

  const [comparedIds, setComparedIds] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState<boolean>(false);
  const [showJobModal, setShowJobModal] = useState<boolean>(false);
  const [selectedCandidateForInterview, setSelectedCandidateForInterview] = useState<any>(null);
  const [selectedCandidateForProfile, setSelectedCandidateForProfile] = useState<any>(null);

  const loadCandidates = async () => {
    setLoading(true);
    try {
      const data = await api.getCandidates(filters);
      setCandidates(data.candidates || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadJobsAndPipeline = async () => {
    try {
      const [jData, rData] = await Promise.all([
        api.getJobs(),
        api.getReferralOpportunities(),
      ]);
      setJobs(jData.jobs || []);
      setReferrals(rData.opportunities || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadCandidates();
    loadJobsAndPipeline();
  }, [filters]);

  const handleShortlist = async (cand: any) => {
    try {
      await api.shortlistCandidate(cand.id);
      alert(`Candidate ${cand.user?.name || ''} shortlisted to Talent Pool.`);
      loadCandidates();
    } catch (err: any) {
      alert(err.message || 'Failed to shortlist candidate.');
    }
  };

  const handleViewDetails = async (id: string) => {
    try {
      const data = await api.getCandidateDetails(id);
      setSelectedCandidateForProfile(data.candidate);
    } catch (err) {
      console.error(err);
    }
  };

  if (selectedCandidateForProfile) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedCandidateForProfile(null)}
          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold"
        >
          ← Back to Talent Discovery
        </button>
        <StudentProfileView student={selectedCandidateForProfile} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner with Soft Indigo Gradient */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white p-6 border border-indigo-800/50 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-lg">
        <div className="space-y-2">
          <span className="text-[10px] font-mono text-cyan-300 font-bold uppercase tracking-wider">
            TALENT DISCOVERY PLATFORM
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Find people who can actually do the job 👋</h1>
          <p className="text-xs sm:text-sm text-indigo-200">
            Search candidates by verified skills, AI interview scores, and project evidence rather than unverified resumes.
          </p>
        </div>

        <button
          onClick={() => setShowJobModal(true)}
          className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 whitespace-nowrap self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Post Open Position</span>
        </button>
      </div>

      {/* Interactive Kanban Pipeline */}
      <HiringPipelineKanban
        referralRequests={referrals}
        onRefresh={loadJobsAndPipeline}
      />

      {/* Search & Filter Bar */}
      <CandidateSearchFilters filters={filters} onChange={setFilters} />

      {/* Candidate Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
            Verified Candidates Discovered ({candidates.length})
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            Evidence-backed candidate discovery
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 font-mono flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500 animate-spin" />
            <span>Searching verified talent network...</span>
          </div>
        ) : candidates.length === 0 ? (
          <div className="p-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-3 shadow-sm">
            <Search className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">No verified candidates match your filters</h4>
            <p className="text-xs text-slate-500">Try clearing filters or lowering minimum score requirements.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {candidates.map((cand) => (
              <CandidateCard
                key={cand.id}
                candidate={cand}
                onViewProfile={(c) => handleViewDetails(c.id)}
                onShortlist={(c) => handleShortlist(c)}
                onRequestInterview={(c) => setSelectedCandidateForInterview(c)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Job Creator Modal */}
      {showJobModal && (
        <JobCreatorModal
          onClose={() => setShowJobModal(false)}
          onJobCreated={() => loadJobsAndPipeline()}
        />
      )}

      {/* Interview Request Modal */}
      {selectedCandidateForInterview && (
        <InterviewRequestModal
          isOpen={Boolean(selectedCandidateForInterview)}
          candidate={selectedCandidateForInterview}
          onClose={() => setSelectedCandidateForInterview(null)}
          onSuccess={() => loadCandidates()}
        />
      )}
    </div>
  );
};
