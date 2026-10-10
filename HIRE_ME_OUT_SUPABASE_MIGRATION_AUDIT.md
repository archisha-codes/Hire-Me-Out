# Step 4 Audit Report: Existing Application & Production Supabase PostgreSQL Schema Design

> **READ-ONLY AUDIT CONFIRMATION**
> This document is the output of a strict **READ-ONLY AUDIT** of the Hire Me Out application codebase.
> - **No database migrations were executed.**
> - **No Supabase database or backend structures were altered.**
> - **Prisma schema and SQLite database remain untouched.**
> - **No code, authentication, or UI functionality was modified.**
> - **No Git commit or push was performed.**

---

## 1. Current Architecture Overview

### Stack Summary
- **Frontend**: Vite + React 18 (TypeScript), Tailwind CSS, Lucide Icons, Custom React Contexts (`AuthContext`, `ThemeContext`).
- **Backend**: Express.js (TypeScript) running on Node.js port 5000 (`server/index.ts`).
- **Database / ORM**: SQLite (file-based `prisma/dev.db`) managed via Prisma ORM (`prisma/schema.prisma`).
- **Authentication**: Custom JWT authentication (`jsonwebtoken`) signed with a static fallback secret (`super-secret-hiremeout-key-2026`). Bearer tokens are stored in browser `localStorage` as `hiremeout_token`.
- **Password Security**: `bcryptjs` password hashing with a fallback hardcoded override (`password123`) in the login route.
- **Engine & Business Logic**:
  - **Resume Parser**: Deterministic keyword and score extractor (`server/services/resumeParser.ts`).
  - **Scoring Engine**: Weighted domain scoring algorithm calculating Verified Talent Score (0–100), Talent Tier (Tier S/A/B/C), and Percentile (`server/services/scoringEngine.ts`).
  - **Matching Engine**: Candidate-job skill and score match calculator (`server/services/matchingEngine.ts`).
  - **AI Simulation Engine**: Question generator and mock interview evaluator (`server/services/aiService.ts`).

---

## 2. Complete Prisma Schema Audit

The following table documents **every single model** defined in `prisma/schema.prisma`:

### Model Summary Table

