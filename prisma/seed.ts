import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Hire Me Out database...');

  // Clean existing data
  await prisma.notification.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.referralRequest.deleteMany();
  await prisma.job.deleteMany();
  await prisma.humanInterviewRequest.deleteMany();
  await prisma.interviewSession.deleteMany();
  await prisma.assessmentAnswer.deleteMany();
  await prisma.assessmentAttempt.deleteMany();
  await prisma.question.deleteMany();
  await prisma.assessmentTemplate.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.project.deleteMany();
  await prisma.certification.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.education.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.companyProfile.deleteMany();
  await prisma.employeeProfile.deleteMany();
  await prisma.user.deleteMany();

  const defaultPassword = await bcrypt.hash('password123', 10);

  // 1. Create Main Demo Student (Ananya Sharma)
  const studentUser = await prisma.user.create({
    data: {
      email: 'student@demo.com',
      password: defaultPassword,
      name: 'Ananya Sharma',
      role: 'STUDENT',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      phone: '+91 98765 43210',
    }
  });

  const studentProfile = await prisma.studentProfile.create({
    data: {
      userId: studentUser.id,
      headline: 'Full Stack Developer & AI Enthusiast | B.Tech CSE 2026',
      college: 'IIT Bangalore',
      degree: 'B.Tech',
      branch: 'Computer Science & Engineering',
      gradYear: 2026,
      cgpa: 9.1,
      location: 'Bangalore, India',
      targetDomain: 'Software Development',
      targetRoles: JSON.stringify(['Full Stack Developer', 'Software Engineer', 'Frontend Engineer']),
      experienceLevel: 'Fresher',
      bio: 'Passionate developer building high-performance web applications and scalable API systems. Proven capability in React, Node.js, and Cloud architectures.',
      resumeUrl: 'https://cdn.hiremeout.io/resumes/ananya_sharma_resume.pdf',
      resumeScore: 89,
      missingSkills: JSON.stringify(['Docker', 'Kubernetes']),
      github: 'https://github.com/ananya-sharma',
      linkedin: 'https://linkedin.com/in/ananya-sharma',
      portfolio: 'https://ananya.dev',
      talentScore: 87,
      talentTier: 'Tier A',
      percentile: 88.0,
      techScore: 91,
      problemSolvingScore: 88,
      commScore: 79,
      projectsScore: 93,
      interviewScore: 85,
      humanVerified: true,
      onboardingComplete: true,
    }
  });

  await prisma.skill.createMany({
    data: [
      { studentProfileId: studentProfile.id, name: 'React', category: 'Frontend', level: 'Advanced' },
      { studentProfileId: studentProfile.id, name: 'Node.js', category: 'Backend', level: 'Advanced' },
      { studentProfileId: studentProfile.id, name: 'TypeScript', category: 'Language', level: 'Advanced' },
      { studentProfileId: studentProfile.id, name: 'Python', category: 'Language', level: 'Intermediate' },
      { studentProfileId: studentProfile.id, name: 'SQL', category: 'Database', level: 'Advanced' },
      { studentProfileId: studentProfile.id, name: 'AWS', category: 'Cloud', level: 'Intermediate' },
    ]
  });

  await prisma.project.createMany({
    data: [
      {
        studentProfileId: studentProfile.id,
        title: 'Distributed Cloud Storage Engine',
        description: 'Built a high-concurrency file storage system using Node.js, S3, and Redis with client-side chunk encryption.',
        techStack: JSON.stringify(['Node.js', 'Redis', 'AWS S3', 'TypeScript']),
        githubUrl: 'https://github.com/ananya-sharma/cloud-storage',
        liveUrl: 'https://cloudstorage.ananya.dev'
      },
      {
        studentProfileId: studentProfile.id,
        title: 'Real-time Analytics Dashboard',
        description: 'Designed an interactive analytics visualization system processing 10k events/sec using WebSockets and Recharts.',
        techStack: JSON.stringify(['React', 'TypeScript', 'Tailwind', 'WebSockets']),
        githubUrl: 'https://github.com/ananya-sharma/analytics-dashboard',
        liveUrl: 'https://analytics.ananya.dev'
      }
    ]
  });

  await prisma.certification.createMany({
    data: [
      { studentProfileId: studentProfile.id, title: 'AWS Certified Solutions Architect Associate', issuer: 'Amazon Web Services', issueDate: 'Jan 2026' },
      { studentProfileId: studentProfile.id, title: 'Meta Front-End Developer Professional', issuer: 'Coursera / Meta', issueDate: 'Nov 2025' }
    ]
  });

  // 2. Create Additional Realistic Candidates
  const candidatesData = [
    { name: 'Rahul Sharma', email: 'rahul@student.com', domain: 'Software Development', score: 92, tier: 'Tier S', tech: 94, ps: 91, comm: 88, proj: 95, int: 90, college: 'IIT Delhi', cgpa: 9.4 },
    { name: 'Priya Patel', email: 'priya@student.com', domain: 'AI / ML', score: 94, tier: 'Tier S', tech: 96, ps: 94, comm: 86, proj: 92, int: 91, college: 'BITS Pilani', cgpa: 9.3 },
    { name: 'Vikram Seth', email: 'vikram@student.com', domain: 'Cloud / DevOps', score: 85, tier: 'Tier A', tech: 88, ps: 84, comm: 82, proj: 86, int: 83, college: 'NIT Trichy', cgpa: 8.7 },
    { name: 'Sneha Reddy', email: 'sneha@student.com', domain: 'Data Science', score: 89, tier: 'Tier A', tech: 90, ps: 89, comm: 85, proj: 91, int: 87, college: 'IIT Madras', cgpa: 9.0 },
    { name: 'Arjun Mehta', email: 'arjun@student.com', domain: 'Product Management', score: 86, tier: 'Tier A', tech: 78, ps: 88, comm: 92, proj: 86, int: 88, college: 'DTU Delhi', cgpa: 8.6 },
    { name: 'Tanvi Iyer', email: 'tanvi@student.com', domain: 'UI/UX', score: 88, tier: 'Tier A', tech: 82, ps: 85, comm: 90, proj: 94, int: 86, college: 'NID Ahmedabad', cgpa: 9.2 }
  ];

  for (const c of candidatesData) {
    const user = await prisma.user.create({
      data: {
        name: c.name,
        email: c.email,
        password: defaultPassword,
        role: 'STUDENT',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(c.name)}`,
      }
    });

    const prof = await prisma.studentProfile.create({
      data: {
        userId: user.id,
        headline: `${c.domain} Specialist | ${c.college}`,
        college: c.college,
        degree: 'B.Tech',
        branch: 'Computer Science',
        gradYear: 2026,
        cgpa: c.cgpa,
        location: 'Bangalore, India',
        targetDomain: c.domain,
        targetRoles: JSON.stringify([`${c.domain} Engineer`]),
        talentScore: c.score,
        talentTier: c.tier,
        percentile: 90.0,
        techScore: c.tech,
        problemSolvingScore: c.ps,
        commScore: c.comm,
        projectsScore: c.proj,
        interviewScore: c.int,
        humanVerified: true,
        onboardingComplete: true,
      }
    });

    await prisma.skill.createMany({
      data: [
        { studentProfileId: prof.id, name: 'Python' },
        { studentProfileId: prof.id, name: 'SQL' },
        { studentProfileId: prof.id, name: 'System Design' }
      ]
    });
  }

  // 3. Create Main Demo Company (TechNova Solutions)
  const companyUser = await prisma.user.create({
    data: {
      email: 'company@demo.com',
      password: defaultPassword,
      name: 'Sarah Jenkins',
      role: 'COMPANY',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    }
  });

  const companyProfile = await prisma.companyProfile.create({
    data: {
      userId: companyUser.id,
      companyName: 'TechNova Solutions',
      department: 'Engineering Recruitment',
      designation: 'Head of Technical Hiring',
      website: 'https://technova.example.com',
      companySize: '500-1000 employees',
      isVerified: true,
    }
  });

  const job1 = await prisma.job.create({
    data: {
      companyProfileId: companyProfile.id,
      title: 'Full Stack Developer Intern / Fresher',
      domain: 'Software Development',
      role: 'Full Stack Developer',
      experienceLevel: 'Fresher',
      location: 'Bangalore, India (Hybrid)',
      type: 'FULL_TIME',
      description: 'Looking for verified full-stack engineering candidates with strong proficiency in React, Node.js, and SQL.',
      requiredSkillsJson: JSON.stringify(['React', 'Node.js', 'SQL', 'TypeScript']),
      preferredSkillsJson: JSON.stringify(['AWS', 'Docker']),
      salaryRange: '₹12 - 18 LPA',
      referralBonus: 8000,
    }
  });

  await prisma.job.create({
    data: {
      companyProfileId: companyProfile.id,
      title: 'AI / ML Research Engineer',
      domain: 'AI / ML',
      role: 'ML Engineer',
      experienceLevel: 'Fresher',
      location: 'Bangalore / Remote',
      type: 'FULL_TIME',
      description: 'Building next-generation generative AI products. Requires strong Python, PyTorch, and vector database foundation.',
      requiredSkillsJson: JSON.stringify(['Python', 'PyTorch', 'SQL']),
      preferredSkillsJson: JSON.stringify(['LangChain', 'FastAPI']),
      salaryRange: '₹15 - 24 LPA',
      referralBonus: 12000,
    }
  });

  // 4. Create Main Demo Employee Referrer
  const employeeUser = await prisma.user.create({
    data: {
      email: 'employee@demo.com',
      password: defaultPassword,
      name: 'Rohan Verma',
      role: 'EMPLOYEE',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    }
  });

  const employeeProfile = await prisma.employeeProfile.create({
    data: {
      userId: employeeUser.id,
      companyName: 'TechNova Solutions',
      designation: 'Senior Lead Engineer',
      workEmail: 'rohan.verma@technova.example.com',
      isVerified: true,
      totalReferrals: 8,
      successfulReferrals: 3,
      earnings: 24000,
    }
  });

  // 5. Create Main Demo Admin
  await prisma.user.create({
    data: {
      email: 'admin@demo.com',
      password: defaultPassword,
      name: 'Hire Me Out Administrator',
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    }
  });

  // 6. Create Initial Referral Request Pipeline (Ananya Sharma -> TechNova)
  const initialHistory = [
    { status: 'PROFILE_CREATED', date: 'March 2, 2026', text: 'Verified talent profile created' },
    { status: 'ASSESSMENT_COMPLETE', date: 'March 7, 2026', text: 'AI Technical Assessment Score 91/100 verified' },
    { status: 'AI_INTERVIEW_COMPLETE', date: 'March 15, 2026', text: 'AI Technical Interview Score 85/100 verified' },
    { status: 'VERIFIED', date: 'March 18, 2026', text: 'Human & AI Verification Badges Granted' },
    { status: 'SHORTLISTED', date: 'March 20, 2026', text: 'Candidate discovered & shortlisted by TechNova Solutions' },
    { status: 'INTERVIEW_REQUESTED', date: 'March 22, 2026', text: 'Recruiter requested initial screening interview' },
    { status: 'INTERVIEW_COMPLETED', date: 'March 25, 2026', text: 'Interview completed with score 89/100 (Strongly Recommended)' },
    { status: 'REFERRAL_REQUESTED', date: 'March 28, 2026', text: 'Moved to referral request pool' },
    { status: 'REFERRAL_SUBMITTED', date: 'March 30, 2026', text: 'Employee Rohan Verma reviewed proof points and submitted internal referral' },
    { status: 'SCREENING', date: 'April 2, 2026', text: 'Candidate currently in company internal HR screening pipeline' },
  ];

  await prisma.referralRequest.create({
    data: {
      studentProfileId: studentProfile.id,
      companyProfileId: companyProfile.id,
      jobId: job1.id,
      employeeProfileId: employeeProfile.id,
      status: 'SCREENING',
      statusHistoryJson: JSON.stringify(initialHistory),
      notes: 'Outstanding candidate with top 12% verified score in React and API architecture.',
    }
  });

  // 7. Seed Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: studentUser.id,
        title: 'Shortlisted by TechNova Solutions',
        message: 'Recruiter Sarah Jenkins shortlisted your verified profile for Full Stack Developer role.',
        type: 'SHORTLIST',
        read: false,
      },
      {
        userId: studentUser.id,
        title: 'Internal Referral Submitted',
        message: 'Employee Rohan Verma submitted your verified referral to TechNova Solutions HR.',
        type: 'REFERRAL',
        read: true,
      },
      {
        userId: companyUser.id,
        title: 'New Verified Candidate Match',
        message: 'Ananya Sharma (Score: 87, Tier A) matched your Full Stack Developer position at 94%.',
        type: 'INFO',
        read: false,
      }
    ]
  });

  // 8. Seed Social Posts
  await prisma.post.create({
    data: {
      studentProfileId: studentProfile.id,
      content: 'Excited to complete my AI Verified Assessment on Hire Me Out! Scored 91/100 on Software Development & API architecture. Verification badges updated on my profile! 🚀',
      type: 'ASSESSMENT',
      likesCount: 14,
      commentsCount: 3,
    }
  });

  console.log('✅ Hire Me Out database seeded successfully with demo accounts & notifications!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
