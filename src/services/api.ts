const API_BASE = '/api';

export function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('hiremeout_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'An error occurred during API request.');
  }

  return data as T;
}

export const api = {
  // Auth
  login: (credentials: any) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  demoLogin: (role: string) => apiRequest('/auth/demo-login', { method: 'POST', body: JSON.stringify({ role }) }),
  register: (data: any) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => apiRequest('/auth/me'),

  // Student
  getStudentProfile: () => apiRequest('/students/me'),
  updateStudentProfile: (data: any) => apiRequest('/students/me', { method: 'PUT', body: JSON.stringify(data) }),
  uploadResume: (data: { resumeText?: string; targetDomain?: string }) => apiRequest('/students/resume', { method: 'POST', body: JSON.stringify(data) }),
  getProgressTimeline: () => apiRequest('/students/progress'),

  // Assessments
  getActiveAssessment: () => apiRequest('/assessments/active'),
  startAssessment: (data: { domain?: string; role?: string; experienceLevel?: string }) => apiRequest('/assessments/start', { method: 'POST', body: JSON.stringify(data) }),
  autosaveAssessmentAnswer: (data: any) => apiRequest('/assessments/answer', { method: 'POST', body: JSON.stringify(data) }),
  submitAssessment: (data: any) => apiRequest('/assessments/submit', { method: 'POST', body: JSON.stringify(data) }),
  getTalentScore: () => apiRequest('/assessments/talent-score'),

  // Interviews
  startInterview: (data: { role?: string; domain?: string }) => apiRequest('/interviews/start', { method: 'POST', body: JSON.stringify(data) }),
  completeInterview: (data: any) => apiRequest('/interviews/complete', { method: 'POST', body: JSON.stringify(data) }),
  getInterviewReport: (id: string) => apiRequest(`/interviews/${id}/report`),
  requestHumanInterview: (data: any) => apiRequest('/interviews/human-request', { method: 'POST', body: JSON.stringify(data) }),

  // Recruiter Discovery
  getCandidates: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/discovery/candidates?${query}`);
  },
  shortlistCandidate: (studentProfileId: string) => apiRequest('/discovery/shortlist', { method: 'POST', body: JSON.stringify({ studentProfileId }) }),
  getCandidateDetails: (id: string) => apiRequest(`/discovery/candidates/${id}`),
  compareCandidates: (candidateIds: string[]) => apiRequest('/discovery/candidates/compare', { method: 'POST', body: JSON.stringify({ candidateIds }) }),

  // Jobs & Radar
  getJobs: () => apiRequest('/jobs'),
  createJob: (data: any) => apiRequest('/jobs', { method: 'POST', body: JSON.stringify(data) }),
  getJobRadar: () => apiRequest('/jobs/radar'),

  // Referrals
  requestCandidateInterview: (data: { studentProfileId: string; jobId?: string; notes?: string }) => apiRequest('/referrals/interview-request', { method: 'POST', body: JSON.stringify(data) }),
  getMyReferralRequests: () => apiRequest('/referrals/my-requests'),
  getReferralOpportunities: () => apiRequest('/referrals/opportunities'),
  acceptReferral: (id: string) => apiRequest(`/referrals/${id}/accept`, { method: 'POST' }),
  updateReferralStatus: (id: string, data: { status: string; notes?: string }) => apiRequest(`/referrals/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }),

  // Notifications
  getNotifications: () => apiRequest('/notifications'),
  markNotificationRead: (id: string) => apiRequest(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => apiRequest('/notifications/read-all', { method: 'POST' }),

  // Feed
  getPosts: () => apiRequest('/feed/posts'),
  createPost: (data: any) => apiRequest('/feed/posts', { method: 'POST', body: JSON.stringify(data) }),
  likePost: (id: string) => apiRequest(`/feed/posts/${id}/like`, { method: 'POST' }),

  // Payments
  createTransaction: (data: { type: string; amount: number }) => apiRequest('/payments/create', { method: 'POST', body: JSON.stringify(data) }),
  getTransactions: () => apiRequest('/payments/history'),

  // Admin
  getAdminAnalytics: () => apiRequest('/admin/analytics'),
  getCommissionRules: () => apiRequest('/admin/commission-rules'),
  updateCommissionRules: (data: any) => apiRequest('/admin/commission-rules', { method: 'PUT', body: JSON.stringify(data) }),
  getUsersList: () => apiRequest('/admin/users'),
};
