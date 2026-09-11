export interface MatchResult {
  matchPercentage: number;
  skillMatchPercentage: number;
  assessmentMatchPercentage: number;
  experienceMatchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  explanation: {
    strengths: string[];
    gaps: string[];
    recommendation: string;
  };
}

export function calculateCandidateJobMatch(
  studentProfile: {
    skills: { name: string }[];
    talentScore: number;
    techScore: number;
    interviewScore: number;
    experienceLevel: string;
  },
  job: {
    requiredSkillsJson: string;
    preferredSkillsJson?: string | null;
    experienceLevel: string;
  }
): MatchResult {
  const candidateSkills = (studentProfile.skills || []).map(s => s.name.toLowerCase());
  
  let requiredSkills: string[] = [];
  try {
    requiredSkills = JSON.parse(job.requiredSkillsJson);
  } catch (e) {
    requiredSkills = job.requiredSkillsJson ? job.requiredSkillsJson.split(',').map(s => s.trim()) : [];
  }

  let preferredSkills: string[] = [];
  if (job.preferredSkillsJson) {
    try {
      preferredSkills = JSON.parse(job.preferredSkillsJson);
    } catch (e) {
      preferredSkills = job.preferredSkillsJson.split(',').map(s => s.trim());
    }
  }

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  requiredSkills.forEach(reqSkill => {
    if (candidateSkills.some(cs => cs.includes(reqSkill.toLowerCase()) || reqSkill.toLowerCase().includes(cs))) {
      matchedSkills.push(reqSkill);
    } else {
      missingSkills.push(reqSkill);
    }
  });

  const matchedCount = matchedSkills.length;
  const totalRequired = Math.max(1, requiredSkills.length);
  const skillMatchPercentage = Math.round((matchedCount / totalRequired) * 100);

  // Assessment match based on Talent Score (scale to 100)
  const assessmentMatchPercentage = Math.min(99, Math.max(60, Math.round(studentProfile.talentScore * 1.05)));

  // Experience match
  const expMatch = studentProfile.experienceLevel.toLowerCase() === job.experienceLevel.toLowerCase() ? 95 : 85;

  const matchPercentage = Math.round(
    skillMatchPercentage * 0.45 +
    assessmentMatchPercentage * 0.35 +
    expMatch * 0.20
  );

  const strengths: string[] = [];
  matchedSkills.forEach(skill => strengths.push(`✓ Verified capability in ${skill}`));
  if (studentProfile.talentScore >= 80) {
    strengths.push(`✓ High Talent Score (${studentProfile.talentScore}/100) in domain assessments`);
  }
  if (studentProfile.interviewScore >= 80) {
    strengths.push(`✓ Strong AI Interview performance (${studentProfile.interviewScore}/100)`);
  }

  const gaps: string[] = [];
  missingSkills.forEach(skill => gaps.push(`Missing explicit verification for ${skill}`));

  const recommendation = matchPercentage >= 85
    ? 'Strongly Recommended for Shortlist and Referral Request.'
    : matchPercentage >= 70
    ? 'Good Match. Recommended for initial technical screening.'
    : 'Moderate Match. Candidates may require additional skill verification.';

  return {
    matchPercentage,
    skillMatchPercentage,
    assessmentMatchPercentage,
    experienceMatchPercentage: expMatch,
    matchedSkills,
    missingSkills,
    explanation: {
      strengths,
      gaps,
      recommendation,
    },
  };
}
