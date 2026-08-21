'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, Mail, Building2, User, Shield, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuthStore } from '@/stores/auth-store';
import { authApi } from '@swipex/api';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(['JOB_SEEKER', 'RECRUITER', 'ADMIN']),
  rememberMe: z.boolean(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const loginStore = useAuthStore((state) => state.login);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      role: 'JOB_SEEKER',
      rememberMe: false,
    },
  });

  const rememberMe = watch('rememberMe');
  const selectedRole = watch('role');

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setLoginError(null);
    try {
      const roleMap: Record<string, string> = {
        JOB_SEEKER: 'job_seeker',
        RECRUITER: 'recruiter',
        ADMIN: 'admin'
      };

      const res: any = await authApi.login({
        email: data.email,
        username: data.email,
        password: data.password,
        role: (roleMap[selectedRole] || 'job_seeker'),
      } as any);

      const backendRoleMap: Record<string, string> = {
        job_seeker: 'JOB_SEEKER',
        recruiter: 'RECRUITER',
        admin: 'ADMIN'
      };

      const rawRole = res.user?.role || res.role || roleMap[selectedRole] || 'JOB_SEEKER';
      const userId = res.user?.id ? String(res.user.id) : (res.user_id ? String(res.user_id) : '1');
      const userEmail = res.user?.email || res.username || data.email;
      const userFullName = res.user?.fullName || res.user?.full_name || userEmail.split('@')[0];

      const mappedUser = {
        id: userId,
        email: userEmail,
        fullName: userFullName,
        role: (backendRoleMap[rawRole] || rawRole) as any,
      };

      const mappedTokens = {
        accessToken: res.access_token || '',
        refreshToken: res.refresh_token || res.access_token || '',
      };

      loginStore(mappedUser, mappedTokens);

      if (mappedUser.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else if (mappedUser.role === 'RECRUITER') {
        router.push('/recruiter/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error(error);
      setLoginError(error.message || 'Invalid credentials or database connection failure.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-[22px] font-bold tracking-tight" style={{ color: '#F5FAFF' }}>Welcome back</h1>
        <p className="text-[13px]" style={{ color: '#66788A' }}>
          Log in to access your Candidate, Recruiter, or Admin workspace.
        </p>
      </div>

      {/* Role Selection Tabs */}
      <div
        className="grid grid-cols-3 gap-1.5 p-1.5 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.038)', border: '1px solid rgba(190,225,255,0.10)' }}
      >
        <button
          type="button"
          onClick={() => setValue('role', 'JOB_SEEKER')}
          className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-semibold transition-all"
          style={
            selectedRole === 'JOB_SEEKER'
              ? { background: 'rgba(191,232,255,0.10)', border: '1px solid rgba(191,232,255,0.22)', color: '#BFE8FF' }
              : { background: 'transparent', border: '1px solid transparent', color: '#66788A' }
          }
        >
          <User className="w-3.5 h-3.5" />
          Job Seeker
        </button>
        <button
          type="button"
          onClick={() => setValue('role', 'RECRUITER')}
          className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-semibold transition-all"
          style={
            selectedRole === 'RECRUITER'
              ? { background: 'rgba(191,232,255,0.10)', border: '1px solid rgba(191,232,255,0.22)', color: '#BFE8FF' }
              : { background: 'transparent', border: '1px solid transparent', color: '#66788A' }
          }
        >
          <Building2 className="w-3.5 h-3.5" />
          Recruiter
        </button>
        <button
          type="button"
          onClick={() => setValue('role', 'ADMIN')}
          className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-semibold transition-all"
          style={
            selectedRole === 'ADMIN'
              ? { background: 'rgba(191,232,255,0.10)', border: '1px solid rgba(191,232,255,0.22)', color: '#BFE8FF' }
              : { background: 'transparent', border: '1px solid transparent', color: '#66788A' }
          }
        >
          <Shield className="w-3.5 h-3.5" />
          Admin
        </button>
      </div>

      {/* Error */}
      {loginError && (
        <div
          className="p-3 rounded-xl text-[12px] font-medium"
          style={{ background: 'rgba(255,122,144,0.08)', border: '1px solid rgba(255,122,144,0.18)', color: '#FF7A90' }}
        >
          {loginError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-[13px] font-medium" style={{ color: '#9BAFC2' }}>
            {selectedRole === 'RECRUITER' ? 'Work Email' : 'Email Address'}
          </label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              placeholder={selectedRole === 'RECRUITER' ? 'hr@company.com' : 'name@example.com'}
              {...register('email')}
              className={cn('h-11 pl-10 rounded-xl', errors.email && 'border-destructive')}
            />
            <Mail className="absolute left-3.5 top-3.5 h-4 w-4" style={{ color: '#66788A' }} />
          </div>
          {errors.email && (
            <p className="text-[12px]" style={{ color: '#FF7A90' }}>{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-[13px] font-medium" style={{ color: '#9BAFC2' }}>Password</label>
            <Link
              href="/forgot-password"
              className="text-[12px] font-medium transition-colors"
              style={{ color: '#BFE8FF' }}
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('password')}
              className={cn('h-11 pl-10 pr-10 rounded-xl', errors.password && 'border-destructive')}
            />
            <Lock className="absolute left-3.5 top-3.5 h-4 w-4" style={{ color: '#66788A' }} />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3.5 transition-colors"
              style={{ color: '#66788A' }}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-[12px]" style={{ color: '#FF7A90' }}>{errors.password.message}</p>
          )}
        </div>

        {/* Remember me */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember"
            checked={rememberMe}
            onCheckedChange={(checked) => setValue('rememberMe', checked as boolean)}
          />
          <label htmlFor="remember" className="text-[12px] cursor-pointer" style={{ color: '#66788A' }}>
            Remember me
          </label>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          className="w-full h-11 rounded-xl font-semibold text-[13px]"
          style={{ color: '#060B12' }}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...
            </>
          ) : (
            <>
              Sign In as {selectedRole === 'RECRUITER' ? 'Recruiter' : selectedRole === 'ADMIN' ? 'Admin' : 'Candidate'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="h-px w-full" style={{ background: 'rgba(190,225,255,0.08)' }} />

      {/* Sign up link */}
      <p className="text-center text-[13px]" style={{ color: '#66788A' }}>
        Don&apos;t have an account?{' '}
        <Link
          href="/signup"
          className="font-semibold transition-colors"
          style={{ color: '#BFE8FF' }}
        >
          Create an account
        </Link>
      </p>
    </motion.div>
  );
}