| Model Name | Primary Key | Key Fields & Types | Nullable Fields | Default Values | Unique Constraints | Relations & onDelete | JSON Fields |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **User** | `id` (String UUID) | `email`, `password`, `name`, `role`, `avatar`, `phone`, `createdAt`, `updatedAt` | `avatar`, `phone` | `id`: uuid(), `role`: "STUDENT", `createdAt`: now() | `email` | 1:1 `studentProfile`, `companyProfile`, `employeeProfile`. 1:N `comments`, `likes`, `transactions`, `notifications` | None |
| **StudentProfile** | `id` (String UUID) | `userId`, `headline`, `college`, `degree`, `branch`, `gradYear`, `cgpa`, `location`, `targetDomain`, `targetRoles`, `experienceLevel`, `bio`, `resumeUrl`, `resumeScore`, `missingSkills`, `github`, `linkedin`, `portfolio`, `talentScore`, `talentTier`, `percentile`, `techScore`, `problemSolvingScore`, `commScore`, `projectsScore`, `interviewScore`, `humanVerified`, `privacyLevel`, `onboardingComplete` | `headline`, `college`, `degree`, `branch`, `gradYear`, `cgpa`, `location`, `targetDomain`, `targetRoles`, `bio`, `resumeUrl`, `missingSkills`, `github`, `linkedin`, `portfolio` | `id`: uuid(), `experienceLevel`: "Fresher", `resumeScore`: 0, `talentScore`: 0, `talentTier`: "Tier B", `percentile`: 0, `humanVerified`: false, `privacyLevel`: "PUBLIC", `onboardingComplete`: false | `userId` | Belongs to `User` (FK: `userId`, Cascade). 1:N `educations`, `experiences`, `skills`, `projects`, `certifications`, `achievements`, `assessmentAttempts`, `interviewSessions`, `humanInterviews`, `referralRequests`, `posts` | `targetRoles` (String), `missingSkills` (String) |
| **Education** | `id` (String UUID) | `studentProfileId`, `institution`, `degree`, `fieldOfStudy`, `startYear`, `endYear`, `grade` | `grade` | `id`: uuid() | None | Belongs to `StudentProfile` (FK: `studentProfileId`, Cascade) | None |
| **Experience** | `id` (String UUID) | `studentProfileId`, `title`, `company`, `location`, `startDate`, `endDate`, `current`, `description` | `location`, `endDate`, `description` | `id`: uuid(), `current`: false | None | Belongs to `StudentProfile` (FK: `studentProfileId`, Cascade) | None |
| **Skill** | `id` (String UUID) | `studentProfileId`, `name`, `category`, `level` | `category`, `level` | `id`: uuid() | None | Belongs to `StudentProfile` (FK: `studentProfileId`, Cascade) | None |
| **Project** | `id` (String UUID) | `studentProfileId`, `title`, `description`, `techStack`, `githubUrl`, `liveUrl` | `techStack`, `githubUrl`, `liveUrl` | `id`: uuid() | None | Belongs to `StudentProfile` (FK: `studentProfileId`, Cascade) | `techStack` (String) |
| **Certification** | `id` (String UUID) | `studentProfileId`, `title`, `issuer`, `issueDate`, `credentialUrl` | `credentialUrl` | `id`: uuid() | None | Belongs to `StudentProfile` (FK: `studentProfileId`, Cascade) | None |
| **Achievement** | `id` (String UUID) | `studentProfileId`, `title`, `date`, `description` | `description` | `id`: uuid() | None | Belongs to `StudentProfile` (FK: `studentProfileId`, Cascade) | None |
| **CompanyProfile** | `id` (String UUID) | `userId`, `companyName`, `department`, `designation`, `website`, `linkedin`, `companySize`, `isVerified`, `logo` | `department`, `designation`, `website`, `linkedin`, `companySize`, `logo` | `id`: uuid(), `isVerified`: true | `userId` | Belongs to `User` (FK: `userId`, Cascade). 1:N `jobs`, `referralRequests` | None |
| **EmployeeProfile** | `id` (String UUID) | `userId`, `companyName`, `designation`, `workEmail`, `isVerified`, `totalReferrals`, `successfulReferrals`, `earnings` | None | `id`: uuid(), `isVerified`: true, `totalReferrals`: 0, `successfulReferrals`: 0, `earnings`: 0 | `userId` | Belongs to `User` (FK: `userId`, Cascade). 1:N `referralRequests` | None |
| **AssessmentTemplate** *(Unused in API)* | `id` (String UUID) | `domain`, `role`, `experienceLevel`, `title`, `description`, `timeLimitMinutes` | None | `id`: uuid(), `experienceLevel`: "Fresher", `timeLimitMinutes`: 20 | None | 1:N `questions`, `attempts` | None |
| **Question** *(Unused in API)* | `id` (String UUID) | `assessmentTemplateId`, `type`, `text`, `codeSnippet`, `optionsJson`, `correctAnswer`, `explanation`, `difficulty`, `domain`, `role`, `skillCategory` | `assessmentTemplateId`, `codeSnippet`, `optionsJson`, `explanation` | `id`: uuid(), `type`: "MCQ", `difficulty`: "Medium" | None | Belongs to `AssessmentTemplate` (FK: `assessmentTemplateId`, Cascade). 1:N `answers` | `optionsJson` (String) |
| **AssessmentAttempt** | `id` (String UUID) | `studentProfileId`, `assessmentTemplateId`, `domain`, `role`, `score`, `maxScore`, `timeTakenSeconds`, `timeLeftSeconds`, `correctAnswers`, `totalQuestions`, `status`, `answersJson`, `feedbackJson`, `createdAt` | `assessmentTemplateId`, `domain`, `role`, `timeLeftSeconds`, `answersJson`, `feedbackJson` | `id`: uuid(), `domain`: "Software Development", `role`: "Full Stack Developer", `score`: 0, `maxScore`: 100, `timeTakenSeconds`: 0, `timeLeftSeconds`: 1200, `status`: "IN_PROGRESS", `createdAt`: now() | None | Belongs to `StudentProfile` (FK: `studentProfileId`, Cascade), Belongs to `AssessmentTemplate` (FK: `assessmentTemplateId`, SetNull). 1:N `answers` | `answersJson` (String), `feedbackJson` (String) |
| **AssessmentAnswer** *(Unused in API)* | `id` (String UUID) | `attemptId`, `questionId`, `userAnswer`, `isCorrect`, `timeTakenSeconds`, `scoreEarned` | None | `id`: uuid() | None | Belongs to `AssessmentAttempt` (FK: `attemptId`, Cascade), Belongs to `Question` (FK: `questionId`, Cascade) | None |
| **InterviewSession** | `id` (String UUID) | `studentProfileId`, `type`, `role`, `domain`, `status`, `overallScore`, `commScore`, `techDepthScore`, `confidenceScore`, `accuracyScore`, `behavioralScore`, `answersJson`, `strengthsJson`, `weaknessesJson`, `recommendation`, `transcriptJson`, `createdAt` | `answersJson`, `strengthsJson`, `weaknessesJson`, `transcriptJson` | `id`: uuid(), `type`: "AI", `status`: "COMPLETED", `recommendation`: "RECOMMENDED", `createdAt`: now() | None | Belongs to `StudentProfile` (FK: `studentProfileId`, Cascade) | `answersJson` (String), `strengthsJson` (String), `weaknessesJson` (String), `transcriptJson` (String) |
| **HumanInterviewRequest** | `id` (String UUID) | `studentProfileId`, `interviewerName`, `scheduledAt`, `status`, `notes`, `rating`, `createdAt` | `interviewerName`, `notes`, `rating` | `id`: uuid(), `status`: "PENDING", `createdAt`: now() | None | Belongs to `StudentProfile` (FK: `studentProfileId`, Cascade) | None |
| **Job** | `id` (String UUID) | `companyProfileId`, `title`, `domain`, `role`, `experienceLevel`, `location`, `type`, `description`, `requiredSkillsJson`, `preferredSkillsJson`, `salaryRange`, `referralBonus`, `isActive`, `createdAt` | `preferredSkillsJson` | `id`: uuid(), `type`: "FULL_TIME", `referralBonus`: 5000, `isActive`: true, `createdAt`: now() | None | Belongs to `CompanyProfile` (FK: `companyProfileId`, Cascade). 1:N `referralRequests` | `requiredSkillsJson` (String), `preferredSkillsJson` (String) |
| **ReferralRequest** | `id` (String UUID) | `studentProfileId`, `jobId`, `companyProfileId`, `employeeProfileId`, `status`, `statusHistoryJson`, `notes`, `createdAt`, `updatedAt` | `employeeProfileId`, `statusHistoryJson`, `notes` | `id`: uuid(), `status`: "SHORTLISTED", `createdAt`: now(), `updatedAt`: updatedAt | None | Belongs to `StudentProfile` (FK: `studentProfileId`, Cascade), `Job` (FK: `jobId`, Cascade), `CompanyProfile` (FK: `companyProfileId`, Cascade), `EmployeeProfile` (FK: `employeeProfileId`, SetNull) | `statusHistoryJson` (String) |
| **Post** | `id` (String UUID) | `studentProfileId`, `content`, `type`, `mediaUrl`, `privacy`, `likesCount`, `commentsCount`, `createdAt` | `mediaUrl` | `id`: uuid(), `type`: "GENERAL", `privacy`: "PUBLIC", `likesCount`: 0, `commentsCount`: 0, `createdAt`: now() | None | Belongs to `StudentProfile` (FK: `studentProfileId`, Cascade). 1:N `comments`, `likes` | None |
| **Comment** | `id` (String UUID) | `postId`, `userId`, `content`, `createdAt` | None | `id`: uuid(), `createdAt`: now() | None | Belongs to `Post` (FK: `postId`, Cascade), `User` (FK: `userId`, Cascade) | None |
| **Like** | `id` (String UUID) | `postId`, `userId` | None | `id`: uuid() | None | Belongs to `Post` (FK: `postId`, Cascade), `User` (FK: `userId`, Cascade) | None |
| **Transaction** | `id` (String UUID) | `userId`, `type`, `amount`, `currency`, `status`, `razorpayPaymentId`, `createdAt` | `razorpayPaymentId` | `id`: uuid(), `currency`: "INR", `status`: "COMPLETED", `createdAt`: now() | None | Belongs to `User` (FK: `userId`, Cascade) | None |
| **CommissionRule** | `id` (String UUID) | `name`, `studentFee`, `companySubMonthly`, `employeeRewardAmount`, `platformCommissionPercent` | None | `id`: uuid(), `name`: "Default Pricing", `studentFee`: 499, `companySubMonthly`: 9999, `employeeRewardAmount`: 3000, `platformCommissionPercent`: 20 | None | None | None |
| **Notification** | `id` (String UUID) | `userId`, `title`, `message`, `type`, `read`, `link`, `createdAt` | `link` | `id`: uuid(), `type`: "INFO", `read`: false, `createdAt`: now() | None | Belongs to `User` (FK: `userId`, Cascade) | None |

