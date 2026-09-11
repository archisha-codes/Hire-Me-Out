import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { TalentScoreBadge } from '../common/TalentScoreBadge';
import { ScoreExplainer } from '../common/ScoreExplainer';
import { Clock, CheckCircle2, ShieldCheck, Sparkles, ArrowRight, Video } from 'lucide-react';

interface AssessmentPlayerProps {
  domain?: string;
  role?: string;
  onCompleted?: () => void;
  onLaunchInterview?: () => void;
}

export const AssessmentPlayer: React.FC<AssessmentPlayerProps> = ({
  domain = 'Software Development',
  role = 'Full Stack Developer',
  onCompleted,
  onLaunchInterview,
}) => {
  const [assessment, setAssessment] = useState<any>(null);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(1200); // 20 mins
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const loadAssessment = async () => {
      try {
        const data = await api.startAssessment({ domain, role, experienceLevel: 'Fresher' });
        setAssessment(data.assessment);
        if (data.assessment?.timeLeftSeconds) {
          setTimeLeft(data.assessment.timeLeftSeconds);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadAssessment();
  }, [domain, role]);

  // Auto-submit timer listener
  useEffect(() => {
    if (!assessment || result) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [assessment, result]);

  if (!assessment) {
    return (
      <div className="p-12 text-center text-slate-500 font-mono flex items-center justify-center gap-3">
        <Sparkles className="w-6 h-6 text-indigo-600 animate-spin" />
        <span>Generating dynamic AI assessment questions for {role}...</span>
      </div>
    );
  }

  const questions = assessment.questions || [];
  const currentQ = questions[currentIdx] || questions[0];
  const progressPct = Math.round(((currentIdx + 1) / questions.length) * 100);

  const handleOptionSelect = (optionText: string) => {
    const updated = {
      ...selectedAnswers,
      [currentQ.id]: optionText,
    };
    setSelectedAnswers(updated);
    api.autosaveAssessmentAnswer({
      attemptId: assessment.id,
      questionId: currentQ.id,
      userAnswer: optionText,
      timeLeftSeconds: timeLeft,
      answers: updated,
    }).catch(console.error);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const formattedAnswers = questions.map((q: any) => ({
        questionId: q.id,
        userAnswer: selectedAnswers[q.id] || '',
        isCorrect: selectedAnswers[q.id] === q.correctAnswer,
      }));

      const res = await api.submitAssessment({
        attemptId: assessment.id,
        domain,
        role,
        answers: formattedAnswers,
        timeTakenSeconds: 1200 - timeLeft,
      });

      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {!result ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          {/* Top Bar with Progress & Timer */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">
                HIRE ME OUT • {assessment.domain} ASSESSMENT
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                {assessment.title || 'Technical Skill Assessment'}
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-1.5 rounded-xl font-mono text-sm font-bold text-amber-600 dark:text-amber-400">
                <Clock className="w-4 h-4" />
                <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                Question {currentIdx + 1} / {questions.length} ({progressPct}%)
              </span>
            </div>
          </div>

          {/* Question Progress Bar */}
          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-indigo-600 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Question Content */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-2.5 py-0.5 rounded font-mono font-bold">
                {currentQ.type}
              </span>
              <span className="text-slate-500 font-medium">Category: {currentQ.skillCategory}</span>
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white leading-relaxed">
              {currentIdx + 1}. {currentQ.text}
            </h3>

            {currentQ.codeSnippet && (
              <pre className="bg-slate-900 text-cyan-300 p-4 rounded-xl border border-slate-800 text-xs font-mono overflow-x-auto">
                <code>{currentQ.codeSnippet}</code>
              </pre>
            )}

            {/* Options List */}
            <div className="space-y-2.5 pt-2">
              {currentQ.options?.map((opt: string, oIdx: number) => {
                const selected = selectedAnswers[currentQ.id] === opt;
                return (
                  <button
                    key={oIdx}
                    onClick={() => handleOptionSelect(opt)}
                    className={`w-full p-4 rounded-xl text-xs text-left font-medium border transition-all flex items-center justify-between ${
                      selected
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-900 dark:text-white font-bold shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-indigo-300'
                    }`}
                  >
                    <span>{opt}</span>
                    {selected && <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold disabled:opacity-30"
            >
              Previous
            </button>

            {currentIdx < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIdx((prev) => Math.min(questions.length - 1, prev + 1))}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20"
              >
                Save & Continue
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20"
              >
                {submitting ? 'Evaluating Assessment...' : 'Submit & Calculate Talent Score'}
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Result Reveal View */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6 text-center">
          <div className="inline-flex p-4 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mb-1">
            <ShieldCheck className="w-12 h-12" />
          </div>

          <h2 className="text-3xl font-black text-slate-900 dark:text-white">Assessment Complete!</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
            Your technical performance has been synthesized into an explainable Verified Talent Score.
          </p>

          <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 inline-block space-y-3">
            <div className="text-xs text-slate-500 uppercase font-mono tracking-wider font-bold">UPDATED TALENT SCORE</div>
            <TalentScoreBadge
              score={result.updatedTalentScore || 87}
              tier={result.updatedTier || 'Tier A'}
              percentile={result.percentile || 88}
              humanVerified={true}
              size="lg"
            />
          </div>

          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => {
                if (onCompleted) onCompleted();
              }}
              className="px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl text-xs font-bold"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => {
                if (onLaunchInterview) onLaunchInterview();
                else if (onCompleted) onCompleted();
              }}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-2"
            >
              <Video className="w-4 h-4" />
              <span>Start AI Technical Interview</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
