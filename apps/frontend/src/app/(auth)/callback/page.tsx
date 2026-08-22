'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@swipex/api';
import { useAuthStore } from '@/stores/auth-store';
import { Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loginStore = useAuthStore((state) => state.login);

  const [error, setError] = useState<string | null>(null);
  const [statusText, setStatusText] = useState('Verifying Google credentials...');

  useEffect(() => {
    async function processOAuth() {
      try {
        const code = searchParams.get('code') || searchParams.get('credential') || searchParams.get('id_token');
        const errParam = searchParams.get('error');
        const stateParam = searchParams.get('state');

        if (errParam) {
          setError(`Google authentication error: ${errParam}`);
          return;
        }

        if (!code) {
          setError('No OAuth authorization code or credential received from Google.');
          return;
        }

        let role = 'job_seeker';
        if (stateParam) {
          try {
            const parsedState = JSON.parse(decodeURIComponent(stateParam));
            if (parsedState.role) {
              role = parsedState.role;
            }
          } catch {
            if (stateParam.includes('recruiter')) role = 'recruiter';
          }
        }

        setStatusText('Exchanging Google token with SwipeX authentication backend...');

        const res: any = await authApi.googleOAuth(code, role);

        if (!res || !res.access_token || !res.user) {
          throw new Error('Invalid authentication response received from server.');
        }

        const rawRole = (res.user.role || role || 'JOB_SEEKER').toUpperCase();
        const mappedRole = (rawRole === 'ADMIN' ? 'ADMIN' : rawRole === 'RECRUITER' ? 'RECRUITER' : 'JOB_SEEKER') as any;

        const mappedUser = {
          id: res.user.id || 'temp-id',
          email: res.user.email || 'google_user@gmail.com',
          fullName: res.user.fullName || res.user.email?.split('@')[0] || 'Google User',
          role: mappedRole,
        };

        const mappedTokens = {
          accessToken: res.access_token || '',
          refreshToken: res.refresh_token || res.access_token || '',
        };

        // Initialize session in Zustand store
        loginStore(mappedUser, mappedTokens);

        setStatusText('Authentication successful! Redirecting to dashboard...');

        // Role-based redirection
        if (mappedRole === 'ADMIN') {
          router.replace('/admin/dashboard');
        } else if (mappedRole === 'RECRUITER') {
          router.replace('/recruiter/dashboard');
        } else {
          router.replace('/dashboard');
        }
      } catch (err: any) {
        console.error('Google OAuth callback failure:', err);
        setError(err?.message || 'Failed to complete Google authentication. Please try logging in again.');
      }
    }

    processOAuth();
  }, [searchParams, router, loginStore]);

  if (error) {
    return (
      <div className="glass-2 border rounded-2xl p-8 max-w-md w-full text-center space-y-4 animate-in fade-in">
        <div className="w-12 h-12 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto text-destructive">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-[#F5FAFF]">Authentication Failed</h2>
        <p className="text-sm text-[#9BAFC2]">{error}</p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
        >
          Return to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="glass-2 border rounded-2xl p-8 max-w-md w-full text-center space-y-4 animate-in fade-in">
      <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
      <h2 className="text-xl font-bold text-[#F5FAFF]">Signing you in...</h2>
      <p className="text-xs text-[#66788A]">{statusText}</p>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#060B12]">
      <Suspense
        fallback={
          <div className="glass-2 border rounded-2xl p-8 max-w-md w-full text-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
            <h2 className="text-xl font-bold text-[#F5FAFF]">Loading OAuth Callback...</h2>
          </div>
        }
      >
        <GoogleCallbackContent />
      </Suspense>
    </div>
  );
}