---

## 3. Backend Model & Endpoint Usage Audit

### Route Usage Matrix

| Route Path | File | Primary Models Used | HTTP Methods | Read Fields | Written Fields | Module / Domain |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/auth/login` | `server/routes/auth.ts` | `User`, `StudentProfile`, `CompanyProfile`, `EmployeeProfile` | POST | `email`, `password`, `id`, `name`, `role`, profiles | Token issuance | Authentication |
| `/api/auth/demo-login` | `server/routes/auth.ts` | `User`, profiles | POST | `email`, `role`, profiles | Token issuance | Authentication / Demo Shortcut |
| `/api/auth/register` | `server/routes/auth.ts` | `User`, `StudentProfile`, `CompanyProfile`, `EmployeeProfile` | POST | `email` | `name`, `email`, `password`, `role`, profile defaults | Authentication & Onboarding |
| `/api/auth/me` | `server/routes/auth.ts` | `User`, `StudentProfile`, educations, experiences, skills, projects, certifications, achievements | GET | All user & profile scalar & relation fields | None | Auth context / Session check |
| `/api/students/me` | `server/routes/students.ts` | `StudentProfile`, all nested collections, `AssessmentAttempt`, `InterviewSession`, `Post` | GET, PUT | All student fields | `headline`, `college`, `degree`, `branch`, `gradYear`, `cgpa`, `location`, `targetDomain`, `targetRoles`, `bio`, `github`, `linkedin`, `portfolio`, `privacyLevel`, nested items | Student Onboarding & Profile |
| `/api/students/resume` | `server/routes/students.ts` | `StudentProfile` | POST | `userId` | `resumeUrl`, `resumeScore`, `missingSkills` | Student Resume Upload & AI Parsing |
| `/api/students/progress` | `server/routes/students.ts` | `StudentProfile`, `AssessmentAttempt`, `InterviewSession` | GET | `resumeScore`, `techScore`, `interviewScore`, `talentScore`, `talentTier` | None | Student Progress Timeline |
| `/api/assessments/active` | `server/routes/assessments.ts` | `StudentProfile`, `AssessmentAttempt` | GET | `id`, `domain`, `role`, `timeTakenSeconds`, `timeLeftSeconds`, `answersJson` | None | Assessment module |
| `/api/assessments/start` | `server/routes/assessments.ts` | `StudentProfile`, `AssessmentAttempt` | POST | `studentProfileId`, `status` | `domain`, `role`, `status`, `totalQuestions`, `timeLeftSeconds` | Assessment module |
| `/api/assessments/answer` | `server/routes/assessments.ts` | `StudentProfile`, `AssessmentAttempt` | POST | `attemptId`, `studentProfileId` | `answersJson`, `timeLeftSeconds` | Assessment module (Autosave) |
| `/api/assessments/submit` | `server/routes/assessments.ts` | `StudentProfile`, `AssessmentAttempt`, `Notification` | POST | `attemptId`, sub-scores | `score`, `maxScore`, `timeTakenSeconds`, `correctAnswers`, `status`, `answersJson`, `feedbackJson`, `techScore`, `talentScore`, `talentTier` | Assessment & Talent Scoring |
| `/api/assessments/talent-score` | `server/routes/assessments.ts` | `StudentProfile` | GET | `talentScore`, `talentTier`, `percentile`, sub-scores | None | Talent Scoring Engine |
| `/api/interviews/start` | `server/routes/interviews.ts` | `StudentProfile` | POST | `userId` | None (returns simulated rounds) | AI Interview module |
| `/api/interviews/complete` | `server/routes/interviews.ts` | `StudentProfile`, `InterviewSession`, `Notification` | POST | `userId`, sub-scores | `overallScore`, `commScore`, `techDepthScore`, `confidenceScore`, `accuracyScore`, `behavioralScore`, `strengthsJson`, `weaknessesJson`, `recommendation`, `transcriptJson`, `talentScore` | AI Interview & Talent Scoring |
| `/api/interviews/:id/report` | `server/routes/interviews.ts` | `InterviewSession`, `StudentProfile`, `User` | GET | Session scores, strengths, weaknesses, student name | None | AI Interview Report Card |
| `/api/interviews/human-request` | `server/routes/interviews.ts` | `StudentProfile`, `HumanInterviewRequest`, `Notification` | POST | `userId` | `scheduledAt`, `status`, `interviewerName`, `notes`, `humanVerified` (set to `true`) | Human Verification Interview |
| `/api/discovery/candidates` | `server/routes/discovery.ts` | `StudentProfile`, `User`, `Skill`, `Project`, `Certification`, `AssessmentAttempt`, `InterviewSession` | GET | Profile search fields, scores, privacy level | None | Recruiter Candidate Discovery |
| `/api/discovery/shortlist` | `server/routes/discovery.ts` | `CompanyProfile`, `StudentProfile`, `User`, `Notification` | POST | `companyName`, `studentProfileId` | Creates `Notification` | Candidate Shortlisting |
| `/api/discovery/candidates/:id` | `server/routes/discovery.ts` | `StudentProfile`, `User`, all nested collections | GET | All candidate details | None | Recruiter Candidate Profile View |
| `/api/discovery/candidates/compare` | `server/routes/discovery.ts` | `StudentProfile`, `User`, `Skill`, `Project`, attempts, sessions | POST | Candidate fields | None | Recruiter Candidate Comparison |
| `/api/jobs` | `server/routes/jobs.ts` | `Job`, `CompanyProfile`, `User` | GET, POST | Job fields, company profile | `title`, `domain`, `role`, `experienceLevel`, `location`, `type`, `description`, `requiredSkillsJson`, `preferredSkillsJson`, `salaryRange`, `referralBonus` | Jobs & Postings |
| `/api/jobs/radar` | `server/routes/jobs.ts` | `StudentProfile`, `Job`, `CompanyProfile`, `User` | GET | Student skills, talent score, job details | None | AI Job Radar Aggregation |
| `/api/referrals/interview-request` | `server/routes/referrals.ts` | `CompanyProfile`, `StudentProfile`, `Job`, `ReferralRequest`, `Notification` | POST | `companyProfileId`, `studentProfileId`, `jobId` | `status` ("INTERVIEW_REQUESTED"), `statusHistoryJson`, `notes` | Referral & Interview Pipeline |
| `/api/referrals/my-requests` | `server/routes/referrals.ts` | `StudentProfile`, `ReferralRequest`, `CompanyProfile`, `Job`, `EmployeeProfile` | GET | Request status, company, job title, employee | None | Student Referral Requests |
| `/api/referrals/opportunities` | `server/routes/referrals.ts` | `ReferralRequest`, `StudentProfile`, `User`, `Job`, `CompanyProfile` | GET | Pipeline opportunities | None | Employee Referrer Inbox |
| `/api/referrals/:id/accept` | `server/routes/referrals.ts` | `EmployeeProfile`, `ReferralRequest`, `StudentProfile`, `Notification` | POST | `employeeProfileId`, `statusHistoryJson` | `employeeProfileId`, `status` ("REFERRAL_SUBMITTED"), `statusHistoryJson`, `totalReferrals` (increment) | Employee Referral Submission |
| `/api/referrals/:id/status` | `server/routes/referrals.ts` | `ReferralRequest`, `EmployeeProfile`, `CompanyProfile`, `StudentProfile`, `Notification` | PUT | `statusHistoryJson`, `employeeProfileId` | `status`, `statusHistoryJson`, `notes`, `successfulReferrals` (increment), `earnings` (increment) | Referral Pipeline Management |
| `/api/feed/posts` | `server/routes/feed.ts` | `Post`, `StudentProfile`, `User`, `Comment`, `Like` | GET, POST | Post content, user name/avatar, likes, comments | `content`, `type`, `mediaUrl`, `privacy` | Social Proof Feed |
| `/api/feed/posts/:id/like` | `server/routes/feed.ts` | `Like`, `Post` | POST | `postId`, `userId` | Toggles `Like` record, increments/decrements `likesCount` | Social Proof Feed |
| `/api/payments/create` | `server/routes/payments.ts` | `Transaction`, `StudentProfile`, `Notification` | POST | `userId`, `role` | `type`, `amount`, `currency`, `status`, `razorpayPaymentId`, `humanVerified` (set to `true` on premium) | Payment Simulation |
| `/api/payments/history` | `server/routes/payments.ts` | `Transaction` | GET | Transaction history | None | User Payment History |
| `/api/admin/analytics` | `server/routes/admin.ts` | `StudentProfile`, `CompanyProfile`, `EmployeeProfile`, `Job`, `ReferralRequest`, `AssessmentAttempt`, `InterviewSession`, `Transaction` | GET | System metrics counts & totals | None | Admin Dashboard Analytics |
| `/api/admin/commission-rules` | `server/routes/admin.ts` | `CommissionRule` | GET, PUT | Monetization config | `studentFee`, `companySubMonthly`, `employeeRewardAmount`, `platformCommissionPercent` | Admin Monetization Config |
| `/api/admin/users` | `server/routes/admin.ts` | `User` | GET | `id`, `name`, `email`, `role`, `createdAt` | None | Admin User Moderation |
| `/api/notifications` | `server/routes/notifications.ts` | `Notification` | GET, PUT, POST | Notification records | `read` (Boolean) | Notification System |

### Unused Schema Models
- **`AssessmentTemplate`**: Declared in schema and seeded, but all question generation in `server/routes/assessments.ts` is generated on-the-fly dynamically via `aiService.generateQuestions()`.
- **`Question`**: Declared in schema and seeded, but not directly queried by `server/routes/assessments.ts`.
- **`AssessmentAnswer`**: Declared in schema and seeded, but individual question answers are stored as a JSON array string (`answersJson`) directly on the `AssessmentAttempt` record.

---

## 4. Frontend Usage Audit

- **`src/context/AuthContext.tsx`**: Manages state for `user`, `token`, and `role`. Uses `localStorage.getItem('hiremeout_token')`. Calls `api.getMe()`, `api.login()`, `api.demoLogin()`, `api.register()`.
- **`src/services/api.ts`**: Centralized HTTP client using standard `fetch`. Automatically attaches `Authorization: Bearer ${token}` header from `localStorage`.
- **`src/types/index.ts`**: Declares TypeScript interfaces mirroring Prisma models (`User`, `StudentProfile`, `CompanyProfile`, `EmployeeProfile`, `Job`, `ReferralRequest`, `Post`, `Transaction`, `AssessmentAttempt`, `InterviewReport`, `Question`, `CandidateCardData`).
- **`src/App.tsx`**: Tab and routing controller (`landing`, `discovery`, `radar`, `feed`, `pricing`, `dashboard`). Controls views depending on `role` (`STUDENT`, `COMPANY`, `EMPLOYEE`, `ADMIN`).

---

## 5. Identified Prototype & Demo Data Shortcuts

The following list documents all hardcoded values, fallbacks, and mock logic currently present in the codebase:

1. **Authentication & Password Fallbacks**:
   - `JWT_SECRET` fallback string `'super-secret-hiremeout-key-2026'` in `server/middleware/auth.ts`.
   - Hardcoded password bypass `password !== 'password123'` in `server/routes/auth.ts` (allows logging into any account using `password123`).
   - `/api/auth/demo-login` route issuing valid JWT tokens for hardcoded emails (`student@demo.com`, `company@demo.com`, `employee@demo.com`, `admin@demo.com`).
2. **Hardcoded Resume URLs**:
   - `'https://cdn.hiremeout.io/resumes/demo_resume.pdf'` hardcoded in `server/routes/students.ts`.
   - `'https://cdn.hiremeout.io/resumes/ananya_sharma_resume.pdf'` in `prisma/seed.ts`.
3. **Hardcoded Dates & Timeline Events**:
   - Progress timeline in `server/routes/students.ts` contains hardcoded dates (`March 2, 2026`, `March 7, 2026`, `March 15, 2026`, `March 22, 2026`, `April 4, 2026`).
   - Referral status history initial array in `server/routes/referrals.ts` and `prisma/seed.ts`.
4. **Mocked AI Scores & Sub-scores**:
   - In `server/services/aiService.ts`, interview evaluation returns fixed sub-scores (`techDepthScore = 91`, `commScore = 82`, `problemSolvingScore = 88`, `behavioralScore = 86`, `confidenceScore = 85`).
   - Fallback talent scores (`techScore: 82`, `problemSolvingScore: 79`, `commScore: 74`, etc.) created upon student registration in `server/routes/auth.ts`.
5. **Simulated Payment Logic**:
   - `/api/payments/create` generates mock Razorpay IDs (`pay_${Date.now()}_rzp`) and mock receipt URLs (`https://hiremeout.io/invoices/inv_...pdf`).
