# HIRE ME OUT — Verified Talent Discovery & Referral Platform

> **"Don't just get referred. Get verified first."**  
> *"Don't refer resumes. Refer verified talent. Companies should see the candidate's journey, not just the candidate's CV."*

---

## 🌟 Overview

**Hire Me Out** is a full-stack, state-driven verified talent platform designed to replace unverified resume spamming with authentic, AI-evaluated proof points. Candidates prove their technical capabilities through adaptive skill assessments and 6-round technical mock interviews, earning an explainable **Verified Talent Score**. Hiring managers discover verified candidates with rich analytics, while company employees review proof points before submitting internal referrals.

---

## 🚀 Key Features

1. **Complete Rebranding & Positioning**:
   - Official product name: **HIRE ME OUT**
   - Tagline: *"Don't just get referred. Get verified first."*
   - Core philosophy: *"Don't refer resumes. Refer verified talent."*

2. **Full-Width Viewport Fluid Responsive Architecture**:
   - Eliminates constrained max-width containers on main application shell.
   - Utilizes 100% available browser width seamlessly across 1280px, 1366px, 1440px, 1536px, 1920px, 2560px desktops and mobile (320px–768px).

3. **Student 12-Step Onboarding**:
   - 12-step structured wizard saving progress, validating fields, and persisting candidate data to SQLite via Prisma.

4. **AI Resume Upload & Structured Parsing**:
   - Extracts 14 structured fields (education, skills, experience, CGPA, links) with quality scoring and missing skill identification.
   - Provider-agnostic AI architecture with deterministic fallback for 100% offline reliability.

5. **Interactive Assessment Engine with Mid-Test Autosave**:
   - MCQ, coding, debugging, scenario, and written evaluation.
   - Saves answers incrementally to prevent data loss on page refresh.
   - Calculates score drivers, talent tier (Tier S/A/B/C), percentile, and explanation.

6. **AI Technical Mock Interview Room & Report Card**:
   - 6-round technical interview flow (Introduction, Resume Deep Dive, Core Concepts, System Scenario, Behavioral, Candidate Questions).
   - Generates comprehensive report card with technical depth, communication, confidence, accuracy, and hiring recommendation.

7. **Human Verification Flow**:
   - Request, schedule, and evaluate 1-on-1 human verification interviews with senior tech leads.

8. **Recruiter Candidate Discovery & Side-by-Side Comparison**:
   - Server-side database filtering by domain, skills, score, tier, CGPA, location, remote, experience, and human verification badges.
   - One-click shortlisting and interview requesting with real candidate notification alerts.

9. **Employee Referrer Inbox & 12-Stage Referral Pipeline**:
   - Employee dashboard showcasing pre-screened referral opportunities.
   - Synchronized 12-stage status machine (`PROFILE_CREATED` -> `ASSESSMENT_COMPLETE` -> `AI_INTERVIEW_COMPLETE` -> `VERIFIED` -> `SHORTLISTED` -> `INTERVIEW_REQUESTED` -> `INTERVIEW_COMPLETED` -> `REFERRAL_SUBMITTED` -> `SCREENING` -> `FINAL_INTERVIEW` -> `OFFER` -> `HIRED`).

10. **In-App Notification Center & Payment Simulator**:
    - Real-time notification drawer backed by SQLite database.
    - Razorpay payment simulation upgrading user status and creating transaction receipts.

---

## 🛠️ Quick Start & Setup

### Prerequisites
- Node.js (v18+)
- npm

### Installation & Database Setup
```bash
# 1. Install dependencies
npm install

# 2. Push database schema & seed demo accounts
npm run setup
```

### Running Locally
```bash
# Start both backend server (port 5000) and frontend Vite server (port 5173)
npm run dev
```

### Running Automated Test Suite
```bash
# Run integration tests
npm run test

# Run End-to-End multi-role lifecycle test
npm run test:e2e

# Production build check
npm run build
```

---

## 🔑 Demo Login Accounts

| Role | Email | Password |
| :--- | :--- | :--- |
| **Candidate / Student** | `student@demo.com` | `password123` |
| **Recruiter / Company** | `company@demo.com` | `password123` |
| **Employee Referrer** | `employee@demo.com` | `password123` |
| **Administrator** | `admin@demo.com` | `password123` |

---

## 📁 Repository Structure

```
├── prisma/
│   ├── schema.prisma      # Database schema (SQLite / PostgreSQL ready)
│   └── seed.ts            # Hire Me Out database seed script
├── server/
│   ├── index.ts           # Express server entrypoint
│   ├── middleware/        # Auth JWT and Error handlers
│   ├── routes/            # Auth, Students, Assessments, Interviews, Discovery, Referrals, Jobs, Notifications, Payments, Admin, Feed
│   └── services/          # AI Service, Scoring Engine, Resume Parser, Matching Engine
├── src/
│   ├── App.tsx            # Main application layout shell
│   ├── components/        # Student, Company, Referrer, Admin, Auth, Common, Landing, Layout components
│   ├── context/           # AuthContext state manager
│   ├── services/          # Frontend API client
│   └── types/             # TypeScript definitions
├── tests/
│   ├── integration.test.ts # Integration test suite
│   └── e2e.test.ts        # End-to-End lifecycle test script
└── package.json
```
