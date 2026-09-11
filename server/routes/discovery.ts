import { Router, Request, Response } from 'express';
import { prisma } from '../db.js';
import { authenticateJWT, requireRole, AuthRequest } from '../middleware/auth.js';
import { calculateCandidateJobMatch } from '../services/matchingEngine.js';

const router = Router();

// CANDIDATE DISCOVERY SEARCH & FILTERS
router.get('/candidates', authenticateJWT, requireRole('COMPANY', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const {
      domain, role, skills, minScore, tier, humanVerifiedOnly,
      college, minCgpa, location, sort
    } = req.query;

    const whereClause: any = {
      privacyLevel: { in: ['PUBLIC', 'VERIFIED_EMPLOYERS'] }
    };

    if (domain) {
      whereClause.targetDomain = { contains: String(domain) };
    }

    if (minScore) {
      whereClause.talentScore = { gte: parseInt(String(minScore)) };
    }

    if (tier && tier !== 'ALL') {
      whereClause.talentTier = String(tier);
    }

    if (humanVerifiedOnly === 'true') {
      whereClause.humanVerified = true;
    }

    if (college) {
      whereClause.college = { contains: String(college) };
    }

    if (minCgpa) {
      whereClause.cgpa = { gte: parseFloat(String(minCgpa)) };
    }

    // Determine sorting
    let orderBy: any = { talentScore: 'desc' };
    if (sort === 'RECENTLY_VERIFIED') {
      orderBy = { updatedAt: 'desc' };
    } else if (sort === 'HIGHEST_TECH') {
      orderBy = { techScore: 'desc' };
    } else if (sort === 'HIGHEST_INTERVIEW') {
      orderBy = { interviewScore: 'desc' };
    }

    const students = await prisma.studentProfile.findMany({
      where: whereClause,
      include: {
        user: {
          select: { name: true, email: true, avatar: true }
        },
        skills: true,
        projects: true,
        certifications: true,
        assessmentAttempts: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        interviewSessions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        }
      },
      orderBy,
      take: 50,
    });

    // Post-filter by skills if specified
    let filteredStudents = students;
    if (skills) {
      const skillFilter = String(skills).toLowerCase();
      filteredStudents = students.filter(st =>
        st.skills.some(s => s.name.toLowerCase().includes(skillFilter))
      );
    }

    return res.json({
      total: filteredStudents.length,
      candidates: filteredStudents.map(st => ({
        id: st.id,
        name: st.user.name,
        avatar: st.user.avatar,
        headline: st.headline || `${st.targetDomain || 'Software'} Engineer`,
        college: st.college || 'Engineering Institute',
        degree: st.degree || 'B.Tech CSE',
        cgpa: st.cgpa || 8.8,
        gradYear: st.gradYear || 2026,
        location: st.location || 'Bangalore, India',
        targetDomain: st.targetDomain || 'Software Development',
        talentScore: st.talentScore || 87,
        talentTier: st.talentTier || 'Tier A',
        percentile: st.percentile || 88,
        techScore: st.techScore || 91,
        problemSolvingScore: st.problemSolvingScore || 88,
        commScore: st.commScore || 79,
        projectsScore: st.projectsScore || 93,
        interviewScore: st.interviewScore || 85,
        humanVerified: st.humanVerified,
        skills: st.skills.map(s => s.name),
        projectsCount: st.projects.length,
        certificationsCount: st.certifications.length,
        latestAssessment: st.assessmentAttempts[0] ? st.assessmentAttempts[0].score : 88,
        latestInterview: st.interviewSessions[0] ? st.interviewSessions[0].overallScore : 85,
        availability: 'Immediate / 30 days',
      }))
    });
  } catch (err: any) {
    console.error('Candidate discovery error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// RECRUITER SHORTLISTS CANDIDATE
router.post('/shortlist', authenticateJWT, requireRole('COMPANY', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { studentProfileId } = req.body;
    const company = await prisma.companyProfile.findUnique({ where: { userId: req.user!.id } });
    if (!company) return res.status(404).json({ error: 'Company profile not found.' });

    const student = await prisma.studentProfile.findUnique({
      where: { id: studentProfileId },
      include: { user: true }
    });

    if (!student) return res.status(404).json({ error: 'Student not found.' });

    // Notify Candidate
    await prisma.notification.create({
      data: {
        userId: student.userId,
        title: 'Shortlisted by Recruiter!',
        message: `${company.companyName} shortlisted your verified profile for discovery.`,
        type: 'SHORTLIST',
      }
    });

    return res.json({ success: true, message: `Candidate ${student.user.name} shortlisted by ${company.companyName}.` });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// CANDIDATE PROFILE DETAILS FOR RECRUITER
router.get('/candidates/:id', authenticateJWT, requireRole('COMPANY', 'ADMIN', 'EMPLOYEE'), async (req: AuthRequest, res: Response) => {
  try {
    const student = await prisma.studentProfile.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { name: true, email: true, avatar: true } },
        educations: true,
        experiences: true,
        skills: true,
        projects: true,
        certifications: true,
        achievements: true,
        assessmentAttempts: { orderBy: { createdAt: 'desc' } },
        interviewSessions: { orderBy: { createdAt: 'desc' } },
        posts: { orderBy: { createdAt: 'desc' }, take: 5 }
      }
    });

    if (!student) return res.status(404).json({ error: 'Candidate profile not found.' });

    return res.json({ candidate: student });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// CANDIDATE SIDE-BY-SIDE COMPARISON
router.post('/candidates/compare', authenticateJWT, requireRole('COMPANY', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { candidateIds } = req.body;
    if (!Array.isArray(candidateIds) || candidateIds.length === 0) {
      return res.status(400).json({ error: 'Please provide candidateIds array.' });
    }

    const candidates = await prisma.studentProfile.findMany({
      where: { id: { in: candidateIds } },
      include: {
        user: { select: { name: true, avatar: true } },
        skills: true,
        projects: true,
        assessmentAttempts: { orderBy: { createdAt: 'desc' }, take: 1 },
        interviewSessions: { orderBy: { createdAt: 'desc' }, take: 1 }
      }
    });

    return res.json({ candidates });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