6. **Hardcoded Fallback Analytics**:
   - In `server/routes/admin.ts`, revenue fallback calculation defaults to `284500` if transaction sum is zero.
7. **JSON Strings in Database Columns**:
   - Structured lists stored as text columns (`targetRoles`, `missingSkills`, `techStack`, `optionsJson`, `answersJson`, `feedbackJson`, `strengthsJson`, `weaknessesJson`, `transcriptJson`, `requiredSkillsJson`, `preferredSkillsJson`, `statusHistoryJson`).

---

## 6. Identified Security Issues

1. **Custom JWT Authentication**:
   - Signed with a weak, predictable default secret (`super-secret-hiremeout-key-2026`).
   - Standard JWT tokens lack built-in row-level data isolation enforcement at the database level.
2. **Insecure Token Storage**:
   - Auth tokens are stored in `localStorage`, making them vulnerable to Cross-Site Scripting (XSS) attacks.
3. **Hardcoded Password Backdoor**:
   - `password !== 'password123'` check in `auth.ts` permits unauthorized access to any user account.
4. **Demo Auth Endpoint in Production Code**:
   - `/api/auth/demo-login` allows instant privilege escalation to `ADMIN`, `COMPANY`, or `EMPLOYEE` without credential verification.
5. **Unverified Payment Endpoint**:
   - `/api/payments/create` accepts client-supplied `amount` and automatically marks transactions as `COMPLETED` and sets `humanVerified = true` without checking Razorpay cryptographic signatures or webhooks.
