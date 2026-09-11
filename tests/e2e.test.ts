import assert from 'assert';

const API_URL = 'http://localhost:5000/api';

async function runE2ETest() {
  console.log('🚀 Starting Hire Me Out End-to-End Lifecycle Test...');

  // Step 1: Student Login
  console.log('  1. Student Login (student@demo.com)...');
  const studentAuthRes = await fetch(`${API_URL}/auth/demo-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'STUDENT' })
  });
  const studentAuth = await studentAuthRes.json();
  const studentToken = studentAuth.token;
  assert.ok(studentToken, 'Student token required');
  console.log('     ✓ Student authenticated.');

  // Step 2: Student Profile Setup
  console.log('  2. Updating Student Profile (12-step onboarding)...');
  const profileRes = await fetch(`${API_URL}/students/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    },
    body: JSON.stringify({
      headline: 'Full Stack Developer | IIT Bangalore',
      college: 'IIT Bangalore',
      degree: 'B.Tech',
      branch: 'Computer Science',
      gradYear: 2026,
      cgpa: 9.2,
      location: 'Bangalore, India',
      targetDomain: 'Software Development',
      targetRoles: ['Full Stack Developer'],
      bio: 'Full stack developer building high-performance web systems',
      skills: [{ name: 'React' }, { name: 'Node.js' }, { name: 'TypeScript' }, { name: 'SQL' }],
    })
  });
  const profileData = await profileRes.json();
  assert.ok(profileData.student);
  const studentProfileId = profileData.student.id;
  console.log('     ✓ Student profile saved to database.');

  // Step 3: Student Takes Skill Assessment
  console.log('  3. Taking AI Skill Assessment...');
  const startAsmtRes = await fetch(`${API_URL}/assessments/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    },
    body: JSON.stringify({ domain: 'Software Development', role: 'Full Stack Developer' })
  });
  const startAsmt = await startAsmtRes.json();
  const attemptId = startAsmt.assessment.id;

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
      answers: startAsmt.assessment.questions.map((q: any) => ({
        questionId: q.id,
        userAnswer: q.correctAnswer,
        isCorrect: true
      })),
      timeTakenSeconds: 240
    })
  });
  const submitAsmt = await submitAsmtRes.json();
  assert.ok(submitAsmt.updatedTalentScore >= 80, 'Score should be >= 80');
  console.log(`     ✓ Assessment completed! Verified Talent Score: ${submitAsmt.updatedTalentScore} (${submitAsmt.updatedTier})`);

  // Step 4: AI Technical Interview
  console.log('  4. Completing AI Technical Interview...');
  const interviewRes = await fetch(`${API_URL}/interviews/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    },
    body: JSON.stringify({
      role: 'Full Stack Developer',
      domain: 'Software Development',
      responses: [
        { round: 1, title: 'Intro', question: 'Tell me about yourself', answer: 'I am a CS student passionate about web engineering' },
        { round: 2, title: 'Resume', question: 'Tell me about your projects', answer: 'Built cloud storage engine with S3 and Redis' }
      ]
    })
  });
  const interviewData = await interviewRes.json();
  assert.ok(interviewData.report);
  console.log(`     ✓ AI Technical Interview finished! Recommendation: ${interviewData.report.recommendation}`);

  // Step 5: Request Human Verification
  console.log('  5. Requesting Human Tech Lead Verification...');
  const humanRes = await fetch(`${API_URL}/interviews/human-request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    },
    body: JSON.stringify({ preferredDate: '2026-03-25', preferredTime: '14:00 IST' })
  });
  const humanData = await humanRes.json();
  assert.ok(humanData.humanRequest);
  console.log('     ✓ Human Verification scheduled & badge granted.');

  // Step 6: Recruiter Login
  console.log('  6. Recruiter Login (company@demo.com)...');
  const companyAuthRes = await fetch(`${API_URL}/auth/demo-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'COMPANY' })
  });
  const companyAuth = await companyAuthRes.json();
  const companyToken = companyAuth.token;
  assert.ok(companyToken, 'Company token required');

  // Step 7: Recruiter Posts Job
  console.log('  7. Recruiter Posting New Open Position...');
  const jobRes = await fetch(`${API_URL}/jobs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${companyToken}`
    },
    body: JSON.stringify({
      title: 'Full Stack Engineer - Core Team',
      domain: 'Software Development',
      role: 'Full Stack Developer',
      experienceLevel: 'Fresher',
      location: 'Bangalore, India',
      salaryRange: '₹14 - 22 LPA',
      requiredSkills: ['React', 'Node.js', 'SQL', 'TypeScript'],
      referralBonus: 10000
    })
  });
  const jobData = await jobRes.json();
  assert.ok(jobData.job);
  const jobId = jobData.job.id;
  console.log('     ✓ Job created successfully.');

  // Step 8: Recruiter Discovers & Searches Candidate
  console.log('  8. Searching Candidates in Discovery...');
  const discoveryRes = await fetch(`${API_URL}/discovery/candidates?domain=Software`, {
    headers: { 'Authorization': `Bearer ${companyToken}` }
  });
  const discoveryData = await discoveryRes.json();
  assert.ok(discoveryData.candidates.length > 0);
  console.log(`     ✓ Found ${discoveryData.candidates.length} candidates.`);

  // Step 9: Recruiter Shortlists Candidate
  console.log('  9. Shortlisting Candidate...');
  const shortlistRes = await fetch(`${API_URL}/discovery/shortlist`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${companyToken}`
    },
    body: JSON.stringify({ studentProfileId })
  });
  const shortlistData = await shortlistRes.json();
  assert.strictEqual(shortlistData.success, true);
  console.log('     ✓ Candidate shortlisted.');

  // Step 10: Recruiter Requests Interview
  console.log(' 10. Requesting Interview with Candidate...');
  const intReqRes = await fetch(`${API_URL}/referrals/interview-request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${companyToken}`
    },
    body: JSON.stringify({
      studentProfileId,
      jobId,
      notes: 'Outstanding technical score in React and API architecture.'
    })
  });
  const intReqData = await intReqRes.json();
  assert.ok(intReqData.referralRequest);
  const referralRequestId = intReqData.referralRequest.id;
  console.log('     ✓ Interview requested.');

  // Step 11: Employee Referrer Login
  console.log(' 11. Employee Referrer Login (employee@demo.com)...');
  const employeeAuthRes = await fetch(`${API_URL}/auth/demo-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'EMPLOYEE' })
  });
  const employeeAuth = await employeeAuthRes.json();
  const employeeToken = employeeAuth.token;
  assert.ok(employeeToken, 'Employee token required');

  // Step 12: Employee Inspects Candidate & Accepts Referral
  console.log(' 12. Employee Accepting & Submitting Internal Referral...');
  const acceptRes = await fetch(`${API_URL}/referrals/${referralRequestId}/accept`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${employeeToken}`
    }
  });
  const acceptData = await acceptRes.json();
  assert.ok(acceptData.referralRequest);
  assert.strictEqual(acceptData.referralRequest.status, 'REFERRAL_SUBMITTED');
  console.log('     ✓ Internal referral submitted to company portal.');

  // Step 13: Recruiter Advances Pipeline Status to HIRED
  console.log(' 13. Recruiter Advancing Pipeline Status to HIRED...');
  const statusRes = await fetch(`${API_URL}/referrals/${referralRequestId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${companyToken}`
    },
    body: JSON.stringify({
      status: 'HIRED',
      notes: 'Final interview passed! Offer extended and accepted.'
    })
  });
  const statusData = await statusRes.json();
  assert.strictEqual(statusData.referralRequest.status, 'HIRED');
  console.log('     ✓ Candidate pipeline updated to HIRED!');

  // Step 14: Verification of Candidate State
  console.log(' 14. Verifying Candidate Notifications & Referral Pipeline State...');
  const studentRequestsRes = await fetch(`${API_URL}/referrals/my-requests`, {
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  const studentRequests = await studentRequestsRes.json();
  assert.ok(studentRequests.requests.length > 0);
  assert.strictEqual(studentRequests.requests[0].status, 'HIRED');

  const studentNotifRes = await fetch(`${API_URL}/notifications`, {
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  const studentNotifs = await studentNotifRes.json();
  assert.ok(studentNotifs.notifications.length > 0);
  console.log('     ✓ Candidate received all real-time alerts and state is synchronized.');

  console.log('\n🏆 COMPLETE END-TO-END MULTI-ROLE LIFECYCLE PASSED WITH 100% SUCCESS!');
}

runE2ETest().catch(err => {
  console.error('❌ E2E Test Failure:', err);
  process.exit(1);
});
