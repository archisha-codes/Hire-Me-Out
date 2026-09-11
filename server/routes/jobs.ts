import { Router, Request, Response } from 'express';
import { prisma } from '../db.js';
import { authenticateJWT, requireRole, AuthRequest } from '../middleware/auth.js';
import { calculateCandidateJobMatch } from '../services/matchingEngine.js';

const router = Router();

// LIST JOBS
router.get('/', async (req: Request, res: Response) => {
  try {
    const jobs = await prisma.job.findMany({
      where: { isActive: true },
      include: {
        companyProfile: {
          include: {
            user: { select: { name: true, avatar: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ jobs });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// CREATE JOB (Company Recruiter)
router.post('/', authenticateJWT, requireRole('COMPANY', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { title, domain, role, experienceLevel, location, type, description, requiredSkills, preferredSkills, salaryRange, referralBonus } = req.body;
    
    const company = await prisma.companyProfile.findUnique({ where: { userId: req.user!.id } });
    if (!company) return res.status(404).json({ error: 'Company profile not found.' });

    const job = await prisma.job.create({
      data: {
        companyProfileId: company.id,
        title: title || 'Software Engineer Intern',
        domain: domain || 'Software Development',
        role: role || 'Full Stack Developer',
        experienceLevel: experienceLevel || 'Fresher',
        location: location || 'Bangalore, India (Hybrid)',
        type: type || 'FULL_TIME',
        description: description || 'Seeking verified engineering talent proficient in React, Node.js, and SQL.',
        requiredSkillsJson: JSON.stringify(requiredSkills || ['React', 'Node.js', 'SQL', 'JavaScript']),
        preferredSkillsJson: JSON.stringify(preferredSkills || ['AWS', 'Docker', 'TypeScript']),
        salaryRange: salaryRange || '₹8 - 14 LPA',
        referralBonus: referralBonus ? parseFloat(referralBonus) : 5000,
      }
    });

    return res.json({ job, message: 'Job created successfully.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// AI JOB RADAR AGGREGATION & MATCHING
router.get('/radar', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.id },
      include: { skills: true }
    });

    const jobs = await prisma.job.findMany({
      include: {
        companyProfile: {
          include: {
            user: { select: { name: true, avatar: true } }
          }
        }
      },
      take: 20,
    });

    if (!student) {
      return res.json({ radarJobs: jobs.map(j => ({ job: j, match: { matchPercentage: 85 } })) });
    }

    const radarJobs = jobs.map(job => {
      const match = calculateCandidateJobMatch(student, job);
      return {
        id: job.id,
        title: job.title,
        companyName: job.companyProfile.companyName,
        companyLogo: job.companyProfile.logo || job.companyProfile.user.avatar,
        location: job.location,
        domain: job.domain,
        experienceLevel: job.experienceLevel,
        salaryRange: job.salaryRange,
        requiredSkills: JSON.parse(job.requiredSkillsJson || '[]'),
        referralBonus: job.referralBonus,
        referralAvailable: true,
        candidateTalentScore: student.talentScore,
        matchPercentage: match.matchPercentage,
        skillMatchPercentage: match.skillMatchPercentage,
        matchedSkills: match.matchedSkills,
        missingSkills: match.missingSkills,
        explanation: match.explanation,
      };
    });

    // Sort by match percentage
    radarJobs.sort((a, b) => b.matchPercentage - a.matchPercentage);

    return res.json({ radarJobs });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