6. **Overly Broad Role Permissions**:
   - In `/api/referrals/:id/status`, `requireRole('COMPANY', 'ADMIN', 'EMPLOYEE', 'STUDENT')` allows `STUDENT` users to advance their own referral status to `HIRED`.
7. **Missing Ownership & Resource Scoping**:
   - Several endpoints (e.g. updating assessment answers or reading student profiles) rely on payload parameters without strictly verifying that the requested resource belongs to `req.user.id`.
8. **Lack of Database Row Level Security (RLS)**:
   - SQLite does not support RLS; any compromised server process or SQL injection has unrestricted access to all tables and records.

---

## 7. Current Roles & Authorizations Audit

- **`STUDENT`**:
  - *Can Access*: Onboarding wizard, student dashboard, assessment player, AI mock interview room, job radar, referral request tracking, social feed, payment simulation.
  - *Can Modify*: Own profile data, resume upload text, assessment answers, post creations, post likes.
- **`COMPANY`**:
  - *Can Access*: Recruiter discovery dashboard, candidate filtering/search, candidate profile modal, candidate side-by-side comparison, job posting manager.
  - *Can Modify*: Create job postings, shortlist candidates, issue interview requests, advance candidate referral status.
- **`EMPLOYEE`**:
  - *Can Access*: Internal referrer inbox, job opportunities list at registered company, referral request verification portal.
  - *Can Modify*: Accept referral requests, submit verified internal referrals, advance referral status.
