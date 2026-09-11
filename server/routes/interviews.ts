import { Router, Response } from 'express';
import { prisma } from '../db.js';
import { authenticateJWT, requireRole, AuthRequest } from '../middleware/auth.js';
import { aiService } from '../services/aiService.js';
import { calculateVerifiedTalentScore } from '../services/scoringEngine.js';

const router = Router();

// START AI Interview
router.post('/start', authenticateJWT, requireRole('STUDENT'), async (req: AuthRequest, res: Response) => {
  try {
    const { role, domain } = req.body;
    const student = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
    if (!student) return res.status(404).json({ error: 'Student profile not found.' });

    const interviewSession = {
      id: `int_${Date.now()}`,
      role: role || 'Full Stack Developer',
      domain: domain || 'Software Development',
      rounds: [
        { round: 1, title: 'Introduction & Background', duration: '2 mins', description: 'Brief self-introduction and domain interest.' },
        { round: 2, title: 'Resume Deep Dive', duration: '3 mins', description: 'Explaining key projects, tech stack choices, and internships.' },
        { round: 3, title: 'Core Technical Concepts', duration: '5 mins', description: 'Algorithms, system design, state management, API design.' },
        { round: 4, title: 'System Scenario & Troubleshooting', duration: '4 mins', description: 'Handling high concurrency, debugging API latency, caching.' },
        { round: 5, title: 'Behavioral & Team Culture', duration: '3 mins', description: 'Conflict resolution, tight deadline management, learning velocity.' },
        { round: 6, title: 'Candidate Questions & Wrap Up', duration: '2 mins', description: 'Asking role-specific questions and concluding session.' },
      ]
    };

    return res.json({ interviewSession });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// COMPLETE AI Interview & Generate Report
router.post('/complete', authenticateJWT, requireRole('STUDENT'), async (req: AuthRequest, res: Response) => {
  try {
    const { role, domain, responses } = req.body;
    const student = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
    if (!student) return res.status(404).json({ error: 'Student profile not found.' });

    // Evaluate via AI Service
    const evaluation = await aiService.evaluateInterviewSession(
      role || 'Full Stack Developer',
      domain || 'Software Development',
      responses || []
    );

    // Save session in database
    const session = await prisma.interviewSession.create({
      data: {
        studentProfileId: student.id,
        type: 'AI',
        role: role || 'Full Stack Developer',
        domain: domain || 'Software Development',
        status: 'COMPLETED',
        overallScore: evaluation.overallScore,
        commScore: evaluation.commScore,
        techDepthScore: evaluation.techDepthScore,
        confidenceScore: evaluation.confidenceScore,
        accuracyScore: evaluation.accuracyScore,
        behavioralScore: evaluation.behavioralScore,
        strengthsJson: JSON.stringify(evaluation.strengths),
        weaknessesJson: JSON.stringify(evaluation.weaknesses),
        recommendation: evaluation.recommendation,
        transcriptJson: JSON.stringify(responses || []),
      }
    });

    // Update student's interview sub-score and Verified Talent Score
    const updatedSubScores = {
      techScore: student.techScore || 88,
      problemSolvingScore: student.problemSolvingScore || 85,
      commScore: evaluation.commScore,
      projectsScore: student.projectsScore || 88,
      interviewScore: evaluation.overallScore,
    };

    const calculated = calculateVerifiedTalentScore(domain || student.targetDomain || 'Software Development', updatedSubScores);

    await prisma.studentProfile.update({
      where: { id: student.id },
      data: {
        commScore: evaluation.commScore,
        interviewScore: evaluation.overallScore,
        talentScore: calculated.talentScore,
        talentTier: calculated.talentTier,
        percentile: calculated.percentile,
      }
    });

    // Create Notification
    await prisma.notification.create({
      data: {
        userId: req.user!.id,
        title: 'AI Technical Interview Complete!',
        message: `Interview evaluated. Overall score: ${evaluation.overallScore}/100 (${evaluation.recommendation}). Talent Score updated to ${calculated.talentScore}.`,
        type: 'SCORE',
      }
    });

    return res.json({
      session,
      report: evaluation,
      updatedTalentScore: calculated.talentScore,
      updatedTier: calculated.talentTier,
    });
  } catch (err: any) {
    console.error('Complete interview error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// GET Interview Report Card by Session ID
router.get('/:id/report', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const session = await prisma.interviewSession.findUnique({
      where: { id: req.params.id },
      include: {
        studentProfile: {
          include: {
            user: { select: { name: true, email: true, avatar: true } }
          }
        }
      }
    });

    if (!session) return res.status(404).json({ error: 'Interview report not found.' });

    let strengths = [];
    let weaknesses = [];
    try {
      if (session.strengthsJson) strengths = JSON.parse(session.strengthsJson);
      if (session.weaknessesJson) weaknesses = JSON.parse(session.weaknessesJson);
    } catch (e) {}

    return res.json({
      report: {
        id: session.id,
        studentName: session.studentProfile.user.name,
        role: session.role,
        domain: session.domain,
        overallScore: session.overallScore,
        commScore: session.commScore,
        techDepthScore: session.techDepthScore,
        confidenceScore: session.confidenceScore,
        accuracyScore: session.accuracyScore,
        behavioralScore: session.behavioralScore,
        recommendation: session.recommendation,
        strengths,
        weaknesses,
        createdAt: session.createdAt,
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// REQUEST Human Verification Interview
router.post('/human-request', authenticateJWT, requireRole('STUDENT'), async (req: AuthRequest, res: Response) => {
  try {
    const { preferredDate, preferredTime, notes } = req.body;
    const student = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
    if (!student) return res.status(404).json({ error: 'Student profile not found.' });

    const humanRequest = await prisma.humanInterviewRequest.create({
      data: {
        studentProfileId: student.id,
        scheduledAt: `${preferredDate || '2026-03-25'} at ${preferredTime || '14:00 IST'}`,
        status: 'SCHEDULED',
        interviewerName: 'Senior Tech Lead Interviewer',
        notes: notes || 'Human technical verification interview request',
      }
    });

    // Set human verified flag to true upon scheduling request
    await prisma.studentProfile.update({
      where: { id: student.id },
      data: { humanVerified: true }
    });

    await prisma.notification.create({
      data: {
        userId: req.user!.id,
        title: 'Human Verification Interview Scheduled',
        message: `Scheduled for ${humanRequest.scheduledAt} with ${humanRequest.interviewerName}. Verified Talent Badge updated!`,
        type: 'INFO',
      }
    });

    return res.json({ humanRequest, message: 'Human verification interview requested and scheduled.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
