import { execSync } from 'child_process';
import assert from 'assert';

const API_URL = 'http://localhost:5000/api';

async function runIntegrationTests() {
  console.log('🧪 Starting Hire Me Out Integration Test Suite...');

  // 1. Healthcheck Test
  const healthRes = await fetch(`${API_URL}/health`);
  const healthData = await healthRes.json();
  assert.strictEqual(healthData.status, 'ok');
  assert.strictEqual(healthData.name, 'Hire Me Out API');
  console.log('  ✅ Healthcheck endpoint verified.');

  // 2. Demo Login - Student
  const studentLoginRes = await fetch(`${API_URL}/auth/demo-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'STUDENT' })
  });
  const studentData = await studentLoginRes.json();
  assert.ok(studentData.token, 'Student token should exist');
  assert.strictEqual(studentData.user.role, 'STUDENT');
  const studentToken = studentData.token;
  console.log('  ✅ Student demo login & token generation verified.');

  // 3. Demo Login - Company
  const companyLoginRes = await fetch(`${API_URL}/auth/demo-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'COMPANY' })
  });
  const companyData = await companyLoginRes.json();
  assert.ok(companyData.token, 'Company token should exist');
  assert.strictEqual(companyData.user.role, 'COMPANY');
  const companyToken = companyData.token;
  console.log('  ✅ Recruiter demo login & token generation verified.');

  // 4. Demo Login - Employee
  const employeeLoginRes = await fetch(`${API_URL}/auth/demo-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'EMPLOYEE' })
  });
  const employeeData = await employeeLoginRes.json();
  assert.ok(employeeData.token, 'Employee token should exist');
  assert.strictEqual(employeeData.user.role, 'EMPLOYEE');
  const employeeToken = employeeData.token;
  console.log('  ✅ Referrer demo login & token generation verified.');

  // 5. Resume Parsing Test
  const resumeRes = await fetch(`${API_URL}/students/resume`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    },
    body: JSON.stringify({
      resumeText: 'B.Tech CSE React Node.js TypeScript SQL AWS Python 2 internships',
      targetDomain: 'Software Development'
    })
  });
  const resumeData = await resumeRes.json();
  assert.ok(resumeData.parsedData);
  assert.ok(resumeData.parsedData.resumeQualityScore >= 60);
  console.log('  ✅ Resume parsing & structured extraction verified.');

  // 6. Start Assessment & Answer Autosave Test
  const startAsmtRes = await fetch(`${API_URL}/assessments/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    },
    body: JSON.stringify({ domain: 'Software Development', role: 'Full Stack Developer' })
  });
  const startAsmtData = await startAsmtRes.json();
  assert.ok(startAsmtData.assessment);
  assert.ok(startAsmtData.assessment.questions.length > 0);
  const attemptId = startAsmtData.assessment.id;
  console.log('  ✅ Assessment initiation verified.');

  // Autosave answer
  const answerRes = await fetch(`${API_URL}/assessments/answer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    },
    body: JSON.stringify({
      attemptId,
      questionId: startAsmtData.assessment.questions[0].id,
      userAnswer: startAsmtData.assessment.questions[0].correctAnswer,
      timeLeftSeconds: 1150,
      answers: { [startAsmtData.assessment.questions[0].id]: startAsmtData.assessment.questions[0].correctAnswer }
    })
  });
  const answerData = await answerRes.json();
  assert.strictEqual(answerData.success, true);
  console.log('  ✅ Assessment answer incremental autosave verified.');

  // Submit Assessment
  const submitAsmtRes = await fetch(`${API_URL}/assessments/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    },
    body: JSON.stringify({
      attemptId,
      domain: 'Software Development',
      role: 'Full Stack Developer',
      answers: startAsmtData.assessment.questions.map((q: any) => ({
        questionId: q.id,
        userAnswer: q.correctAnswer,
        isCorrect: true
      })),
      timeTakenSeconds: 300
    })
  });
  const submitAsmtData = await submitAsmtRes.json();
  assert.ok(submitAsmtData.attempt);
  assert.ok(submitAsmtData.updatedTalentScore >= 60);
  console.log('  ✅ Assessment submission & talent score calculation verified.');

  // 7. Job Creation (Company)
  const createJobRes = await fetch(`${API_URL}/jobs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${companyToken}`
    },
    body: JSON.stringify({
      title: 'Full Stack Developer Intern',
      domain: 'Software Development',
      role: 'Full Stack Developer',
      experienceLevel: 'Fresher',
      location: 'Bangalore, India',
      type: 'FULL_TIME',
      description: 'Building modern web applications using React and Node.js',
      requiredSkills: ['React', 'Node.js', 'SQL', 'TypeScript'],
      salaryRange: '₹12 - 18 LPA',
      referralBonus: 10000
    })
  });
  const createJobData = await createJobRes.json();
  assert.ok(createJobData.job);
  console.log('  ✅ Recruiter job creation verified.');

  // 8. Candidate Search & Discovery
  const searchRes = await fetch(`${API_URL}/discovery/candidates?domain=Software`, {
    headers: { 'Authorization': `Bearer ${companyToken}` }
  });
  const searchData = await searchRes.json();
  assert.ok(Array.isArray(searchData.candidates));
  assert.ok(searchData.candidates.length > 0);
  console.log('  ✅ Recruiter candidate search & filtering verified.');

  // 9. Payment Simulation
  const paymentRes = await fetch(`${API_URL}/payments/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    },
    body: JSON.stringify({ type: 'VERIFICATION_PREMIUM', amount: 499 })
  });
  const paymentData = await paymentRes.json();
  assert.ok(paymentData.transaction);
  assert.strictEqual(paymentData.transaction.status, 'COMPLETED');
  console.log('  ✅ Payment simulation & status transition verified.');

  // 10. Notifications Retrieval
  const notifRes = await fetch(`${API_URL}/notifications`, {
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  const notifData = await notifRes.json();
  assert.ok(Array.isArray(notifData.notifications));
  console.log('  ✅ User notification alerts retrieval verified.');

  console.log('🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULLY!');
}

runIntegrationTests().catch(err => {
  console.error('❌ Integration Test Failure:', err);
  process.exit(1);
});