- **`ADMIN`**:
  - *Can Access*: Platform analytics dashboard, user moderation list, commission/pricing rule manager.
  - *Can Modify*: Monetization settings, commission rules, platform parameters, system-wide status.

---

## 8. Business Flows Implementation Status

| Business Flow | Implementation Status | Data Storage & Logic |
| :--- | :--- | :--- |
| **Student Registration & Login** | Implemented | `User` + `StudentProfile` created; JWT returned |
| **Student Onboarding Wizard** | Implemented | Updates `StudentProfile`, `Skill`, `Project`, `Certification` |
| **Resume Upload & AI Parsing** | Implemented | Mock text parsing via `resumeParser.ts`; saves score & missing skills |
| **Verified Talent Assessment** | Implemented | Dynamic question sets generated by `aiService.ts`; saves `AssessmentAttempt` |
| **AI Mock Technical Interview** | Implemented | 6-round scenario interview; evaluates responses & saves `InterviewSession` |
| **Human Verification Request** | Implemented | Schedules `HumanInterviewRequest`; sets `humanVerified = true` |
| **AI Job Radar & Match Engine** | Implemented | Evaluates skill overlap & talent score against `Job` via `matchingEngine.ts` |
| **Recruiter Discovery & Search** | Implemented | Filters `StudentProfile` by domain, talent score, tier, human verification, college |
| **Candidate Shortlisting & Request** | Implemented | Creates `ReferralRequest` status `INTERVIEW_REQUESTED` + `Notification` |
| **Employee Referral Verification** | Implemented | Employee accepts request, updates `ReferralRequest` to `REFERRAL_SUBMITTED` |
| **Referral Pipeline & Hiring** | Implemented | Status transitions (`SHORTLISTED` -> `INTERVIEW_REQUESTED` -> `REFERRAL_SUBMITTED` -> `SCREENING` -> `HIRED`); increments employee earnings |
| **Social Proof Feed** | Implemented | Creates/reads `Post`, toggles `Like` |
| **Monetization & Payments** | Implemented (Simulated) | Creates `Transaction` record; updates verification status |
| **Admin Platform Management** | Implemented | Reads counts from all tables; updates `CommissionRule` |

---

## 9. Proposed Supabase PostgreSQL Schema Mapping

Below is the proposed design mapping from current Prisma models to production Supabase PostgreSQL tables:

