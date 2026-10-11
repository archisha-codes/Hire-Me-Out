import { describe, it, expect } from 'vitest';

/**
 * Step 6C Supabase Local Storage API & Integration Test Suite
 * Validates local Supabase Storage API endpoints (http://127.0.0.1:54321/storage/v1)
 */

describe('Step 6C Supabase Local Storage API Suite', () => {
  const STORAGE_API = 'http://127.0.0.1:54321/storage/v1';
  const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
  const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

  it('should verify storage buckets are initialized when queried via service role', async () => {
    const res = await fetch(`${STORAGE_API}/bucket`, {
      headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` }
    });
    expect(res.ok).toBe(true);
    const buckets: any = await res.json();
    
    const bucketNames = buckets.map((b: any) => b.name);
    expect(bucketNames).toContain('resumes');
    expect(bucketNames).toContain('avatars');
    expect(bucketNames).toContain('company-logos');
    expect(bucketNames).toContain('verification-docs');

    // Verify Public vs Private configurations
    const resumesBucket = buckets.find((b: any) => b.id === 'resumes');
    const avatarsBucket = buckets.find((b: any) => b.id === 'avatars');
    const verifBucket = buckets.find((b: any) => b.id === 'verification-docs');

    expect(resumesBucket.public).toBe(false);
    expect(verifBucket.public).toBe(false);
    expect(avatarsBucket.public).toBe(true);
  });

  it('should restrict bucket listing for anonymous requests', async () => {
    const res = await fetch(`${STORAGE_API}/bucket`, {
      headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` }
    });
    expect(res.ok).toBe(true);
    const buckets: any = await res.json();
    // Anon user cannot list private bucket configurations
    expect(buckets.length).toBe(0);
  });

  it('should deny unauthorized anonymous upload to private resumes bucket', async () => {
    const res = await fetch(`${STORAGE_API}/object/resumes/unauthorized/resume.pdf`, {
      method: 'POST',
      body: 'fake pdf content',
      headers: { 'Content-Type': 'application/pdf', apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` }
    });
    // Rejected by RLS / Auth
    expect(res.ok).toBe(false);
  });

  it('should deny unauthorized access to private verification-docs bucket', async () => {
    const res = await fetch(`${STORAGE_API}/object/verification-docs/company-1/license.pdf`, {
      headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` }
    });
    expect(res.ok).toBe(false);
  });
});
