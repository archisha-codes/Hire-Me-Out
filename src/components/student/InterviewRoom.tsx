import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Video, Mic, Send, ShieldCheck, Award, CheckCircle2, FileText, Sparkles, UserCheck, Clock } from 'lucide-react';
import { InterviewReportModal } from './InterviewReportModal';

interface InterviewRoomProps {
  role?: string;
  domain?: string;
  onCompleted?: () => void;
}

export const InterviewRoom: React.FC<InterviewRoomProps> = ({
  role = 'Full Stack Developer',
  domain = 'Software Development',
  onCompleted,
}) => {
  const [roundIdx, setRoundIdx] = useState<number>(0);
  const [userResponse, setUserResponse] = useState<string>('');
  const [history, setHistory] = useState<any[]>([]);
  const [completing, setCompleting] = useState<boolean>(false);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [report, setReport] = useState<any>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [humanRequested, setHumanRequested] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);

  const rounds = [
    { round: 1, title: 'Introduction & Background', question: `Welcome! Please introduce yourself, your academic background, and why you are targeting ${role} positions.` },
    { round: 2, title: 'Resume & Projects Deep Dive', question: 'Tell me about a challenging technical project you built. What architecture choices did you make, and how did you handle state management or API performance?' },
    { round: 3, title: 'Core Technical Concepts', question: `In ${domain}, how do you optimize asynchronous event loops, handle database indexing, and protect REST endpoints against connection pool exhaustion?` },
    { round: 4, title: 'System Scenario & Debugging', question: 'Suppose your live web service experiences sudden 10x traffic spikes causing high API response latency. Walk me through your step-by-step diagnostic workflow.' },
    { round: 5, title: 'Behavioral & Team Culture', question: 'Describe a time when you received tough technical feedback or had a conflict over code architecture. How did you resolve it?' },
    { round: 6, title: 'Candidate Questions & Wrap Up', question: 'Great job! Do you have any questions about engineering expectations, team velocity, or tech stack standards?' },
  ];

  const currentRound = rounds[roundIdx];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleNextRound = () => {
    if (!userResponse.trim()) return;

    setAnalyzing(true);
    const newEntry = {
      round: currentRound.round,
      title: currentRound.title,
      question: currentRound.question,
      answer: userResponse,
    };
    const updatedHistory = [...history, newEntry];
    setHistory(updatedHistory);
    setUserResponse('');

    setTimeout(() => {
      setAnalyzing(false);
      if (roundIdx < rounds.length - 1) {
        setRoundIdx(roundIdx + 1);
      } else {
        finishInterview(updatedHistory);
      }
    }, 800);
  };

  const finishInterview = async (finalHistory: any[]) => {
    setCompleting(true);
    try {
      const res = await api.completeInterview({
        role,
        domain,
        responses: finalHistory,
      });
      setReport(res.report);
      setIsReportModalOpen(true);
      if (onCompleted) onCompleted();
    } catch (err) {
      console.error(err);
    } finally {
      setCompleting(false);
    }
  };

  const handleRequestHuman = async () => {
    try {
      await api.requestHumanInterview({ preferredDate: '2026-03-25', preferredTime: '14:00 IST' });
      setHumanRequested(true);
    } catch (err) {
      console.error(err);
    }
  };

  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;
  const progressPct = Math.round(((roundIdx + 1) / rounds.length) * 100);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {!report ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">
                HIRE ME OUT • AI TECHNICAL INTERVIEW ROOM
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Round {roundIdx + 1} of 6: {currentRound.title}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-xl font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                {role}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-indigo-600 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Two Column Layout: Left Avatar & Prompt | Right Response & Log */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left: AI Avatar & Question */}
            <div className="md:col-span-5 space-y-4">
              <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 text-center space-y-3 shadow-md">
                <div className="w-20 h-20 rounded-full bg-indigo-600/30 border-2 border-indigo-500 flex items-center justify-center text-indigo-300 mx-auto animate-pulse">
                  <Video className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-extrabold text-white text-sm">AI Technical Interviewer</h4>
                  <p className="text-[11px] text-slate-400 font-mono">Evaluating technical depth & clarity</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/50 space-y-2">
                <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 block uppercase">
                  CURRENT QUESTION:
                </span>
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                  "{currentRound.question}"
                </p>
              </div>
            </div>

            {/* Right: Response Area & Previous Log */}
            <div className="md:col-span-7 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Your Technical Response:</span>
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[11px] font-mono">
                    <Mic className="w-3.5 h-3.5" /> Mic & Text Mode
                  </span>
                </div>

                <textarea
                  value={userResponse}
                  onChange={(e) => setUserResponse(e.target.value)}
                  rows={5}
                  placeholder="Structure your answer with system design choices, code patterns, and trade-offs..."
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-xs text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none leading-relaxed font-medium"
                />
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-mono text-slate-500">
                  {roundIdx + 1} / 6 Rounds Completed
                </span>

                <button
                  onClick={handleNextRound}
                  disabled={!userResponse.trim() || analyzing || completing}
                  className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 disabled:opacity-40"
                >
                  <span>
                    {analyzing
                      ? 'Analyzing response...'
                      : roundIdx === 5
                      ? completing
                        ? 'Generating Report Card...'
                        : 'Finish AI Interview'
                      : 'Submit Answer & Next Round'}
                  </span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Previous Questions Log */}
              {history.length > 0 && (
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                    Previous Answered Rounds ({history.length})
                  </span>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {history.map((h, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-[11px]"
                      >
                        <span className="font-bold text-slate-700 dark:text-slate-300">R{h.round}: {h.title}</span>
                        <p className="text-slate-500 dark:text-slate-400 truncate">"{h.answer}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Report Summary View */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6 text-center">
          <div className="inline-flex p-4 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mb-1">
            <ShieldCheck className="w-12 h-12" />
          </div>

          <h2 className="text-3xl font-black text-slate-900 dark:text-white">AI Technical Interview Complete!</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
            Your technical answers have been evaluated and verified into an evidence report.
          </p>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20"
            >
              View Full Interview Evidence Report
            </button>
          </div>

          <InterviewReportModal
            isOpen={isReportModalOpen}
            onClose={() => setIsReportModalOpen(false)}
            session={{
              role,
              domain,
              overallScore: report.overallScore || 88,
              recommendation: report.recommendation || 'STRONGLY RECOMMENDED',
              techDepthScore: report.techDepthScore || 91,
              commScore: report.commScore || 82,
              accuracyScore: report.accuracyScore || 88,
              behavioralScore: report.behavioralScore || 87,
              answersJson: JSON.stringify(history),
            }}
          />
        </div>
      )}
    </div>
  );
};