```
CURRENT PRISMA MODEL        PROPOSED SUPABASE TABLE       AUTH RELATION                 RLS OWNER LOGIC
========================================================================================================================
User                  →     profiles                      linked to auth.users (id)     Identity Owner (auth.uid() = id)
StudentProfile        →     student_profiles              linked to profiles (user_id)  Student Owner / Public View
Education             →     student_educations            linked via student_profile_id Student Owner / Public View
Experience            →     student_experiences           linked via student_profile_id Student Owner / Public View
Skill                 →     student_skills                linked via student_profile_id Student Owner / Public View
Project               →     student_projects              linked via student_profile_id Student Owner / Public View
Certification         →     student_certifications        linked via student_profile_id Student Owner / Public View
Achievement           →     student_achievements          linked via student_profile_id Student Owner / Public View
CompanyProfile        →     company_profiles              linked to profiles (user_id)  Company Recruiter Owner
EmployeeProfile       →     employee_profiles             linked to profiles (user_id)  Employee Owner
AssessmentTemplate    →     assessment_templates          None                          Read: Auth Users / Write: Admin
Question              →     assessment_questions          None                          Read: Auth Users / Write: Admin
AssessmentAttempt     →     assessment_attempts           linked via student_profile_id Student Owner / Company View
AssessmentAnswer      →     assessment_answers            linked via attempt_id         Student Owner
InterviewSession      →     interview_sessions            linked via student_profile_id Student Owner / Recruiter View
HumanInterviewRequest →     human_interview_requests      linked via student_profile_id Student Owner / Admin Access
Job                   →     jobs                          linked via company_profile_id Company Recruiter / Public Read
ReferralRequest       →     referral_requests             linked to student/company/emp Candidate, Company, Employee
Post                  →     posts                         linked via student_profile_id Author / Public Read
Comment               →     comments                      linked to profiles (user_id)  Author / Public Read
Like                  →     likes                         linked to profiles (user_id)  Author / Public Read
Transaction           →     transactions                  linked to profiles (user_id)  User Owner / Admin Access
CommissionRule        →     commission_rules              None                          Public Read / Admin Write
Notification          →     notifications                 linked to profiles (user_id)  Recipient Owner (auth.uid() = user_id)
```

---

## 10. Proposed New Production Tables Required

To support full production features without relying on JSON string blobs or single-user profile assumptions, the following new tables are required:

1. **`user_roles`**:
   - Maps `user_id` to roles (`STUDENT`, `COMPANY`, `EMPLOYEE`, `ADMIN`). Integrates with Supabase Auth Custom Claims or RBAC functions.
2. **`company_members`**:
   - Maps multiple company recruiters (`profile_id`) to a single `company_profile_id` with permissions (`OWNER`, `RECRUITER`, `MEMBER`).
3. **`shortlists`**:
   - Dedicated junction table tracking candidate shortlisting by recruiters without creating prematurely full referral requests.
4. **`referral_status_history`**:
   - Replaces `statusHistoryJson` text blob with a normalized relational audit table (`id`, `referral_request_id`, `status`, `actor_id`, `notes`, `created_at`).
5. **`resume_files`**:
   - Metadata table tracking uploaded resume versions, file paths in Supabase Storage, MIME types, and parsing outputs.
6. **`company_verifications`**:
   - Holds company domain verification records, GST/EIN documents, and admin approval logs.
7. **`audit_logs`**:
   - Tracks security actions (role changes, status overhauls, payment payouts).

---

## 11. Proposed Row Level Security (RLS) Model

The required RLS policies for each production table are specified below:

| Table | Public Access | Authenticated Access | Owner Policy | Role-based Policy |
| :--- | :--- | :--- | :--- | :--- |
| `profiles` | SELECT (name, avatar, role) | SELECT | UPDATE if `auth.uid() = id` | ADMIN (ALL) |
| `student_profiles` | SELECT if `privacy_level = 'PUBLIC'` | SELECT if `privacy_level IN ('PUBLIC', 'VERIFIED_EMPLOYERS')` | SELECT, UPDATE if `user_id = auth.uid()` | COMPANY / EMPLOYEE (SELECT if privacy permits), ADMIN (ALL) |
| `student_skills` / `projects` / `educations` | SELECT (if profile readable) | SELECT | ALL if profile belongs to `auth.uid()` | ADMIN (ALL) |
| `company_profiles` | SELECT | SELECT | ALL if `user_id = auth.uid()` or in `company_members` | ADMIN (ALL) |
| `employee_profiles` | SELECT (verified status) | SELECT | ALL if `user_id = auth.uid()` | ADMIN (ALL) |
| `jobs` | SELECT active jobs | SELECT active jobs | ALL if `company_profile_id` belongs to recruiter | ADMIN (ALL) |
| `assessment_attempts` | NONE | NONE | ALL if `student_profile_id` belongs to `auth.uid()` | COMPANY (SELECT summary scores only), ADMIN (ALL) |
| `interview_sessions` | NONE | NONE | ALL if `student_profile_id` belongs to `auth.uid()` | COMPANY (SELECT completed report), ADMIN (ALL) |
| `referral_requests` | NONE | NONE | SELECT if candidate (`student_profile_id = auth.uid()`) | COMPANY (SELECT, UPDATE if owner), EMPLOYEE (SELECT, UPDATE if assigned), ADMIN (ALL) |
| `posts` / `comments` / `likes` | SELECT public posts | SELECT, INSERT | ALL if `user_id / profile_id = auth.uid()` | ADMIN (ALL) |
| `transactions` | NONE | NONE | SELECT if `user_id = auth.uid()` | ADMIN (ALL) |
| `notifications` | NONE | NONE | ALL if `user_id = auth.uid()` | System Trigger Insert |
| `commission_rules` | SELECT | SELECT | NONE | ADMIN (ALL) |

