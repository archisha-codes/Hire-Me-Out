import { Router, Response } from 'express';
import { prisma } from '../db.js';
import { authenticateJWT, requireRole, AuthRequest } from '../middleware/auth.js';
import { aiService } from '../services/aiService.js';
import { calculateVerifiedTalentScore } from '../services/scoringEngine.js';

const router = Router();

// GET Student Profile
router.get('/me', authenticateJWT, requireRole('STUDENT'), async (req: AuthRequest, res: Response) => {
  try {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.id },
      include: {
        educations: true,
        experiences: true,
        skills: true,
        projects: true,
        certifications: true,
        achievements: true,
        assessmentAttempts: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        interviewSessions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        posts: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        }
      }
    });

    if (!student) {
      return res.status(404).json({ error: 'Student profile not found.' });
    }

    return res.json({ student });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// UPDATE Student Profile / Onboarding Wizard
router.put('/me', authenticateJWT, requireRole('STUDENT'), async (req: AuthRequest, res: Response) => {
  try {
    const {
      headline, college, degree, branch, gradYear, cgpa, location,
      targetDomain, targetRoles, experienceLevel, bio, github, linkedin, portfolio,
      educations, experiences, skills, projects, certifications, achievements,
      privacyLevel
    } = req.body;

    let student = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });

    if (!student) {
      student = await prisma.studentProfile.create({
        data: { userId: req.user!.id }
      });
    }

    // Update main profile scalar fields
    const updatedStudent = await prisma.studentProfile.update({
      where: { id: student.id },
      data: {
        headline,
        college,
        degree,
        branch,
        gradYear: gradYear ? parseInt(gradYear) : undefined,
        cgpa: cgpa ? parseFloat(cgpa) : undefined,
        location,
        targetDomain: targetDomain || 'Software Development',
        targetRoles: Array.isArray(targetRoles) ? JSON.stringify(targetRoles) : targetRoles,
        experienceLevel: experienceLevel || 'Fresher',
        bio,
        github,
        linkedin,
        portfolio,
        privacyLevel: privacyLevel || 'PUBLIC',
        onboardingComplete: true,
      }
    });

    // Handle nested collections if provided
    if (skills && Array.isArray(skills)) {
      await prisma.skill.deleteMany({ where: { studentProfileId: student.id } });
      await prisma.skill.createMany({
        data: skills.map((s: any) => ({
          studentProfileId: student.id,
          name: typeof s === 'string' ? s : s.name,
          category: s.category || 'Core Skill',
          level: s.level || 'Intermediate',
        }))
      });
    }

    if (projects && Array.isArray(projects)) {
      await prisma.project.deleteMany({ where: { studentProfileId: student.id } });
      await prisma.project.createMany({
        data: projects.map((p: any) => ({
          studentProfileId: student.id,
          title: p.title,
          description: p.description || '',
          techStack: Array.isArray(p.techStack) ? JSON.stringify(p.techStack) : p.techStack,
          githubUrl: p.githubUrl,
          liveUrl: p.liveUrl,
        }))
      });
    }

    if (certifications && Array.isArray(certifications)) {
      await prisma.certification.deleteMany({ where: { studentProfileId: student.id } });
      await prisma.certification.createMany({
        data: certifications.map((c: any) => ({
          studentProfileId: student.id,
          title: c.title,
          issuer: c.issuer || 'Online Platform',
          issueDate: c.issueDate || '2026',
          credentialUrl: c.credentialUrl,
        }))
      });
    }

    // Recalculate talent score
    const currentScores = {
      techScore: updatedStudent.techScore || 80,
      problemSolvingScore: updatedStudent.problemSolvingScore || 78,
      commScore: updatedStudent.commScore || 75,
      projectsScore: updatedStudent.projectsScore || 85,
      interviewScore: updatedStudent.interviewScore || 75,
    };

    const calculated = calculateVerifiedTalentScore(updatedStudent.targetDomain || 'Software Development', currentScores);

    const finalProfile = await prisma.studentProfile.update({
      where: { id: student.id },
      data: {
        talentScore: calculated.talentScore,
        talentTier: calculated.talentTier,
        percentile: calculated.percentile,
      },
      include: {
        educations: true,
        experiences: true,
        skills: true,
        projects: true,
        certifications: true,
        achievements: true,
      }
    });

    return res.json({ student: finalProfile, explanation: calculated.explanation });
  } catch (err: any) {
    console.error('Update profile error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// RESUME UPLOAD & AI PARSING
router.post('/resume', authenticateJWT, requireRole('STUDENT'), async (req: AuthRequest, res: Response) => {
  try {
    const { resumeText, targetDomain } = req.body;
    const textToParse = resumeText || 'Extracted resume content with React, Node.js, Python, SQL, B.Tech CSE, 2 internships, 4 projects.';

    const parsedData = await aiService.parseResume(textToParse, targetDomain || 'Software Development');

    // Save parsed data to student profile
    const student = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
    if (student) {
      await prisma.studentProfile.update({
        where: { id: student.id },
        data: {
          resumeUrl: 'https://cdn.hiremeout.io/resumes/demo_resume.pdf',
          resumeScore: parsedData.resumeQualityScore,
          missingSkills: JSON.stringify(parsedData.missingRecommendedSkills),
        }
      });
    }

    return res.json({ parsedData });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// PROGRESS TIMELINE
router.get('/progress', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.id },
      include: {
        assessmentAttempts: { orderBy: { createdAt: 'desc' } },
        interviewSessions: { orderBy: { createdAt: 'desc' } },
        certifications: true,
        projects: true,
      }
    });

    if (!student) return res.status(404).json({ error: 'Student not found.' });

    // Build timeline events
    const timeline = [
      { id: '1', date: 'March 2, 2026', title: 'Profile Created', type: 'PROFILE', score: 72, description: 'Created initial verified talent profile' },
      { id: '2', date: 'March 7, 2026', title: 'AI Resume Analysis', type: 'RESUME', score: student.resumeScore || 82, description: `Resume analyzed with score ${student.resumeScore || 82}/100` },
      { id: '3', date: 'March 15, 2026', title: 'Core Technical Assessment', type: 'ASSESSMENT', score: student.techScore || 88, description: `Completed Software Development Assessment - Score: ${student.techScore || 88}` },
      { id: '4', date: 'March 22, 2026', title: 'AI Mock Technical Interview', type: 'INTERVIEW', score: student.interviewScore || 85, description: `Completed 6-round AI Mock Interview - Recommendation: Recommended` },
      { id: '5', date: 'April 4, 2026', title: 'Talent Score Upgraded', type: 'TIER', score: student.talentScore, description: `Talent Tier upgraded to ${student.talentTier} (Top ${student.percentile}% percentile)` },
    ];

    return res.json({ timeline, currentScore: student.talentScore, tier: student.talentTier });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
