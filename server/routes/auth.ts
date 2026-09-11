import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';
import { JWT_SECRET, authenticateJWT, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        studentProfile: true,
        companyProfile: true,
        employeeProfile: true,
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch && password !== 'password123') { // Allow standard demo password fallback
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        studentProfile: user.studentProfile,
        companyProfile: user.companyProfile,
        employeeProfile: user.employeeProfile,
      }
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: err.message || 'Server error during login.' });
  }
});

// Demo Quick Login Preset
router.post('/demo-login', async (req: Request, res: Response) => {
  try {
    const { role } = req.body; // STUDENT, COMPANY, EMPLOYEE, ADMIN
    let email = 'student@demo.com';
    if (role === 'COMPANY') email = 'company@demo.com';
    else if (role === 'EMPLOYEE') email = 'employee@demo.com';
    else if (role === 'ADMIN') email = 'admin@demo.com';

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        studentProfile: true,
        companyProfile: true,
        employeeProfile: true,
      }
    });

    if (!user) {
      return res.status(404).json({ error: `Demo user for role ${role} not found. Please run seed script.` });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        studentProfile: user.studentProfile,
        companyProfile: user.companyProfile,
        employeeProfile: user.employeeProfile,
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, college, degree, branch, gradYear, companyName, designation } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role || 'STUDENT';

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: userRole,
      }
    });

    if (userRole === 'STUDENT') {
      await prisma.studentProfile.create({
        data: {
          userId: user.id,
          college: college || 'University Student',
          degree: degree || 'B.Tech',
          branch: branch || 'Computer Science',
          gradYear: parseInt(gradYear) || 2026,
          targetDomain: 'Software Development',
          experienceLevel: 'Fresher',
          talentScore: 78,
          talentTier: 'Tier B',
          techScore: 82,
          problemSolvingScore: 79,
          commScore: 74,
          projectsScore: 80,
          interviewScore: 76,
        }
      });
    } else if (userRole === 'COMPANY') {
      await prisma.companyProfile.create({
        data: {
          userId: user.id,
          companyName: companyName || 'InnovateTech',
          designation: designation || 'Talent Lead / Recruiter',
        }
      });
    } else if (userRole === 'EMPLOYEE') {
      await prisma.employeeProfile.create({
        data: {
          userId: user.id,
          companyName: companyName || 'TechCorp',
          designation: designation || 'Senior Software Engineer',
          workEmail: email,
        }
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        studentProfile: true,
        companyProfile: true,
        employeeProfile: true,
      }
    });

    return res.json({ token, user: updatedUser });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: err.message || 'Server error during registration.' });
  }
});

// Current User Me Endpoint
router.get('/me', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        studentProfile: {
          include: {
            educations: true,
            experiences: true,
            skills: true,
            projects: true,
            certifications: true,
            achievements: true,
          }
        },
        companyProfile: true,
        employeeProfile: true,
      }
    });

    if (!user) return res.status(404).json({ error: 'User not found.' });
    return res.json({ user });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
