import { Router, Request, Response } from 'express';
import { prisma } from '../db.js';
import { authenticateJWT, requireRole, AuthRequest } from '../middleware/auth.js';

const router = Router();

// COMPANY REQUESTS INTERVIEW WITH CANDIDATE
router.post('/interview-request', authenticateJWT, requireRole('COMPANY', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { studentProfileId, jobId, notes } = req.body;
    if (!studentProfileId) {
      return res.status(400).json({ error: 'studentProfileId is required.' });
    }

    const company = await prisma.companyProfile.findUnique({ where: { userId: req.user!.id } });
    if (!company) return res.status(404).json({ error: 'Company profile not found.' });

    const student = await prisma.studentProfile.findUnique({
      where: { id: studentProfileId },
      include: { user: true }
    });

    if (!student) return res.status(404).json({ error: 'Student not found.' });

    // Check if job exists or get first company job
    let targetJobId = jobId;
    if (!targetJobId) {
      const firstJob = await prisma.job.findFirst({ where: { companyProfileId: company.id } });
      if (firstJob) targetJobId = firstJob.id;
    }

    if (!targetJobId) {
      return res.status(400).json({ error: 'Please create a job posting first before requesting candidate interviews.' });
    }

    const initialHistory = [
      { status: 'PROFILE_CREATED', date: new Date().toISOString(), text: 'Verified profile established' },
      { status: 'ASSESSMENT_COMPLETE', date: new Date().toISOString(), text: 'AI Assessment verified' },
      { status: 'AI_INTERVIEW_COMPLETE', date: new Date().toISOString(), text: 'AI Technical Interview completed' },
      { status: 'VERIFIED', date: new Date().toISOString(), text: 'Talent proof verified' },
      { status: 'SHORTLISTED', date: new Date().toISOString(), text: `Shortlisted by ${company.companyName}` },
      { status: 'INTERVIEW_REQUESTED', date: new Date().toISOString(), text: `Interview requested by ${company.companyName}` },
    ];

    const referralReq = await prisma.referralRequest.create({
      data: {
        studentProfileId,
        companyProfileId: company.id,
        jobId: targetJobId,
        status: 'INTERVIEW_REQUESTED',
        statusHistoryJson: JSON.stringify(initialHistory),
        notes: notes || 'Recruiter requested initial screening interview',
      }
    });

    // Send notification to candidate
    await prisma.notification.create({
      data: {
        userId: student.userId,
        title: 'Interview Requested!',
        message: `${company.companyName} requested an interview for your profile. Notes: ${notes || 'Screening Interview'}`,
        type: 'INTERVIEW_REQUEST',
      }
    });

    return res.json({ referralRequest: referralReq, message: 'Interview requested successfully.' });
  } catch (err: any) {
    console.error('Interview request error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// STUDENT GETS MY REFERRALS & INTERVIEW REQUESTS
router.get('/my-requests', authenticateJWT, requireRole('STUDENT'), async (req: AuthRequest, res: Response) => {
  try {
    const student = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
    if (!student) return res.status(404).json({ error: 'Student profile not found.' });

    const requests = await prisma.referralRequest.findMany({
      where: { studentProfileId: student.id },
      include: {
        companyProfile: { select: { companyName: true, logo: true } },
        job: { select: { title: true, location: true, salaryRange: true } },
        employeeProfile: { select: { designation: true, workEmail: true } }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return res.json({ requests });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// EMPLOYEE REFERRER OPPORTUNITIES & INBOX
router.get('/opportunities', authenticateJWT, requireRole('EMPLOYEE', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const opportunities = await prisma.referralRequest.findMany({
      include: {
        studentProfile: {
          include: {
            user: { select: { name: true, avatar: true, email: true } },
            skills: true,
            projects: true,
            assessmentAttempts: { orderBy: { createdAt: 'desc' }, take: 1 },
            interviewSessions: { orderBy: { createdAt: 'desc' }, take: 1 },
          }
        },
        job: true,
        companyProfile: true,
      },
      orderBy: { updatedAt: 'desc' }
    });

    return res.json({ opportunities });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// EMPLOYEE ACCEPTS REFERRAL REQUEST
router.post('/:id/accept', authenticateJWT, requireRole('EMPLOYEE', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const employee = await prisma.employeeProfile.findUnique({
      where: { userId: req.user!.id },
      include: { user: true }
    });

    if (!employee) return res.status(404).json({ error: 'Employee profile not found.' });

    const reqRecord = await prisma.referralRequest.findUnique({
      where: { id: req.params.id },
      include: { studentProfile: true, companyProfile: true }
    });

    if (!reqRecord) return res.status(404).json({ error: 'Referral request not found.' });

    let history = [];
    try {
      if (reqRecord.statusHistoryJson) history = JSON.parse(reqRecord.statusHistoryJson);
    } catch (e) {}

    history.push({
      status: 'REFERRAL_SUBMITTED',
      date: new Date().toISOString(),
      text: `Referral verified & submitted by employee ${employee.user.name} (${employee.companyName} - ${employee.designation})`
    });

    const updated = await prisma.referralRequest.update({
      where: { id: req.params.id },
      data: {
        employeeProfileId: employee.id,
        status: 'REFERRAL_SUBMITTED',
        statusHistoryJson: JSON.stringify(history),
      }
    });

    // Update employee statistics
    await prisma.employeeProfile.update({
      where: { id: employee.id },
      data: {
        totalReferrals: { increment: 1 }
      }
    });

    // Send notifications to candidate
    await prisma.notification.create({
      data: {
        userId: reqRecord.studentProfile.userId,
        title: 'Referral Submitted!',
        message: `Employee ${employee.user.name} (${employee.designation} at ${employee.companyName}) verified your talent score and submitted your internal referral.`,
        type: 'REFERRAL',
      }
    });

    return res.json({ referralRequest: updated, message: 'Referral accepted and submitted to company internal portal.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// UPDATE REFERRAL STATUS (Recruiter/Admin/Student moves candidate along pipeline)
router.put('/:id/status', authenticateJWT, requireRole('COMPANY', 'ADMIN', 'EMPLOYEE', 'STUDENT'), async (req: AuthRequest, res: Response) => {
  try {
    const { status, notes } = req.body;
    const reqRecord = await prisma.referralRequest.findUnique({
      where: { id: req.params.id },
      include: { studentProfile: true, companyProfile: true, employeeProfile: true }
    });

    if (!reqRecord) return res.status(404).json({ error: 'Referral request not found.' });

    let history = [];
    try {
      if (reqRecord.statusHistoryJson) history = JSON.parse(reqRecord.statusHistoryJson);
    } catch (e) {}

    history.push({
      status,
      date: new Date().toISOString(),
      text: notes || `Pipeline status advanced to ${status}`
    });

    const updated = await prisma.referralRequest.update({
      where: { id: req.params.id },
      data: {
        status,
        statusHistoryJson: JSON.stringify(history),
        notes: notes || reqRecord.notes,
      }
    });

    if (status === 'HIRED' && reqRecord.employeeProfileId) {
      await prisma.employeeProfile.update({
        where: { id: reqRecord.employeeProfileId },
        data: {
          successfulReferrals: { increment: 1 },
          earnings: { increment: 3000 }
        }
      });
    }

    // Send status notification to candidate
    await prisma.notification.create({
      data: {
        userId: reqRecord.studentProfile.userId,
        title: `Pipeline Status: ${status}`,
        message: `Your referral application with ${reqRecord.companyProfile.companyName} has moved to ${status}.`,
        type: 'REFERRAL',
      }
    });

    return res.json({ referralRequest: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
