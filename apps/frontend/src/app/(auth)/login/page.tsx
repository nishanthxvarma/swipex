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
      const res = await authApi.login({
        email: data.email,
        password: data.password,
      });

      const backendRoleMap: Record<string, string> = {
        job_seeker: 'JOB_SEEKER',
        recruiter: 'RECRUITER',
        admin: 'ADMIN'
      };

      const mappedUser = {
        id: res.user.id,
        email: res.user.email,
        fullName: res.user.fullName || res.user.email.split('@')[0],
        role: (backendRoleMap[res.user.role] || res.user.role) as any,
      };

      const mappedTokens = {
        accessToken: res.access_token,
        refreshToken: res.refresh_token,
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
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground text-sm">
          Log in to access your Candidate, Recruiter, or Admin workspace.
        </p>
      </div>

      {/* Role Selection Tabs */}
      <div className="grid grid-cols-3 gap-2 p-1.5 bg-muted rounded-2xl border">
        <button
          type="button"
          onClick={() => setValue('role', 'JOB_SEEKER')}
          className={cn(
            'flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all',
            selectedRole === 'JOB_SEEKER'
              ? 'bg-card text-foreground shadow-xs border border-border'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <User className="w-3.5 h-3.5 text-primary" />
          Job Seeker
        </button>
        <button
          type="button"
          onClick={() => setValue('role', 'RECRUITER')}
          className={cn(
            'flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all',
            selectedRole === 'RECRUITER'
              ? 'bg-card text-foreground shadow-xs border border-border'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Building2 className="w-3.5 h-3.5 text-primary" />
          Recruiter
        </button>
        <button
          type="button"
          onClick={() => setValue('role', 'ADMIN')}
          className={cn(
            'flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all',
            selectedRole === 'ADMIN'
              ? 'bg-card text-foreground shadow-xs border border-border'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Shield className="w-3.5 h-3.5 text-primary" />
          Admin
        </button>
      </div>

{loginError && (
        <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold animate-pulse">
          {loginError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">
            {selectedRole === 'RECRUITER' ? 'Work Email' : 'Email Address'}
          </Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              placeholder={selectedRole === 'RECRUITER' ? 'hr@company.com' : 'name@example.com'}
              {...register('email')}
              className={cn('h-11 pl-10 rounded-xl', errors.email && 'border-destructive')}
            />
            <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
          </div>
          {errors.email && (
            <p className="text-xs font-semibold text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-primary hover:underline"
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
            <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs font-semibold text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setValue('rememberMe', checked as boolean)}
            />
            <label htmlFor="remember" className="text-xs font-semibold text-muted-foreground cursor-pointer">
              Remember me
            </label>
          </div>
        </div>

        <Button type="submit" className="w-full h-11 rounded-xl font-bold shadow-md" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loggin in...
            </>
          ) : (
            <>
              Sign In as {selectedRole === 'RECRUITER' ? 'Recruiter' : 'Candidate'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <div className="text-center text-xs text-muted-foreground pt-2">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="font-bold text-primary hover:underline">
          Create an account
        </Link>
      </div>
    </motion.div>
  );
}
