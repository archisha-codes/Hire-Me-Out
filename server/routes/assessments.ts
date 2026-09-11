import { Router, Response } from 'express';
import { prisma } from '../db.js';
import { authenticateJWT, requireRole, AuthRequest } from '../middleware/auth.js';
import { aiService } from '../services/aiService.js';
import { calculateVerifiedTalentScore, generateScoreExplanation } from '../services/scoringEngine.js';

const router = Router();

// GET active/in-progress assessment attempt if any
router.get('/active', authenticateJWT, requireRole('STUDENT'), async (req: AuthRequest, res: Response) => {
  try {
    const student = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
    if (!student) return res.status(404).json({ error: 'Student profile not found.' });

    const activeAttempt = await prisma.assessmentAttempt.findFirst({
      where: { studentProfileId: student.id, status: 'IN_PROGRESS' },
      orderBy: { createdAt: 'desc' }
    });

    if (!activeAttempt) {
      return res.json({ active: false });
    }

    let answers = [];
    if (activeAttempt.answersJson) {
      try { answers = JSON.parse(activeAttempt.answersJson); } catch (e) {}
    }

    return res.json({
      active: true,
      attempt: {
        id: activeAttempt.id,
        domain: activeAttempt.domain,
        role: activeAttempt.role,
        timeTakenSeconds: activeAttempt.timeTakenSeconds,
        timeLeftSeconds: activeAttempt.timeLeftSeconds,
        answers,
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// START Assessment (creates IN_PROGRESS attempt)
router.post('/start', authenticateJWT, requireRole('STUDENT'), async (req: AuthRequest, res: Response) => {
  try {
    const { domain, role, experienceLevel } = req.body;
    const targetDomain = domain || 'Software Development';
    const targetRole = role || 'Full Stack Developer';
    const exp = experienceLevel || 'Fresher';

    const student = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
    if (!student) return res.status(404).json({ error: 'Student profile not found.' });

    // Check if there is an existing in-progress attempt created recently
    const existing = await prisma.assessmentAttempt.findFirst({
      where: { studentProfileId: student.id, status: 'IN_PROGRESS' }
    });

    // Generate dynamic assessment questions
    const questions = await aiService.generateQuestions(targetDomain, targetRole, exp);

    let attempt;
    if (existing) {
      attempt = existing;
    } else {
      attempt = await prisma.assessmentAttempt.create({
        data: {
          studentProfileId: student.id,
          domain: targetDomain,
          role: targetRole,
          status: 'IN_PROGRESS',
          totalQuestions: questions.length,
          timeLeftSeconds: 1200,
          timeTakenSeconds: 0,
        }
      });
    }

    return res.json({
      assessment: {
        id: attempt.id,
        domain: targetDomain,
        role: targetRole,
        experienceLevel: exp,
        title: `${targetRole} AI Verified Assessment`,
        timeLimitMinutes: 20,
        totalQuestions: questions.length,
        questions,
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// AUTOSAVE Answer Incremental Endpoint
router.post('/answer', authenticateJWT, requireRole('STUDENT'), async (req: AuthRequest, res: Response) => {
  try {
    const { attemptId, questionId, userAnswer, timeLeftSeconds, answers } = req.body;
    const student = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
    if (!student) return res.status(404).json({ error: 'Student profile not found.' });

    if (attemptId) {
      await prisma.assessmentAttempt.updateMany({
        where: { id: attemptId, studentProfileId: student.id },
        data: {
          answersJson: JSON.stringify(answers || []),
          timeLeftSeconds: timeLeftSeconds !== undefined ? timeLeftSeconds : undefined,
        }
      });
    }

    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// SUBMIT Assessment Attempt
router.post('/submit', authenticateJWT, requireRole('STUDENT'), async (req: AuthRequest, res: Response) => {
  try {
    const { attemptId, domain, role, answers, timeTakenSeconds } = req.body;
    const student = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
    if (!student) return res.status(404).json({ error: 'Student profile not found.' });

    // Evaluate attempt
    const evaluation = await aiService.evaluateAssessment(answers || []);

    let attempt;
    if (attemptId) {
      attempt = await prisma.assessmentAttempt.update({
        where: { id: attemptId },
        data: {
          score: evaluation.score,
          maxScore: evaluation.maxScore,
          timeTakenSeconds: timeTakenSeconds || 340,
          correctAnswers: evaluation.correctAnswers,
          totalQuestions: evaluation.totalQuestions,
          status: 'COMPLETED',
          answersJson: JSON.stringify(answers || []),
          feedbackJson: JSON.stringify(evaluation.feedback),
        }
      });
    } else {
      attempt = await prisma.assessmentAttempt.create({
        data: {
          studentProfileId: student.id,
          domain: domain || student.targetDomain || 'Software Development',
          role: role || 'Full Stack Developer',
          score: evaluation.score,
          maxScore: evaluation.maxScore,
          timeTakenSeconds: timeTakenSeconds || 340,
          correctAnswers: evaluation.correctAnswers,
          totalQuestions: evaluation.totalQuestions,
          status: 'COMPLETED',
          answersJson: JSON.stringify(answers || []),
          feedbackJson: JSON.stringify(evaluation.feedback),
        }
      });
    }

    // Update student's technical & problem-solving sub-scores
    const newTechScore = Math.round((student.techScore * 0.4) + (evaluation.score * 0.6));
    const newProblemSolvingScore = Math.round((student.problemSolvingScore * 0.4) + (evaluation.score * 0.6));

    const updatedSubScores = {
      techScore: Math.min(99, Math.max(60, newTechScore)),
      problemSolvingScore: Math.min(99, Math.max(60, newProblemSolvingScore)),
      commScore: student.commScore || 79,
      projectsScore: student.projectsScore || 85,
      interviewScore: student.interviewScore || 82,
    };

    const calculated = calculateVerifiedTalentScore(domain || student.targetDomain || 'Software Development', updatedSubScores);

    await prisma.studentProfile.update({
      where: { id: student.id },
      data: {
        techScore: updatedSubScores.techScore,
        problemSolvingScore: updatedSubScores.problemSolvingScore,
        talentScore: calculated.talentScore,
        talentTier: calculated.talentTier,
        percentile: calculated.percentile,
      }
    });

    // Create Notification
    await prisma.notification.create({
      data: {
        userId: req.user!.id,
        title: 'Assessment Complete!',
        message: `You scored ${evaluation.score}/100 on ${domain || 'Software Development'}. Your Talent Score is now ${calculated.talentScore} (${calculated.talentTier}).`,
        type: 'SCORE',
      }
    });

    return res.json({
      attempt,
      evaluation,
      updatedTalentScore: calculated.talentScore,
      updatedTier: calculated.talentTier,
      percentile: calculated.percentile,
      explanation: calculated.explanation,
    });
  } catch (err: any) {
    console.error('Submit assessment error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// GET Verified Talent Score Breakdown
router.get('/talent-score', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.id }
    });

    if (!student) return res.status(404).json({ error: 'Student profile not found.' });

    const scores = {
      techScore: student.techScore || 85,
      problemSolvingScore: student.problemSolvingScore || 82,
      commScore: student.commScore || 79,
      projectsScore: student.projectsScore || 88,
      interviewScore: student.interviewScore || 84,
    };

    const explanation = generateScoreExplanation(student.talentScore || 86, scores);

    return res.json({
      talentScore: student.talentScore || 86,
      talentTier: student.talentTier || 'Tier A',
      percentile: student.percentile || 88,
      subScores: scores,
      explanation,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
