export type Role = 'STUDENT' | 'COMPANY' | 'EMPLOYEE' | 'ADMIN';
export type PrivacyLevel = 'PUBLIC' | 'VERIFIED_EMPLOYERS' | 'REFERRAL_ONLY' | 'PRIVATE';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
  phone?: string;
  studentProfile?: StudentProfile;
  companyProfile?: CompanyProfile;
  employeeProfile?: EmployeeProfile;
}

export interface Skill {
  id?: string;
  name: string;
  category?: string;
  level?: string;
}

export interface Project {
  id?: string;
  title: string;
  description: string;
  techStack?: string;
  githubUrl?: string;
  liveUrl?: string;
}

export interface Certification {
  id?: string;
  title: string;
  issuer: string;
  issueDate: string;
  credentialUrl?: string;
}

export interface Education {
  id?: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: number;
  endYear: number;
  grade?: string;
}

export interface StudentProfile {
  id: string;
  userId: string;
  user?: { name: string; email: string; avatar?: string };
  headline?: string;
  college?: string;
  degree?: string;
  branch?: string;
  gradYear?: number;
  cgpa?: number;
  location?: string;
  targetDomain?: string;
  targetRoles?: string; // JSON
  experienceLevel?: string;
  bio?: string;
  resumeUrl?: string;
  resumeScore?: number;
  missingSkills?: string;
  github?: string;
  linkedin?: string;
  portfolio?: string;
  talentScore: number;
  talentTier: string;
  percentile: number;
  techScore: number;
  problemSolvingScore: number;
  commScore: number;
  projectsScore: number;
  interviewScore: number;
  humanVerified: boolean;
  privacyLevel: PrivacyLevel;
  onboardingComplete: boolean;
  educations?: Education[];
  skills?: Skill[];
  projects?: Project[];
  certifications?: Certification[];
}

export interface CompanyProfile {
  id: string;
  userId: string;
  user?: { name: string; avatar?: string };
  companyName: string;
  department?: string;
  designation?: string;
  website?: string;
  companySize?: string;
  isVerified: boolean;
  logo?: string;
}

export interface EmployeeProfile {
  id: string;
  userId: string;
  user?: { name: string; avatar?: string };
  companyName: string;
  designation: string;
  workEmail: string;
  isVerified: boolean;
  totalReferrals: number;
  successfulReferrals: number;
  earnings: number;
}

export interface Question {
  id: string;
  type: 'MCQ' | 'CODING' | 'DEBUGGING' | 'SCENARIO' | 'WRITTEN';
  text: string;
  codeSnippet?: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  difficulty?: string;
  skillCategory?: string;
}

export interface AssessmentAttempt {
  id: string;
  score: number;
  maxScore: number;
  timeTakenSeconds: number;
  correctAnswers: number;
  totalQuestions: number;
  createdAt: string;
}

export interface InterviewReport {
  id: string;
  studentName?: string;
  role: string;
  domain: string;
  overallScore: number;
  commScore: number;
  techDepthScore: number;
  confidenceScore: number;
  accuracyScore: number;
  behavioralScore: number;
  recommendation: string;
  strengths: string[];
  weaknesses: string[];
  createdAt?: string;
}

export interface CandidateCardData {
  id: string;
  name: string;
  avatar?: string;
  headline: string;
  college: string;
  degree: string;
  cgpa: number;
  gradYear: number;
  location: string;
  targetDomain: string;
  talentScore: number;
  talentTier: string;
  percentile: number;
  techScore: number;
  problemSolvingScore: number;
  commScore: number;
  projectsScore: number;
  interviewScore: number;
  humanVerified: boolean;
  skills: string[];
  projectsCount: number;
  certificationsCount: number;
  latestAssessment: number;
  latestInterview: number;
  availability: string;
}

export interface Job {
  id: string;
  title: string;
  domain: string;
  role: string;
  experienceLevel: string;
  location: string;
  type: string;
  description: string;
  requiredSkillsJson: string;
  preferredSkillsJson?: string;
  salaryRange: string;
  referralBonus: number;
  companyProfile?: CompanyProfile;
}

export interface ReferralRequest {
  id: string;
  studentProfileId: string;
  studentProfile?: StudentProfile;
  jobId: string;
  job?: Job;
  companyProfileId: string;
  companyProfile?: CompanyProfile;
  employeeProfileId?: string;
  employeeProfile?: EmployeeProfile;
  status: string;
  statusHistoryJson?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: string;
  studentProfileId: string;
  studentProfile?: {
    user: { name: string; avatar?: string };
    talentScore: number;
    talentTier: string;
  };
  content: string;
  type: string;
  mediaUrl?: string;
  privacy: PrivacyLevel;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  likes?: { userId: string }[];
  comments?: { id: string; content: string; user: { name: string; avatar?: string }; createdAt: string }[];
}

export interface Transaction {
  id: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  razorpayPaymentId?: string;
  createdAt: string;
}
