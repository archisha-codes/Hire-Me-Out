export interface ScoreWeights {
  technical: number;
  problemSolving: number;
  communication: number;
  projects: number;
  interview: number;
}

// Configurable scoring weights by domain/role
export const DOMAIN_WEIGHTS: Record<string, ScoreWeights> = {
  'Software Development': { technical: 0.35, problemSolving: 0.25, communication: 0.15, projects: 0.15, interview: 0.10 },
  'AI / ML': { technical: 0.40, problemSolving: 0.25, communication: 0.10, projects: 0.15, interview: 0.10 },
  'Data Science': { technical: 0.35, problemSolving: 0.30, communication: 0.15, projects: 0.10, interview: 0.10 },
  'Data Analytics': { technical: 0.30, problemSolving: 0.25, communication: 0.20, projects: 0.15, interview: 0.10 },
  'Cloud / DevOps': { technical: 0.40, problemSolving: 0.20, communication: 0.15, projects: 0.15, interview: 0.10 },
  'Cybersecurity': { technical: 0.45, problemSolving: 0.25, communication: 0.10, projects: 0.10, interview: 0.10 },
  'Product Management': { technical: 0.15, problemSolving: 0.30, communication: 0.30, projects: 0.15, interview: 0.10 },
  'UI/UX': { technical: 0.20, problemSolving: 0.25, communication: 0.25, projects: 0.20, interview: 0.10 },
  'Business / Sales': { technical: 0.10, problemSolving: 0.25, communication: 0.45, projects: 0.10, interview: 0.10 },
  'Finance': { technical: 0.30, problemSolving: 0.30, communication: 0.20, projects: 0.10, interview: 0.10 },
  'Marketing': { technical: 0.15, problemSolving: 0.25, communication: 0.40, projects: 0.10, interview: 0.10 },
  'HR': { technical: 0.10, problemSolving: 0.25, communication: 0.45, projects: 0.10, interview: 0.10 },
};

export const DEFAULT_WEIGHTS: ScoreWeights = {
  technical: 0.35,
  problemSolving: 0.25,
  communication: 0.15,
  projects: 0.15,
  interview: 0.10,
};

export function calculateVerifiedTalentScore(
  domain: string,
  scores: {
    techScore: number;
    problemSolvingScore: number;
    commScore: number;
    projectsScore: number;
    interviewScore: number;
  }
) {
  const weights = DOMAIN_WEIGHTS[domain] || DEFAULT_WEIGHTS;

  const totalScore = Math.round(
    scores.techScore * weights.technical +
    scores.problemSolvingScore * weights.problemSolving +
    scores.commScore * weights.communication +
    scores.projectsScore * weights.projects +
    scores.interviewScore * weights.interview
  );

  let talentTier = 'Tier C';
  if (totalScore >= 90) talentTier = 'Tier S';
  else if (totalScore >= 80) talentTier = 'Tier A';
  else if (totalScore >= 70) talentTier = 'Tier B';

  // Calculate approximate percentile
  let percentile = 99 - Math.max(0, (100 - totalScore) * 1.5);
  percentile = Math.min(99, Math.max(50, Math.round(percentile)));

  const explanation = generateScoreExplanation(totalScore, scores);

  return {
    talentScore: totalScore,
    talentTier,
    percentile,
    explanation,
  };
}

export function generateScoreExplanation(
  overallScore: number,
  scores: {
    techScore: number;
    problemSolvingScore: number;
    commScore: number;
    projectsScore: number;
    interviewScore: number;
  }
) {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];

  if (scores.techScore >= 85) strengths.push('Strong core technical knowledge & domain fundamentals');
  else if (scores.techScore < 75) weaknesses.push('Technical depth in domain concepts needs reinforcement');

  if (scores.problemSolvingScore >= 85) strengths.push('Excellent algorithmic accuracy and scenario resolution');
  else if (scores.problemSolvingScore < 75) weaknesses.push('Systematic problem solving under time pressure');

  if (scores.commScore >= 80) strengths.push('Clear, structured technical communication & explanation skills');
  else if (scores.commScore < 75) weaknesses.push('Clarity & confidence during verbal/technical explanations');

  if (scores.projectsScore >= 85) strengths.push('High practical execution demonstrated in hands-on projects');
  else if (scores.projectsScore < 75) weaknesses.push('Project architecture documentation & depth');

  if (scores.interviewScore >= 85) strengths.push('Outstanding mock technical interview response consistency');
  else if (scores.interviewScore < 75) weaknesses.push('System design and behavioral interview scenarios');

  // Fallback defaults if list is brief
  if (strengths.length === 0) strengths.push('Consistent foundation across core evaluation modules');
  if (weaknesses.length === 0) weaknesses.push('Minor fine-tuning required on advanced enterprise scenario questions');

  if (scores.techScore < 85) recommendations.push('Complete advanced skill-specific coding and architecture assessments');
  if (scores.commScore < 85) recommendations.push('Schedule another AI Mock Interview focusing on behavioral & scenario articulation');
  if (scores.projectsScore < 85) recommendations.push('Add project GitHub repository & live link proof points to your profile');
  if (recommendations.length === 0) recommendations.push('Maintain profile updates with latest certifications & project milestones');

  return {
    strengths,
    weaknesses,
    recommendations,
    whyText: `Your score of ${overallScore}/100 reflects a weighted synthesis of your technical accuracy (${scores.techScore}), problem solving (${scores.problemSolvingScore}), communication (${scores.commScore}), project quality (${scores.projectsScore}), and interview readiness (${scores.interviewScore}).`
  };
}