---

## 12. Proposed Supabase Storage Model

Four dedicated storage buckets should be established:

| Bucket Name | Public Visibility | Owner Access | Recruiter / Employee Access | Allowed File Types | Max Size |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`resumes`** | Private (`false`) | Candidate Read/Write (`auth.uid()`) | Verified Recruiter & Employee Read | PDF, DOCX | 5 MB |
| **`avatars`** | Public (`true`) | User Read/Write (`auth.uid()`) | Public Read | PNG, JPG, WEBP | 2 MB |
| **`company-logos`**| Public (`true`) | Recruiter Read/Write (`auth.uid()`) | Public Read | PNG, JPG, SVG, WEBP | 2 MB |
| **`verification-docs`** | Private (`false`) | Company / Employee Write | Admin Only Read | PDF, PNG, JPG | 10 MB |

---

## 13. Authentication & API Migration Strategy

### Auth Transition (Custom JWT → Supabase Auth)
1. Replace `localStorage` token management with `@supabase/supabase-js` client authentication (`supabase.auth.signUp()`, `supabase.auth.signInWithPassword()`).
2. Utilize Supabase session management (`onAuthStateChange`).
3. Store user metadata and roles in `auth.users` app_metadata or synced `profiles` table.
4. Replace Express `authenticateJWT` middleware with standard Supabase JWT validation (`supabase.auth.getUser(token)`).

### API Architecture Evolution
- **Phase A**: Frontend interacts with Supabase Auth for login/signup; Express API handles business logic using Supabase Service Role client for DB operations.
- **Phase B**: Migrate direct read operations (candidate discovery, job listing, social feed) directly to Supabase client using PostgreSQL RLS policies.
- **Phase C**: Keep complex server-side operations (AI interview generation, resume parsing, talent score weighting calculations) as Express endpoints or Supabase Edge Functions.

---

## 14. Data Migration Risks

1. **JSON String Unpacking**:
   - Current SQLite schema stores JSON strings (`targetRoles`, `requiredSkillsJson`, `statusHistoryJson`). Moving to PostgreSQL array types (`text[]`) or normalized tables requires explicit ETL sanitization.
2. **UUID References**:
   - Ensures all user foreign keys directly reference `auth.users.id` upon migration.
3. **Password Hash Incompatibility**:
   - Existing SQLite passwords hashed via `bcryptjs` must either be migrated into `auth.users` using Supabase admin password import tools or users prompted to reset passwords.
4. **Data Integrity Constraints**:
   - Existing SQLite test records may contain orphan rows (e.g., student profiles missing matching `User` records) that must be cleaned prior to applying foreign key constraints in PostgreSQL.

---

## 15. Recommended Migration Order

1. **Step 5**: Create Supabase Project & Execute Production PostgreSQL DDL Script.
2. **Step 6**: Enable RLS Policies & Storage Buckets.
3. **Step 7**: Configure Supabase Auth & Integrate `@supabase/supabase-js` in Frontend.
4. **Step 8**: Migrate Backend Services & Endpoints to Supabase Client.
5. **Step 9**: Data ETL (Migrate SQLite Seed/Production Data to Supabase).
6. **Step 10**: End-to-End Runtime Verification & Security Audit.

---

## 16. Mandatory Items That MUST NOT Be Changed Yet

- **Do NOT delete `prisma/schema.prisma` or `prisma/dev.db`**.
- **Do NOT modify Express server routes or middleware**.
- **Do NOT remove hardcoded seed or fallback credentials in code**.
- **Do NOT execute SQL scripts against Supabase yet**.
- **Do NOT alter frontend AuthContext or API service functions**.

---

## 17. Files Inspected During Audit

1. `prisma/schema.prisma`
2. `prisma/seed.ts`
3. `server/index.ts`
4. `server/db.ts`
5. `server/middleware/auth.ts`
6. `server/middleware/errorHandler.ts`
7. `server/routes/auth.ts`
8. `server/routes/students.ts`
9. `server/routes/assessments.ts`
10. `server/routes/interviews.ts`
11. `server/routes/discovery.ts`
12. `server/routes/jobs.ts`
13. `server/routes/referrals.ts`
14. `server/routes/feed.ts`
15. `server/routes/payments.ts`
16. `server/routes/admin.ts`
17. `server/routes/notifications.ts`
18. `server/services/aiService.ts`
19. `server/services/matchingEngine.ts`
20. `server/services/resumeParser.ts`
21. `server/services/scoringEngine.ts`
22. `src/App.tsx`
23. `src/context/AuthContext.tsx`
24. `src/services/api.ts`
25. `src/types/index.ts`

---
*Report compiled autonomously by Antigravity AI agentic pair-programmer.*
